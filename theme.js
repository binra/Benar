// ======================
// Theme Toggle (Light / Dark Mode)
// ======================

// Apply saved theme immediately (before the page finishes loading)
// to avoid a flash of the wrong theme.
if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark-mode");
}

document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("themeToggle");

    if (!btn) return;

    function updateIcon() {

        const isDark = document.documentElement.classList.contains("dark-mode");

        btn.textContent = isDark ? "☀️" : "🌙";

    }

    updateIcon();

    btn.addEventListener("click", () => {

        document.documentElement.classList.toggle("dark-mode");

        const isDark = document.documentElement.classList.contains("dark-mode");

        localStorage.setItem("theme", isDark ? "dark" : "light");

        updateIcon();

    });

});
