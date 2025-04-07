// Import Firebase SDK components
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  get,
  ref,
  child,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase configuration object
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
const db = getDatabase();
const auth = getAuth();
const dbref = ref(db);

// DOM Elements
const mainForm = document.getElementById("mainform");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const passwordFeedback = document.getElementById("passwordFeedback");
const forgotPasswordForm = document.getElementById("forgotPasswordForm");
const resetEmailInput = document.getElementById("forgotpassemail");
const feedbackElement = document.getElementById("noacc-feedback");

// Function to check if email exists in Firebase Realtime Database
const doesEmailExist = async (email) => {
  try {
    const snapshot = await get(child(dbref, "superadmin"));
    if (!snapshot.exists()) return false;

    const accounts = snapshot.val();
    return Object.values(accounts).some((account) => account.email === email);
  } catch (error) {
    console.error("Error checking email existence:", error);
    return false;
  }
};

// SignIn function
const signInUser = async (evt) => {
  evt.preventDefault();

  // Custom form validation
  if (!mainForm.checkValidity()) {
    mainForm.classList.add("was-validated");
    return;
  }

  // Clear previous error messages
  passwordInput.classList.remove("is-invalid");
  passwordFeedback.style.display = "none";

  try {
    // Check if email exists
    const emailExists = await doesEmailExist(emailInput.value);
    if (!emailExists) {
      alert("Account does not exist.");
      return;
    }

    // Sign in with email and password
    const credentials = await signInWithEmailAndPassword(
      auth,
      emailInput.value,
      passwordInput.value
    );
    const userSnapshot = await get(
      child(dbref, `superadmin/${credentials.user.uid}`)
    );

    if (userSnapshot.exists()) {
      sessionStorage.setItem("user-info", JSON.stringify(userSnapshot.val()));
      sessionStorage.setItem("user-creds", JSON.stringify(credentials.user));
      window.location.href = "/client";
    }
  } catch (error) {
    // Handle sign-in errors
    passwordInput.classList.add("is-invalid");
    passwordFeedback.innerText = "*Incorrect Password.";
    passwordFeedback.style.display = "block";
  }
};

// Send OTP for password reset
const sendPasswordReset = () => {
  const email = resetEmailInput.value.trim();

  // Validate email input
  if (!email) {
    feedbackElement.textContent = "*Please enter your email.";
    resetEmailInput.classList.add("is-invalid");
    return;
  }

  resetEmailInput.classList.remove("is-invalid");

  // Send password reset email
  sendPasswordResetEmail(auth, email)
    .then(() => {
      const resetEmailModal = new bootstrap.Modal(
        document.getElementById("resetEmailModal")
      );
      resetEmailModal.show();
    })
    .catch((error) => {
      // Handle errors from password reset
      let errorMessage =
        "*An unexpected error occurred. Please try again later.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "*No account found with this email address.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "*Invalid email format. Please enter a correct email.";
      }
      feedbackElement.textContent = errorMessage;
      feedbackElement.style.color = "red";
    });
};

// Reset modal state
const resetModalState = () => {
  const modal = document.querySelector(".modal");
  const inputs = modal.querySelectorAll("input");
  inputs.forEach((input) => (input.value = ""));
  inputs.forEach((input) => input.classList.remove("is-invalid"));
  feedbackElement.textContent = "";
};

// Event Listeners
mainForm.addEventListener("submit", signInUser);
document.getElementById("sendOTP").addEventListener("click", sendPasswordReset);
document.querySelectorAll(".btn-close").forEach((button) => {
  button.addEventListener("click", resetModalState);
});
