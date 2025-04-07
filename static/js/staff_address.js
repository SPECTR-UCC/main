function StaffProvince() {
    const region = document.getElementById("staff_region").value;
    const provinceSelect = document.getElementById("staff_province");
    const citySelect = document.getElementById("staff_city");
    const barangaySelect = document.getElementById("staff_barangay");

    provinceSelect.innerHTML = '<option value="">Select Province</option>';
    citySelect.innerHTML = '<option value="">Select City</option>';
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && addressData[region]) {
        for (const province in addressData[region]) {
            provinceSelect.innerHTML += `<option value="${province}">${province}</option>`;
        }
    }
}

function StaffCity() {
    const region = document.getElementById("staff_region").value;
    const province = document.getElementById("staff_province").value;
    const citySelect = document.getElementById("staff_city");
    const barangaySelect = document.getElementById("staff_barangay");

    citySelect.innerHTML = '<option value="">Select City</option>';
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && province && addressData[region][province]) {
        for (const city in addressData[region][province]) {
            citySelect.innerHTML += `<option value="${city}">${city}</option>`;
        }
    }
}

function StaffBarangay() {
    const region = document.getElementById("staff_region").value;
    const province = document.getElementById("staff_province").value;
    const city = document.getElementById("staff_city").value;
    const barangaySelect = document.getElementById("staff_barangay");

    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && province && city && addressData[region][province][city]) {
        addressData[region][province][city].forEach(barangay => {
            barangaySelect.innerHTML += `<option value="${barangay}">${barangay}</option>`;
        });
    }
}
