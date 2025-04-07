// Import the functions you need from the SDKs you need
import { staffData } from "./client.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
  getDatabase,
  get,
  ref,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// Your web app's Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
  const mainForm = document.getElementById("mainform");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  // Check authentication state
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userUID = user.uid;
      const ClientRef = ref(db, `Registered_Accounts/${userUID}`);
      get(ClientRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            console.log("User is a Manager.");

            // Redirect to main dashboard if on login page
            if (
              window.location.pathname === "/index" ||
              window.location.pathname === "/"
            ) {
              window.location.href = "/client";
            }
          } else {
            console.warn("Access denied: Not a Client.");
            signOut(auth);
            window.location.href = "/index"; // Redirect unauthorized users back to login
          }
        })
        .catch((error) => {
          console.error("Error checking status:", error);
        });

      const userTabsRef = ref(db, `Registered_Accounts/${user.uid}/CameraTabs`);

      onValue(userTabsRef, (snapshot) => {
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const tabData = childSnapshot.val();

            if (tabData.Id && tabData.name) {
              const tabId = tabData.Id.trim(); // Ensure no extra spaces
              const tabElement = document.getElementById(tabId);

              if (tabElement) {
                tabElement.textContent = tabData.name;
              } else {
                console.warn(`Tab with ID "${tabId}" not found in the DOM.`);
              }
            } else {
              console.warn("Invalid tab data format:", tabData);
            }
          });
        } else {
          return;
        }
      });

      staffData();
    } else {
      console.log("No user logged in.");
      if (window.location.pathname === "/client") {
        window.location.href = "/index";
      }
    }
  });

  let SignInUser = async (evt) => {
    evt.preventDefault();

    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    if (emailValue === "" || passwordValue === "") {
      alert("Both fields are required.");
      return;
    }

    try {
      const credentials = await signInWithEmailAndPassword(
        auth,
        emailValue,
        passwordValue
      );

      // ✅ Corrected reference to get all registered accounts
      const emailSnapshot = await get(ref(db, "Registered_Accounts"));

      if (!emailSnapshot.exists()) {
        alert("No registered accounts found.");
        signOut(auth);
        return;
      }

      const accounts = emailSnapshot.val();
      let userAccount = null;
      let isStaff = false;

      for (const [accountKey, accountData] of Object.entries(accounts)) {
        // ✅ If email matches a main account, set userAccount
        if (accountData.email === emailValue) {
          userAccount = accountData;
          break;
        }

        // ✅ Navigate properly into `Staff_Management`
        if (accountData.Staff_Management) {
          for (const [staffUID, staffData] of Object.entries(
            accountData.Staff_Management
          )) {
            if (staffData.email === emailValue) {
              userAccount = staffData;
              isStaff = true;
              break;
            }
          }
        }

        // ✅ Stop searching once a user is found
        if (userAccount) break;
      }

      if (!userAccount) {
        alert("Account does not exist.");
        return;
      }

      sessionStorage.setItem("user-info", JSON.stringify(userAccount));
      sessionStorage.setItem("user-creds", JSON.stringify(credentials.user));

      // ✅ Redirect based on role
      if (isStaff) {
        console.log("✅ Staff login detected! Redirecting to /staff");
        window.location.href = "/staff";
      } else {
        console.log("✅ Client login detected! Redirecting to /client");
        window.location.href = "/client";
      }
    } catch (error) {
      console.error("❌ Sign-in error:", error);

      // ✅ Better error handling for Firebase auth
      if (error.code === "auth/wrong-password") {
        alert("Incorrect password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        alert("No user found with this email.");
      } else if (error.code === "auth/too-many-requests") {
        alert("Too many failed attempts. Please try again later.");
      } else {
        alert("An error occurred during sign-in. Please try again.");
      }
    }
  };

  const showpass = document.getElementById("togglePassword");
  if (showpass) {
    showpass.addEventListener("click", function () {
      const passwordInput = document.getElementById("password");
      const icon = this;

      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash"); // Change icon to eye-slash
      } else {
        passwordInput.type = "password";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye"); // Change icon back to eye
      }
    });
  } else {
    return;
  }

  if (mainForm) {
    mainForm.addEventListener("submit", SignInUser);
  } else {
    return;
  }

  if (!showpass) {
    return;
  }

  // LOGOUT
  const logoutBtn = document.getElementById("signoutbutton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      console.log("Attempting to log out...");
      signOut(auth)
        .then(() => {
          console.log("User successfully logged out.");
          window.location.href = "/index";
        })
        .catch((error) => {
          console.error("Error logging out:", error);
        });
    });
  }
});
