/* itinerary.js - the Itinerary tab: add, edit, delete and re-order activities day by day.
   Data: trip.itinerary is an array with one object per day: { activities: [ {id, name, time, location, notes}, ... ] } */

const activityForm = document.getElementById('activity-form');
const activityMessage = document.getElementById('activity-message');
let editingDay = -1;                              // which activity is being edited (-1 = none)
let editingIndex = -1;

// Fills the "Day" drop-down and the list of suggestions for the activity name
function prepareActivityForm() {
  let dayOptions = '';
  for (let i = 0; i < trip.itinerary.length; i++) {
    dayOptions = dayOptions + '<option value="' + i + '">Day ' + (i + 1) + ' - ' + getDayDateText(trip.startDate, i) + '</option>';
  }
  document.getElementById('activity-day').innerHTML = dayOptions;

  let suggestionHtml = '';
  for (let i = 0; i < tripDestination.activities.length; i++) {
    suggestionHtml = suggestionHtml + '<option value="' + escapeHtml(tripDestination.activities[i].name) + '">';
  }
  document.getElementById('activity-suggestions').innerHTML = suggestionHtml;
}

// Draws every day with its activities
function showItinerary() {
  let html = '';
  for (let dayIndex = 0; dayIndex < trip.itinerary.length; dayIndex++) {
    const activities = trip.itinerary[dayIndex].activities;
    let rows = '';
    for (let i = 0; i < activities.length; i++) {
      const a = activities[i];
      let details = '';
      if (a.location !== '') { details = details + '📍 ' + escapeHtml(a.location) + '  '; }
      if (a.notes !== '') { details = details + '📝 ' + escapeHtml(a.notes); }
      rows = rows + `
        <div class="activity-item">
          <span class="activity-time">${a.time === '' ? '--:--' : a.time}</span>
          <div class="activity-text"><strong>${escapeHtml(a.name)}</strong><small>${details}</small></div>
          <div class="activity-buttons">
            <button type="button" class="icon-button" onclick="moveActivity(${dayIndex}, ${i}, -1)" title="Move up">↑</button>
            <button type="button" class="icon-button" onclick="moveActivity(${dayIndex}, ${i}, 1)" title="Move down">↓</button>
            <button type="button" class="icon-button" onclick="startEditActivity(${dayIndex}, ${i})" title="Edit">✎</button>
            <button type="button" class="icon-button icon-danger" onclick="deleteActivity(${dayIndex}, ${i})" title="Delete">✕</button>
          </div>
        </div>`;
    }
    if (rows === '') {
      rows = '<p class="empty-day">No activities yet for this day.</p>';
    }
    html = html + '<div class="day-card"><h4>Day ' + (dayIndex + 1) + ' <small>' + getDayDateText(trip.startDate, dayIndex) + '</small></h4>' + rows + '</div>';
  }
  document.getElementById('itinerary-list').innerHTML = html;
}

// Puts the form back to "add" mode
function cancelActivityEdit() {
  editingDay = -1;
  editingIndex = -1;
  activityForm.reset();
  activityMessage.textContent = '';
  document.getElementById('activity-form-title').textContent = 'Add an activity';
  document.getElementById('activity-save-button').textContent = 'Add activity';
  document.getElementById('activity-cancel-button').hidden = true;
}

// Copies an activity into the form so the user can change it
function startEditActivity(dayIndex, activityIndex) {
  const a = trip.itinerary[dayIndex].activities[activityIndex];
  editingDay = dayIndex;
  editingIndex = activityIndex;
  document.getElementById('activity-day').value = dayIndex;
  document.getElementById('activity-time').value = a.time;
  document.getElementById('activity-name').value = a.name;
  document.getElementById('activity-location').value = a.location;
  document.getElementById('activity-notes').value = a.notes;
  document.getElementById('activity-form-title').textContent = 'Edit activity';
  document.getElementById('activity-save-button').textContent = 'Save changes';
  document.getElementById('activity-cancel-button').hidden = false;
  activityForm.scrollIntoView();
}

// Removes one activity
function deleteActivity(dayIndex, activityIndex) {
  if (confirm('Delete this activity?') === false) {
    return;
  }
  trip.itinerary[dayIndex].activities.splice(activityIndex, 1);     // splice removes 1 item at this position
  saveTrip(trip);
  cancelActivityEdit();
  showItinerary();
  showToast('Activity deleted');
}

// Swaps an activity with the one above (direction -1) or below (direction +1)
function moveActivity(dayIndex, activityIndex, direction) {
  const activities = trip.itinerary[dayIndex].activities;
  const otherIndex = activityIndex + direction;
  if (otherIndex < 0 || otherIndex >= activities.length) {
    return;                                       // already at the top / bottom
  }
  const temp = activities[activityIndex];
  activities[activityIndex] = activities[otherIndex];
  activities[otherIndex] = temp;
  saveTrip(trip);
  cancelActivityEdit();
  showItinerary();
}

// Runs when the activity form is submitted (add OR save changes)
activityForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const dayIndex = Number(document.getElementById('activity-day').value);
  const name = document.getElementById('activity-name').value.trim();
  if (name === '') {
    activityMessage.textContent = 'Please enter the activity name.';
    return;
  }
  activityMessage.textContent = '';

  const activity = {
    id: makeId('act'),
    name: name,
    time: document.getElementById('activity-time').value,
    location: document.getElementById('activity-location').value.trim(),
    notes: document.getElementById('activity-notes').value.trim()
  };

  if (editingIndex === -1) {
    trip.itinerary[dayIndex].activities.push(activity);               // add at the end of the day
    showToast('Activity added');
  } else {
    // edit: take the old one out, then put the changed one into the chosen day
    const old = trip.itinerary[editingDay].activities.splice(editingIndex, 1)[0];
    activity.id = old.id;
    trip.itinerary[dayIndex].activities.push(activity);
    showToast('Activity updated');
  }
  saveTrip(trip);
  cancelActivityEdit();
  showItinerary();
});

if (trip !== null) {
  prepareActivityForm();
  showItinerary();
}
