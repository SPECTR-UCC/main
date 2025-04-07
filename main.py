import os
import cv2
import torch
import time
import logging
import pathlib
import subprocess
import numpy as np
import firebase_admin
from collections import deque
from flask import Flask, render_template, Response, jsonify, send_file, request
from models.common import DetectMultiBackend
from utils.general import check_img_size, non_max_suppression, scale_boxes
from utils.plots import Annotator, colors
from firebase_admin import credentials, storage, db
from pathlib import Path
from datetime import datetime
from flask_cors import CORS
import threading

# Force pathlib to use WindowsPath
pathlib.PosixPath = pathlib.WindowsPath

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)

CORS(app)

cred = credentials.Certificate(
    "credentials.json"
)  # Replace with your service account key path
firebase_admin.initialize_app(
    cred,
    {
        "storageBucket": "spectre-8f79c.appspot.com",
        "databaseURL": "https://spectre-8f79c-default-rtdb.asia-southeast1.firebasedatabase.app",
    },
)
bucket = storage.bucket()

# Directories
UPLOAD_FOLDER = "External/uploads"
PROCESSED_FOLDER = "External/processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Allowed file types
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "mp4", "avi", "mov"}

# YOLOv5 Model Setup
weights = "latest.pt"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = DetectMultiBackend(weights, device=device)
stride, names, pt = model.stride, model.names, model.pt
imgsz = check_img_size([640, 640], s=stride)

UPLOAD_FOLDER = "External/uploads"
PROCESSED_FOLDER = "External/processed"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

# Print model details
print(f"CUDA Available: {torch.cuda.is_available()}")
print(
    f"GPU Device: {torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'}"
)
print(f"YOLOv5 Model Setup:")
print(f"  Weights file: {weights}")
print(f"  Device: {device}")
print(f"  Stride: {stride}")
print(f"  Names: {names}")
print(f"  PT Format: {pt}")
print(f"  Image Size: {imgsz}")

# Video sources and labels
video_sources = {
    # "rtsp://admin:Hikvision@192.168.137.2:554/Streaming/Channels/101": False,
    # "rtsp://admin:Hikvision@192.168.137.2:554/Streaming/Channels/201": False,
    # "rtsp://admin:Hikvision@192.168.137.2:554/Streaming/Channels/301": False,
    # "rtsp://admin:Hikvision@192.168.137.2:554/Streaming/Channels/401": False,
}
video_labels = {
    "rtsp://admin:Hikvision@192.168.137.2:554/Streaming/Channels/101": "Camera 1",
    "rtsp://admin:Hikvision@192.168.137.2:554/Streaming/Channels/201": "Camera 2",
    "rtsp://admin:Hikvision@192.168.137.2:554/Streaming/Channels/301": "Camera 3",
    "rtsp://admin:Hikvision@192.168.137.2:554/Streaming/Channels/401": "Camera 4",
}
detection_log = []
persons_detected = False

# Maximum retries for frame reading
MAX_RETRIES = 5
FRAME_SKIP = 2
PRE_RECORD_SECONDS = 5


def is_file_locked_or_empty(filepath):
    try:
        with open(filepath, "r+") as file:
            file.seek(0, os.SEEK_END)
            return file.tell() == 0
    except FileNotFoundError:
        return "File does not exist"
    except IOError:
        return "File is locked"


def play_alarm():
    audio_file = os.path.abspath("static/ai2.mp3")
    try:
        # Start the audio playback process
        process = subprocess.Popen(
            ["ffplay", "-nodisp", "-autoexit", audio_file],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            shell=True,
        )
        process.wait()
    except Exception as e:
        print("Error playing sound:", e)


def upload_to_firebase(file_path, uid, camera_label):
    try:
        retries = 5
        while retries > 0:
            if not is_file_locked_or_empty(file_path):
                break
            print(f"File is locked, retrying... ({retries} retries left)")
            time.sleep(1)
            retries -= 1

        if retries == 0:
            raise Exception("File is still locked after multiple retries.")

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File {file_path} not found.")

        print(f"Uploading file {file_path} to Firebase...")

        blob = bucket.blob(
            f"Registered_Accounts/{uid}/Detection/{camera_label}/{Path(file_path).name}"
        )
        blob.upload_from_filename(file_path, content_type="video/mp4")
        blob.make_public()
        video_url = blob.public_url
        print(f"Uploaded file {file_path} to Firebase with URL: {video_url}")

        os.remove(file_path)

        # Log detection metadata
        current_datetime = datetime.now()
        date_str = current_datetime.date().isoformat()
        time_str = current_datetime.strftime("%I:%M:%S %p")

        db.reference(f"Registered_Accounts/{uid}/Detection/{camera_label}").push(
            {
                "date": date_str,
                "time": time_str,
                "camera": camera_label,
                "type": "Shoplifting",
                "video_url": video_url,
            }
        )
    except Exception as e:
        print(f"Failed to upload {file_path} to Firebase: {e}")


# Frame Generation for Multiple Cameras
def generate_frames(camera_index, uid):
    global persons_detected

    cap = cv2.VideoCapture(camera_index, cv2.CAP_FFMPEG)
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    if not cap.isOpened():
        print(f"[ERROR] Camera {camera_index} failed to open.")
        return

    fps = cap.get(cv2.CAP_PROP_FPS)
    fps = fps if fps > 0 else 15
    frame_buffer = deque(maxlen=int(fps * PRE_RECORD_SECONDS))

    retry_count = 0
    recording = False
    video_writer = None
    output_filename = None
    last_detection_time = None
    max_inactivity_time = 5
    alarm_played = False

    while True:
        success, frame = cap.read()
        if not success:
            time.sleep(0.1)
            retry_count += 1
            if retry_count > MAX_RETRIES:
                break
            continue
        retry_count = 0

        # Process only every 2nd frame to improve performance
        if cap.get(cv2.CAP_PROP_POS_FRAMES) % FRAME_SKIP == 0:
            continue

        img = cv2.resize(frame, (640, 640))
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = (
            torch.from_numpy(img)
            .to(device)
            .float()
            .div(255.0)
            .permute(2, 0, 1)
            .unsqueeze(0)
        )

        # Detection
        pred = non_max_suppression(model(img), conf_thres=0.30, iou_thres=0.45)
        annotator = Annotator(frame, line_width=1)
        detection_status = False

        # Process detections
        for det in pred:
            if len(det):
                det[:, :4] = scale_boxes(img.shape[2:], det[:, :4], frame.shape).round()
                for *xyxy, conf, cls in reversed(det):
                    label = names[int(cls)]
                    if label == "Shoplift":
                        detection_status = True
                        last_detection_time = time.time()
                    elif label == "Person":
                        persons_detected = True

                    # Annotate frame
                    annotator.box_label(xyxy, f"{label}", colors(int(cls), True))

        # Only update detection status if there was a detection
        video_sources[camera_index] = detection_status
        alarm_played = False

        if detection_status:
            current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            camera_label = video_labels.get(str(camera_index), f"Camera {camera_index}")
            log_entry = f"[{current_time}] Shoplift detected on {camera_label}."
            if not detection_log or detection_log[-1] != log_entry:
                detection_log.append(log_entry)
                last_detection_time = time.time()

        # Start recording
        if detection_status and not recording:
            if not alarm_played:
                threading.Thread(target=play_alarm, daemon=True).start()
                alarm_played = True

            recording = True
            timestamp = time.strftime("%Y%m%d_%H%M%S")
            output_filename = f"shoplift_detected_{timestamp}_on_{camera_label}.mp4"

            try:
                ffmpeg_cmd = [
                    "ffmpeg",
                    "-y",
                    "-hwaccel",
                    "cuda",
                    "-fflags",
                    "nobuffer",
                    "-flags",
                    "low_delay",
                    "-max_delay",
                    "0",
                    "-f",
                    "rawvideo",
                    "-vcodec",
                    "rawvideo",
                    "-pix_fmt",
                    "bgr24",
                    "-s",
                    f"{frame.shape[1]}x{frame.shape[0]}",
                    "-r",
                    str(fps),
                    "-i",
                    "-",
                    "-vf",
                    "format=yuv420p",  # ✅ Force color format conversion
                    "-c:v",
                    "h264_nvenc",
                    "-preset",
                    "fast",
                    "-b:v",
                    "2000k",
                    "-rc",
                    "constqp",
                    "-qp",
                    "20",
                    "-pix_fmt",
                    "yuv420p",  # ✅ Ensure correct output format
                    output_filename,
                ]

                video_writer = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)
                print(f"Recording started: {output_filename}")

                # Write pre-recorded frames
                while frame_buffer:
                    video_writer.stdin.write(frame_buffer.popleft())
            except Exception as e:
                print(f"[ERROR] Failed to start recording: {e}")
                recording = False

        # Stop recording after max inactivity time
        if not detection_status and recording:
            if time.time() - last_detection_time >= max_inactivity_time:
                recording = False
                if video_writer:
                    try:
                        video_writer.stdin.close()
                        video_writer.wait()
                    except Exception as e:
                        print(f"[ERROR] Closing video writer failed: {e}")

                print(f"Stopped recording: {output_filename}")

                alarm_played = False

                threading.Thread(
                    target=upload_to_firebase,
                    args=(output_filename, uid, camera_label),
                    daemon=True,
                ).start()

        # Buffer frames
        frame_buffer.append(frame)

        # Write the frame to the video file if recording
        if recording and video_writer and video_writer.stdin:
            try:
                video_writer.stdin.write(frame.tobytes())
            except Exception as e:
                print(f"[ERROR] Writing frame failed: {e}")

        # Convert frame to JPEG and yield it for streaming
        ret, buffer = cv2.imencode(".jpg", frame)
        frame = buffer.tobytes()
        yield (b"--frame\r\n" b"Content-Type: image/jpeg\r\n\r\n" + frame + b"\r\n")

    cap.release()
    cv2.destroyAllWindows()
    print(f"Stopped processing {camera_label}.")


# Flask Routes
@app.route("/video_feed")
def video_feed():
    camera_url = request.args.get("camera_url")
    uid = request.args.get("uid")

    print(f"Received camera URL: {camera_url}")

    if not camera_url or camera_url not in video_sources:
        print(f"Camera URL {camera_url} is not available.")
        return Response(status=404)

    return Response(
        generate_frames(camera_url, uid),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )


@app.route("/available_cameras")
def available_cameras():
    return jsonify({"available_camera": list(video_sources.keys())})


@app.route("/detection_status", methods=["GET"])
def detection_status():
    try:
        if not isinstance(video_sources, dict):
            raise ValueError("video_sources is not properly initialized.")

        detected_cameras = []
        for camera, detected in video_sources.items():
            try:
                if detected:
                    detected_cameras.append(video_labels.get(camera, "Unknown Camera"))
            except Exception as e:
                continue

        shoplift_detected = len(detected_cameras) > 0

        return jsonify(
            {
                "shoplift_detected": shoplift_detected,
                "detected_cameras": detected_cameras,
            }
        )

    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400

    except KeyError as ke:
        return jsonify({"error": f"Missing key: {ke}"}), 400

    except Exception:
        return jsonify({"error": "Internal Server Error"}), 500


# logContainer
@app.route("/logs")
def get_logs():
    return jsonify(detection_log)


# //DRAG AND DROP
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# Process Image
def process_image(image_path, output_path):
    img = cv2.imread(image_path)
    img_resized = cv2.resize(img, (640, 640))  # Resize for YOLO
    img_tensor = (
        torch.from_numpy(img_resized[:, :, ::-1].copy())
        .float()
        .to(device)
        .permute(2, 0, 1)
        .unsqueeze(0)
        / 255.0
    )

    pred = model(img_tensor)  # Run detection
    pred = non_max_suppression(pred, conf_thres=0.4, iou_thres=0.5)[0]  # Apply NMS

    annotator = Annotator(img, line_width=2)
    for det in pred:
        x1, y1, x2, y2, conf, cls = det.tolist()
        label = f"{names[int(cls)]} {conf:.2f}"
        color = colors(int(cls), True)
        annotator.box_label((int(x1), int(y1), int(x2), int(y2)), label, color=color)

    cv2.imwrite(output_path, annotator.result())  # Save processed image


# Process Video
def process_video(video_path, output_path):
    cap = cv2.VideoCapture(video_path)
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    orig_w = int(cap.get(3))  # Original width
    orig_h = int(cap.get(4))  # Original height
    out = cv2.VideoWriter(output_path, fourcc, fps, (orig_w, orig_h))

    new_w, new_h = 640, 640  # Resized dimensions

    frame_count = 0
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        processed_frame = detect_objects(frame, orig_w, orig_h, new_w, new_h)
        out.write(processed_frame)  # Write processed frame

    cap.release()
    out.release()


# Upload Endpoint
@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "" or not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    # Determine new filename based on file type
    ext = file.filename.rsplit(".", 1)[1].lower()
    filename = "demo.jpg" if ext in {"png", "jpg", "jpeg"} else "demo.mp4"

    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    output_path = os.path.join(PROCESSED_FOLDER, filename)

    # Process images and videos
    if ext in {"png", "jpg", "jpeg"}:
        process_image(file_path, output_path)
    else:
        process_video(file_path, output_path)

    return (
        jsonify({"message": "File processed", "download_url": f"/download/{filename}"}),
        200,
    )


def detect_objects(frame, orig_w, orig_h, new_w, new_h):
    img = cv2.resize(frame, (new_w, new_h))  # Resize properly
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Convert color correctly
    img = torch.from_numpy(img).to(device)  # Convert to tensor
    img = img.float() / 255.0  # Normalize
    img = img.permute(2, 0, 1).unsqueeze(0)  # Ensure correct shape

    with torch.no_grad():  # Disable gradients for inference
        pred = model(img, augment=False)

    pred = non_max_suppression(pred, 0.25, 0.45)

    if pred is None or len(pred) == 0:
        print("No objects detected.")
        return frame

    annotator = Annotator(frame, line_width=2, example=str(names))
    for det in pred:
        if len(det):
            for *xyxy, conf, cls in det:
                # Scale bounding box back to original size
                x1, y1, x2, y2 = xyxy
                x1 = int(x1 * (orig_w / new_w))
                y1 = int(y1 * (orig_h / new_h))
                x2 = int(x2 * (orig_w / new_w))
                y2 = int(y2 * (orig_h / new_h))

                label = f"{names[int(cls)]} {conf:.2f}"
                print(
                    f"  - {label} at ({x1}, {y1}, {x2}, {y2})"
                )  # Print detection info
                annotator.box_label(
                    (x1, y1, x2, y2), label, color=colors(int(cls), True)
                )

    return annotator.result()


# Download Endpoint
@app.route("/download/<filename>")
def download_file(filename):
    file_path = os.path.join(PROCESSED_FOLDER, filename)
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
    return send_file(file_path, as_attachment=True)


# //DRAG AND DROP
@app.route("/")
def index():
    return render_template("new_index.html")


@app.route("/client")
def client():
    return render_template("new-client.html")


@app.route("/staff")
def staff():
    return render_template("staff.html")


@app.route("/index")
def index_home():
    return render_template("new_index.html")


@app.route("/about-us")
def aboutus():
    return render_template("landing/new_about-us.html")


@app.route("/contact_us")
def contactus():
    return render_template("landing/new_contact_us.html")


@app.route("/privacy_policy")
def privacypolicy():
    return render_template("landing/new_privacy_policy.html")


@app.route("/Zq3cT404")
def sudoLogin():
    return render_template("credentials/superadmin-login.html")


@app.route("/Zq3cT404/main")
def admin():
    return render_template("credentials/new-admin.html")


@app.route("/Zq3cT404/add-account")
def addAccount():
    return render_template("credentials/add-account.html")


@app.route("/create-new-password")
def createNewpass():
    return render_template("credentials/create-new-password.html")


@app.route("/code-verification")
def codeVerify():
    return render_template("credentials/code-verification.html")


if __name__ == "__main__":
    # Start a thread for each camera
    for camera_url in video_sources.keys():
        threading.Thread(
            target=generate_frames, args=(camera_url, "default_uid"), daemon=True
        ).start()

    app.run(port=5002, debug=True)
