document.addEventListener("DOMContentLoaded", async function () {
  const baseUrl = "http://127.0.0.1:5002/video_feed";
  const noSignalImage = "../static/images/nosignal.jpg";

  const rawUserCreds = sessionStorage.getItem("user-creds");
  const userCredentials = rawUserCreds ? JSON.parse(rawUserCreds) : null;
  const userUid = userCredentials ? userCredentials.uid : null;

  if (!userUid) {
    console.error("User ID not found in session storage");
    return;
  }

  // Fetch available cameras from the Flask server
  try {
    const response = await fetch("http://127.0.0.1:5002/available_cameras");
    if (!response.ok) throw new Error("Failed to fetch available cameras");

    const data = await response.json();
    const availableCams = data.available_camera;

    console.log("Available cameras:", availableCams);

    document.querySelectorAll(".webcam-container img").forEach((imgElement) => {
      let rtspUrl = imgElement.getAttribute("data-rtsp");

      if (!rtspUrl) {
        console.error("Missing RTSP URL in image attribute.");
        return;
      }

      if (availableCams.includes(rtspUrl)) {
        imgElement.src = `${baseUrl}?camera_url=${encodeURIComponent(
          rtspUrl
        )}&uid=${userUid}`;
        console.log(`Streaming from ${rtspUrl}`);
      } else {
        console.warn(`RTSP URL ${rtspUrl} is not available.`);
        imgElement.src = noSignalImage;
      }

      imgElement.onerror = function () {
        console.error(
          `Stream failed for ${rtspUrl}, switching to noSignal image.`
        );
        imgElement.src = noSignalImage;
      };
    });
  } catch (error) {
    console.error("Error fetching cameras:", error);
  }

  let alertShown = false;

  // Function to check detection status
  function checkDetection() {
    fetch("/detection_status")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        const detectionAlert = document.getElementById("detectionAlert");
        const cameraLabel = document.getElementById("camera-label");

        if (!detectionAlert || !cameraLabel) {
          console.error("detectionAlert or cameraLabel not found in DOM.");
          return;
        }

        if (data.shoplift_detected && !alertShown) {
          const cameras =
            data.detected_cameras?.join(", ") || "an unknown camera";
          cameraLabel.textContent = `Shoplifting detected at ${cameras}`;

          detectionAlert.style.display = "block";
          detectionAlert.style.visibility = "visible";
          detectionAlert.style.opacity = "1";

          alertShown = true;

          setTimeout(() => {
            detectionAlert.style.visibility = "hidden";
            detectionAlert.style.opacity = "0";
            alertShown = false;
          }, 5000);
        }
      })
      .catch((error) =>
        console.error("❌ Error fetching detection status:", error)
      )
      .finally(() => {
        setTimeout(checkDetection, 500);
      });
  }

  checkDetection();

  // Add event listeners to images for fullscreen mode
  document.querySelectorAll(".block img").forEach((img) => {
    img.addEventListener("click", () => {
      if (img.src !== noSignalImage) {
        const fullScreenContainer = document.createElement("div");
        fullScreenContainer.classList.add("fullscreen");

        const videoElement = document.createElement("img");
        videoElement.src = img.src;
        fullScreenContainer.appendChild(videoElement);

        const closeButton = document.createElement("button");
        closeButton.classList.add("close-fullscreen-btn");
        closeButton.textContent = "X";
        fullScreenContainer.appendChild(closeButton);

        document.body.appendChild(fullScreenContainer);

        closeButton.addEventListener("click", () => {
          fullScreenContainer.remove();
        });

        const escNotification = document.createElement("div");
        escNotification.classList.add("esc-notification");
        escNotification.textContent = "Press Esc to exit fullscreen";
        fullScreenContainer.appendChild(escNotification);

        setTimeout(() => {
          escNotification.style.opacity = "0";
        }, 1000);
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      const fullscreenElement = document.querySelector(".fullscreen");
      if (fullscreenElement) {
        fullscreenElement.remove();
      }
    }
  });
});
