// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  update,
  get,
  onValue,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  fetchSignInMethodsForEmail,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firebase Configuration
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
const db = getDatabase(app);
const auth = getAuth(app);

function isValidName(name) {
  return /^[a-zA-Z\s]+$/.test(name);
}

//Email Validation
function isValidEmail(email) {
  return /^[^@]+@gmail\.com$/.test(email);
}

function isValidContactNo(editContactNo) {
  // Check if the number starts with 9 and has 9 more digits
  return /^9\d{9}$/.test(editContactNo);
}

//Function to validate the company email
function isValidCompanyEmail(editCompanyEmail) {
  // List of valid TLDs (you can expand this list as needed)
  const validTlds = [
    "com",
    "org",
    "net",
    "gov",
    "edu",
    "io",
    "co",
    "ph",
    "com.ph",
    "co.ph",
    "net.ph",
    "org.ph",
    "gov.ph",
    "edu.ph",
  ];

  // Regex pattern to match emails with no double dots, allowing Gmail and Yahoo with .com and .ph
  const emailPattern = /^[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/;

  // Check if the email matches the general pattern
  if (!emailPattern.test(editCompanyEmail)) {
    return false;
  }

  // Extract the TLD part (after the last dot)
  const tld = editCompanyEmail.split(".").pop();

  // Check if the TLD is in the list of valid TLDs
  if (!validTlds.includes(tld)) {
    return false; // Reject if the TLD is not in the validTlds list
  }

  // Additional validations: Ensure no consecutive dots, no other special characters except "@",
  // and no starting or ending dot in the local part of the email
  return (
    !/\.\./.test(editCompanyEmail) && // Ensure there are no consecutive dots
    /^[a-zA-Z0-9@._%+-]+$/.test(editCompanyEmail) && // Ensure no other special characters/symbols except "@"
    !/^\./.test(editCompanyEmail.split("@")[0]) && // Ensure the local part does not start with a dot
    !/\.$/.test(editCompanyEmail.split("@")[0])
  ); // Ensure the local part does not end with a dot
}

// Function to validate the telephone number format (00-000-0000 or 000-000-0000)
function isValidTelephoneNo(editCompanyTelephoneNo) {
  // Check if the number matches either 00-000-0000 or 000-000-0000
  return /^(\d{2}|\d{3})-\d{3}-\d{4}$/.test(editCompanyTelephoneNo);
}

const editFirstName = document.getElementById("editFirstname");
const firstNameFeedback = document.getElementById("edit_firstNameFeedback");

const editMiddleName = document.getElementById("editMiddlename");
const middleNameFeedback = document.getElementById("edit_middleNameFeedback");

const editLastName = document.getElementById("editLastname");
const lastNameFeedback = document.getElementById("edit_lastNameFeedback");

const editContactNo = document.getElementById("editContactNo");
const contactNoFeedback = document.getElementById("edit_contactNoFeedback");

const editAddressInfo = document.getElementById("editAddressInfo");
const addressInfoFeedback = document.getElementById("edit_addressInfoFeedback");

const editCompanyEmail = document.getElementById("editCompanyEmail");
const companyEmailFeedback = document.getElementById(
  "edit_companyEmailFeedback"
);

const editCompanyTelephoneNo = document.getElementById(
  "editCompanyTelephoneNo"
);
const companyTelephoneNoFeedback = document.getElementById(
  "edit_companyTelephoneNoFeedback"
);

const email = document.getElementById("staffEmail");
const password = document.getElementById("staffPassword");
const confirmPassword = document.getElementById("staffConfirmPassword");

const staffAccountEmail = document.getElementById("staffAccountEmail");

const addStaffAccForm = document.getElementById("addStaffAccForm");

const staffEmailFeedback = document.getElementById("staffEmailFeedback");
const staffPasswordFeedback = document.getElementById("staffPasswordFeedback");
const staffConfirmPasswordFeedback = document.getElementById(
  "staffConfirmPasswordFeedback"
);

// Function to check and display staff account email
function GetAllDataOnce(user) {
  if (!user) return; // Ensure user is authenticated

  const dbRef = ref(db, `Registered_Accounts/${user.uid}/Staff_Management`);

  onValue(dbRef, (snapshot) => {
    if (snapshot.exists()) {
      const staffData = snapshot.val();
      const firstStaffKey = Object.keys(staffData)[0]; // Get first staff key
      const firstStaff = staffData[firstStaffKey]; // Get first staff data

      // Populate the email in the input field
      staffAccountEmail.value = firstStaff.email;

      // Show the staff account section
      document.getElementById("addStaffAccCard").style.display = "none";
      document.getElementById("staffAccCard").style.display = "block";
    } else {
      console.log("No staff account found.");
      // Show add staff form if no staff exists
      document.getElementById("addStaffAccCard").style.display = "block";
      document.getElementById("staffAccCard").style.display = "none";
    }
  });
}

// Ensure GetAllDataOnce runs only after authentication is ready
onAuthStateChanged(auth, (user) => {
  if (user) {
    GetAllDataOnce(user); // Call only when user is logged in
  } else {
    console.log("User not logged in.");
  }
});

// Handle Form Submission
document
  .getElementById("addStaffAccbtn")
  .addEventListener("click", async (event) => {
    event.preventDefault(); // Prevent form submission

    // Validate if fields are empty
    if (!email.value || !password.value || !confirmPassword.value) {
      email.classList.remove("is-valid");
      email.classList.add("is-invalid");
      password.classList.remove("is-valid");
      password.classList.add("is-invalid");
      confirmPassword.classList.remove("is-valid");
      confirmPassword.classList.add("is-invalid");

      staffEmailFeedback.innerText = "*Email is required.";
      staffEmailFeedback.style.display = "block";
      staffPasswordFeedback.innerText = "*Password is required.";
      staffPasswordFeedback.style.display = "block";
      staffConfirmPasswordFeedback.innerText = "*Please confirm your password.";
      staffConfirmPasswordFeedback.style.display = "block";
      return;
    }

    // **Trigger Custom Validation & Stop if Invalid**
    if (!addStaffAccForm.checkValidity()) {
      addStaffAccForm.classList.add("was-validated");
      return;
    }

    const checkEmail = email.value.trim();

    // **Validate Email Format (@gmail.com)**
    if (!isValidEmail(checkEmail)) {
      email.classList.remove("is-valid");
      email.classList.add("is-invalid");
      staffEmailFeedback.innerText = "*Invalid email.";
      staffEmailFeedback.style.display = "block";
      return;
    }

    // **Check if Email Already Exists in Database**
    const emailRef = ref(db, "Registered_Accounts/");
    const snapshot_emailRef = await get(emailRef);
    let isUserEmailTaken = false;

    snapshot_emailRef.forEach((userSnapshot) => {
      const userData = userSnapshot.val();
      if (userData.email === checkEmail) {
        isUserEmailTaken = true;
      }
    });

    if (isUserEmailTaken) {
      email.classList.remove("is-valid");
      email.classList.add("is-invalid");
      staffEmailFeedback.innerText = "*Email is already taken.";
      staffEmailFeedback.style.display = "block";
      return;
    } else {
      email.classList.remove("is-invalid");
      email.classList.add("is-valid");
      staffEmailFeedback.style.display = "none";
    }

    // **Validate Password Strength**
    if (!isValidPassword(password.value)) {
      password.classList.remove("is-valid");
      password.classList.add("is-invalid");
      staffPasswordFeedback.innerText =
        "*Password must be 8-12 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";
      staffPasswordFeedback.style.display = "block";
      return;
    } else {
      password.classList.remove("is-invalid");
      password.classList.add("is-valid");
      staffPasswordFeedback.style.display = "none";
    }

    // **Check Password Confirmation**
    if (password.value !== confirmPassword.value) {
      confirmPassword.classList.remove("is-valid");
      confirmPassword.classList.add("is-invalid");
      staffConfirmPasswordFeedback.innerText = "*Passwords do not match.";
      staffConfirmPasswordFeedback.style.display = "block";
      return;
    } else {
      confirmPassword.classList.remove("is-invalid");
      confirmPassword.classList.add("is-valid");
      staffConfirmPasswordFeedback.style.display = "none";
    }

    const hashedPassword = CryptoJS.MD5(password.value).toString();
    const user = auth.currentUser;

    if (user) {
      const uid = user.uid; // Logged-in user's UID
      const staffManagementRef = ref(
        db,
        `Registered_Accounts/${uid}/Staff_Management`
      );

      // Check if the Staff_Management child exists
      get(staffManagementRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            // If Staff_Management already exists, prevent adding a new account
            alert(
              "You already have a staff account added. You cannot add more accounts."
            );
            document.getElementById("addStaffAccCard").style.display = "none";
            document.getElementById("staffAccCard").style.display = "block";
          } else {
            // If no Staff_Management exists, allow adding new staff account

            // Create staff account in Firebase Authentication
            createUserWithEmailAndPassword(auth, email.value, password.value)
              .then(async (credentials) => {
                const staffUser = credentials.user; // Get newly created staff user
                const newStaffUid = staffUser.uid; // Use Firebase Auth UID

                // Store Staff in Staff_Management under Admin's Account
                await set(
                  ref(
                    db,
                    `Registered_Accounts/${uid}/Staff_Management/${newStaffUid}`
                  ),
                  {
                    email: email.value,
                    password: hashedPassword, // Hashed password
                    uid: newStaffUid,
                    createdAt: new Date().toISOString(),
                    role: "Staff",
                  }
                );

                // Display new staff email in UI
                staffAccountEmail.value = email.value;

                // Show success modal
                let staffSuccessModal = new bootstrap.Modal(
                  document.getElementById("modalSuccess")
                );
                staffSuccessModal.show();

                // Reset form & update UI
                addStaffAccForm.reset();
                document.getElementById("addStaffAccCard").style.display =
                  "none";
                document.getElementById("staffAccCard").style.display = "block";
              })
              .catch((error) => {
                if (error.code === "auth/email-already-in-use") {
                  email.classList.add("is-invalid");
                  email.classList.remove("is-valid"); // Ensure the valid class is removed
                  staffEmailFeedback.innerText =
                    "Email is already taken. Try another.";
                  staffEmailFeedback.style.display = "block";
                  email.style.borderColor = "red"; // Force red border
                } else {
                  console.error(
                    "Error creating staff account in Firebase Auth:",
                    error
                  );
                  alert(
                    "There was an issue creating the staff account. Please try again later."
                  );
                }
              });
          }
        })
        .catch((error) => {
          console.error("Error checking staff accounts:", error);
        });
    } else {
      console.error("User is not logged in.");
      alert("Please log in to manage staff accounts.");
    }
  });

// Password Validation
function isValidPassword(password) {
  const minLength = 8;
  const maxLength = 12;
  const uppercase = /[A-Z]/;
  const lowercase = /[a-z]/;
  const number = /[0-9]/;
  const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

  return (
    password.length >= minLength &&
    password.length <= maxLength &&
    uppercase.test(password) &&
    lowercase.test(password) &&
    number.test(password) &&
    specialChar.test(password)
  );
}

// Real time validations for Add Staff Acc
email.addEventListener("blur", async () => {
  const checkEmail = email.value.trim();

  // **If the field is empty, remove all styles**
  if (!checkEmail) {
    email.classList.remove("is-valid", "is-invalid");
    staffEmailFeedback.style.display = "none";
    return;
  }

  // **Validate Email Format (@gmail.com)**
  if (!isValidEmail(checkEmail)) {
    email.classList.remove("is-valid");
    email.classList.add("is-invalid");
    staffEmailFeedback.innerText =
      "*Invalid email format. Only Gmail accounts are allowed.";
    staffEmailFeedback.style.display = "block";
    return;
  }

  let isUserEmailTaken = false;

  try {
    // **1️⃣ Check if Email Exists in Firebase Authentication**
    const signInMethods = await fetchSignInMethodsForEmail(auth, checkEmail);
    if (signInMethods.length > 0) {
      isUserEmailTaken = true;
    }

    // **2️⃣ Check if Email Exists in Registered_Accounts**
    const emailRef = ref(db, "Registered_Accounts/");
    const snapshot_emailRef = await get(emailRef);

    snapshot_emailRef.forEach((userSnapshot) => {
      const userData = userSnapshot.val();
      if (userData.email === checkEmail) {
        isUserEmailTaken = true;
      }
    });

    // **3️⃣ Check if Email Exists in Staff_Management Under Current User**
    const user = auth.currentUser;
    if (user) {
      const uid = user.uid; // Current user's UID
      const staffRef = ref(db, `Registered_Accounts/${uid}/Staff_Management/`);
      const snapshot_staffRef = await get(staffRef);

      snapshot_staffRef.forEach((staffSnapshot) => {
        const staffData = staffSnapshot.val();
        if (staffData.email === checkEmail) {
          isUserEmailTaken = true;
        }
      });
    }

    // **Update UI Based on Email Check**
    if (isUserEmailTaken) {
      email.classList.remove("is-valid");
      email.classList.add("is-invalid");
      staffEmailFeedback.innerText = "*Email is already taken.";
      staffEmailFeedback.style.display = "block";
    } else {
      email.classList.remove("is-invalid");
      email.classList.add("is-valid");
      staffEmailFeedback.style.display = "none";
    }
  } catch (error) {
    console.error("Error checking email:", error);
    staffEmailFeedback.innerText = "*Error checking email. Please try again.";
    staffEmailFeedback.style.display = "block";
  }
});

password.addEventListener("input", () => {
  // **If the field is empty, remove all styles**
  if (!password.value.trim()) {
    password.classList.remove("is-valid", "is-invalid");
    staffPasswordFeedback.style.display = "none";
    return;
  }

  // **Check if the password meets the criteria**
  if (isValidPassword(password.value)) {
    password.classList.remove("is-invalid");
    password.classList.add("is-valid");
    staffPasswordFeedback.style.display = "none";
  } else {
    password.classList.remove("is-valid");
    password.classList.add("is-invalid");
    staffPasswordFeedback.innerText =
      "*Password must be 8-12 characters, including at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.";
    staffPasswordFeedback.style.display = "block";
  }
});

confirmPassword.addEventListener("input", () => {
  // **If the field is empty, remove all styles**
  if (!confirmPassword.value.trim()) {
    confirmPassword.classList.remove("is-valid", "is-invalid");
    staffConfirmPasswordFeedback.style.display = "none";
    return;
  }

  if (confirmPassword.value != password.value) {
    confirmPassword.classList.remove("is-valid");
    confirmPassword.classList.add("is-invalid");
    staffConfirmPasswordFeedback.innerText = "*Password does not match.";
    staffConfirmPasswordFeedback.style.display = "block";
  } else {
    confirmPassword.classList.remove("is-invalid");
    confirmPassword.classList.add("is-valid");
    staffConfirmPasswordFeedback.innerText = "";
    staffConfirmPasswordFeedback.style.display = "block";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("myAccount").addEventListener("click", function () {
    const user = auth.currentUser;

    if (user) {
      const uid = user.uid;
      const dbRef = ref(db, `Registered_Accounts/${uid}`);

      get(dbRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();

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
            document.getElementById("viewCompanyTelephoneNumber").value =
              userData.company_telephone_no || "";
            document.getElementById("viewCompanyRegion").value =
              userData.company_region || "";
            document.getElementById("viewCompanyProvince").value =
              userData.company_province || "";
            document.getElementById("viewCompanyCity").value =
              userData.company_city || "";
            document.getElementById("viewCompanyBarangay").value =
              userData.company_barangay || "";
            document.getElementById("viewCompanyAddress").value =
              userData.company_address || "";

            // Show the modal
            let yourAccModal = new bootstrap.Modal(
              document.getElementById("yourAccModal")
            );
            yourAccModal.show();
          } else {
            console.error("No data found for the current user.");
          }
        })
        .catch((error) => {
          console.error("Error fetching user data: ", error);
        });
    } else {
      console.error("User is not logged in.");
    }
  });

  // Ensure modal completely closes (removes backdrop)
  document
    .getElementById("yourAccModal")
    .addEventListener("hidden.bs.modal", function () {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    });

  // Initialize Bootstrap tooltips (if you haven't already)
  var deleteBtn = document.getElementById("deleteBtn");
  var staffAccModal = new bootstrap.Modal(
    document.getElementById("staffAccModal")
  );
  var modalDelete = new bootstrap.Modal(document.getElementById("modalDelete"));

  // Initialize Tooltip
  var tooltip = new bootstrap.Tooltip(deleteBtn);

  // Add event listener for delete button click
  deleteBtn.addEventListener("click", function () {
    // Show both modals
    staffAccModal.show();
    modalDelete.show();
  });
});

// Function to fetch user data and populate fields
// function fetchUserData(user) {
//   if (!user) {
//     console.error("User not logged in.");
//     return;
//   }

//   const uid = user.uid;
//   const dbRef = ref(db, `Registered_Accounts/${uid}`);

//   get(dbRef)
//     .then((snapshot) => {
//       if (snapshot.exists()) {
//         const userData = snapshot.val();

//         // Populate modal fields with user data
//         document.getElementById("editFirstname").value = userData.firstname || "";
//         document.getElementById("editMiddlename").value = userData.middlename || "";
//         document.getElementById("editLastname").value = userData.lastname || "";
//         document.getElementById("editContactNo").value = userData.contact_no || "";
//         document.getElementById("editGender").value = userData.gender || "";
//         // document.getElementById("editClientRegion").value = userData.region || "";
//         // document.getElementById("editClientProvince").value = userData.province || "";
//         // document.getElementById("editClientCity").value = userData.city || "";
//         // document.getElementById("editClientBarangay").value = userData.barangay || "";
//         // document.getElementById("editClientAddressInfo").value = userData.address_info || "";

//         document.getElementById("editCompanyName").value = userData.company_name || "";
//         document.getElementById("editCompanyBranch").value = userData.company_branch || "";
//         document.getElementById("editCompanyEmail").value = userData.company_email || "";
//         document.getElementById("editCompanyTelephoneNo").value = userData.company_telephone_no || "";
//         // document.getElementById("editCompanyRegion").value = userData.company_region || "";
//         // document.getElementById("editCompanyProvince").value = userData.company_province || "";
//         // document.getElementById("editCompanyCity").value = userData.company_city || "";
//         // document.getElementById("editCompanyBarangay").value = userData.company_barangay || "";
//         // document.getElementById("editCompanyAddressInfo").value = userData.company_address || "";

//         console.log("User data loaded successfully.");
//       } else {
//         console.error("No user data found.");
//       }
//     })
//     .catch((error) => {
//       console.error("Error fetching user data: ", error);
//     });
// }

// Real-time Form Change Detection
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("editYourAccountForm");
  const saveBtn = document.getElementById("saveEditBtn");
  let initialFormData = {};

  // Function to get the form values
  function getFormData() {
    let formData = {};
    form.querySelectorAll("input, select").forEach((field) => {
      formData[field.id] = field.value.trim();
    });
    return formData;
  }

  // Store initial form values
  function storeInitialData() {
    initialFormData = getFormData();
  }

  // Check if form data has changed
  function hasFormChanged() {
    let currentData = getFormData();
    return Object.keys(currentData).some(
      (key) => currentData[key] !== initialFormData[key]
    );
  }

  // Listen for input changes
  form.addEventListener("input", function () {
    saveBtn.disabled = !hasFormChanged();
  });

  // Initialize the form
  storeInitialData();
});

// Function to fetch user data and populate fields
async function fetchUserData(user) {
  if (!user) return;

  const uid = user.uid;
  const dbRef = ref(db, `Registered_Accounts/${uid}`);

  try {
    const snapshot = await get(dbRef);
    if (snapshot.exists()) {
      const userData = snapshot.val();
      document.getElementById("editFirstname").value = userData.firstname || "";
      document.getElementById("editMiddlename").value =
        userData.middlename || "";
      document.getElementById("editLastname").value = userData.lastname || "";
      document.getElementById("editContactNo").value =
        userData.contact_no.slice(3) || "";
      document.getElementById("editGender").value = userData.gender || "";
      document.getElementById("editCompanyName").value =
        userData.company_name || "";
      document.getElementById("editCompanyBranch").value =
        userData.company_branch || "";
      document.getElementById("editCompanyEmail").value =
        userData.company_email || "";
      document.getElementById("editCompanyTelephoneNo").value =
        userData.company_telephone_no || "";
      console.log("User data loaded successfully.");
    } else {
      console.log("No user data found.");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

// Edit Button Functionality
// Add event listener to Edit button
document
  .getElementById("editAccountBtn")
  .addEventListener("click", function () {
    const user = auth.currentUser;
    if (user) {
      fetchUserData(user);
    }
  });

// function isAddressComplete() {
//   const region = document.getElementById('editRegion').value;
//   const province = document.getElementById('editProvince').value;
//   const city = document.getElementById('editCity').value;
//   const barangay = document.getElementById('editBarangay').value;
//   const addressinfo = document.getElementById('editAddressInfo').value;
//   const companyRegion = document.getElementById('editCompanyRegion').value;
//   const companyProvince = document.getElementById('editCompanyProvince').value;
//   const companyCity = document.getElementById('editCompanyCity').value;
//   const companyBarangay = document.getElementById('editCompanyBarangay').value;
//   const companyAddressInfo = document.getElementById('editCompanyAddressInfo').value;

//   // Check if any of the address fields are empty
//   if (!region || !province || !city || !barangay || !addressinfo || !companyRegion || !companyProvince || !companyCity || !companyBarangay || !companyAddressInfo) {
//     return false;
//   }

//   return true;
// }

// Function to get the original data for comparison

const saveChangesBtn = document.getElementById("saveEditBtn"); // Save Changes button
const confirmSaveBtn = document.getElementById("confirmSaveBtn"); // Yes button in confirmation modal
const confirmationModal = new bootstrap.Modal(
  document.getElementById("confirmationModal")
); // Confirmation modal
const saveChangesModal = new bootstrap.Modal(
  document.getElementById("savechangesModal")
); // Success modal

let originalData = {}; // Store original data for comparison

// Event listener for first name validation
editFirstName.addEventListener("input", () => {
  if (isValidName(editFirstName.value)) {
    editFirstName.classList.remove("is-invalid");
    editFirstName.classList.add("is-valid");
    firstNameFeedback.style.display = "none";
  } else {
    editFirstName.classList.remove("is-valid");
    editFirstName.classList.add("is-invalid");
    firstNameFeedback.innerText = "*Invalid first name.";
    firstNameFeedback.style.display = "block";
  }
});

editMiddleName.addEventListener("input", () => {
  if (isValidName(editMiddleName.value)) {
    editMiddleName.classList.remove("is-invalid");
    editMiddleName.classList.add("is-valid");
    middleNameFeedback.style.display = "none";
  } else {
    editMiddleName.classList.remove("is-valid");
    editMiddleName.classList.add("is-invalid");
    middleNameFeedback.innerText = "*Invalid middle name.";
    middleNameFeedback.style.display = "block";
  }
});

editLastName.addEventListener("input", () => {
  if (isValidName(editLastName.value)) {
    editLastName.classList.remove("is-invalid");
    editLastName.classList.add("is-valid");
    lastNameFeedback.style.display = "none";
  } else {
    editLastName.classList.remove("is-valid");
    editLastName.classList.add("is-invalid");
    lastNameFeedback.innerText = "*Invalid last name.";
    lastNameFeedback.style.display = "block";
  }
});

editContactNo.addEventListener("blur", async () => {
  const contactNumberWithPrefix = "+63" + editContactNo.value.trim();
  const contactNoRef = ref(db, "Registered_Accounts/");
  const snapshot = await get(contactNoRef);
  let isContactNoTaken = false;

  snapshot.forEach((userSnapshot) => {
    const userData = userSnapshot.val();
    if (userData.contact_no === contactNumberWithPrefix) {
      isContactNoTaken = true;
    }
  });

  if (isContactNoTaken) {
    editContactNo.classList.add("is-invalid");
    contactNoFeedback.innerText = "*Contact number is already taken.";
    contactNoFeedback.style.display = "block";
  } else if (isValidContactNo(editContactNo.value)) {
    editContactNo.classList.remove("is-invalid");
    editContactNo.classList.add("is-valid");
    contactNoFeedback.style.display = "none";
  } else {
    editContactNo.classList.add("is-invalid");
    contactNoFeedback.innerText = "*Invalid contact number";
    contactNoFeedback.style.display = "block";
  }
});

editCompanyEmail.addEventListener("blur", async () => {
  // Validate company email uniqueness
  if (!isValidCompanyEmail(editCompanyEmail.value)) {
    editCompanyEmail.classList.add("is-invalid");
    editCompanyEmail.classList.remove("is-valid");
    companyEmailFeedback.innerText = "*Please provide a valid company email.";
    companyEmailFeedback.style.display = "block";
    return; // Stop processing
  } else {
    // Check if company email already exists in Firebase Database
    const companyEmailRef = ref(db, `Registered_Accounts/`);
    const snapshot = await get(companyEmailRef);
    let isCompanyEmailTaken = false;
    snapshot.forEach((userSnapshot) => {
      const userData = userSnapshot.val();
      if (userData.company_email === editCompanyEmail.value) {
        isCompanyEmailTaken = true;
      }
    });
    if (isCompanyEmailTaken) {
      editCompanyEmail.classList.add("is-invalid");
      editCompanyEmail.classList.remove("is-valid");
      companyEmailFeedback.innerText = "Company email is already taken.";
      companyEmailFeedback.style.display = "block";
      return;
    } else {
      editCompanyEmail.classList.remove("is-invalid");
      editCompanyEmail.classList.add("is-valid");
      companyEmailFeedback.style.display = "none";
    }
  }
});

editCompanyTelephoneNo.addEventListener("blur", async () => {
  const companyTelephoneno = editCompanyTelephoneNo.value;
  const telephoneNoRef = ref(db, "Registered_Accounts/");
  const snapshot_telephoneNoRef = await get(telephoneNoRef);
  let isTelephoneNoTaken = false;
  const companyTelephoneNoFeedback = editCompanyTelephoneNo.nextElementSibling;

  snapshot_telephoneNoRef.forEach((userSnapshot) => {
    const userData = userSnapshot.val();
    if (userData.company_telephone_no === companyTelephoneno) {
      isTelephoneNoTaken = true;
    }
  });

  if (isTelephoneNoTaken) {
    editCompanyTelephoneNo.classList.remove("is-valid");
    editCompanyTelephoneNo.classList.add("is-invalid");
    companyTelephoneNoFeedback.innerText =
      "*Telephone number is already taken.";
    companyTelephoneNoFeedback.style.display = "block";
  } else if (isValidTelephoneNo(editCompanyTelephoneNo.value)) {
    editCompanyTelephoneNo.classList.remove("is-invalid");
    editCompanyTelephoneNo.classList.add("is-valid");
    companyTelephoneNoFeedback.style.display = "none";
  } else {
    editCompanyTelephoneNo.classList.remove("is-valid");
    editCompanyTelephoneNo.classList.add("is-invalid");
    companyTelephoneNoFeedback.innerText = "*Invalid telephone number.";
    companyTelephoneNoFeedback.style.display = "block";
  }
});

// Function to get the original data for comparison
async function getOriginalData(uid) {
  const snapshot = await get(ref(db, `Registered_Accounts/${uid}`));
  return snapshot.exists() ? snapshot.val() : {};
}

// Function to get updated form data
function getFormData() {
  return {
    firstname: document.getElementById("editFirstname").value.trim(),
    middlename: document.getElementById("editMiddlename").value.trim(),
    lastname: document.getElementById("editLastname").value.trim(),
    contact_no: editContactNo.value.trim()
      ? `+63${editContactNo.value.trim()}`
      : "", // Prepend +63
    gender: document.getElementById("editGender").value,

    region: document.getElementById("editClientRegion").value,
    province: document.getElementById("editClientProvince").value,
    city: document.getElementById("editClientCity").value,
    barangay: document.getElementById("editClientBarangay").value,
    address_info: document.getElementById("editClientAddressInfo").value.trim(),

    company_name: document.getElementById("editCompanyName").value.trim(),
    company_branch: document.getElementById("editCompanyBranch").value.trim(),
    company_email: document.getElementById("editCompanyEmail").value.trim(),
    company_telephone_no: document
      .getElementById("editCompanyTelephoneNo")
      .value.trim(),

    company_region: document.getElementById("editCompanyRegion").value,
    company_province: document.getElementById("editCompanyProvince").value,
    company_city: document.getElementById("editCompanyCity").value,
    company_barangay: document.getElementById("editCompanyBarangay").value,
    company_address_info: document
      .getElementById("editCompanyAddressInfo")
      .value.trim(),
  };
}

// Function to check if changes exist
function hasChanges(updatedData) {
  return Object.keys(updatedData).some((key) => {
    const originalValue = originalData[key] ?? ""; // Ensure undefined values are treated as empty
    return updatedData[key] !== originalValue;
  });
}

// Event listener for "Save Changes" button (Opens Confirmation Modal)
saveChangesBtn.addEventListener("click", function () {
  const updatedData = getFormData();

  // Ensure original data is loaded before checking changes
  if (!originalData || Object.keys(originalData).length === 0) {
    console.warn("Original data not loaded yet.");
    return;
  }

  // ✅ Validate first name before proceeding
  if (!isValidName(updatedData.firstname)) {
    console.error("Invalid first name. Update aborted.");
    return;
  }

  if (!isValidName(updatedData.middlename)) {
    console.error("Invalid middle name. Update aborted.");
    return;
  }

  if (!isValidName(updatedData.lastname)) {
    console.error("Invalid last name. Update aborted.");
    return;
  }

  // Validate contact number before proceeding
  if (!isValidContactNo(editContactNo.value)) {
    console.error("Invalid contact number. Update aborted.");
    return;
  }

  // Validate contact number before proceeding
  if (!isValidCompanyEmail(editCompanyEmail.value)) {
    console.error("Invalid company email. Update aborted.");
    return;
  }

  if (!isValidTelephoneNo(editCompanyTelephoneNo.value)) {
    console.error("Invalid company telephone number. Update aborted.");
    return;
  }

  // ✅ Check if changes exist before showing confirmation modal
  if (!hasChanges(updatedData)) {
    console.log("No changes detected. No action performed.");
    return; // Exit if no changes
  }

  confirmationModal.show(); // Show confirmation modal only if there are changes
});

// Event listener for "Yes" button in Confirmation Modal
confirmSaveBtn.addEventListener("click", async function () {
  confirmationModal.hide(); // Hide confirmation modal

  const user = auth.currentUser;
  if (!user) {
    console.error("User not logged in.");
    return;
  }

  const uid = user.uid;
  const userRef = ref(db, `Registered_Accounts/${uid}`);
  const updatedData = getFormData();

  // Preserve original values for unchanged fields
  const finalUpdates = {};
  Object.keys(updatedData).forEach((key) => {
    if (updatedData[key] !== "" && updatedData[key] !== originalData[key]) {
      finalUpdates[key] = updatedData[key]; // Update only changed fields
    }
  });

  // If no changes detected, do nothing (this is an extra check)
  if (Object.keys(finalUpdates).length === 0) {
    console.log("No changes detected. No update performed.");
    return;
  }

  // ✅ Update only changed fields in Firebase
  update(userRef, finalUpdates)
    .then(() => {
      console.log("User data updated successfully.");

      // Show success modal
      saveChangesModal.show();

      // Refresh displayed data
      GetAllDataOnce();

      // Update originalData after successful save
      originalData = { ...originalData, ...finalUpdates };
    })
    .catch((error) => {
      console.error("Error updating user:", error.message);
    });
});

// Load user data on modal open and store it for comparison
onAuthStateChanged(auth, async (user) => {
  if (user) {
    originalData = await getOriginalData(user.uid);
  }
});
