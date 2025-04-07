import { auth, db } from "./login.js";
import {
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

// Function to create a table row with detection data for each camera
function CameraLogs(date, time, camera, type, tbody) {
  let trow = document.createElement("tr");

  let td1 = document.createElement("td");
  let td2 = document.createElement("td");
  let td3 = document.createElement("td");
  let td4 = document.createElement("td");

  td1.classList.add("text-center");
  td2.classList.add("text-center");
  td3.classList.add("text-center");
  td4.classList.add("text-center");

  td1.innerHTML = date;
  td2.innerHTML = time;
  td3.innerHTML = camera;
  td4.innerHTML = type;

  trow.appendChild(td1);
  trow.appendChild(td2);
  trow.appendChild(td3);
  trow.appendChild(td4);

  // Append to the correct table body
  document.getElementById(tbody).appendChild(trow);
}

// Function to populate the table with camera data
function AddAllItemsToTable(cameraData, tableId, tbodyId) {
  // Clear the table body first
  document.getElementById(tbodyId).innerHTML = "";

  // Loop through the camera's data and create rows for each detection entry
  cameraData.forEach((log) => {
    let camera = log.camera; // Camera name
    CameraLogs(log.date, log.time, camera, log.type, tbodyId);
  });
  console.log(cameraData);

  // Reinitialize DataTable after populating
  if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
    $(`#${tableId}`).DataTable().clear();
    $(`#${tableId}`).DataTable().destroy();
  }

  $(document).ready(function () {
    $(`#${tableId}`).DataTable();
  });
}

// Function to fetch and display the data for each camera
function GetAllDataOnce(cameraRef, tableId, tbodyId) {
  const user = auth.currentUser;

  if (user) {
    const uid = user.uid; // Get the UID of the logged-in user
    const dbRef = ref(db, `Registered_Accounts/${uid}/Detection/${cameraRef}`);

    onValue(dbRef, (snapshot) => {
      let cameraData = [];
      snapshot.forEach((childSnapshot) => {
        cameraData.push(childSnapshot.val());
      });

      // Pass the camera-specific data to the table
      AddAllItemsToTable(cameraData, tableId, tbodyId);
    });
  } else {
    console.error("User is not logged in.");
  }
}

// Example camera references and table bodies
const cameras = [
  { cameraRef: "Camera 1", tableId: "cameralogs1", tbody: "tbody_cam1" },
  { cameraRef: "Camera 2", tableId: "cameralogs2", tbody: "tbody_cam2" },
  { cameraRef: "Camera 3", tableId: "cameralogs3", tbody: "tbody_cam3" },
  { cameraRef: "Camera 4", tableId: "cameralogs4", tbody: "tbody_cam4" },
];

// Initialize data for all cameras
cameras.forEach((camera) => {
  GetAllDataOnce(camera.cameraRef, camera.tableId, camera.tbody);
});

auth.onAuthStateChanged((user) => {
  if (user) {
    cameras.forEach((camera) => {
      GetAllDataOnce(camera.cameraRef, camera.tableId, camera.tbody);
    });
  } else {
    console.error("No user is currently logged in.");
  }
});
