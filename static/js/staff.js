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

let userID = 0;
let tbody = document.getElementById('tbody_dashboard');

document.addEventListener("DOMContentLoaded", () => {
    let tbody = document.getElementById('tbody_dashboard');

    if (!tbody) {
        console.error("Element with ID 'tbody_dashboard' not found.");
        return;
    }

    function StaffManagement(staff_firstname, staff_lastname, position) {
        let trow = document.createElement("tr");

        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let td3 = document.createElement('td');
        let td4 = document.createElement('td');

        td1.classList.add('text-center');
        td2.classList.add('text-center');
        td3.classList.add('text-center');
        td4.classList.add('text-center');

        td1.innerHTML = ++userID;
        td2.innerHTML = staff_firstname;
        td3.innerHTML = staff_lastname;
        td4.innerHTML = position;

        trow.appendChild(td1);
        trow.appendChild(td2);
        trow.appendChild(td3);
        trow.appendChild(td4);

        tbody.appendChild(trow);
    }

    function AddAllItemsToTable(TheUser) {
        userID = 0;
        tbody.innerHTML = "";

        TheUser.reverse().forEach(element => {
            StaffManagement(element.staff_firstname, element.staff_lastname, element.position);
        });
    }

    function GetAllDataOnce() {
        const user = auth.currentUser;

        if (user) {
            const uid = user.uid; // Get the UID of the logged-in user
            const dbRef = ref(db, `Registered_Accounts/${uid}/Staff_Management`);

            onValue(dbRef, (snapshot) => {
                if (snapshot.exists()) {
                    let users = [];

                    snapshot.forEach(childSnapshot => {
                        users.push(childSnapshot.val());
                    });

                    AddAllItemsToTable(users);
                } else {
                    console.warn("No staff data found for the user.");
                }
            });
        } else {
            console.error("User is not logged in.");
        }
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            GetAllDataOnce();
        } else {
            console.error("No user is currently logged in.");
        }
    });
});

