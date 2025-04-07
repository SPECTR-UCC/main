document.addEventListener("DOMContentLoaded", function () {
  var tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  var tooltipList = [...tooltipTriggerList].map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

function validateInput(input, isValid) {
  if (input.value.trim() === "") {
    input.classList.remove("valid", "invalid");
  } else {
    if (isValid) {
      input.classList.add("valid");
      input.classList.remove("invalid");
    } else {
      input.classList.add("invalid");
      input.classList.remove("valid");
    }
  }
}

function validateField(event) {
  const input = event.target;
  let isValid = false;

  if (input.id === "fname") {
    isValid = /^[A-Za-z\s]{1,20}$/.test(input.value.trim());
  } else if (input.id === "lname") {
    isValid = /^[A-Za-z\s]{1,13}$/.test(input.value.trim());
  } else if (input.id === "emailCon") {
    isValid = /^[^\s@]+@(gmail\.com|outlook\.com)$/.test(input.value.trim());
  } else if (input.id === "contact_no") {
    isValid = /^09\d{9}$/.test(input.value.trim());
  } else if (input.id === "message") {
    isValid = input.value.trim().length > 0;
  }

  validateInput(input, isValid);
}

function attachInputListeners() {
  const inputs = document.querySelectorAll(
    "#contactForm input, #contactForm textarea"
  );
  inputs.forEach((input) => {
    input.addEventListener("input", validateField);
  });
}

const successBanner = document.getElementById("successBanner");
const failedBanner = document.getElementById("failedBanner");

document.addEventListener("DOMContentLoaded", attachInputListeners);

function validateForm() {
  let isFormValid = true;

  // Get element references
  const fname = document.getElementById("fname");
  const lname = document.getElementById("lname");
  const emailCon = document.getElementById("emailCon");
  const cnumber = document.getElementById("contact_no");
  const message = document.getElementById("message");

  // Validate all fields
  const fnameIsValid = /^[A-Za-z\s]{1,20}$/.test(fname.value.trim());
  validateInput(fname, fnameIsValid);
  if (!fnameIsValid) isFormValid = false;

  const lnameIsValid = /^[A-Za-z\s]{1,16}$/.test(lname.value.trim());
  validateInput(lname, lnameIsValid);
  if (!lnameIsValid) isFormValid = false;

  const emailIsValid = /^[^\s@]+@(gmail\.com|outlook\.com)$/.test(
    emailCon.value.trim()
  );
  validateInput(emailCon, emailIsValid);
  if (!emailIsValid) isFormValid = false;

  const phoneIsValid = /^09\d{9}$/.test(cnumber.value.trim());
  validateInput(cnumber, phoneIsValid);
  if (!phoneIsValid) isFormValid = false;

  const messageIsValid = message.value.trim().length > 0;
  validateInput(message, messageIsValid);
  if (!messageIsValid) isFormValid = false;

  return isFormValid;
}

function sendEmail() {
  if (validateForm()) {
    // Get reCAPTCHA response
    const recaptchaResponse = grecaptcha.getResponse();

    if (!recaptchaResponse) {
      failedBanner.textContent = "Please complete the reCAPTCHA.";
      failedBanner.style.display = "block";
      setTimeout(() => {
        failedBanner.style.display = "none";
      }, 2500);
      return;
    }

    // Prepare parameters for email service
    const params = {
      fname: document.getElementById("fname").value.trim(),
      lname: document.getElementById("lname").value.trim(),
      email: document.getElementById("email").value.trim(),
      cnumber: document.getElementById("contact_no").value.trim(),
      message: document.getElementById("message").value.trim(),
      "g-recaptcha-response": recaptchaResponse,
    };

    // Send email using EmailJS
    emailjs
      .send("service_4y99tbo", "template_17szvfu", params)
      .then(() => {
        successBanner.style.display = "block";
        document.getElementById("contactForm").reset();
        grecaptcha.reset();
        setTimeout(() => {
          successBanner.style.display = "none";
        }, 3000);

        // Reset the borders
        const inputs = document.querySelectorAll(
          "#contactForm input, #contactForm textarea"
        );
        inputs.forEach((input) => {
          input.classList.remove("valid", "invalid");
        });
      })
      .catch((error) => {
        failedBanner.textContent = "Failed to send email. Please try again.";
        failedBanner.style.display = "block";
        setTimeout(() => {
          failedBanner.style.display = "none";
        }, 2500);
        console.error("EmailJS Error:", error);
      });
  } else {
    failedBanner.textContent = "Please fix the errors in the form.";
    failedBanner.style.display = "block";
    setTimeout(() => {
      failedBanner.style.display = "none";
    }, 2500);
  }
}