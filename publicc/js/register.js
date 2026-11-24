const registerForm = document.getElementById("registerForm");
const errorMsg = document.getElementById("errorMsg");

function showError(message) {
  errorMsg.textContent = message;
  errorMsg.style.display = "block";
}

registerForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (name.length < 2) {
    showError("Please enter your name.");
    return;
  }
  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    return;
  }
  if (password !== confirmPassword) {
    showError("Passwords do not match.");
    return;
  }

  errorMsg.style.display = "none";

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      showError(data.message || "Registration failed");
      return;
    }

    // Registration also logs the user in
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    window.location.href = "dashboard.html";
  } catch (err) {
    showError("Could not reach the server. Is it running?");
  }
});