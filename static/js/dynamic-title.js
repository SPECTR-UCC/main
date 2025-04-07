// function showContent(contentId) {
//     // Hide all content items
//     document.querySelectorAll('.content-item').forEach(item => item.style.display = 'none');

//     // Show the selected content
//     const selectedContent = document.getElementById(contentId);
//     if (selectedContent) {
//         selectedContent.style.display = 'block';

//         // Update the document title based on data-title
//         const newTitle = selectedContent.getAttribute('data-title');
//         if (newTitle) {
//             document.title = newTitle;

//             // Save the current content ID and title to localStorage
//             localStorage.setItem('activeContentId', contentId);
//             localStorage.setItem('pageTitle', newTitle);
//         }
//     }
// }

// // Event listener for navigation links
// document.querySelectorAll('.nav-link').forEach(link => {
//     link.addEventListener('click', function (e) {
//         e.preventDefault();
//         const targetContentId = this.getAttribute('href').substring(1); // Remove '#' from href
//         showContent(targetContentId);
//     });
// });

// // On page load, show the last active content
// document.addEventListener("DOMContentLoaded", () => {
//     const savedContentId = localStorage.getItem('activeContentId') || 'content1'; // Default to 'content1'
//     const savedTitle = localStorage.getItem('pageTitle') || 'Default Title'; // Default title
//     showContent(savedContentId);

//     // Set the saved title
//     document.title = savedTitle;

//     // Optional: Add active class to the last clicked link
//     document.querySelectorAll('.nav-link').forEach(link => {
//         link.classList.toggle(
//             'active-link',
//             link.getAttribute('href').substring(1) === savedContentId
//         );
//     });
// });

function showContent(contentId) {
    // Hide all content items
    document.querySelectorAll('.content-item').forEach(item => item.style.display = 'none');

    // Show the selected content
    const selectedContent = document.getElementById(contentId);
    if (selectedContent) {
        selectedContent.style.display = 'block';

        // Update the document title based on data-title
        const newTitle = selectedContent.getAttribute('data-title');
        if (newTitle) {
            document.title = newTitle;

            // Save the current content ID and title to localStorage
            localStorage.setItem('activeContentId', contentId);
            localStorage.setItem('pageTitle', newTitle);
        }
    }
}

// Event listener for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetContentId = this.getAttribute('href').substring(1); // Remove '#' from href
        showContent(targetContentId);
    });
});

// On page load, show the last active content
document.addEventListener("DOMContentLoaded", () => {
    const savedContentId = localStorage.getItem('activeContentId') || 'content1'; // Default to 'content1'
    const savedTitle = localStorage.getItem('pageTitle') || 'Default Title'; // Default title
    showContent(savedContentId);

    // Set the saved title
    document.title = savedTitle;

    // Optional: Add active class to the last clicked link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle(
            'active-link',
            link.getAttribute('href').substring(1) === savedContentId
        );
    });
});
