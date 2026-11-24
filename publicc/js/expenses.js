// ---------- Elements ----------
const tbody = document.getElementById("expenseBody");
const totalLine = document.getElementById("totalLine");
const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");
const filterMonth = document.getElementById("filterMonth");
const sortBy = document.getElementById("sortBy");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const expenseForm = document.getElementById("expenseForm");
const errorMsg = document.getElementById("errorMsg");

let allExpenses = [];   // everything loaded from the server
let editingId = null;   // null = adding, otherwise the id being edited

// ---------- Load from server ----------
async function loadExpenses() {
  try {
    allExpenses = await getExpenses();
    renderExpenses();
  } catch (err) {
    showToast(err.message, "error");
  }
}

// ---------- Render (filter + sort, no server call) ----------
function renderExpenses() {
  let list = [...allExpenses];

  const term = searchInput.value.trim().toLowerCase();
  if (term) {
    list = list.filter((e) => e.title.toLowerCase().includes(term));
  }
  if (filterCategory.value) {
    list = list.filter((e) => e.category === filterCategory.value);
  }
  if (filterMonth.value) {
    list = list.filter((e) => e.date.startsWith(filterMonth.value));
  }

  switch (sortBy.value) {
    case "oldest": list.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
    case "high":   list.sort((a, b) => b.amount - a.amount); break;
    case "low":    list.sort((a, b) => a.amount - b.amount); break;
    case "title":  list.sort((a, b) => a.title.localeCompare(b.title)); break;
    default:       list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const total = list.reduce((sum, e) => sum + e.amount, 0);
  totalLine.textContent = `${list.length} expense(s), total ${formatMoney(total)}`;

  if (list.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty">No expenses found.</td></tr>';
    return;
  }

  tbody.innerHTML = list
    .map(
      (e) => `
      <tr>
        <td>${escapeHtml(e.title)}</td>
        <td><span class="badge cat-${e.category}">${categoryIcon(e.category)} ${e.category}</span></td>
        <td>${e.date}</td>
        <td>${formatMoney(e.amount)}</td>
        <td>
          <button class="action-btn edit" data-id="${e.id}">Edit</button>
          <button class="action-btn delete" data-id="${e.id}">Delete</button>
        </td>
      </tr>`
    )
    .join("");
}

// ---------- Modal ----------
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

function openModal(expense) {
  errorMsg.style.display = "none";

  if (expense) {
    editingId = expense.id;
    modalTitle.textContent = "Edit expense";
    document.getElementById("title").value = expense.title;
    document.getElementById("amount").value = expense.amount;
    document.getElementById("category").value = expense.category;
    document.getElementById("date").value = expense.date;
  } else {
    editingId = null;
    modalTitle.textContent = "Add expense";
    expenseForm.reset();
    document.getElementById("date").value = todayString();
  }

  modal.classList.add("show");
}

function closeModal() {
  modal.classList.remove("show");
}

// ---------- Events ----------
document.getElementById("addBtn").addEventListener("click", () => openModal(null));
document.getElementById("closeModal").addEventListener("click", closeModal);
document.getElementById("cancelBtn").addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

// Save (add or edit)
expenseForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;

  if (title.length === 0) {
    errorMsg.textContent = "Please enter a title.";
    errorMsg.style.display = "block";
    return;
  }
  if (isNaN(amount) || amount <= 0) {
    errorMsg.textContent = "Amount must be greater than 0.";
    errorMsg.style.display = "block";
    return;
  }

  const data = { title, amount, category, date };
  const wasEditing = editingId !== null;

  try {
    if (wasEditing) {
      await updateExpense(editingId, data);
    } else {
      await addExpense(data);
    }
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = "block";
    return;
  }

  closeModal();
  await loadExpenses();
  showToast(wasEditing ? "Expense updated" : "Expense added");
});

// Edit / Delete buttons
tbody.addEventListener("click", async function (event) {
  const btn = event.target.closest(".action-btn");
  if (!btn) return;

  const id = btn.dataset.id;

  if (btn.classList.contains("edit")) {
    const expense = allExpenses.find((e) => e.id === id);
    if (expense) openModal(expense);
  }

  if (btn.classList.contains("delete")) {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(id);
      await loadExpenses();
      showToast("Expense deleted");
    } catch (err) {
      showToast(err.message, "error");
    }
  }
});

// Search, filters, sort: re-render instantly
searchInput.addEventListener("input", renderExpenses);
filterCategory.addEventListener("change", renderExpenses);
filterMonth.addEventListener("change", renderExpenses);
sortBy.addEventListener("change", renderExpenses);

document.getElementById("clearFilters").addEventListener("click", () => {
  searchInput.value = "";
  filterCategory.value = "";
  filterMonth.value = "";
  sortBy.value = "newest";
  renderExpenses();
});

document.getElementById("logoutBtn").addEventListener("click", logout);

// ---------- Start ----------
loadExpenses();