let currentStep = 1;

function showStep(step) {
    document.querySelectorAll('.step').forEach((stepEl, index) => {
        stepEl.classList.toggle('d-none', index + 1 !== step);
    });

    document.getElementById('prevBtn').disabled = step === 1;
    document.getElementById('nextBtn').classList.toggle('d-none', step === 3);
    document.getElementById('submitBtn').classList.toggle('d-none', step !== 3);
}

function changeStep(direction) {
    const steps = document.querySelectorAll('.step');
    if (currentStep + direction > 0 && currentStep + direction <= steps.length) {
        currentStep += direction;
        showStep(currentStep);
    }
}

function validateStep() {
    const currentStepEl = document.getElementById(`step${currentStep}`);
    const inputs = currentStepEl.querySelectorAll('input, select');
    let isValid = true;

    inputs.forEach(input => {
        input.classList.add('was-validated');
        if (!input.checkValidity()) {
            isValid = false;
        }
    });

    if (isValid) {
        changeStep(1);
    }
}

// Prevent form submission with "Enter" key
document.getElementById('mainform').addEventListener('keydown', function (e) {
    if (e.key === "Enter" && currentStep !== 3) {
        e.preventDefault();
        validateStep();
    }
});

showStep(currentStep);

document.getElementById('mainform').addEventListener('submit', function (e) {
    e.preventDefault();

    if (validateStep()) {
        // Simulate an AJAX request to send the data to the server (replace with real request)
        let isDataSaved = true; // Simulate success of saving data to the database

        if (isDataSaved) {
            // Hide and completely remove the multi-step modal after successful submission
            const multiStepModal = document.getElementById('multiStepModal');
            if (multiStepModal) {
                const modalInstance = new bootstrap.Modal(multiStepModal);
                modalInstance.hide(); // Hide the modal
                multiStepModal.remove(); // Completely remove the modal from DOM
            }

            // Show the custom success modal
            const successModal = new bootstrap.Modal(document.getElementById('createUserModal'));
            successModal.show(); // Show the success modal

            // Reset form and step navigation after successful submission
            document.getElementById('mainform').reset();
            currentStep = 1;
            showStep(currentStep);
        } else {
            // Handle any errors (show error message if needed)
            alert("There was an issue saving your data. Please try again.");
        }
    }
});

// After the success modal is closed, redirect to admin.html
document.getElementById('createUserModal').addEventListener('hidden.bs.modal', function () {
    window.location.href = '/Zq3cT404/main'; 
});