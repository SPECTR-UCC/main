// Initialize Firebase
import { db } from "./admin.js";
import {
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";

/*DATE*/
document.addEventListener("DOMContentLoaded", function () {
  const dateElement = document.getElementById("currentDate");

  const date = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString(undefined, options);

  dateElement.textContent = formattedDate;

  // Reference to the 'Registered_Accounts' node
  const registeredAccountsRef = ref(db, "Registered_Accounts");

  // Fetch the accounts and count them
  get(registeredAccountsRef).then((snapshot) => {
    const accounts = snapshot.val();
    const activeUsers = accounts ? Object.keys(accounts).length : 0; // Assuming all users are active
    // const inactiveUsers = 0; // No inactive users for now

    // Update counts in the cards
    document.getElementById("activeUsersCount").innerText = activeUsers;
    // document.getElementById("inactiveUsersCount").innerText = inactiveUsers;

    // Set up the data for the chart
    const donutGraph = {
      chart: {
        type: "donut",
        height: "100%",
      },
      series: [activeUsers], // Active and Inactive users
      labels: ["Active Users"],
      plotOptions: {
        pie: {
          donut: {
            labels: {
              show: true,
              name: {
                fontSize: "22px",
                fontWeight: 600,
                color: "#ffffff", // White font for the label name
                offsetY: 20,
              },
              value: {
                fontSize: "16px",
                fontWeight: 400,
                color: "#ffffff", // White font for the value
                offsetY: -20,
              },
            },
          },
        },
      },
      colors: ["#4CAF50", "#F44336"], // Green for active, Red for inactive
      theme: {
        mode: "dark", // Ensure overall dark theme for better contrast
      },
    };

    // Render the chart
    const chartpieGraph = new ApexCharts(
      document.querySelector("#chart3"),
      donutGraph
    );
    chartpieGraph.render();
  });
});
