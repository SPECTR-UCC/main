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

document.addEventListener("DOMContentLoaded", function () {
  let tbody = document.getElementById("tbody_activitylogs");

  if (tbody) {
    tbody.innerHTML = "Some Data";
  } else {
    console.error("Error: Element with ID 'tableBody' is missing from the DOM.");
  }

  function ActivityLogs(user, date, time) {
    let trow = document.createElement("tr");

    let td1 = document.createElement("td");
    td1.style.color = "white";
    let td2 = document.createElement("td");
    td2.style.color = "white";
    let td3 = document.createElement("td");
    td3.style.color = "white";
    let td4 = document.createElement("td");
    td4.style.color = "white";

    td1.classList.add("text-center");
    td2.classList.add("text-center");
    td3.classList.add("text-center");
    td4.classList.add("text-center");

    td1.innerHTML = user;
    td2.innerHTML = date;
    td3.innerHTML = time;

    trow.appendChild(td1);
    trow.appendChild(td2);
    trow.appendChild(td3);
    trow.appendChild(td4);

    tbody.appendChild(trow);
  }

  function AddAllItemsToTable(TheUser) {
    userID = 0;
    tbody.innerHTML = "";

    TheUser.reverse().forEach((element) => {
      ActivityLogs(element.user, element.date, element.time);
    });

    if ($.fn.DataTable.isDataTable("#activitylogs")) {
      $("#activitylogs").DataTable().clear();
      $("#activitylogs").DataTable().destroy();
    }

    $(document).ready(function () {
      var table = $("#activitylogs").DataTable({
        buttons: [
          { extend: "copy", exportOptions: { columns: ":not(:last-child)" } },
          { extend: "pdf", exportOptions: { columns: ":not(:last-child)" } },
          { extend: "print", exportOptions: { columns: ":not(:last-child)" } },
        ],
      });

      table
        .buttons()
        .container()
        .appendTo("#activitylogs_wrapper .col-md-6:eq(0)");
    });
  }

  function GetAllDataOnce() {
    const dbRef = ref(db, "Registered_Accounts");

    onValue(dbRef, (snapshot) => {
      var users = [];

      snapshot.forEach((childSnapshot) => {
        users.push(childSnapshot.val());
      });

      AddAllItemsToTable(users);
    });
  }

  window.onload = GetAllDataOnce;
});
