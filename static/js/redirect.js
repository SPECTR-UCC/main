if (!currentPath.includes('.') && currentPath !== '/') {
    fetch(currentPath + '.html')
        .then((response) => {
            if (response.ok) {
                response.text().then((html) => {
                    document.open();
                    document.write(html);
                    document.close();
                });
            } else {
                window.location.replace('/404'); // Redirect to a custom 404 page
            }
        })
        .catch((error) => {
            console.error("Error loading page:", error);
            window.location.replace('/404'); // Redirect to a custom 404 page
        });
}