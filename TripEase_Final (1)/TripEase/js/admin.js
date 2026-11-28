/* =====================================================
   admin.js - the Admin Panel (demo version)
   - Dashboard: simple statistics
   - Destinations: add, edit, delete, feature / un-feature
   - Activities: add, edit, delete activities of a destination

   How data is saved: the whole destination list is saved in LocalStorage under
   "tripease_destinations". getDestinations() in common.js reads it, so every
   page (Home, Explore, Recommendations...) shows the admin's changes.
   ===================================================== */

const ACTIVITY_CATEGORIES = ['Sightseeing', 'Adventure', 'Food', 'Culture', 'Nature', 'Shopping', 'Stay', 'Wellness'];
let editingDestinationId = null;               // id of the destination being edited (null = adding a new one)
let editingActivityIndex = -1;                 // position of the activity being edited (-1 = adding)

// ---------- Small helpers ----------

// Makes a copy of the list so we can change it safely (text -> back to objects)
function copyOfDestinations() {
  return JSON.parse(JSON.stringify(getDestinations()));
}

function saveDestinations(list) {
  localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(list));
}

// "Hill Fort 2" becomes "hill-fort-2" (used as the destination id)
function makeSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function findIndexById(list, id) {
  for (let i = 0; i < list.length; i++) {
    if (list[i].id === id) {
      return i;
    }
  }
  return -1;
}

// Shows one admin tab and hides the others
function showAdminTab(name) {
  const names = ['dashboard', 'destinations', 'activities'];
  for (let i = 0; i < names.length; i++) {
    document.getElementById('admin-panel-' + names[i]).hidden = (names[i] !== name);
    document.getElementById('admin-tab-' + names[i]).classList.toggle('active', names[i] === name);
  }
  if (name === 'dashboard') { showDashboard(); }
}

// ---------- 1. Dashboard ----------
function showDashboard() {
  const list = getDestinations();
  const users = getUsers();

  let activityCount = 0;
  let featuredCount = 0;
  for (let i = 0; i < list.length; i++) {
    activityCount = activityCount + list[i].activities.length;
    if (list[i].featured === true) { featuredCount = featuredCount + 1; }
  }

  let customerCount = 0;
  let favoriteCount = 0;
  for (let i = 0; i < users.length; i++) {
    if (users[i].role === 'customer') { customerCount = customerCount + 1; }
    const savedText = localStorage.getItem('tripease_favorites_' + users[i].id);
    if (savedText !== null) { favoriteCount = favoriteCount + JSON.parse(savedText).length; }
  }

  const numbers = [list.length, activityCount, featuredCount, customerCount, getTrips().length, favoriteCount];
  const labels = ['Destinations', 'Activities (places)', 'Featured destinations', 'Registered customers', 'Trips created', 'Favorites saved'];
  let html = '';
  for (let i = 0; i < numbers.length; i++) {
    html = html + '<div class="stat-box"><span class="stat-number">' + numbers[i] + '</span><span class="stat-label">' + labels[i] + '</span></div>';
  }
  document.getElementById('admin-stats').innerHTML = html;

  // Bars: how many destinations of each type
  const types = ['Mountains', 'Beaches', 'Adventure', 'Culture', 'Nature'];
  let barsHtml = '';
  for (let t = 0; t < types.length; t++) {
    let count = 0;
    for (let i = 0; i < list.length; i++) {
      if (list[i].type === types[t]) { count = count + 1; }
    }
    const width = list.length === 0 ? 0 : Math.round(count / list.length * 100);
    barsHtml = barsHtml + '<div class="admin-bar-row"><span class="admin-bar-label">' + types[t] + '</span><div class="progress progress-small"><div class="progress-fill bar-green" style="width: ' + width + '%;"></div></div><strong>' + count + '</strong></div>';
  }
  document.getElementById('admin-type-bars').innerHTML = barsHtml;
}

// ---------- 2. Destinations ----------
function showDestinationTable() {
  const searchText = document.getElementById('admin-search').value.toLowerCase();
  const list = getDestinations();
  let html = '<tr><th>Name</th><th>Region</th><th>Type</th><th>Cost</th><th>Days</th><th>Featured</th><th>Actions</th></tr>';
  let shown = 0;
  for (let i = 0; i < list.length; i++) {
    const d = list[i];
    if ((d.name + ' ' + d.region).toLowerCase().includes(searchText)) {
      html = html + '<tr><td><strong>' + escapeHtml(d.name) + '</strong></td><td>' + escapeHtml(d.region) + '</td><td>' + d.type + '</td><td>' + formatMoney(d.cost) + '</td><td>' + d.minDays + '–' + d.maxDays + '</td>' +
        '<td><input type="checkbox" ' + (d.featured ? 'checked' : '') + ' onchange="toggleFeatured(\'' + d.id + '\')" aria-label="Featured"></td>' +
        '<td><div class="table-buttons"><button type="button" class="icon-button" onclick="startEditDestination(\'' + d.id + '\')" title="Edit">✎</button>' +
        '<button type="button" class="icon-button icon-danger" onclick="deleteDestination(\'' + d.id + '\')" title="Delete">✕</button></div></td></tr>';
      shown = shown + 1;
    }
  }
  if (shown === 0) {
    html = html + '<tr><td colspan="7">No destinations found.</td></tr>';
  }
  document.getElementById('destination-table').innerHTML = html;
}

function toggleFeatured(id) {
  const list = copyOfDestinations();
  const index = findIndexById(list, id);
  list[index].featured = !list[index].featured;
  saveDestinations(list);
  showToast(list[index].featured ? 'Marked as featured' : 'Removed from featured');
}

// Reads the form into one destination object
function readDestinationForm() {
  const styleBoxes = document.querySelectorAll('input[name="d-style"]');
  const styles = [];
  for (let i = 0; i < styleBoxes.length; i++) {
    if (styleBoxes[i].checked) { styles.push(styleBoxes[i].value); }
  }
  const highlights = [];
  const lines = document.getElementById('d-highlights').value.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '') { highlights.push(lines[i].trim()); }
  }
  return {
    name: document.getElementById('d-name').value.trim(),
    region: document.getElementById('d-region').value.trim(),
    type: document.getElementById('d-type').value,
    cost: Number(document.getElementById('d-cost').value),
    minDays: Number(document.getElementById('d-min').value),
    maxDays: Number(document.getElementById('d-max').value),
    styles: styles,
    rating: Number(document.getElementById('d-rating').value),
    featured: document.getElementById('d-featured').checked,
    colors: [document.getElementById('d-color1').value, document.getElementById('d-color2').value],
    tagline: document.getElementById('d-tagline').value.trim(),
    description: document.getElementById('d-description').value.trim(),
    bestTime: document.getElementById('d-besttime').value.trim(),
    highlights: highlights
  };
}

// Returns an error message, or '' if the destination is fine
function checkDestination(d, list) {
  if (d.name === '') { return 'Please enter the destination name.'; }
  if (d.region === '') { return 'Please enter the region.'; }
  if (d.cost <= 0) { return 'The cost must be greater than 0.'; }
  if (d.minDays < 1 || d.maxDays < d.minDays) { return 'Ideal days: "from" must be at least 1 and "to" cannot be smaller than "from".'; }
  if (d.rating < 0 || d.rating > 5) { return 'The rating must be between 0 and 5.'; }
  if (d.styles.length === 0) { return 'Tick at least one travel style.'; }
  if (d.tagline === '' || d.description === '') { return 'Please enter a tagline and a description.'; }
  if (editingDestinationId === null) {                           // a new destination needs a unique id
    const newId = makeSlug(d.name);
    if (newId === '') { return 'The name must contain letters or numbers.'; }
    if (findIndexById(list, newId) !== -1) { return 'A destination with this name already exists.'; }
  }
  return '';
}

function cancelDestinationEdit() {
  editingDestinationId = null;
  document.getElementById('destination-form').reset();
  document.getElementById('d-color1').value = '#1B7A43';
  document.getElementById('d-color2').value = '#8FD3A8';
  document.getElementById('destination-message').textContent = '';
  document.getElementById('destination-form-title').textContent = 'Add a destination';
  document.getElementById('destination-save-button').textContent = 'Add destination';
  document.getElementById('destination-cancel-button').hidden = true;
}

function startEditDestination(id) {
  const d = findDestination(id);
  editingDestinationId = id;
  document.getElementById('d-name').value = d.name;
  document.getElementById('d-region').value = d.region;
  document.getElementById('d-type').value = d.type;
  document.getElementById('d-cost').value = d.cost;
  document.getElementById('d-min').value = d.minDays;
  document.getElementById('d-max').value = d.maxDays;
  document.getElementById('d-rating').value = d.rating;
  document.getElementById('d-color1').value = d.colors[0];
  document.getElementById('d-color2').value = d.colors[1];
  document.getElementById('d-tagline').value = d.tagline;
  document.getElementById('d-description').value = d.description;
  document.getElementById('d-besttime').value = d.bestTime;
  document.getElementById('d-highlights').value = d.highlights.join('\n');
  document.getElementById('d-featured').checked = d.featured;
  const styleBoxes = document.querySelectorAll('input[name="d-style"]');
  for (let i = 0; i < styleBoxes.length; i++) {
    styleBoxes[i].checked = d.styles.includes(styleBoxes[i].value);
  }
  document.getElementById('destination-form-title').textContent = 'Edit destination';
  document.getElementById('destination-save-button').textContent = 'Save changes';
  document.getElementById('destination-cancel-button').hidden = false;
  document.getElementById('destination-form').scrollIntoView();
}

function deleteDestination(id) {
  if (confirm('Delete this destination? Trips that already use it will show "Removed destination".') === false) {
    return;
  }
  const list = copyOfDestinations();
  list.splice(findIndexById(list, id), 1);
  saveDestinations(list);
  cancelDestinationEdit();
  refreshAdminLists();
  showToast('Destination deleted');
}

// Brings the back "sample data" list
function resetToSampleData() {
  if (confirm('Throw away all admin changes and go back to the original sample destinations?') === false) {
    return;
  }
  localStorage.removeItem(DESTINATIONS_KEY);
  cancelDestinationEdit();
  refreshAdminLists();
  showToast('Sample data restored');
}

document.getElementById('destination-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const list = copyOfDestinations();
  const formData = readDestinationForm();
  const problem = checkDestination(formData, list);
  if (problem !== '') {
    document.getElementById('destination-message').textContent = problem;
    return;
  }

  if (editingDestinationId === null) {
    formData.id = makeSlug(formData.name);
    formData.activities = [];                               // a new destination starts without activities
    list.push(formData);
    showToast('Destination added');
  } else {
    const index = findIndexById(list, editingDestinationId);
    formData.id = editingDestinationId;
    formData.activities = list[index].activities;           // keep its activities
    if (list[index].images) { formData.images = list[index].images; }
    list[index] = formData;
    showToast('Destination updated');
  }
  saveDestinations(list);
  cancelDestinationEdit();
  refreshAdminLists();
});

// ---------- 3. Activities of a destination ----------
function fillActivityDestinationSelect() {
  const select = document.getElementById('activity-destination-select');
  const oldValue = select.value;
  const list = getDestinations();
  let html = '';
  for (let i = 0; i < list.length; i++) {
    html = html + '<option value="' + list[i].id + '">' + escapeHtml(list[i].name) + '</option>';
  }
  select.innerHTML = html;
  if (oldValue !== '' && findIndexById(list, oldValue) !== -1) {
    select.value = oldValue;
  }
}

function showAdminActivities() {
  const d = findDestination(document.getElementById('activity-destination-select').value);
  let html = '<tr><th>Activity</th><th>Category</th><th>Cost</th><th>Actions</th></tr>';
  if (d === null || d.activities.length === 0) {
    html = html + '<tr><td colspan="4">No activities yet.</td></tr>';
  } else {
    for (let i = 0; i < d.activities.length; i++) {
      const a = d.activities[i];
      html = html + '<tr><td>' + escapeHtml(a.name) + '</td><td>' + a.category + '</td><td>' + (a.cost > 0 ? formatMoney(a.cost) : 'Free') + '</td>' +
        '<td><div class="table-buttons"><button type="button" class="icon-button" onclick="startEditAdminActivity(' + i + ')" title="Edit">✎</button>' +
        '<button type="button" class="icon-button icon-danger" onclick="deleteAdminActivity(' + i + ')" title="Delete">✕</button></div></td></tr>';
    }
  }
  document.getElementById('admin-activity-table').innerHTML = html;
}

function cancelAdminActivityEdit() {
  editingActivityIndex = -1;
  document.getElementById('admin-activity-form').reset();
  document.getElementById('admin-activity-message').textContent = '';
  document.getElementById('admin-activity-form-title').textContent = 'Add an activity';
  document.getElementById('admin-activity-save-button').textContent = 'Add activity';
  document.getElementById('admin-activity-cancel-button').hidden = true;
}

function startEditAdminActivity(index) {
  const d = findDestination(document.getElementById('activity-destination-select').value);
  const a = d.activities[index];
  editingActivityIndex = index;
  document.getElementById('a-name').value = a.name;
  document.getElementById('a-category').value = a.category;
  document.getElementById('a-cost').value = a.cost;
  document.getElementById('admin-activity-form-title').textContent = 'Edit activity';
  document.getElementById('admin-activity-save-button').textContent = 'Save changes';
  document.getElementById('admin-activity-cancel-button').hidden = false;
}

function deleteAdminActivity(index) {
  if (confirm('Delete this activity?') === false) { return; }
  const list = copyOfDestinations();
  const destIndex = findIndexById(list, document.getElementById('activity-destination-select').value);
  list[destIndex].activities.splice(index, 1);
  saveDestinations(list);
  cancelAdminActivityEdit();
  showAdminActivities();
  showToast('Activity deleted');
}

document.getElementById('admin-activity-form').addEventListener('submit', function (event) {
  event.preventDefault();
  const name = document.getElementById('a-name').value.trim();
  const cost = Number(document.getElementById('a-cost').value);
  if (name === '') {
    document.getElementById('admin-activity-message').textContent = 'Please enter the activity name.';
    return;
  }
  if (cost < 0) {
    document.getElementById('admin-activity-message').textContent = 'The cost cannot be negative.';
    return;
  }

  const list = copyOfDestinations();
  const destIndex = findIndexById(list, document.getElementById('activity-destination-select').value);
  const activity = { name: name, category: document.getElementById('a-category').value, cost: cost };
  if (editingActivityIndex === -1) {
    list[destIndex].activities.push(activity);
    showToast('Activity added');
  } else {
    list[destIndex].activities[editingActivityIndex] = activity;
    showToast('Activity updated');
  }
  saveDestinations(list);
  cancelAdminActivityEdit();
  showAdminActivities();
});

// ---------- Start ----------
function refreshAdminLists() {
  showDestinationTable();
  fillActivityDestinationSelect();
  showAdminActivities();
  showDashboard();
}

function startAdminPage() {
  let categoryOptions = '';
  for (let i = 0; i < ACTIVITY_CATEGORIES.length; i++) {
    categoryOptions = categoryOptions + '<option value="' + ACTIVITY_CATEGORIES[i] + '">' + ACTIVITY_CATEGORIES[i] + '</option>';
  }
  document.getElementById('a-category').innerHTML = categoryOptions;
  document.getElementById('admin-search').addEventListener('input', showDestinationTable);
  refreshAdminLists();
}

// Only start for the admin (layout.js already sends everybody else away)
const adminUser = getCurrentUser();
if (adminUser !== null && adminUser.role === 'admin') {
  startAdminPage();
}
