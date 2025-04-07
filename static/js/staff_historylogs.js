import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD56TvVuz9rl9wvRN9VhkJH_Gz8WHpFh_Q",
  authDomain: "spectre-8f79c.firebaseapp.com",
  databaseURL:
    "https://spectre-8f79c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "spectre-8f79c",
  storageBucket: "spectre-8f79c.appspot.com",
  messagingSenderId: "875337744237",
  appId: "1:875337744237:web:d2dd76f311523b30b56464",
  measurementId: "G-13VZ185YFT",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth(app);

let tbody = document.getElementById("tbody_detection");

function renderDetectionLogs(detections) {
  tbody.innerHTML = ""; // Clear previous content

  if (!detections || detections.length === 0) {
    tbody.innerHTML = `<tr><td class="text-center" colspan="5">No detection logs available.</td></tr>`;
    return;
  }

  detections.forEach(({ date, time, type, camera, video_url }) => {
    const trow = document.createElement("tr");

    trow.innerHTML = `
      <td class="text-center">${date}</td>
      <td class="text-center">${time}</td>
      <td class="text-center">${type}</td>
      <td class="text-center">${camera}</td>
      <td class="text-center">
        ${
          video_url
            ? `<a href="${video_url}" class="btn" style="color: #2ff29e;" play><i class="bi bi-play-circle-fill me-2"></i>Preview</a>`
            : "No video available"
        }
      </td>
    `;

    tbody.appendChild(trow);
  });

  // Destroy existing DataTable instance before reinitializing
  if ($.fn.DataTable.isDataTable("#table_detection")) {
    $("#table_detection").DataTable().destroy();
  }

  $("#table_detection").DataTable({
    buttons: [
      { extend: "copy", exportOptions: { columns: ":not(:last-child)" } },
      { extend: "csv", exportOptions: { columns: ":not(:last-child)" } },
      { extend: "excel", exportOptions: { columns: ":not(:last-child)" } },
      { extend: "pdf", exportOptions: { columns: ":not(:last-child)" } },
      { extend: "print", exportOptions: { columns: ":not(:last-child)" } },
    ],
  });
}

async function fetchAllDetections() {
  const user = auth.currentUser;
  if (!user) {
    console.error("🚨 No user is currently logged in.");
    return;
  }

  const userUid = user.uid;
  const accountsRef = ref(db, "Registered_Accounts");

  try {
    const snapshot = await get(accountsRef);
    if (!snapshot.exists()) {
      console.error("❌ No registered accounts found.");
      return;
    }

    let parentUid = null;
    snapshot.forEach((accountSnapshot) => {
      const accountData = accountSnapshot.val();
      if (accountData.Staff_Management && accountData.Staff_Management[userUid]) {
        parentUid = accountSnapshot.key; // Get parent account UID
      }
    });

    if (!parentUid) {
      console.error("❌ Staff account not linked to a parent UID.");
      return;
    }

    const detectionRef = ref(db, `Registered_Accounts/${parentUid}/Detection`);
    onValue(
      detectionRef,
      (detectionSnapshot) => {
        const detections = [];

        detectionSnapshot.forEach((cameraSnapshot) => {
          const cameraKey = cameraSnapshot.key;

          cameraSnapshot.forEach((detection) => {
            const data = detection.val();
            detections.push({
              date: data.date || "Unknown Date",
              time: data.time || "Unknown Time",
              type: data.type || "Unknown Type",
              video_url: data.video_url || null,
              camera: cameraKey || "Unknown Camera",
            });
          });
        });

        console.log("✅ Detection logs fetched:", detections);
        renderDetectionLogs(detections);
      },
      (error) => {
        console.error("❌ Error fetching detections:", error);
      }
    );
  } catch (error) {
    console.error("❌ Error fetching parent UID:", error);
  }
}

auth.onAuthStateChanged((user) => {
  if (user) {
    fetchAllDetections();
  } else {
    console.error("🚨 User not logged in.");
  }
});

// Error handling for missing tbody element
if (!tbody) {
  console.error("❌ tbody_detection element not found in the DOM.");
}
