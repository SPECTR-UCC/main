// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import {
  getDatabase,
  get,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-database.js";
import {
  getAuth,
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
const dbref = ref(db);

document.addEventListener("DOMContentLoaded", function () {
  const mainForm = document.getElementById("mainform");
  const email = document.getElementById("email");
  const password = document.getElementById("password");

  let SignInUser = async (evt) => {
    evt.preventDefault();

    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    try {
      const credentials = await signInWithEmailAndPassword(
        auth,
        emailValue,
        passwordValue
      );

      // Fetch user's account data
      const emailSnapshot = await get(child(dbref, "Registered_Accounts"));
      if (!emailSnapshot.exists()) {
        alert("No registered accounts found.");
        return;
      }

      const accounts = emailSnapshot.val();
      let userAccount = null;
      let isStaff = false;

      for (const [accountKey, accountData] of Object.entries(accounts)) {
        if (accountData.email === emailValue) {
          userAccount = accountData;
          break;
        }

        if (accountData.Staff_Management) {
          for (const [uidKey, staffData] of Object.entries(
            accountData.Staff_Management
          )) {
            if (staffData.email === emailValue) {
              userAccount = staffData;
              isStaff = true;
              break;
            }
          }
        }
      }

      if (!userAccount) {
        alert("Account does not exist.");
        return;
      }

      sessionStorage.setItem("user-info", JSON.stringify(userAccount));
      sessionStorage.setItem("user-creds", JSON.stringify(credentials.user));

      if (isStaff) {
        window.location.href = "/staff";
      } else {
        window.location.href = "/client";
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert("An error occurred during sign-in. Please check your credentials.");
    }
  };

  if (mainForm) {
    mainForm.addEventListener("submit", SignInUser);
  }
});
