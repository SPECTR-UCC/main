function EditStaffProvince() {
    const region = document.getElementById("editRegion").value;
    const provinceSelect = document.getElementById("editProvince");
    const citySelect = document.getElementById("editCity");
    const barangaySelect = document.getElementById("editBarangay");

    provinceSelect.innerHTML = '<option value="">Select Province</option>';
    citySelect.innerHTML = '<option value="">Select City</option>';
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && addressData[region]) {
        for (const province in addressData[region]) {
            provinceSelect.innerHTML += `<option value="${province}">${province}</option>`;
        }
    }
}


function EditStaffCity() {
    const region = document.getElementById("editRegion").value;
    const province = document.getElementById("editProvince").value;
    const citySelect = document.getElementById("editCity");
    const barangaySelect = document.getElementById("editBarangay");

    citySelect.innerHTML = '<option value="">Select City</option>';
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && province && addressData[region][province]) {
        for (const city in addressData[region][province]) {
            citySelect.innerHTML += `<option value="${city}">${city}</option>`;
        }
    }
}

function EditStaffBarangay() {
    const region = document.getElementById("editRegion").value;
    const province = document.getElementById("editProvince").value;
    const city = document.getElementById("editCity").value;
    const barangaySelect = document.getElementById("editBarangay");

    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && province && city && addressData[region][province][city]) {
        addressData[region][province][city].forEach(barangay => {
            barangaySelect.innerHTML += `<option value="${barangay}">${barangay}</option>`;
        });
    }
}
