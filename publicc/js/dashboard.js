let expenses = [];
let budget = 0;
let categoryChart = null;

// ---------- Helpers ----------
function isThisMonth(dateString) {
  const d = new Date(dateString);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

// ---------- Rendering ----------
function renderStats(month) {
  const now = new Date();
  const today = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - today + 1; // counts today
  const remaining = budget - month;

  document.getElementById("dailyAvg").textContent = formatMoney(Math.round(month / today));
  document.getElementById("daysLeft").textContent = daysLeft;
  document.getElementById("safePerDay").textContent =
    budget > 0 && remaining > 0 ? formatMoney(Math.round(remaining / daysLeft)) : "—";
}

function renderSummary() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const month = expenses
    .filter((e) => isThisMonth(e.date))
    .reduce((sum, e) => sum + e.amount, 0);

  document.getElementById("totalSpending").textContent = formatMoney(total);
  document.getElementById("monthSpending").textContent = formatMoney(month);

  renderStats(month);

  const remainingEl = document.getElementById("budgetRemaining");
  const bar = document.getElementById("budgetBar");
  const budgetText = document.getElementById("budgetText");
  const budgetPercent = document.getElementById("budgetPercent");

  // No budget set yet
  if (budget <= 0) {
    remainingEl.textContent = "Not set";
    remainingEl.classList.remove("danger", "success");
    bar.style.width = "0%";
    bar.classList.remove("over");
    budgetText.textContent = `${formatMoney(month)} spent this month`;
    budgetPercent.textContent = "No budget set. Set one below.";
    return;
  }

  const remaining = budget - month;
  remainingEl.textContent = formatMoney(remaining);
  remainingEl.classList.toggle("danger", remaining < 0);
  remainingEl.classList.toggle("success", remaining >= 0);

  const percent = Math.min(Math.round((month / budget) * 100), 100);
  bar.style.width = percent + "%";
  bar.classList.toggle("over", month > budget);

  budgetText.textContent = `${formatMoney(month)} spent of ${formatMoney(budget)}`;
  budgetPercent.textContent =
    month > budget ? "You are over budget!" : `${percent}% of budget used`;
}

function renderCategories() {
  const totals = {};
  expenses
    .filter((e) => isThisMonth(e.date))
    .forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

  const labels = Object.keys(totals);
  const empty = document.getElementById("categoryEmpty");
  const box = document.getElementById("chartBox");

  if (labels.length === 0 || typeof Chart === "undefined") {
    empty.style.display = "block";
    box.style.display = "none";
    return;
  }

  empty.style.display = "none";
  box.style.display = "block";

  const dark = document.documentElement.getAttribute("data-theme") === "dark";
  Chart.defaults.color = dark ? "#c7c9e0" : "#4b5563";

  if (categoryChart) categoryChart.destroy();

  categoryChart = new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: Object.values(totals),
          backgroundColor: labels.map(categoryColor),
          borderColor: dark ? "#18223a" : "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: ${formatMoney(ctx.parsed)}`,
          },
        },
      },
    },
  });
}

function renderRecent() {
  const tbody = document.getElementById("expenseBody");

  const recent = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">No expenses yet.</td></tr>';
    return;
  }

  tbody.innerHTML = recent
    .map(
      (e) => `
      <tr>
        <td>${escapeHtml(e.title)}</td>
        <td><span class="badge cat-${e.category}">${categoryIcon(e.category)} ${e.category}</span></td>
        <td>${e.date}</td>
        <td>${formatMoney(e.amount)}</td>
      </tr>`
    )
    .join("");
}

// ---------- Budget form ----------
document.getElementById("budgetForm").addEventListener("submit", async function (event) {
  event.preventDefault();

  const msg = document.getElementById("budgetMsg");
  const input = document.getElementById("budgetInput");
  const value = parseFloat(input.value);

  if (isNaN(value) || value < 0) {
    msg.textContent = "Enter a valid amount.";
    return;
  }

  try {
    await saveBudget(value);
    budget = value;
    input.value = "";
    msg.textContent = "";
    renderSummary();
    showToast("Budget saved");
  } catch (err) {
    showToast(err.message, "error");
  }
});

// Redraw the chart when the theme is switched
window.addEventListener("themechange", renderCategories);

// ---------- Start ----------
async function init() {
  try {
    expenses = await getExpenses();
    budget = await getBudget();
  } catch (err) {
    showToast(err.message, "error");
    return;
  }

  renderSummary();
  renderCategories();
  renderRecent();
}

init();

document.getElementById("logoutBtn").addEventListener("click", logout);