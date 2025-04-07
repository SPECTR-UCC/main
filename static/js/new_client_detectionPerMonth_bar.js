// Import Firebase modules
import { auth, db } from "./login.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

// Listen for the user's authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;

    // Reference to the 'Detection' node of the logged-in user
    const detectionRef = ref(db, `Registered_Accounts/${uid}/Detection`);

    // Fetch the data
    get(detectionRef)
      .then((snapshot) => {
        const data = snapshot.val();

        if (!data) {
          // No data found, display empty state
          document.querySelector("#detectionPerMonth").innerHTML = ` 
                    <div style="text-align: center; padding: 50px;">
                        <p style="font-size: 18px; color: #000000; font-weight: bold;">No Data Available</p>
                    </div>`;
          document.querySelector("#shopliftingCount").textContent = "0";
          return;
        }

        let totalShopliftingCount = 0;

        const monthlyData = {
          Shoplifting: Array(12).fill(0), // Initialize 12 months for Shoplifting
        };

        // Loop through each camera and each detection
        for (const camera in data) {
          for (const detectionId in data[camera]) {
            const detection = data[camera][detectionId];
            const date = new Date(detection.date); // Convert to Date object
            const month = date.getMonth(); // Get the month (0-11)

            // Increment count based on detection type
            if (detection.type === "Shoplifting") {
              monthlyData.Shoplifting[month]++;
              totalShopliftingCount++;
            }
          }
        }

        // Prepare data for the chart
        var options = {
          series: [
            {
              name: "Shoplifting",
              data: monthlyData.Shoplifting,
            },
          ],
          chart: {
            type: "bar",
            height: "350",
          },
          plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: "55%",
              borderRadius: 5,
              borderRadiusApplication: "end",
            },
          },
          dataLabels: {
            enabled: false,
          },
          stroke: {
            show: true,
            width: 2,
            colors: ["transparent"],
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
              text: "No. of Detections",
            },
          },
          colors: ["#2ff29e"],
          fill: {
            opacity: 1,
          },
          tooltip: {
            y: {
              formatter: function (val) {
                return val + " detections";
              },
            },
          },
          responsive: [
            {
              breakpoint: 768, // For tablets and mobile devices
              options: {
                chart: {
                  height: 250,
                },
                plotOptions: {
                  bar: {
                    columnWidth: "65%", // Slightly narrower bars
                  },
                },
                legend: {
                  position: "bottom", // Move legend to bottom for small screens
                  fontSize: "10px",
                },
              },
            },
          ],
        };

        // Render the chart
        var chart = new ApexCharts(
          document.querySelector("#detectionPerMonth"),
          options
        );
        chart.render();

        // Update the shoplifting count in the UI
        document.querySelector("#shopliftingCount").textContent =
          totalShopliftingCount;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  } else {
    console.log("No user is signed in.");
  }
});
