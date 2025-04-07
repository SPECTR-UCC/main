import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, set, ref, onValue, remove } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase();
const auth = getAuth(app);

function showErrorMessage() {
    document.getElementById('errorMessage').style.display = 'block';
}

function hideErrorMessage() {
    document.getElementById('errorMessage').style.display = 'none';
}

/*PIN MODAL */
document.getElementById('profile-link').addEventListener('click', function (event) {
    event.preventDefault();

    var modal = new bootstrap.Modal(document.getElementById('pinModal'), {
        backdrop: 'static',
        keyboard: false
    });
    modal.show();
});

document.getElementById('staff-management-link').addEventListener('click', function (event) {
    event.preventDefault();

    var modal = new bootstrap.Modal(document.getElementById('pinModal'), {
        backdrop: 'static',
        keyboard: false
    });
    modal.show();
});

// Firebase initialization and modal handlers remain unchanged

const userPinInput = document.getElementById('userPin');

// Restrict input to digits only
userPinInput.addEventListener('input', function (e) {
    // Replace non-digit characters with an empty string
    this.value = this.value.replace(/\D/g, '');
});

// Form submission handling
document.getElementById('pin-form').addEventListener('submit', function (e) {
    e.preventDefault();

    // const form = document.getElementById('pin-form');
    // if (!form.checkValidity()) {
    //     form.classList.add('was-validated');
    //     return;
    // }

    const enteredPin = userPinInput.value;

    const user = auth.currentUser;
    if (user) {
        const uid = user.uid;
        const dbRef = ref(db, `Registered_Accounts/${uid}/pincode`);

        onValue(dbRef, (snapshot) => {
            const storedPin = snapshot.val();

            if (enteredPin === storedPin) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('pinModal'));
                modal.hide();
                return;
                // Redirect to the appropriate page or display the staff management UI
            } else if (enteredPin != storedPin) {
                userPinInput.classList.remove('is-valid');
                userPinInput.classList.add('is-invalid');
                pinCodeFeedback.innerText = "*Invalid 4 Digit Verification PIN.";
                pinCodeFeedback.style.display = 'block';
                return;
            } else {
                //showErrorMessage();
                userPinInput.classList.remove('is-valid');
                userPinInput.classList.add('is-invalid');
                pinCodeFeedback.innerText = "*Invalid 4 Digit Verification PIN.";
                pinCodeFeedback.style.display = 'block';
                return;
            }
        });
    } else {
        console.error("User is not logged in.");
    }
});