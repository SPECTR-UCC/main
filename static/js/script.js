document.addEventListener("DOMContentLoaded", function () {
  const links = document.querySelectorAll("#sidebar .event-link a");
  const contentItems = document.querySelectorAll(".content-item");
  const profileLink = document.getElementById("profile-link");

  // DATE DISPLAY
  const dateElement = document.getElementById("currentDate");
  const date = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = date.toLocaleDateString(undefined, options);
  if (dateElement) dateElement.textContent = formattedDate;

  /* FIREBASE FETCHING */
  let UserInfo = JSON.parse(sessionStorage.getItem("user-info"));

  // console.log(UserInfo);

  let userFirstname = document.getElementById("user_firstname");
  let displayCompanyName = document.getElementById("displayCompanyName");
  let displayCompanyName2 = document.getElementById("displayCompanyName2");
  let displayCompanyName3 = document.getElementById("displayCompanyName_staff");
  let displayCompanyBranch = document.getElementById("displayCompanyBranch");
  let displayCompanyTelephoneNo = document.getElementById(
    "displayCompanyTelephoneNo"
  );

  // Helper function to update element text
  function updateElementText(element, value) {
    if (element) {
      element.innerText = value || "N/A"; // Default to "N/A" if value is undefined
    }
  }

  // Display user info with fallback values
  if (UserInfo) {
    updateElementText(userFirstname, UserInfo.firstname);
    updateElementText(displayCompanyName, UserInfo.company_name);
    updateElementText(displayCompanyName2, UserInfo.company_name);
    updateElementText(displayCompanyName3, UserInfo.company_name);
    updateElementText(displayCompanyBranch, UserInfo.company_branch);
    updateElementText(displayCompanyTelephoneNo, UserInfo.company_telephone_no);
  } else {
    console.log("UserInfo is not available.");
  }

  /* SIDEBAR TOGGLE */
  if (typeof $ !== "undefined") {
    $(document).ready(function () {
      $("#sidebarCollapse").on("click", function () {
        $("#sidebar").toggleClass("active");
      });
    });
  } else {
    document
      .getElementById("sidebarCollapse")
      ?.addEventListener("click", function () {
        document.getElementById("sidebar").classList.toggle("active");
      });
  }

  /* START CONTENT AND SIDEBAR LOGIC */
  // Load the last active link and content from localStorage
  const lastActiveContentId = localStorage.getItem("activeContent");

  if (lastActiveContentId) {
    links.forEach((link) => {
      if (link.getAttribute("href") === `#${lastActiveContentId}`) {
        link.classList.add("active-link");
      }
    });

    contentItems.forEach((item) => {
      item.style.display = item.id === lastActiveContentId ? "block" : "none";
    });

    // Set initial title based on stored active content
    const activeContent = document.querySelector(`#${lastActiveContentId}`);
    if (activeContent) {
      document.title = `${activeContent.dataset.title}`;
    }
  } else {
    // Set Default Active Link
    const defaultLink = document.querySelector(
      "#sidebar .event-link a[href='#content1']"
    );
    if (defaultLink) {
      defaultLink.classList.add("active-link");
      document.querySelector("#content1").style.display = "block";
      document.title = `Dashboard`;
    }
  }

  // Click Event for Sidebar Links
  links.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();

      const href = this.getAttribute("href");

      if (!href || !href.startsWith("#")) {
        console.error("Invalid href attribute:", href);
        return;
      }

      const targetContentId = href.substring(1);
      const targetContent = document.querySelector(`#${targetContentId}`);

      if (targetContent) {
        document
          .querySelectorAll(".content-item")
          .forEach((item) => (item.style.display = "none"));
        targetContent.style.display = "block";

        // Remove active class from all links
        links.forEach((l) => l.classList.remove("active-link"));
        this.classList.add("active-link");

        // Save the active content to localStorage
        localStorage.setItem("activeContent", targetContentId);

        // Update the page title dynamically
        document.title = `${targetContent.dataset.title}`;
      } else {
        console.error(`Target content with ID ${targetContentId} not found.`);
      }
    });
  });

  /* END CONTENT AND SIDEBAR LOGIC */

  /*SHOW PASSWORD AND PIN EYE TOGGLER*/
  $(document).ready(function () {
    const togglePasswordVisibility = (passwordInput, eyeIcon, eyeSlashIcon) => {
      const type =
        passwordInput.attr("type") === "password" ? "text" : "password";
      passwordInput.attr("type", type);
      eyeIcon.toggleClass("d-none");
      eyeSlashIcon.toggleClass("d-none");
    };

    $(".toggle-password-btn").on("click", function () {
      const targetInputId = $(this).data("target");
      const passwordInput = $("#" + targetInputId);
      const eyeIcon = $(this).find("i.bi-eye");
      const eyeSlashIcon = $(this).find("i.bi-eye-slash");
      togglePasswordVisibility(passwordInput, eyeIcon, eyeSlashIcon);

      const newPasswordInput = $("#newPassword");
      const confirmNewPasswordInput = $("#confirmNewPassword");

      if (targetInputId === "confirmNewPassword") {
        togglePasswordVisibility(
          newPasswordInput,
          $("#passwordToggleBtn i.bi-eye"),
          $("#passwordToggleBtn i.bi-eye-slash")
        );
      } else if (targetInputId === "newPassword") {
        togglePasswordVisibility(
          confirmNewPasswordInput,
          $("#passwordToggleBtn i.bi-eye"),
          $("#passwordToggleBtn i.bi-eye-slash")
        );
      }
    });
  });
});

document
  .getElementById("editAccountBtn")
  .addEventListener("click", function (event) {
    event.preventDefault();

    // Hide all content sections
    document
      .querySelectorAll(".content-item")
      .forEach((item) => (item.style.display = "none"));

    // Show the "Edit Account" section
    document.getElementById("editAccount").style.display = "block";

    // Close the modal
    var modal = bootstrap.Modal.getInstance(
      document.getElementById("yourAccModal")
    );
    modal.hide();

    // Update URL hash
    window.location.hash = "#editAccount";
  });
