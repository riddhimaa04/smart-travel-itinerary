/* trip.js - Trip Details page: overview, tabs, delete.
   The itinerary, budget and packing tabs have their own files (itinerary.js, budget.js, packing.js).
   They use the global variables "trip" and "tripDestination" defined here. */

const tripId = getQueryValue('id');
const trip = findTrip(tripId);                   // null if it does not exist or is not yours
let tripDestination = null;

if (trip === null) {
  document.getElementById('trip-content').hidden = true;
  document.getElementById('not-found-message').hidden = false;
} else {
  tripDestination = getDestinationOrFallback(trip.destinationId);
  const days = countDays(trip.startDate, trip.endDate);
  const status = getTripStatus(trip);

  // Older trips might not have these lists yet
  if (!trip.expenses) { trip.expenses = []; }
  if (!trip.packing) { trip.packing = makeDefaultPackingList(tripDestination.type); saveTrip(trip); }

  // Header and facts
  document.getElementById('trip-hero').style.background = 'linear-gradient(135deg, ' + tripDestination.colors[0] + ', ' + tripDestination.colors[1] + ')';
  document.getElementById('trip-name').textContent = 'Trip to ' + tripDestination.name;
  document.getElementById('trip-subtitle').textContent = tripDestination.region + '  ·  ' + status;
  document.getElementById('trip-dates').textContent = formatDate(trip.startDate) + ' – ' + formatDate(trip.endDate);
  document.getElementById('trip-days').textContent = days + ' day(s)';
  document.getElementById('trip-travelers').textContent = trip.travelers;
  document.getElementById('trip-budget-total').textContent = formatMoney(trip.budget);

  // Interests chosen when the trip was created
  let interestsHtml = '';
  const interests = trip.interests || [];
  for (let i = 0; i < interests.length; i++) {
    interestsHtml = interestsHtml + '<span class="interest-chip">' + interests[i] + '</span>';
  }
  document.getElementById('trip-interests').innerHTML = interestsHtml;

  // Side panel: suggested activities from the destination data
  let activitiesHtml = '';
  for (let i = 0; i < tripDestination.activities.length; i++) {
    const activity = tripDestination.activities[i];
    const costText = activity.cost > 0 ? formatMoney(activity.cost) : 'Free';
    activitiesHtml = activitiesHtml + '<div class="activity-row"><span>' + activity.name + '</span><strong>' + costText + '</strong></div>';
  }
  if (activitiesHtml === '') {
    activitiesHtml = '<p class="fact-label">No suggestions available.</p>';
  }
  document.getElementById('trip-activities').innerHTML = activitiesHtml;
  document.getElementById('edit-trip-link').href = 'create-trip.html?edit=' + trip.id;
  document.getElementById('destination-link').href = 'destination.html?id=' + trip.destinationId;
}

// Shows one tab (itinerary, budget or packing) and hides the other two
function showTripTab(name) {
  const names = ['itinerary', 'budget', 'packing'];
  for (let i = 0; i < names.length; i++) {
    document.getElementById('panel-' + names[i]).hidden = (names[i] !== name);
    document.getElementById('tab-' + names[i]).classList.toggle('active', names[i] === name);
  }
}

// Called by the Delete button
function deleteThisTrip() {
  if (confirm('Delete this trip?') === false) {
    return;
  }
  const allTrips = getTrips();
  const remainingTrips = [];
  for (let i = 0; i < allTrips.length; i++) {
    if (allTrips[i].id !== tripId) {
      remainingTrips.push(allTrips[i]);
    }
  }
  saveTrips(remainingTrips);
  setFlash('Trip deleted.');
  window.location.href = 'my-trips.html';
}
