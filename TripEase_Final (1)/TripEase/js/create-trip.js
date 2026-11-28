/* create-trip.js - the "Plan a Trip" form. It is used for creating a new trip AND for editing a trip
   (editing opens as create-trip.html?edit=TRIP_ID) */

const tripForm = document.getElementById('trip-form');
const destinationSelect = document.getElementById('trip-destination');
const tripMessage = document.getElementById('trip-message');
const INTEREST_OPTIONS = ['Nature', 'Food', 'Culture', 'Adventure', 'Relaxation', 'Shopping', 'Photography', 'Nightlife'];

// Is this an edit? Look for ?edit=... in the address and find that trip
const editId = getQueryValue('edit');
let tripBeingEdited = null;
if (editId !== null) {
  tripBeingEdited = findTrip(editId);          // null if it does not exist or belongs to someone else
  if (tripBeingEdited === null) {
    setFlash('That trip was not found.', 'error');
    window.location.replace('my-trips.html');
  }
}

// Fill the destination drop-down with one <option> for each destination
const allDestinations = getDestinations();
let optionsHtml = '<option value="">Choose a destination</option>';
for (let i = 0; i < allDestinations.length; i++) {
  optionsHtml = optionsHtml + '<option value="' + allDestinations[i].id + '">' + allDestinations[i].name + ' (' + allDestinations[i].region + ')</option>';
}
destinationSelect.innerHTML = optionsHtml;

// Draw one checkbox for each interest
let interestsHtml = '';
for (let i = 0; i < INTEREST_OPTIONS.length; i++) {
  interestsHtml = interestsHtml + '<label class="interest-option"><input type="checkbox" name="interest" value="' + INTEREST_OPTIONS[i] + '"> ' + INTEREST_OPTIONS[i] + '</label>';
}
document.getElementById('interest-list').innerHTML = interestsHtml;

// Returns the list of ticked interests
function getCheckedInterests() {
  const boxes = document.querySelectorAll('input[name="interest"]');
  const chosen = [];
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      chosen.push(boxes[i].value);
    }
  }
  return chosen;
}

// Fill the form: either from the trip being edited, or from ?destination=... in the address
if (tripBeingEdited !== null) {
  document.getElementById('page-title').textContent = 'Edit Trip';
  document.getElementById('page-subtitle').textContent = 'Change the details of your trip. Your activities, expenses and packing list are kept.';
  document.getElementById('save-button').textContent = 'Save Changes';
  destinationSelect.value = tripBeingEdited.destinationId;
  document.getElementById('start-date').value = tripBeingEdited.startDate;
  document.getElementById('end-date').value = tripBeingEdited.endDate;
  document.getElementById('travelers').value = tripBeingEdited.travelers;
  document.getElementById('trip-budget').value = tripBeingEdited.budget;
  const boxes = document.querySelectorAll('input[name="interest"]');
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].checked = (tripBeingEdited.interests || []).includes(boxes[i].value);
  }
} else {
  const destinationFromAddress = getQueryValue('destination');
  if (destinationFromAddress !== null) {
    destinationSelect.value = destinationFromAddress;
  }
}

// Returns an error message if something is wrong, or an empty text if everything is fine
function checkTrip(trip) {
  if (trip.destinationId === '') { return 'Please choose a destination.'; }
  if (trip.startDate === '') { return 'Please choose a start date.'; }
  if (trip.endDate === '') { return 'Please choose an end date.'; }
  if (trip.endDate < trip.startDate) { return 'The end date cannot be before the start date.'; }
  if (countDays(trip.startDate, trip.endDate) > 60) { return 'A trip can be at most 60 days long.'; }
  if (trip.travelers < 1 || trip.travelers > 50) { return 'Travelers must be between 1 and 50.'; }
  if (trip.budget <= 0) { return 'Please enter a budget greater than 0.'; }
  return '';
}

// Saves a brand-new trip
function createNewTrip(formData) {
  const destination = getDestinationOrFallback(formData.destinationId);
  const newTrip = {
    id: makeId('trip'),
    userId: getCurrentUser().id,                 // the trip belongs to the logged-in user
    destinationId: formData.destinationId,
    startDate: formData.startDate,
    endDate: formData.endDate,
    travelers: formData.travelers,
    budget: formData.budget,
    interests: formData.interests,
    itinerary: makeItinerary(formData.startDate, formData.endDate, null),
    expenses: [],
    packing: makeDefaultPackingList(destination.type)
  };
  const trips = getTrips();
  trips.push(newTrip);
  saveTrips(trips);
  setFlash('Trip saved! Now add your activities, budget and packing list.');
  window.location.href = 'trip.html?id=' + newTrip.id;
}

// Updates the trip that is being edited
function updateExistingTrip(formData) {
  const trip = tripBeingEdited;
  const newItinerary = makeItinerary(formData.startDate, formData.endDate, trip.itinerary);

  // If the trip becomes shorter, activities on the removed days would be lost - ask first
  let lostActivities = 0;
  for (let i = newItinerary.length; i < trip.itinerary.length; i++) {
    lostActivities = lostActivities + trip.itinerary[i].activities.length;
  }
  if (lostActivities > 0 && confirm('The shorter trip will remove ' + lostActivities + ' activity(ies) from the last days. Continue?') === false) {
    return;
  }

  trip.destinationId = formData.destinationId;
  trip.startDate = formData.startDate;
  trip.endDate = formData.endDate;
  trip.travelers = formData.travelers;
  trip.budget = formData.budget;
  trip.interests = formData.interests;
  trip.itinerary = newItinerary;
  saveTrip(trip);
  setFlash('Trip updated.');
  window.location.href = 'trip.html?id=' + trip.id;
}

// Runs when the user clicks the save button
tripForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const formData = {
    destinationId: destinationSelect.value,
    startDate: document.getElementById('start-date').value,
    endDate: document.getElementById('end-date').value,
    travelers: Number(document.getElementById('travelers').value),
    budget: Number(document.getElementById('trip-budget').value),
    interests: getCheckedInterests()
  };

  const problem = checkTrip(formData);
  if (problem !== '') {
    tripMessage.textContent = problem;
    return;
  }

  if (tripBeingEdited === null) {
    createNewTrip(formData);
  } else {
    updateExistingTrip(formData);
  }
});
