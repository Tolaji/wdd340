document.addEventListener('DOMContentLoaded', (event) => {
    const currentYearElement = document.getElementById('currentYear');
    const currentYear = new Date().getFullYear();
    if (currentYearElement) {
        currentYearElement.textContent = currentYear;
    }

    const lastModifiedElement = document.getElementById('lastModified');
    const lastModified = document.lastModified;
    if (lastModifiedElement) {
        lastModifiedElement.textContent = `Last Modified: ${lastModified}`;
    }
});
// ----------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById("hamburger");
    const navbar = document.getElementById("navbar");

    hamburger.addEventListener("click", function () {
        navbar.classList.toggle("show");
        hamburger.classList.toggle("open");
    });
});

// --------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".navbar-link");
    const currentPage = window.location.pathname.split("/").pop();

    links.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        }
    });
});
