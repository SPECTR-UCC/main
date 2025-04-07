// Import Firebase functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";


// Firebase configuration
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const storage = getStorage(app);

let positionInput = document.getElementById("position");
let idNumberInput = document.getElementById("staff_idNo");
let staff_firstNameInput = document.getElementById("staff_firstName");
let staff_middleNameInput = document.getElementById("staff_middleName");
let staff_lastNameInput = document.getElementById("staff_lastName");
let staffcontactNoInput = document.getElementById('staff_contactNo');
let genderInput = document.getElementById('staff_gender');
let staffRegionInput = document.getElementById('staff_region');
let staffProvinceInput = document.getElementById('staff_province');
let staffCityInput = document.getElementById('staff_city');
let staffBarangayInput = document.getElementById('staff_barangay');
let staffAddressInfoInput = document.getElementById('staff_addressInfo');
let mainForm = document.getElementById("mainform");


let staff_firstNameFeedback = document.getElementById("staff_firstNameFeedback");
let staff_middleNameFeedback = document.getElementById("staff_middleNameFeedback");
let staff_lastNameFeedback = document.getElementById("staff_lastNameFeedback");
let staff_ContactNoFeedback = document.getElementById("staff_ContactNoFeedback");
let staff_idNumberFeedback = document.getElementById("staff_idNumberFeedback");

// Buttons
const createButton = document.getElementById("add_staff");
const webcamButton = document.getElementById("webcamBtn");

// Webcam Variables
const webcamVideo = document.getElementById("webcam");
let hasCapturedImage = false;
let isCapturing = false;
let currentStream = null;
let capturedImageBase64 = null;


// Initially disable the buttons
createButton.disabled = true;
webcamButton.disabled = true;

// Function to validate name fields (only letters allowed)
function isValidName(name) {
    return /^[a-zA-Z\s]+$/.test(name);
}

// Function to validate the contact number format
function isValidContactNo(staffcontactNoInput) {
    // Check if the number starts with 9 and has 9 more digits
    return /^9\d{9}$/.test(staffcontactNoInput);
}

createButton.addEventListener('click', function (e) {
    e.preventDefault();

    // Validate all fields before proceeding with the Firebase save operation
    if (!mainForm.checkValidity() ||
        !isValidName(staff_firstNameInput.value) ||
        !isValidName(staff_middleNameInput.value) ||
        !isValidName(staff_lastNameInput.value) ||
        !isValidContactNo(staffcontactNoInput.value) ||
        !staffRegionInput.value.trim() ||
        !staffProvinceInput.value.trim() ||
        !staffCityInput.value.trim() ||
        !staffBarangayInput.value.trim() ||
        !staffAddressInfoInput.value.trim()) {

        mainForm.classList.add('was-validated'); // Add Bootstrap validation class
        return; // Stop if any form field is invalid
    }

    // Get logged-in user's UID
    const user = auth.currentUser;
    const contactNumberWithPrefix = "+63" + staffcontactNoInput.value;

    if (user) {
        const uid = user.uid; // Logged-in user's UID

        // Check if ID number is already taken under this user's staff management
        const idNumber = idNumberInput.value;
        get(child(ref(db), `Registered_Accounts/${uid}/Staff_Management/${idNumber}`))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    idNumberInput.classList.add('is-invalid');
                    idNumberInput.classList.remove('is-valid');
                    window.alert("ID number is already taken. Try another one.");
                    staff_idNumberFeedback.style.display = 'block';
                } else {
                    const imageRef = storageRef(storage, `Registered_Accounts/${uid}/Staff_Management/${idNumber}/profile.png`);
                    // Upload the captured image
                    if (capturedImageBase64) {
                        uploadString(imageRef, capturedImageBase64, 'data_url')
                            .then(() => {
                                // Get the image's download URL
                                return getDownloadURL(imageRef);
                            })
                            .then((downloadURL) => {
                                // Save the staff data with the image URL
                                return set(ref(db, `Registered_Accounts/${uid}/Staff_Management/${idNumber}`), {
                                    position: positionInput.value,
                                    idnumber: idNumber,
                                    staff_firstname: staff_firstNameInput.value,
                                    staff_middlename: staff_middleNameInput.value,
                                    staff_lastname: staff_lastNameInput.value,
                                    staff_contact_no: contactNumberWithPrefix,
                                    staff_gender: genderInput.value,
                                    staff_region: staffRegionInput.value,
                                    staff_province: staffProvinceInput.value,
                                    staff_city: staffCityInput.value,
                                    staff_barangay: staffBarangayInput.value,
                                    staff_address_info: staffAddressInfoInput.value,
                                    staff_image_url: downloadURL // Save the image URL
                                });
                            })
                            .then(() => {
                                let staffSuccessModal = new bootstrap.Modal(document.getElementById('savechangesModal'));
                                document.querySelector("#savechangesModal .modal-body p").innerText =
                                    "Staff Successfully Registered!";
                                console.log("Staff data saved successfully!");
                                staffSuccessModal.show();

                                // Reset the form fields
                                mainForm.reset(); // Reset the form

                                // Reset feedback messages and validation states
                                resetValidationStates();

                                // Reset the webcam and image capture
                                resetWebcamState();
                            })
                            .catch((error) => {
                                console.error("Error saving staff details: ", error);
                                
                            });
                    } else {
                        console.error("No image captured. Unable to proceed.");
                    }
                }
            })
            .catch((error) => {
                console.error("Error checking ID number: ", error);
            });
    } else {
        console.error("User is not logged in.");
    }
});

// Reset Validation States: Removes the valid/invalid classes and hides the feedback
function resetValidationStates() {
    staff_firstNameFeedback.style.display = 'none';
    staff_middleNameFeedback.style.display = 'none';
    staff_lastNameFeedback.style.display = 'none';
    staff_ContactNoFeedback.style.display = 'none';
    staff_idNumberFeedback.style.display = 'none';

    // Remove 'is-valid' and 'is-invalid' classes from inputs
    document.querySelectorAll(".form-control").forEach(input => {
        input.classList.remove('is-valid', 'is-invalid');
    });
}

// Reset the Webcam State
function resetWebcamState() {
    hasCapturedImage = false;
    webcamButton.textContent = "Capture"; // Reset the button text
    webcamVideo.style.display = "block"; // Show the video element
    canvas.style.display = "none"; // Hide the canvas
    stopWebcam(); // Stop the webcam
    validateFormAndToggleWebcamButton(); // Update the webcam button state
}

function startWebcam() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            currentStream = stream;
            webcamVideo.srcObject = stream;

            webcamVideo.onloadedmetadata = () => {
                webcamVideo.play();
                webcamVideo.style.display = "block"; // Show the video element
                console.log("Webcam started successfully.");
            };
        })
        .catch((error) => {
            console.error("Error starting webcam:", error.message);
        });
}

function captureImage() {
    const canvas = document.createElement('canvas');
    canvas.width = webcamVideo.videoWidth;
    canvas.height = webcamVideo.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(webcamVideo, 0, 0, canvas.width, canvas.height);

    // Convert the canvas image to base64
    capturedImageBase64 = canvas.toDataURL('image/png');

    stopWebcam();
    webcamVideo.style.display = "none";
    canvas.style.display = "block";

    hasCapturedImage = true;
    validateFormAndToggleWebcamButton();
    console.log("Image captured and ready for upload.");
}


// Function to stop the webcam stream
function stopWebcam() {
    if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
        currentStream = null;
    }
}

// Event listener for the webcam button
webcamButton.addEventListener("click", () => {
    if (isCapturing) {
        // If in "capture" mode, capture the image
        captureImage();
        webcamButton.textContent = "Retake";
    } else{
        // If in "retake" mode, restart the webcam
        startWebcam();
        hasCapturedImage = false;
        webcamButton.textContent = "Capture";
        validateFormAndToggleWebcamButton(); // Update button states
    }
    isCapturing = !isCapturing; // Toggle the mode
});

// Function to validate the entire form and enable the webcam button
function validateFormAndToggleWebcamButton() {
    const allValid =
        mainForm.checkValidity() &&
        isValidName(staff_firstNameInput.value) &&
        isValidName(staff_middleNameInput.value) &&
        isValidName(staff_lastNameInput.value) &&
        isValidContactNo(staffcontactNoInput.value) &&
        staffRegionInput.value.trim() &&
        staffProvinceInput.value.trim() &&
        staffCityInput.value.trim() &&
        staffBarangayInput.value.trim() &&
        staffAddressInfoInput.value.trim();

    webcamButton.disabled = !allValid; // Enable button if all fields are valid

    if (allValid) {
        webcamButton.classList.add('btn-success');
        webcamButton.classList.remove('btn-secondary');
    } else {
        webcamButton.classList.remove('btn-success');
        webcamButton.classList.add('btn-secondary');
    }

    // Enable/disable the Create button based on form and image status
    createButton.disabled = !(allValid && hasCapturedImage);
}

// Attach input event listeners to validate form dynamically
[
    staff_firstNameInput,
    staff_middleNameInput,
    staff_lastNameInput,
    staffcontactNoInput,
    staffRegionInput,
    staffProvinceInput,
    staffCityInput,
    staffBarangayInput,
    staffAddressInfoInput
].forEach((input) => {
    input.addEventListener("input", validateFormAndToggleWebcamButton);
});

validateFormAndToggleWebcamButton();

// Event listeners for first name, middle name, and last name
staff_firstNameInput.addEventListener('input', () => {
    if (isValidName(staff_firstNameInput.value)) {
        staff_firstNameInput.classList.remove('is-invalid');
        staff_firstNameInput.classList.add('is-valid');
        staff_firstNameFeedback.style.display = 'none';
    } else if (staff_firstNameInput.value.trim() === '') {
        staff_firstNameInput.classList.remove('is-invalid');
        staff_firstNameInput.classList.remove('is-valid');
        staff_firstNameFeedback.style.display = 'none';
    }
    else {
        staff_firstNameInput.classList.remove('is-valid');
        staff_firstNameInput.classList.add('is-invalid');
        staff_firstNameFeedback.innerText = "*Invalid first name.";
        staff_firstNameFeedback.style.display = 'block';
    }
});

// Middle name input validation
staff_middleNameInput.addEventListener('input', () => {
    if (isValidName(staff_middleNameInput.value)) {
        staff_middleNameInput.classList.remove('is-invalid');
        staff_middleNameInput.classList.add('is-valid');
        staff_middleNameFeedback.style.display = 'none';
    } else if (staff_middleNameInput.value.trim() === '') {
        staff_middleNameInput.classList.remove('is-invalid');
        staff_middleNameInput.classList.remove('is-valid');
        staff_middleNameFeedback.style.display = 'none';
    }
    else {
        staff_middleNameInput.classList.remove('is-valid');
        staff_middleNameInput.classList.add('is-invalid');
        staff_middleNameFeedback.innerText = "*Invalid middle name.";
        staff_middleNameFeedback.style.display = 'block';
    }
});

// Last name input validation
staff_lastNameInput.addEventListener('input', () => {
    if (isValidName(staff_lastNameInput.value)) {
        staff_lastNameInput.classList.remove('is-invalid');
        staff_lastNameInput.classList.add('is-valid');
        staff_lastNameFeedback.style.display = 'none';
    } else if (staff_lastNameInput.value.trim() === '') {
        staff_lastNameInput.classList.remove('is-invalid');
        staff_lastNameInput.classList.remove('is-valid');
        staff_lastNameFeedback.style.display = 'none';
    }
    else {
        staff_lastNameInput.classList.remove('is-valid');
        staff_lastNameInput.classList.add('is-invalid');
        staff_lastNameFeedback.innerText = "*Invalid last name.";
        staff_lastNameFeedback.style.display = 'block';
    }
});

// Event listener for contact number validation
staffcontactNoInput.addEventListener('input', () => {
    if (isValidContactNo(staffcontactNoInput.value)) {
        staffcontactNoInput.classList.remove('is-invalid');
        staffcontactNoInput.classList.add('is-valid');
        staff_ContactNoFeedback.style.display = 'none';
    } else if (staffcontactNoInput.value.trim() === '') {
        staffcontactNoInput.classList.remove('is-invalid');
        staffcontactNoInput.classList.remove('is-valid');
        staff_ContactNoFeedback.style.display = 'none';
    }
    else {
        staffcontactNoInput.classList.remove('is-valid');
        staffcontactNoInput.classList.add('is-invalid');
        staff_ContactNoFeedback.innerText = "*Invalid contact number";
        staff_ContactNoFeedback.style.display = 'block';
    }
});
