function EditCompanyProvince() {
    const region = document.getElementById("editCompanyRegion").value;
    const provinceSelect = document.getElementById("editCompanyProvince");
    const citySelect = document.getElementById("editCompanyCity");
    const barangaySelect = document.getElementById("editCompanyBarangay");

    provinceSelect.innerHTML = '<option value="">Select Province</option>';
    citySelect.innerHTML = '<option value="">Select City</option>';
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && addressData[region]) {
        for (const province in addressData[region]) {
            provinceSelect.innerHTML += `<option value="${province}">${province}</option>`;
        }
    }
}


function EditCompanyCity() {
    const region = document.getElementById("editCompanyRegion").value;
    const province = document.getElementById("editCompanyProvince").value;
    const citySelect = document.getElementById("editCompanyCity");
    const barangaySelect = document.getElementById("editCompanyBarangay");

    citySelect.innerHTML = '<option value="">Select City</option>';
    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && province && addressData[region][province]) {
        for (const city in addressData[region][province]) {
            citySelect.innerHTML += `<option value="${city}">${city}</option>`;
        }
    }
}

function EditCompanyBarangay() {
    const region = document.getElementById("editCompanyRegion").value;
    const province = document.getElementById("editCompanyProvince").value;
    const city = document.getElementById("editCompanyCity").value;
    const barangaySelect = document.getElementById("editCompanyBarangay");

    barangaySelect.innerHTML = '<option value="">Select Barangay</option>';

    if (region && province && city && addressData[region][province][city]) {
        addressData[region][province][city].forEach(barangay => {
            barangaySelect.innerHTML += `<option value="${barangay}">${barangay}</option>`;
        });
    }
}
