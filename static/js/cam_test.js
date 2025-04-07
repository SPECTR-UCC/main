document.addEventListener("DOMContentLoaded", async function () {
  const baseUrl = "http://127.0.0.1:5002/video_feed";
  const noSignalImage = "static/images/nosignal.jpg";

  // Retrieve the user ID from sessionStorage (assuming it's stored as 'user-creds')
  const rawUserCreds = sessionStorage.getItem("user-creds");
  const userCredentials = rawUserCreds ? JSON.parse(rawUserCreds) : null;
  const userUid = userCredentials ? userCredentials.uid : null;

  if (!userUid) {
    console.error("User ID not found in session storage");
    return;
  }

  const webcam1 = document.getElementById("webcam1");

  // Ensure the video feed is dynamically updated
  webcam1.src = `${baseUrl}?uid=${userUid}`;

  webcam1.onerror = function () {
    console.error("Stream failed, switching to no signal image.");
    webcam1.src = noSignalImage;
  };
  // Fetch available cameras from the Flask server
  // const response = await fetch("http://127.0.0.1:5002/available_cameras").catch(
  //   (err) => console.error("Fetch error:", err)
  // );
  // if (!response || !response.ok) {
  //   console.error("Failed to fetch available cameras");
  //   return;
  // }
  // const data = await response.json();
  // const availableCams = data.available_camera;

  // console.log("Available cameras:", availableCams);

  // // Select all video container elements and update camera feeds
  // const videoContainers = document.querySelectorAll(".webcam-container");

  // videoContainers.forEach((container) => {
  //   const cameraIndex = parseInt(
  //     container.getAttribute("data-camera-index"),
  //     10
  //   );

  //   if (isNaN(cameraIndex)) {
  //     console.error("Invalid camera index in data-camera-index attribute.");
  //     return;
  //   }

  //   const imgElement = container.querySelector("img");

  //   // Check if the camera index is available before requesting the feed
  //   if (availableCams.includes(cameraIndex)) {
  //     imgElement.src = `${baseUrl}?camera_index=${cameraIndex}&uid=${userUid}`;
  //     console.log(`Camera index ${cameraIndex} is active.`);
  //   } else {
  //     console.warn(`Camera index ${cameraIndex} is not available.`);
  //     imgElement.src = noSignalImage;
  //   }

  //   imgElement.onerror = function () {
  //     console.error(
  //       `Stream failed for camera index ${cameraIndex}, switching to noSignal image.`
  //     );
  //     imgElement.src = noSignalImage;
  //   };
  // });

  // Function for camera logs
  function fetchLogs() {
    fetch("/logs")
      .then((response) => response.json())
      .then((data) => {
        // Loop through each log entry and display it in the correct log container
        data.forEach((log) => {
          // Create a new log entry element
          const logEntry = document.createElement("p");
          logEntry.textContent = log;

          // Find the camera number from the log (e.g., "Camera 1")
          const cameraMatch = log.match(/Camera (\d+)/);

          if (cameraMatch) {
            const cameraNumber = cameraMatch[1]; // Extract camera number (1, 2, 3, or 4)
            const logContainer = document.getElementById(
              "logContainer_" + cameraNumber
            );
            if (logContainer) {
              logContainer.appendChild(logEntry);
              console.log("Appending to logContainer_", cameraNumber);
              logContainer.scrollTop = logContainer.scrollHeight;
              console.log("Log container for camera:", logContainer);
            }
          }
        });
      });
  }

  // Function for detection alert
  let alertShown = false;
  const audioAlert = new Audio("../static/sample.mp3");

  function checkDetection() {
    fetch("/detection_status")
      .then((response) => response.json())
      .then((data) => {
        const detectionAlert = document.getElementById("detectionAlert");
        const cameraLabel = document.getElementById("camera-label");

        if (data.shoplift_detected && !alertShown) {
          const cameras = data.detected_cameras.join(", ");
          cameraLabel.textContent = cameras || "an unknown camera";

          // Show the alert
          detectionAlert.style.display = "block";
          audioAlert.play();
          alertShown = true;

          setTimeout(() => {
            detectionAlert.style.display = "none";
            alertShown = false;
          }, 10000);
        }
      })
      .catch((error) =>
        console.error("Error fetching detection status:", error)
      );
  }
  setInterval(checkDetection, 5000);

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
        closeButton.textContent = "×";
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
