import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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

document.addEventListener("DOMContentLoaded", function () {
  let shopliftingCount = 0;
  let robberyCount = 0;
  let totalIncidents = 0;

  const shopliftingCountElement = document.getElementById("shopliftingCount");
  const robberyCountElement = document.getElementById("robberyCount");
  const totalIncidentsElement = document.getElementById("totalIncidents");
  let chart3;

  function renderPieChart(shoplifting, robbery) {
    const pieGraph = {
      chart: {
        type: "pie",
        height: "100%", // Automatically adjust height
      },
      series: [shoplifting, robbery], // Shoplifting and Robbery counts
      labels: ["Shoplifting", "Robbery"],
      colors: ["#4CAF50", "#F44336"], // Green for shoplifting, red for robbery
      responsive: [
        {
          breakpoint: 1024, // For tablets
          options: {
            chart: {
              width: "100%", // Full width
              height: "100%", // Fixed height for tablets
            },
            legend: {
              position: "bottom",
              fontSize: "14px",
            },
          },
        },
        {
          breakpoint: 480, // For mobile devices
          options: {
            chart: {
              width: "100%", // Full width for small devices
              height: "100%", // Smaller height
            },
            legend: {
              position: "bottom",
              fontSize: "12px",
            },
          },
        },
      ],
    };

    // Render or update the chart
    if (!chart3) {
      chart3 = new ApexCharts(document.querySelector("#chart3"), pieGraph);
      chart3.render();
    } else {
      chart3.updateSeries([shoplifting, robbery]);
    }
  }

  function showEmptyState() {
    let chartElement = document.querySelector("#chart3");
    if (!chartElement) {
      console.error("Element with ID 'chart3' not found!");
      return;
    }

    chartElement.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; padding: 50px;">
            <p style="font-size: 18px; color: #000000; font-weight: bold;">No Data Available</p>
        </div>
    `;

    if (shopliftingCountElement) shopliftingCountElement.textContent = 0;
    if (robberyCountElement) robberyCountElement.textContent = 0;
    if (totalIncidentsElement) totalIncidentsElement.textContent = 0;
  }

  function updateIncidentCounts(detections) {
    if (detections.length === 0) {
      showEmptyState();
      return;
    }

    shopliftingCount = 0;
    robberyCount = 0;

    detections.forEach((detection) => {
      if (detection.type === "Shoplifting") {
        shopliftingCount++;
      } else if (detection.type === "Robbery") {
        robberyCount++;
      }
    });

    totalIncidents = shopliftingCount + robberyCount;

    shopliftingCountElement.textContent = shopliftingCount;
    robberyCountElement.textContent = robberyCount;
    totalIncidentsElement.textContent = totalIncidents;

    renderPieChart(shopliftingCount, robberyCount);
  }

  function GetAllDataOnce() {
    const user = auth.currentUser;

    if (user) {
      const uid = user.uid;
      const dbRef = ref(db, `Registered_Accounts/${uid}/Detection`);

      onValue(dbRef, (snapshot) => {
        let detections = [];

        snapshot.forEach((cameraSnapshot) => {
          cameraSnapshot.forEach((detectionSnapshot) => {
            const data = detectionSnapshot.val();
            detections.push({
              date: data.date,
              time: data.time,
              type: data.type,
              camera: data.camera || cameraSnapshot.key,
            });
          });
        });

        updateIncidentCounts(detections);
      });
    } else {
      console.error("User is not logged in.");
    }
  }

  auth.onAuthStateChanged((user) => {
    if (user) {
      GetAllDataOnce();
    } else {
      console.error("No user is currently logged in.");
    }
  });
});
