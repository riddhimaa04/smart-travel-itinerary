/* =====================================================
   common.js - small helper functions used by several pages
   (data.js must be loaded before this file)
   ===================================================== */

// The name under which trips are saved in the browser's LocalStorage
const TRIPS_KEY = 'tripease_trips';

// ---------- Formatting helpers ----------

// 22000 becomes "₹22,000"
function formatMoney(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

// "2026-11-10" becomes "10 Nov 2026"
function formatDate(dateText) {
  const date = new Date(dateText + 'T00:00:00');
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Gives each destination type a small emoji picture
function getTypeEmoji(type) {
  if (type === 'Mountains') { return '🏔️'; }
  if (type === 'Beaches') { return '🏖️'; }
  if (type === 'Adventure') { return '🧗'; }
  if (type === 'Culture') { return '🏛️'; }
  return '🌿';
}

// ---------- Finding data ----------

// The name under which an edited destination list will be saved (the Admin page will use it later)
const DESTINATIONS_KEY = 'tripease_destinations';

// EVERY page gets the destination list from this one function.
// If a saved list exists in LocalStorage we use it, otherwise we use the sample list from data.js.
function getDestinations() {
  const savedText = localStorage.getItem(DESTINATIONS_KEY);
  if (savedText === null) {
    return destinations;           // the sample data from data.js
  }
  return JSON.parse(savedText);
}

// Looks through the destination list and returns the one with this id (or null)
function findDestination(id) {
  const allDestinations = getDestinations();
  for (let i = 0; i < allDestinations.length; i++) {
    if (allDestinations[i].id === id) {
      return allDestinations[i];
    }
  }
  return null;
}

// Reads a value from the web address. Example: in "destination.html?id=goa", getQueryValue('id') is "goa"
function getQueryValue(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ---------- Destination card (used on Home and Explore) ----------

// Returns the HTML text for one destination card
function makeDestinationCard(d) {
  const link = 'destination.html?id=' + d.id;
  return `
    <article class="card">
      <button type="button" class="fav-button${isFavorite(d.id) ? ' active' : ''}" data-fav-id="${d.id}" onclick="handleFavoriteClick('${d.id}')" aria-label="Save to favorites">♥</button>
      <a href="${link}" class="card-cover" style="background: linear-gradient(135deg, ${d.colors[0]}, ${d.colors[1]});">
        <span class="card-emoji">${getTypeEmoji(d.type)}</span>
        <span class="card-type">${d.type}</span>
      </a>
      <div class="card-body">
        <div class="card-title-row">
          <h3>${d.name}</h3>
          <span class="rating">★ ${d.rating}</span>
        </div>
        <p class="card-region">${d.region}</p>
        <p class="card-tagline">${d.tagline}</p>
        <div class="card-footer">
          <span class="card-price">from ${formatMoney(d.cost)}</span>
          <a href="${link}" class="card-link">Details →</a>
        </div>
      </div>
    </article>`;
}

// ---------- Saving and loading trips (LocalStorage) ----------

// Reads the saved trips. LocalStorage only stores text, so JSON.parse turns the text back into an array.
function getTrips() {
  const savedText = localStorage.getItem(TRIPS_KEY);
  if (savedText === null) {
    return [];            // nothing saved yet
  }
  return JSON.parse(savedText);
}

// Saves the trips array. JSON.stringify turns the array into text so LocalStorage can keep it.
function saveTrips(trips) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

// Returns only the trips of the user who is logged in
function getMyTrips() {
  const user = getCurrentUser();
  const myTrips = [];
  if (user === null) {
    return myTrips;
  }
  const allTrips = getTrips();
  for (let i = 0; i < allTrips.length; i++) {
    if (allTrips[i].userId === user.id) {
      myTrips.push(allTrips[i]);
    }
  }
  return myTrips;
}

// Finds one trip by its id - but only if it belongs to the logged-in user (or returns null)
function findTrip(id) {
  const myTrips = getMyTrips();
  for (let i = 0; i < myTrips.length; i++) {
    if (myTrips[i].id === id) {
      return myTrips[i];
    }
  }
  return null;
}

// Saves ONE changed trip: replaces the old copy of it inside the list of all trips
function saveTrip(changedTrip) {
  const allTrips = getTrips();
  for (let i = 0; i < allTrips.length; i++) {
    if (allTrips[i].id === changedTrip.id) {
      allTrips[i] = changedTrip;
    }
  }
  saveTrips(allTrips);
}

// ---------- Trip date helpers ----------

// Today's date as "YYYY-MM-DD" (same style as the date inputs)
function getToday() {
  const now = new Date();
  const month = ('0' + (now.getMonth() + 1)).slice(-2);
  const day = ('0' + now.getDate()).slice(-2);
  return now.getFullYear() + '-' + month + '-' + day;
}

// Number of days in a trip, counting the first and the last day
function countDays(startDate, endDate) {
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  return Math.round((end - start) / millisecondsPerDay) + 1;
}

// Upcoming, Ongoing or Completed - decided by comparing with today's date
function getTripStatus(trip) {
  const today = getToday();
  if (today < trip.startDate) { return 'Upcoming'; }
  if (today > trip.endDate) { return 'Completed'; }
  return 'Ongoing';
}


/* =====================================================
   NEW SECTIONS: users, favorites, notifications, trip helpers
   ===================================================== */

// ---------- Making unique ids ----------
// Example: makeId('act') gives something like "act1761234567890421"
function makeId(prefix) {
  return prefix + Date.now() + Math.floor(Math.random() * 1000);
}

// ---------- Users and login (MOCK - not secure, see README) ----------
const USERS_KEY = 'tripease_users';
const CURRENT_USER_KEY = 'tripease_current_user';

function getUsers() {
  const savedText = localStorage.getItem(USERS_KEY);
  if (savedText === null) {
    return [];
  }
  return JSON.parse(savedText);
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Creates the demo admin account the first time the site is opened
function makeSureAdminExists() {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].role === 'admin') {
      return;                                  // an admin already exists
    }
  }
  users.push({ id: 'admin1', name: 'Admin', email: 'admin@tripease.com', password: 'admin123', role: 'admin' });
  saveUsers(users);
}

// Returns the logged-in user object, or null if nobody is logged in
function getCurrentUser() {
  const currentId = localStorage.getItem(CURRENT_USER_KEY);
  if (currentId === null) {
    return null;
  }
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].id === currentId) {
      return users[i];
    }
  }
  return null;
}

function emailAlreadyUsed(email) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email.toLowerCase()) {
      return true;
    }
  }
  return false;
}

// Adds a new customer and logs them in
function registerUser(name, email, password) {
  const users = getUsers();
  const newUser = { id: makeId('user'), name: name, email: email.toLowerCase(), password: password, role: 'customer' };
  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, newUser.id);
  return newUser;
}

// Checks email + password. Returns the user (and remembers the login) or null
function loginUser(email, password) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].email === email.toLowerCase() && users[i].password === password) {
      localStorage.setItem(CURRENT_USER_KEY, users[i].id);
      return users[i];
    }
  }
  return null;
}

// Called by the Logout button in the navbar
function handleLogout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  setFlash('You have been logged out.');
  window.location.href = 'index.html';
}

// ---------- Favorites (saved separately for each user) ----------
function getFavoriteIds() {
  const user = getCurrentUser();
  if (user === null) {
    return [];
  }
  const savedText = localStorage.getItem('tripease_favorites_' + user.id);
  if (savedText === null) {
    return [];
  }
  return JSON.parse(savedText);
}

function isFavorite(destinationId) {
  return getFavoriteIds().includes(destinationId);
}

// Makes every heart button on the page match the saved favorites
function updateFavoriteButtons() {
  const buttons = document.querySelectorAll('[data-fav-id]');
  for (let i = 0; i < buttons.length; i++) {
    const saved = isFavorite(buttons[i].getAttribute('data-fav-id'));
    buttons[i].classList.toggle('active', saved);
    if (buttons[i].hasAttribute('data-wide')) {              // the big button on the details page has text
      buttons[i].textContent = saved ? '♥ Saved to favorites' : '♡ Save to favorites';
    }
  }
  const countBox = document.getElementById('favorite-count');
  if (countBox !== null) {
    countBox.textContent = getFavoriteIds().length;
  }
}

// Called when a heart button is clicked
function handleFavoriteClick(destinationId) {
  const user = getCurrentUser();
  if (user === null) {
    setFlash('Please log in to save favorites.', 'error');
    window.location.href = 'login.html?next=' + encodeURIComponent(getCurrentFileName() + window.location.search);
    return;
  }

  const oldIds = getFavoriteIds();
  let newIds = [];
  if (oldIds.includes(destinationId)) {
    for (let i = 0; i < oldIds.length; i++) {            // remove it
      if (oldIds[i] !== destinationId) {
        newIds.push(oldIds[i]);
      }
    }
    showToast('Removed from favorites');
  } else {
    newIds = oldIds;                                      // add it
    newIds.push(destinationId);
    showToast('Saved to favorites');
  }
  localStorage.setItem('tripease_favorites_' + user.id, JSON.stringify(newIds));

  updateFavoriteButtons();
  if (typeof showFavorites === 'function') {              // the My Trips page redraws its favorites list
    showFavorites();
  }
}

// ---------- Notifications (small pop-up messages) ----------
function showToast(message, type) {
  let box = document.getElementById('toast-box');
  if (box === null) {                                     // create the container the first time
    box = document.createElement('div');
    box.id = 'toast-box';
    box.className = 'toast-box';
    document.body.appendChild(box);
  }
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + (type || 'success');
  toast.textContent = message;
  box.appendChild(toast);
  setTimeout(function () { toast.remove(); }, 3200);      // disappears after 3.2 seconds
}

// A "flash" message is shown on the NEXT page (e.g. "Trip saved" after a redirect)
function setFlash(message, type) {
  sessionStorage.setItem('tripease_flash', JSON.stringify({ message: message, type: type || 'success' }));
}

function showFlashIfAny() {
  const savedText = sessionStorage.getItem('tripease_flash');
  if (savedText !== null) {
    sessionStorage.removeItem('tripease_flash');
    const flash = JSON.parse(savedText);
    showToast(flash.message, flash.type);
  }
}

// ---------- Trip helpers ----------

// A trip whose destination was deleted by the admin still opens - with these placeholder details
function getDestinationOrFallback(id) {
  const found = findDestination(id);
  if (found !== null) {
    return found;
  }
  return { id: id, name: 'Removed destination', region: 'No longer available', type: 'Nature', cost: 0, colors: ['#4B5D54', '#8FA397'], activities: [], highlights: [], styles: [] };
}

// One empty day for every day of the trip. When a trip is edited, old activities are kept.
function makeItinerary(startDate, endDate, oldItinerary) {
  const dayCount = countDays(startDate, endDate);
  const itinerary = [];
  for (let i = 0; i < dayCount; i++) {
    let activities = [];
    if (oldItinerary && oldItinerary[i]) {
      activities = oldItinerary[i].activities;
    }
    itinerary.push({ activities: activities });
  }
  return itinerary;
}

// Starting packing list: some items for everybody + items for the destination type
function makeDefaultPackingList(type) {
  let names = ['ID proof and tickets', 'Phone and charger', 'Wallet and some cash', 'Toiletries', 'Medicines and first-aid kit', 'Comfortable shoes', 'Water bottle'];
  if (type === 'Mountains') { names = names.concat(['Warm jacket', 'Gloves and woollen cap', 'Woollen socks', 'Moisturiser and lip balm']); }
  if (type === 'Beaches') { names = names.concat(['Swimwear', 'Sunscreen', 'Flip-flops', 'Beach towel']); }
  if (type === 'Adventure') { names = names.concat(['Sports shoes', 'Quick-dry clothes', 'Power bank', 'Rain jacket']); }
  if (type === 'Culture') { names = names.concat(['Modest clothing for temples', 'Camera', 'Walking sandals', 'Scarf or stole']); }
  if (type === 'Nature') { names = names.concat(['Insect repellent', 'Rain jacket', 'Binoculars', 'Sun hat']); }

  const items = [];
  for (let i = 0; i < names.length; i++) {
    items.push({ id: makeId('item') + i, name: names[i], packed: false });
  }
  return items;
}

// Run once on every page: make sure the demo admin account exists
makeSureAdminExists();


/* =====================================================
   MORE TRIP HELPERS (used by My Trips and Trip Details)
   ===================================================== */

// Makes text safe to place inside HTML (so a typed "<b>" cannot break the page)
function escapeHtml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Total number of activities added to a trip's itinerary
function countActivities(trip) {
  let total = 0;
  for (let i = 0; i < trip.itinerary.length; i++) {
    total = total + trip.itinerary[i].activities.length;
  }
  return total;
}

// Adds up all planned expenses of a trip
function calculatePlannedTotal(trip) {
  let total = 0;
  const expenses = trip.expenses || [];
  for (let i = 0; i < expenses.length; i++) {
    total = total + expenses[i].amount;
  }
  return total;
}

// How many packing items are ticked as packed
function countPackedItems(trip) {
  let packed = 0;
  const items = trip.packing || [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].packed === true) {
      packed = packed + 1;
    }
  }
  return packed;
}

// The date of day number "dayIndex" (0 = first day), e.g. "Tue, 10 Nov 2026"
function getDayDateText(startDate, dayIndex) {
  const date = new Date(startDate + 'T00:00:00');
  date.setDate(date.getDate() + dayIndex);
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
