const profileForm = document.getElementById("profileForm");
const passwordForm = document.getElementById("passwordForm");
const profileMsg = document.getElementById("profileMsg");
const passwordMsg = document.getElementById("passwordMsg");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");

function showMsg(el, text, ok) {
  el.textContent = text;
  el.className = "form-msg " + (ok ? "ok" : "bad");
}

// ---------- Load current details ----------
async function loadProfile() {
  try {
    const res = await fetch("/api/user/me", { headers: authHeaders() });
    await checkResponse(res);
    const user = await res.json();
    nameInput.value = user.name;
    emailInput.value = user.email;
  } catch (err) {
    showMsg(profileMsg, err.message, false);
  }
}

// ---------- Save name ----------
profileForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  if (name.length < 2) {
    showMsg(profileMsg, "Name must be at least 2 characters.", false);
    return;
  }

  try {
    const res = await fetch("/api/user/profile", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ name }),
    });
    await checkResponse(res);
    const user = await res.json();

    // keep the saved login details and the navbar greeting in sync
    localStorage.setItem("user", JSON.stringify(user));
    document.getElementById("greeting").textContent = "Hi, " + user.name;

    showMsg(profileMsg, "Profile updated.", true);
  } catch (err) {
    showMsg(profileMsg, err.message, false);
  }
});

// ---------- Change password ----------
passwordForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value;
  const newPassword = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmNewPassword").value;

  if (newPassword.length < 6) {
    showMsg(passwordMsg, "New password must be at least 6 characters.", false);
    return;
  }
  if (newPassword !== confirm) {
    showMsg(passwordMsg, "New passwords do not match.", false);
    return;
  }

  try {
    const res = await fetch("/api/user/password", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    await checkResponse(res);

    passwordForm.reset();
    showMsg(passwordMsg, "Password updated.", true);
  } catch (err) {
    showMsg(passwordMsg, err.message, false);
  }
});

document.getElementById("logoutBtn").addEventListener("click", logout);

loadProfile();