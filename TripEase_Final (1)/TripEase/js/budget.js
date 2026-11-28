/* budget.js - the Budget tab: expenses by category, totals, progress bar and over-budget alert.
   Data: trip.expenses is an array of { id, category, name, amount } */

const BUDGET_CATEGORIES = ['Travel', 'Accommodation', 'Food', 'Activities', 'Shopping', 'Other'];
const expenseForm = document.getElementById('expense-form');
const expenseMessage = document.getElementById('expense-message');

// Adds up the expenses of ONE category
function getCategoryTotal(category) {
  let total = 0;
  for (let i = 0; i < trip.expenses.length; i++) {
    if (trip.expenses[i].category === category) {
      total = total + trip.expenses[i].amount;
    }
  }
  return total;
}

// Chooses the colour of a bar: green is fine, orange is nearly full, red is over budget
function getBarColourClass(percent) {
  if (percent > 100) { return 'bar-red'; }
  if (percent >= 80) { return 'bar-orange'; }
  return 'bar-green';
}

// Draws the whole Budget tab
function showBudget() {
  const planned = calculatePlannedTotal(trip);
  const remaining = trip.budget - planned;
  const percent = Math.round(planned / trip.budget * 100);

  document.getElementById('budget-total-text').textContent = formatMoney(trip.budget);
  document.getElementById('budget-planned-text').textContent = formatMoney(planned);
  document.getElementById('budget-remaining-text').textContent = remaining >= 0 ? formatMoney(remaining) : '-' + formatMoney(-remaining);

  // Main progress bar (never wider than 100%)
  const fill = document.getElementById('budget-progress-fill');
  fill.style.width = Math.min(percent, 100) + '%';
  fill.className = 'progress-fill ' + getBarColourClass(percent);
  document.getElementById('budget-percent-text').textContent = percent + '% of the budget is planned';

  // Alert when the plan is more than the budget
  const alertBox = document.getElementById('budget-alert');
  if (planned > trip.budget) {
    alertBox.hidden = false;
    alertBox.textContent = '⚠ Over budget! Planned expenses are ' + formatMoney(planned - trip.budget) + ' more than your budget.';
  } else {
    alertBox.hidden = true;
  }

  // One small bar for each category
  let barsHtml = '';
  for (let i = 0; i < BUDGET_CATEGORIES.length; i++) {
    const total = getCategoryTotal(BUDGET_CATEGORIES[i]);
    const share = Math.round(total / trip.budget * 100);
    barsHtml = barsHtml + '<div class="category-row"><span class="category-name">' + BUDGET_CATEGORIES[i] + '</span>' +
      '<div class="progress progress-small"><div class="progress-fill bar-green" style="width: ' + Math.min(share, 100) + '%;"></div></div>' +
      '<span class="category-amount">' + formatMoney(total) + '</span></div>';
  }
  document.getElementById('category-bars').innerHTML = barsHtml;

  // List of expenses
  let listHtml = '';
  for (let i = 0; i < trip.expenses.length; i++) {
    const e = trip.expenses[i];
    listHtml = listHtml + '<div class="expense-row"><span class="expense-category">' + e.category + '</span><span class="expense-name">' + escapeHtml(e.name) + '</span>' +
      '<strong>' + formatMoney(e.amount) + '</strong><button type="button" class="icon-button icon-danger" onclick="deleteExpense(\'' + e.id + '\')" title="Delete">✕</button></div>';
  }
  if (listHtml === '') {
    listHtml = '<p class="empty-day">No expenses added yet.</p>';
  }
  document.getElementById('expense-list').innerHTML = listHtml;
}

// Called by the red ✕ button of an expense
function deleteExpense(expenseId) {
  const remaining = [];
  for (let i = 0; i < trip.expenses.length; i++) {
    if (trip.expenses[i].id !== expenseId) {
      remaining.push(trip.expenses[i]);
    }
  }
  trip.expenses = remaining;
  saveTrip(trip);
  showBudget();
  showToast('Expense deleted');
}

// Runs when the "Add an expense" form is submitted
expenseForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = document.getElementById('expense-name').value.trim();
  const amount = Number(document.getElementById('expense-amount').value);
  if (name === '') {
    expenseMessage.textContent = 'Please enter a description.';
    return;
  }
  if (amount <= 0) {
    expenseMessage.textContent = 'Please enter an amount greater than 0.';
    return;
  }
  expenseMessage.textContent = '';

  trip.expenses.push({ id: makeId('exp'), category: document.getElementById('expense-category').value, name: name, amount: amount });
  saveTrip(trip);
  expenseForm.reset();
  showBudget();
  showToast('Expense added');
});

if (trip !== null) {
  // Category drop-down
  let options = '';
  for (let i = 0; i < BUDGET_CATEGORIES.length; i++) {
    options = options + '<option value="' + BUDGET_CATEGORIES[i] + '">' + BUDGET_CATEGORIES[i] + '</option>';
  }
  document.getElementById('expense-category').innerHTML = options;

  // The simple "quick estimate" from the sample data (per person per day, and typical destination cost)
  const days = countDays(trip.startDate, trip.endDate);
  const perPersonPerDay = Math.round(trip.budget / trip.travelers / days);
  const estimatedCost = tripDestination.cost * trip.travelers;
  const difference = trip.budget - estimatedCost;
  document.getElementById('budget-per-day').textContent = formatMoney(perPersonPerDay);
  document.getElementById('budget-estimate').textContent = formatMoney(estimatedCost);
  const verdict = document.getElementById('budget-verdict');
  if (difference >= 0) {
    verdict.textContent = 'Your budget covers the typical cost, with about ' + formatMoney(difference) + ' to spare.';
    verdict.className = 'verdict verdict-good';
  } else {
    verdict.textContent = 'The typical cost is about ' + formatMoney(-difference) + ' more than your budget.';
    verdict.className = 'verdict verdict-bad';
  }

  showBudget();
}
