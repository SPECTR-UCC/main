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
let tbody = document.getElementById('tbody_cam1');

function CameraLogs1(date, time, camera, type) {
    let trow = document.createElement("tr");

    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');

    td1.classList.add('text-center');
    td2.classList.add('text-center');
    td3.classList.add('text-center');
    td4.classList.add('text-center');

    td1.innerHTML = date;
    td2.innerHTML = time;
    td3.innerHTML = camera;
    td4.innerHTML = type;

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
        let camera = `Camera ${element.camera_index}`;
        CameraLogs1(element.date, element.time, camera, element.type);
    });

    // Clear existing DataTable instance if it already exists
    if ($.fn.DataTable.isDataTable('#cameralogs1')) {
        $('#cameralogs1').DataTable().clear();
        $('#cameralogs1').DataTable().destroy();
    }

    // Initialize DataTable without export buttons
    $(document).ready(function () {
        $('#cameralogs1').DataTable();
    });
}


function GetAllDataOnce() {
    const user = auth.currentUser;

    if (user) {
        const uid = user.uid; // Get the UID of the logged-in user
        const dbRef = ref(db, `Registered_Accounts/${uid}/Detection/CAMERA 1`);

        onValue(dbRef, (snapshot) => {
            let users = [];

            snapshot.forEach(childSnapshot => {
                users.push(childSnapshot.val());
            });

            AddAllItemsToTable(users);
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
