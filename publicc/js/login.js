const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("errorMsg");

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
}

loginForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    return;
  }

  errorMsg.style.display = "none";

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Login failed");
      return;
    }

    // Save the token and user, then go to the dashboard
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";
  } catch (err) {
    showError("Could not reach the server. Is it running?");
  }
});