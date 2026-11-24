// Runs immediately (before the page paints), so there is no flash of the wrong theme
(function () {
  const saved = localStorage.getItem("theme");
  const prefersDark =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
})();

document.addEventListener("DOMContentLoaded", function () {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "theme-toggle";
  btn.setAttribute("aria-label", "Toggle dark mode");

  function updateIcon() {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    btn.textContent = dark ? "☀️" : "🌙";
  }

  btn.addEventListener("click", function () {
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = dark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateIcon();
    // lets the dashboard redraw its chart in the new colors
    window.dispatchEvent(new Event("themechange"));
  });

  // Place the button: before Logout if there is one, else in the navbar, else floating
  const logoutBtn = document.getElementById("logoutBtn");
  const navLinks = document.querySelector(".nav-links");

  if (logoutBtn) {
    logoutBtn.parentNode.insertBefore(btn, logoutBtn);
  } else if (navLinks) {
    navLinks.appendChild(btn);
  } else {
    btn.classList.add("floating"); // login and register pages
    document.body.appendChild(btn);
  }

  updateIcon();
});