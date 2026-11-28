/* my-trips.js - the customer dashboard: trip statistics, trip cards with tabs, and saved destinations */

const tripStats = document.getElementById('trip-stats');
const tripTabs = document.getElementById('trip-tabs');
const tripList = document.getElementById('trip-list');
const tripCount = document.getElementById('trip-count');
const favoriteList = document.getElementById('favorite-list');

let selectedTab = 'All';                         // which tab is open: All, Upcoming, Ongoing or Completed

// Counts how many trips have a given status ("All" counts everything)
function countTripsWithStatus(trips, status) {
  if (status === 'All') {
    return trips.length;
  }
  let count = 0;
  for (let i = 0; i < trips.length; i++) {
    if (getTripStatus(trips[i]) === status) {
      count = count + 1;
    }
  }
  return count;
}

// The four number boxes at the top
function showStats(trips) {
  const names = ['All', 'Upcoming', 'Ongoing', 'Completed'];
  const labels = ['Total trips', 'Upcoming', 'Ongoing', 'Completed'];
  let html = '';
  for (let i = 0; i < names.length; i++) {
    html = html + '<div class="stat-box"><span class="stat-number">' + countTripsWithStatus(trips, names[i]) + '</span><span class="stat-label">' + labels[i] + '</span></div>';
  }
  tripStats.innerHTML = html;
}

// The tab buttons (All / Upcoming / Ongoing / Completed)
function showTabs(trips) {
  const names = ['All', 'Upcoming', 'Ongoing', 'Completed'];
  let html = '';
  for (let i = 0; i < names.length; i++) {
    let activeClass = '';
    if (names[i] === selectedTab) {
      activeClass = ' active';
    }
    html = html + '<button type="button" class="tab-button' + activeClass + '" onclick="selectTab(\'' + names[i] + '\')">' + names[i] + ' (' + countTripsWithStatus(trips, names[i]) + ')</button>';
  }
  tripTabs.innerHTML = html;
}

// Called by the tab buttons
function selectTab(tabName) {
  selectedTab = tabName;
  showTrips();
}

// Returns the HTML for one trip card
function makeTripCard(trip) {
  const d = getDestinationOrFallback(trip.destinationId);
  const status = getTripStatus(trip);
  const days = countDays(trip.startDate, trip.endDate);
  const planned = calculatePlannedTotal(trip);
  const packingItems = (trip.packing || []).length;

  // Budget status text: green when within budget, red when planned expenses are over the budget
  let budgetClass = 'budget-ok';
  let budgetText = 'Planned ' + formatMoney(planned) + ' of ' + formatMoney(trip.budget);
  if (planned > trip.budget) {
    budgetClass = 'budget-over';
    budgetText = 'Over budget: ' + formatMoney(planned) + ' of ' + formatMoney(trip.budget);
  }

  return `
    <article class="trip-card">
      <div class="trip-cover" style="background: linear-gradient(135deg, ${d.colors[0]}, ${d.colors[1]});">
        <span class="status status-${status.toLowerCase()}">${status}</span>
        <h3>${d.name}</h3>
        <p>${d.region}</p>
      </div>
      <div class="trip-body">
        <p>📅 ${formatDate(trip.startDate)} – ${formatDate(trip.endDate)} (${days} days)</p>
        <p>👥 ${trip.travelers} traveler(s)</p>
        <p>🗺️ ${countActivities(trip)} activities planned</p>
        <p>🎒 ${countPackedItems(trip)} of ${packingItems} items packed</p>
        <p class="${budgetClass}">💰 ${budgetText}</p>
        <div class="trip-buttons">
          <a href="trip.html?id=${trip.id}" class="button button-small">Open</a>
          <a href="create-trip.html?edit=${trip.id}" class="button button-small button-outline">Edit</a>
          <button type="button" class="button button-small button-danger" onclick="deleteTrip('${trip.id}')">Delete</button>
        </div>
      </div>
    </article>`;
}

// Draws the stats, tabs and the trip cards of the selected tab
function showTrips() {
  const trips = getMyTrips();
  showStats(trips);
  showTabs(trips);

  if (trips.length === 0) {
    tripCount.textContent = 'Everything you have planned, in one place.';
    tripList.innerHTML = '<p class="message-box">You have not saved any trips yet. <a href="create-trip.html">Plan your first trip</a> or <a href="recommend.html">get recommendations</a>.</p>';
    return;
  }
  tripCount.textContent = 'You have ' + trips.length + ' saved trip(s).';

  let html = '';
  for (let i = 0; i < trips.length; i++) {
    if (selectedTab === 'All' || getTripStatus(trips[i]) === selectedTab) {
      html = html + makeTripCard(trips[i]);
    }
  }
  if (html === '') {
    html = '<p class="message-box">You have no ' + selectedTab.toLowerCase() + ' trips.</p>';
  }
  tripList.innerHTML = html;
}

// Called by the Delete button
function deleteTrip(tripId) {
  if (confirm('Delete this trip?') === false) {
    return;
  }
  const allTrips = getTrips();
  const remainingTrips = [];
  for (let i = 0; i < allTrips.length; i++) {
    if (allTrips[i].id !== tripId) {              // keep every trip except the deleted one
      remainingTrips.push(allTrips[i]);
    }
  }
  saveTrips(remainingTrips);
  showToast('Trip deleted');
  showTrips();
}

// Draws the saved (favorite) destinations. common.js calls this function again when a heart is clicked.
function showFavorites() {
  const ids = getFavoriteIds();
  let html = '';
  for (let i = 0; i < ids.length; i++) {
    const d = findDestination(ids[i]);
    if (d !== null) {                             // skip destinations the admin has removed
      html = html + makeDestinationCard(d);
    }
  }
  if (html === '') {
    html = '<p class="message-box">No favorites yet. <a href="explore.html">Explore destinations</a> and tap the heart to save them.</p>';
  }
  favoriteList.innerHTML = html;
}

showTrips();
showFavorites();
