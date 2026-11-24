const API_URL = "/api/expenses";

// ---------- Login helpers ----------
function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

// If there is no token, send the visitor to the login page
if (!getToken()) {
  window.location.href = "login.html";
}

// Every request to the API carries the token
function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + getToken(),
  };
}

// Handles errors; a 401 means the token is missing, wrong, or expired
async function checkResponse(res) {
  if (res.status === 401) {
    logout();
    throw new Error("Please log in again.");
  }
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Something went wrong");
  }
}

// ---------- Expense API ----------
async function getExpenses() {
  const res = await fetch(API_URL, { headers: authHeaders() });
  await checkResponse(res);
  const list = await res.json();
  // MongoDB uses _id, so copy it to id for the rest of the frontend
  return list.map((e) => ({ ...e, id: e._id }));
}

async function addExpense(expense) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(expense),
  });
  await checkResponse(res);
}

async function updateExpense(id, changes) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(changes),
  });
  await checkResponse(res);
}

async function deleteExpense(id) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  await checkResponse(res);
}

async function getBudget() {
  const res = await fetch("/api/budget", { headers: authHeaders() });
  await checkResponse(res);
  const data = await res.json();
  return data.amount;
}

async function saveBudget(amount) {
  const res = await fetch("/api/budget", {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ amount }),
  });
  await checkResponse(res);
}

// ---------- Shared helpers ----------
function formatMoney(amount) {
  const sign = amount < 0 ? "-" : "";
  return sign + "₹" + Math.abs(amount).toLocaleString("en-IN");
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Show "Hi, <name>" in the navbar if the page has a #greeting element
document.addEventListener("DOMContentLoaded", function () {
  const el = document.getElementById("greeting");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (el && user) el.textContent = "Hi, " + user.name;
});

// ---------- Category icons and colors ----------
const CATEGORY_STYLE = {
  Food:          { icon: "🍔", color: "#f97316" },
  Travel:        { icon: "✈️", color: "#0ea5e9" },
  Shopping:      { icon: "🛍️", color: "#ec4899" },
  Bills:         { icon: "💡", color: "#f59e0b" },
  Entertainment: { icon: "🎬", color: "#8b5cf6" },
  Other:         { icon: "📦", color: "#6b7280" },
};

function categoryIcon(category) {
  return (CATEGORY_STYLE[category] || CATEGORY_STYLE.Other).icon;
}

function categoryColor(category) {
  return (CATEGORY_STYLE[category] || CATEGORY_STYLE.Other).color;
}

// ---------- Toast messages ----------
function showToast(message, type = "success") {
  let box = document.getElementById("toastBox");
  if (!box) {
    box = document.createElement("div");
    box.id = "toastBox";
    document.body.appendChild(box);
  }

  const toast = document.createElement("div");
  toast.className = "toast " + type;
  toast.textContent = message;
  box.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}