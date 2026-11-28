/* explore.js - search and filter the destinations on the Explore page */

// Get the page elements we need (by their id in explore.html)
const searchInput = document.getElementById('search-input');
const typeSelect = document.getElementById('type-select');
const budgetSelect = document.getElementById('budget-select');
const resultCount = document.getElementById('result-count');
const destinationList = document.getElementById('destination-list');

// Checks if a destination's cost fits the chosen budget range
function costFitsBudget(cost, budgetChoice) {
  if (budgetChoice === 'low') { return cost < 15000; }
  if (budgetChoice === 'mid') { return cost >= 15000 && cost <= 30000; }
  if (budgetChoice === 'high') { return cost > 30000; }
  return true;                       // "any budget"
}

// Shows only the destinations that match the search box and both drop-downs
function showDestinations() {
  const searchText = searchInput.value.toLowerCase();
  const chosenType = typeSelect.value;
  const chosenBudget = budgetSelect.value;

  const allDestinations = getDestinations();
  let cardsHtml = '';
  let count = 0;

  for (let i = 0; i < allDestinations.length; i++) {
    const d = allDestinations[i];
    const searchableText = (d.name + ' ' + d.region + ' ' + d.tagline + ' ' + d.highlights.join(' ')).toLowerCase();

    const matchesSearch = searchableText.includes(searchText);
    const matchesType = (chosenType === 'All') || (d.type === chosenType);
    const matchesBudget = costFitsBudget(d.cost, chosenBudget);

    // A destination is shown only if ALL three checks pass
    if (matchesSearch && matchesType && matchesBudget) {
      cardsHtml = cardsHtml + makeDestinationCard(d);
      count = count + 1;
    }
  }

  if (count === 0) {
    destinationList.innerHTML = '<p class="message-box">No destinations match your search. Try a different word or change the filters.</p>';
  } else {
    destinationList.innerHTML = cardsHtml;
  }
  resultCount.textContent = count + ' destination(s) found';
}

// Run showDestinations every time the user types or changes a drop-down
searchInput.addEventListener('input', showDestinations);
typeSelect.addEventListener('change', showDestinations);
budgetSelect.addEventListener('change', showDestinations);

// If we arrived from a link like explore.html?type=Beaches, select that type first
const typeFromAddress = getQueryValue('type');
if (typeFromAddress !== null) {
  typeSelect.value = typeFromAddress;
}

showDestinations();   // show everything when the page first opens
