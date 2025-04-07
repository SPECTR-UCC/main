import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

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
export const db = getDatabase(app);
export const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
  //LOGIN FORM
  const Loginform = document.getElementById("loginForm");
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const feedback = document.getElementById("passwordFeedback");

  // VIEW ACCOUNT MODAL
  window.viewButtonClicked = function (company_email) {
    const dbRef = ref(db, "Registered_Accounts");

    onValue(
      dbRef,
      (snapshot) => {
        snapshot.forEach((childSnapshot) => {
          if (childSnapshot.val().company_email === company_email) {
            const userData = childSnapshot.val();

            // Populate modal fields with user data
            document.getElementById("viewFirstname").value =
              userData.firstname || "";
            document.getElementById("viewMiddlename").value =
              userData.middlename || "";
            document.getElementById("viewLastname").value =
              userData.lastname || "";
            document.getElementById("viewContactNo").value = userData.contact_no
              ? userData.contact_no.slice(3)
              : "";
            document.getElementById("viewGender").value = userData.gender || "";
            document.getElementById("viewEmail").value = userData.email || "";
            document.getElementById("viewRegion").value = userData.region || "";
            document.getElementById("viewProvince").value =
              userData.province || "";
            document.getElementById("viewCity").value = userData.city || "";
            document.getElementById("viewBarangay").value =
              userData.barangay || "";
            document.getElementById("viewAddressInfo").value =
              userData.address_info || "";
            document.getElementById("viewCompanyName").value =
              userData.company_name || "";
            document.getElementById("viewCompanyBranch").value =
              userData.company_branch || "";
            document.getElementById("viewCompanyEmail").value =
              userData.company_email || "";
            document.getElementById("viewTelephoneNo").value =
              userData.company_telephone_no || "";
            document.getElementById("viewCompanyAddressInfo").value =
              userData.company_address || "";
            document.getElementById("viewCompanyRegion").value =
              userData.company_region || "";
            document.getElementById("viewCompanyProvince").value =
              userData.company_province || "";
            document.getElementById("viewCompanyCity").value =
              userData.company_city || "";
            document.getElementById("viewCompanyBarangay").value =
              userData.company_barangay || "";

            // Show the modal
            $("#viewAccountModal").modal("show");
          }
        });
      },
      { onlyOnce: true }
    );
  };

  // DATATABLE
  function AddAllItemsToTable(TheUser) {
    if (!Array.isArray(TheUser)) {
      console.error("TheUser is not an array:", TheUser);
      return;
    }

    let tbody = document.getElementById("tbody_accountmanagement");
    if (!tbody) {
      console.error("Table body not found!");
      return;
    }

    // 🔹 Reset table content
    tbody.innerHTML = "";

    let table;
    if ($.fn.DataTable.isDataTable("#example")) {
      table = $("#example").DataTable();
      table.clear().draw();
    } else {
      table = $("#example").DataTable({
        columns: [
          { title: "Email", className: "text-center" },
          { title: "Company Name", className: "text-center" },
          { title: "Branch", className: "text-center" },
          { title: "City", className: "text-center" },
          { title: "Actions", className: "text-center" },
        ],
        buttons: [
          { extend: "copy", exportOptions: { columns: ":not(:last-child)" } },
          { extend: "csv", exportOptions: { columns: ":not(:last-child)" } },
          { extend: "excel", exportOptions: { columns: ":not(:last-child)" } },
          { extend: "pdf", exportOptions: { columns: ":not(:last-child)" } },
          { extend: "print", exportOptions: { columns: ":not(:last-child)" } },
        ],
      });

      table.buttons().container().appendTo("#example_wrapper .col-md-6:eq(0)");
    }

    // Avoid modifying original array
    const reversedUsers = [...TheUser].reverse();

    // Insert rows into DataTable (ONLY ONCE)
    reversedUsers.forEach((user) => {
      if (
        !user.company_email ||
        !user.company_name ||
        !user.company_branch ||
        !user.company_city
      ) {
        console.warn("Skipping user with missing data:", user);
        return;
      }

      let actionButtons = `
  <button class="btn text-sm" style="background-color:#0b0b14;color:#2ff29e;" onclick="viewButtonClicked('${user.company_email}')">
    <i class="bi bi-eye me-1"></i> View
  </button>`;

      try {
        table.row
          .add([
            `<span style="color: white;">${user.company_email}</span>`,
            `<span style="color: white;">${user.company_name}</span>`,
            `<span style="color: white;">${user.company_branch}</span>`,
            `<span style="color: white;">${user.company_city}</span>`,
            actionButtons,
          ])
          .draw();
      } catch (error) {
        console.error("Error adding row:", error);
      }
    });
  }

  // FETCH DATA
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

  // Check authentication state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userUID = user.uid;
      const superadminRef = ref(db, `superadmin/${userUID}`);
      get(superadminRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            console.log("User is a superadmin.");

            // Redirect superadmin to main dashboard if on login page
            if (window.location.pathname === "/Zq3cT404") {
              window.location.href = "/Zq3cT404/main";
            }
          } else {
            console.warn("Access denied: Not a superadmin.");
            signOut(auth);
            window.location.href = "/Zq3cT404"; // Redirect unauthorized users back to login
          }
        })
        .catch((error) => {
          console.error("Error checking superadmin status:", error);
        });
    } else {
      console.log("No user logged in.");

      // Redirect to login if trying to access main dashboard without authentication
      if (window.location.pathname === "/Zq3cT404/main") {
        window.location.href = "/Zq3cT404";
      }
    }
  });

  // LOGOUT
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      console.log("Attempting to log out...");
      signOut(auth)
        .then(() => {
          console.log("User successfully logged out.");
          window.location.href = "/Zq3cT404";
        })
        .catch((error) => {
          console.error("Error logging out:", error);
        });
    });
  }

  if (!Loginform) {
    console.log("Login form not found.");
    return;
  }

  // FORM SUBMISSION
  Loginform.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailField.value.trim();
    const password = passwordField.value.trim();

    if (email === "" || password === "") {
      alert("Both fields are required.");
      return;
    }

    // Authenticate the user
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userUID = user.uid;

        // Check if the user is a superadmin
        const superadminRef = ref(db, `superadmin`);
        get(superadminRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              console.log("Superadmin verified. Redirecting...");
              window.location.href = "/Zq3cT404/main";
            } else {
              alert("Access denied. You are not a superadmin.");
              signOut(auth);
            }
          })
          .catch((error) => {
            console.error("Error checking superadmin status:", error);
          });
      })
      .catch((error) => {
        console.error("Authentication failed:", error);
        alert("Invalid email or password.");
      });
  });
});
