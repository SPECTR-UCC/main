function EditClientProvince() {
    const region = document.getElementById("editClientRegion").value;
    const provinceSelect = document.getElementById("editClientProvince");
    const citySelect = document.getElementById("editClientCity");
    const barangaySelect = document.getElementById("editClientBarangay");

    provinceSelect.innerHTML = '<option value="">Select Province</option>';
    citySelect.innerHTML = '<option value="">Select City</option>';
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && addressData[region]) {
        for (const province in addressData[region]) {
            provinceSelect.innerHTML += `<option value="${province}">${province}</option>`;
        }
    }
}


function EditClientCity() {
    const region = document.getElementById("editClientRegion").value;
    const province = document.getElementById("editClientProvince").value;
    const citySelect = document.getElementById("editClientCity");
    const barangaySelect = document.getElementById("editClientBarangay");

    citySelect.innerHTML = '<option value="">Select City</option>';
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && province && addressData[region][province]) {
        for (const city in addressData[region][province]) {
            citySelect.innerHTML += `<option value="${city}">${city}</option>`;
        }
    }
}

function EditClientBarangay() {
    const region = document.getElementById("editClientRegion").value;
    const province = document.getElementById("editClientProvince").value;
    const city = document.getElementById("editClientCity").value;
    const barangaySelect = document.getElementById("editClientBarangay");

    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && province && city && addressData[region][province][city]) {
        addressData[region][province][city].forEach(barangay => {
            barangaySelect.innerHTML += `<option value="${barangay}">${barangay}</option>`;
        });
    }
}
