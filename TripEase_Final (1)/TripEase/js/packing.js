/* packing.js - the Packing tab: a checklist with progress.
   Data: trip.packing is an array of { id, name, packed } (a starting list is made when the trip is created) */

const packingForm = document.getElementById('packing-form');
const packingMessage = document.getElementById('packing-message');

// Draws the progress text/bar and the list of items
function showPacking() {
  const total = trip.packing.length;
  const packed = countPackedItems(trip);
  let percent = 0;
  if (total > 0) {
    percent = Math.round(packed / total * 100);
  }
  document.getElementById('packing-progress-text').textContent = packed + ' of ' + total + ' items packed (' + percent + '%)';
  document.getElementById('packing-progress-fill').style.width = percent + '%';
  document.getElementById('packing-progress-fill').className = 'progress-fill bar-green';

  let html = '';
  for (let i = 0; i < trip.packing.length; i++) {
    const item = trip.packing[i];
    html = html + '<li class="packing-item' + (item.packed ? ' packed' : '') + '">' +
      '<label><input type="checkbox" ' + (item.packed ? 'checked' : '') + ' onchange="togglePacked(\'' + item.id + '\')"> <span>' + escapeHtml(item.name) + '</span></label>' +
      '<span class="activity-buttons"><button type="button" class="icon-button" onclick="renameItem(\'' + item.id + '\')" title="Edit">✎</button>' +
      '<button type="button" class="icon-button icon-danger" onclick="deleteItem(\'' + item.id + '\')" title="Delete">✕</button></span></li>';
  }
  if (html === '') {
    html = '<li class="empty-day">Your packing list is empty. Add an item above.</li>';
  }
  document.getElementById('packing-list').innerHTML = html;
}

// Finds an item by id (returns its position in the list, or -1)
function findItemIndex(itemId) {
  for (let i = 0; i < trip.packing.length; i++) {
    if (trip.packing[i].id === itemId) {
      return i;
    }
  }
  return -1;
}

// Tick / untick an item
function togglePacked(itemId) {
  const index = findItemIndex(itemId);
  trip.packing[index].packed = !trip.packing[index].packed;
  saveTrip(trip);
  showPacking();
}

// Change the name of an item (asks with a small pop-up box)
function renameItem(itemId) {
  const index = findItemIndex(itemId);
  const newName = prompt('Change the item name:', trip.packing[index].name);
  if (newName === null || newName.trim() === '') {
    return;                                       // cancelled or empty: do nothing
  }
  trip.packing[index].name = newName.trim();
  saveTrip(trip);
  showPacking();
  showToast('Item updated');
}

// Remove an item
function deleteItem(itemId) {
  trip.packing.splice(findItemIndex(itemId), 1);
  saveTrip(trip);
  showPacking();
  showToast('Item removed');
}

// Add a new item
packingForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const nameBox = document.getElementById('packing-name');
  const name = nameBox.value.trim();
  if (name === '') {
    packingMessage.textContent = 'Please type an item name.';
    return;
  }
  packingMessage.textContent = '';
  trip.packing.push({ id: makeId('item'), name: name, packed: false });
  saveTrip(trip);
  nameBox.value = '';
  showPacking();
  showToast('Item added');
});

if (trip !== null) {
  showPacking();
}
