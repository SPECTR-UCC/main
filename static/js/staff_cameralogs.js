import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
  onValue
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD56TvVuz9rl9wvRN9VhkJH_Gz8WHpFh_Q",
  authDomain: "spectre-8f79c.firebaseapp.com",
  databaseURL: "https://spectre-8f79c-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "spectre-8f79c",
  storageBucket: "spectre-8f79c.appspot.com",
  messagingSenderId: "875337744237",
  appId: "1:875337744237:web:d2dd76f311523b30b56464",
  measurementId: "G-13VZ185YFT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Function to fetch staff parent UID
async function getStaffParentUID(userEmail) {
  const accountsSnapshot = await get(ref(db, "Registered_Accounts"));
  if (!accountsSnapshot.exists()) return null;

  for (const [parentUID, accountData] of Object.entries(accountsSnapshot.val())) {
    if (accountData.Staff_Management) {
      for (const [staffUID, staffData] of Object.entries(accountData.Staff_Management)) {
        if (staffData.email === userEmail) {
          return parentUID; // Found the parent UID
        }
      }
    }
  }
  return null;
}

// Function to create a table row
function createTableRow(date, time, camera, type, tbodyId) {
  let trow = document.createElement("tr");

  trow.innerHTML = `
    <td class="text-center">${date}</td>
    <td class="text-center">${time}</td>
    <td class="text-center">${camera}</td>
    <td class="text-center">${type}</td>
  `;

  document.getElementById(tbodyId).appendChild(trow);
}

// Function to populate camera tables
function populateCameraTable(cameraData, tableId, tbodyId) {
  const tbody = document.getElementById(tbodyId);
  tbody.innerHTML = ""; // Clear previous entries

  cameraData.forEach(log => {
    createTableRow(log.date, log.time, log.camera, log.type, tbodyId);
  });

  // Reinitialize DataTable if already initialized
  if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
    $(`#${tableId}`).DataTable().clear();
    $(`#${tableId}`).DataTable().destroy();
  }

  $(document).ready(() => {
    $(`#${tableId}`).DataTable();
  });
}

// Function to fetch detection logs for all cameras
async function fetchDetectionLogs(user) {
  if (!user) return console.error("No user logged in.");

  const parentUID = await getStaffParentUID(user.email);
  if (!parentUID) return console.error("Parent UID not found.");

  const cameras = ["Camera 1", "Camera 2", "Camera 3", "Camera 4"];
  cameras.forEach(cameraRef => {
    const dbRef = ref(db, `Registered_Accounts/${parentUID}/Detection/${cameraRef}`);

    onValue(dbRef, (snapshot) => {
      let cameraData = [];
      snapshot.forEach(childSnapshot => {
        cameraData.push(childSnapshot.val());
      });

      populateCameraTable(cameraData, `cameralogs${cameraRef.split(" ")[1]}`, `tbody_cam${cameraRef.split(" ")[1]}`);
    });
  });
}

// Check if user is logged in and fetch detection logs
auth.onAuthStateChanged(user => {
  if (user) fetchDetectionLogs(user);
});
