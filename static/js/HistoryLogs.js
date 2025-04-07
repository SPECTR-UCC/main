import { auth, db } from "./login.js";
import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// Get tbody element for detections
let tbody = document.getElementById("tbody_detection");
let cameraNames = {};

// Ensure script runs after DOM loads
document.addEventListener("DOMContentLoaded", function () {
  auth.onAuthStateChanged((user) => {
    if (user) {
      fetchCameraNames();
    } else {
      console.error("🚨 User not logged in.");
    }
  });
});

function renderDetectionLogs(detections) {
  if (!tbody) {
    return;
  }

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
            ? `<a href="${video_url}" class="btn" style="color: #2ff29e;"><i class="bi bi-play-circle-fill me-2"></i>Preview</a>`
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
    dom: "Bfrtip",
    dom: "Bfrtip",
    buttons: [
      { extend: "copy", exportOptions: { columns: ":not(:last-child)" } },
      { extend: "csv", exportOptions: { columns: ":not(:last-child)" } },
      { extend: "excel", exportOptions: { columns: ":not(:last-child)" } },
      { extend: "pdf", exportOptions: { columns: ":not(:last-child)" } },
      { extend: "print", exportOptions: { columns: ":not(:last-child)" } },
    ],
  });
}

function perCameraLogs(date, time, camera, type, tbodyId) {
  const camTbody = document.getElementById(tbodyId);

  if (!camTbody) {
    return;
  }

  let trow = document.createElement("tr");

  trow.innerHTML = `
    <td class="text-center">${date}</td>
    <td class="text-center">${time}</td>
    <td class="text-center">${camera}</td>
    <td class="text-center">${type}</td>
  `;

  camTbody.appendChild(trow);
}

function populateCameraTable(cameraData, tableId, tbodyId) {
  const camTbody = document.getElementById(tbodyId);

  if (!camTbody) {
    return;
  }

  camTbody.innerHTML = "";

  cameraData.forEach(({ date, time, camera, type }) => {
    perCameraLogs(date, time, camera, type, tbodyId);
  });

  if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
    $(`#${tableId}`).DataTable().clear().destroy();
  }
  $(`#${tableId}`).DataTable();
}

function fetchCameraNames() {
  const user = auth.currentUser;
  if (!user) return;

  const cameraTabsRef = ref(db, `Registered_Accounts/${user.uid}/CameraTabs`);

  onValue(
    cameraTabsRef,
    (snapshot) => {
      cameraNames = {};
      snapshot.forEach((childSnapshot) => {
        const camId = childSnapshot.key;
        const camData = childSnapshot.val();
        if (camData && camData.name) {
          cameraNames[camId] = camData.name;
        }
      });

      fetchAllDetections();
    },
    (error) => {
      console.error("Error fetching camera names:", error);
    }
  );
}

function fetchAllDetections() {
  const user = auth.currentUser;

  if (!user) {
    console.error("No user is currently logged in.");
    return;
  }

  const uid = user.uid;
  const dbRef = ref(db, `Registered_Accounts/${uid}/Detection`);

  onValue(
    dbRef,
    (snapshot) => {
      const detections = [];

      snapshot.forEach((cameraSnapshot) => {
        const cameraKey = cameraSnapshot.key;

        cameraSnapshot.forEach((detectionSnapshot) => {
          const data = detectionSnapshot.val();

          detections.push({
            date: data.date || "Unknown Date",
            time: data.time || "Unknown Time",
            type: data.type || "Unknown Type",
            video_url: data.video_url || null,
            camera: cameraKey || "Unknown Camera",
          });
        });

        // ✅ Fetch camera data dynamically for each detected camera
        fetchAllCameraData(
          cameraKey,
          `cameralogs${cameraKey.slice(-1)}`,
          `tbody_cam${cameraKey.slice(-1)}`
        );
      });
      renderDetectionLogs(detections);
    },
    (error) => {
      console.error("Error fetching detections:", error);
    }
  );
}
function fetchAllCameraData(cameraRef, tableId, tbodyId) {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  const uid = currentUser.uid;
  const perCameraRef = ref(
    db,
    `Registered_Accounts/${uid}/Detection/${cameraRef}`
  );

  onValue(
    perCameraRef,
    (snapshot) => {
      let cameraData = [];

      snapshot.forEach((childSnapshot) => {
        cameraData.push(childSnapshot.val());
      });

      populateCameraTable(cameraData, tableId, tbodyId);
    },
    (error) => {
      console.error(`Error fetching camera data for ${cameraRef}:`, error);
    }
  );
}
