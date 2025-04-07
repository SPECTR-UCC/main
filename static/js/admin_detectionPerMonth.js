// Import Firebase modules
import { db } from "./admin.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

// Display a loading message
const container = document.querySelector("#detectionPerMonth");
container.innerHTML = `
    <div style="text-align: center; padding: 50px;">
        <p style="font-size: 18px; color: #888888;">Loading data, please wait...</p>
    </div>`;

// Reference to 'Registered_Accounts'
const accountsRef = ref(db, "Registered_Accounts");

// Fetch and process data
get(accountsRef)
  .then((snapshot) => {
    const data = snapshot.val();

    if (!data) {
      container.innerHTML = ` 
            <div style="text-align: center; padding: 50px;">
                <p style="font-size: 18px; color: #000000; font-weight: bold;">No Data Available</p>
            </div>`;
      return;
    }

    const currentYear = new Date().getFullYear();
    const monthlyCounts = Array(12).fill(0); // Initialize counts for 12 months

    // Process detection data
    for (const userId in data) {
      const user = data[userId];

      if (user.Detection) {
        // Limit only to Camera 1 - Camera 4
        for (let i = 1; i <= 4; i++) {
          const cameraKey = `Camera ${i}`;
          const detections = user.Detection[cameraKey];

          if (detections) {
            // Loop through detections
            for (const detectionId in detections) {
              const detection = detections[detectionId];

              // Check if detection type is "Shoplifting"
              if (detection.type === "Shoplifting") {
                const detectionDate = new Date(detection.date);
                const year = detectionDate.getFullYear();
                const month = detectionDate.getMonth(); // Zero-based index (0=Jan, 11=Dec)

                // Count only for the current year
                if (year === currentYear) {
                  monthlyCounts[month]++;
                }
              }
            }
          }
        }
      }
    }

    // Clear the loading indicator
    container.innerHTML = "";

    // Prepare chart data
    const chartBarGraph = {
      series: [
        {
          name: `Shoplifting Detections (${currentYear})`,
          data: monthlyCounts,
        },
      ],
      chart: {
        height: 350,
        type: "bar",
        foreColor: "#ffffff",
      },
      title: {
        text: `Shoplifting Detections per Month - ${currentYear}`,
        align: "center",
        style: {
          fontSize: "16px",
          fontWeight: "bold",
          color: "#ffffff",
        },
      },
      xaxis: {
        categories: [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ],
      },
      yaxis: {
        title: {
          text: "No. of Shoplifting Detections",
          style: {
            fontSize: "14px",
            fontWeight: "bold",
            color: "#ffffff",
          },
        },
      },
      colors: ["#2ff29e"],
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
      },
    };

    // Render the chart
    const barChart = new ApexCharts(container, chartBarGraph);
    barChart.render();
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
    container.innerHTML = `
        <div style="text-align: center; padding: 50px;">
            <p style="font-size: 18px; color: #ff0000;">Error loading data</p>
        </div>`;
  });
