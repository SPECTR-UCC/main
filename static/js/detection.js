import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";
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

// Select DOM elements
const tbody = document.getElementById('tbody_detection');


function Detection(date, time, camera, type) {
    let trow = document.createElement("tr");

    let td1 = document.createElement('td');
    let td2 = document.createElement('td');
    let td3 = document.createElement('td');
    let td4 = document.createElement('td');
    let td5 = document.createElement('td');

    td1.classList.add('text-center');
    td2.classList.add('text-center');
    td3.classList.add('text-center');
    td4.classList.add('text-center');
    td5.classList.add('text-center');

    td1.innerHTML = date;
    td2.innerHTML = time;
    td3.innerHTML = camera;
    td4.innerHTML = type;

    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('d-flex', 'justify-content-center', 'gap-2', 'flex-column', 'flex-sm-row');

    let viewBtn = document.createElement('button');
    viewBtn.type = "button";
    viewBtn.className = "btn text-sm";
    viewBtn.style.backgroundColor = "rgb(49, 101, 147)";
    viewBtn.style.color = "white";
    viewBtn.innerHTML = "<img src='images/icons/download-button.png' alt='Download'> Download";

    buttonContainer.appendChild(viewBtn);

    td5.appendChild(buttonContainer);

    trow.appendChild(td1);
    trow.appendChild(td2);
    trow.appendChild(td3);
    trow.appendChild(td4);
    trow.appendChild(td5);

    tbody.appendChild(trow);
}

function AddAllItemsToTable(detectionData) {
    tbody.innerHTML = "";

    detectionData.reverse().forEach(element => {
        Detection(element.date, element.time, element.camera, element.type);
    });

    if ($.fn.DataTable.isDataTable('#table_detection')) {
        $('#table_detection').DataTable().clear();
        $('#table_detection').DataTable().destroy();
    }

    $(document).ready(function () {
        var table = $('#table_detection').DataTable({
            buttons: [
                { extend: 'copy', exportOptions: { columns: ':not(:last-child)' } },
                { extend: 'csv', exportOptions: { columns: ':not(:last-child)' } },
                { extend: 'excel', exportOptions: { columns: ':not(:last-child)' } },
                { extend: 'pdf', exportOptions: { columns: ':not(:last-child)' } },
                { extend: 'print', exportOptions: { columns: ':not(:last-child)' } }
            ]
        });
        table.buttons().container().appendTo('#table_detection_wrapper .col-md-6:eq(0)');
    });
}

function GetAllDataOnce() {
    const user = auth.currentUser;

    if (user) {
        const uid = user.uid;
        const dbRef = ref(db, `Registered_Accounts/${uid}/Detection`);

        onValue(dbRef, (snapshot) => {
            let detections = [];

            snapshot.forEach(cameraSnapshot => {
                cameraSnapshot.forEach(detectionSnapshot => {
                    const data = detectionSnapshot.val();
                    detections.push({
                        date: data.date,
                        time: data.time,
                        type: data.type,
                        camera: data.camera || cameraSnapshot.key
                    });
                });
            });

            AddAllItemsToTable(detections);
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