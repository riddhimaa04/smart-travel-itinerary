/* destination.js - fills the Destination Details page for the destination named in the address */

const destinationId = getQueryValue('id');           // e.g. "goa" from destination.html?id=goa
const destination = findDestination(destinationId);

if (destination === null) {
  // Unknown id: hide the page content and show a message instead
  document.getElementById('destination-content').hidden = true;
  document.getElementById('not-found-message').hidden = false;
} else {
  document.title = destination.name + ' - TripEase';

  // Simple text fields
  document.getElementById('dest-hero').style.background = 'linear-gradient(135deg, ' + destination.colors[0] + ', ' + destination.colors[1] + ')';
  document.getElementById('dest-type').textContent = getTypeEmoji(destination.type) + ' ' + destination.type;
  document.getElementById('dest-name').textContent = destination.name;
  document.getElementById('dest-region').textContent = destination.region + '  ·  ★ ' + destination.rating;
  document.getElementById('dest-tagline').textContent = destination.tagline;
  document.getElementById('dest-description').textContent = destination.description;
  document.getElementById('dest-best-time').textContent = destination.bestTime;
  document.getElementById('dest-duration').textContent = destination.minDays + ' to ' + destination.maxDays + ' days';
  document.getElementById('dest-cost').textContent = formatMoney(destination.cost) + ' per person';
  document.getElementById('dest-styles').textContent = destination.styles.join(', ');
  document.getElementById('plan-trip-link').href = 'create-trip.html?destination=' + destination.id;

  // Favorites button: tell it which destination it belongs to, then show the saved/not saved state
  const favoriteButton = document.getElementById('favorite-button');
  favoriteButton.setAttribute('data-fav-id', destination.id);
  favoriteButton.addEventListener('click', function () {
    handleFavoriteClick(destination.id);
  });
  updateFavoriteButtons();

  // Gallery: real pictures if the destination has an "images" list, otherwise coloured tiles (one per highlight)
  let galleryHtml = '';
  if (destination.images && destination.images.length > 0) {
    for (let i = 0; i < destination.images.length; i++) {
      galleryHtml = galleryHtml + '<img class="gallery-image" src="images/' + destination.images[i] + '" alt="' + destination.name + '">';
    }
  } else {
    for (let i = 0; i < destination.highlights.length; i++) {
      const angle = 135 + i * 40;                                   // each tile has a slightly different angle
      galleryHtml = galleryHtml + '<div class="gallery-tile" style="background: linear-gradient(' + angle + 'deg, ' + destination.colors[0] + ', ' + destination.colors[1] + ');">' +
        '<span class="gallery-emoji">' + getTypeEmoji(destination.type) + '</span><span class="gallery-caption">' + destination.highlights[i] + '</span></div>';
    }
  }
  document.getElementById('dest-gallery').innerHTML = galleryHtml;

  // Highlights: one <li> for each highlight
  let highlightsHtml = '';
  for (let i = 0; i < destination.highlights.length; i++) {
    highlightsHtml = highlightsHtml + '<li>' + destination.highlights[i] + '</li>';
  }
  document.getElementById('dest-highlights').innerHTML = highlightsHtml;

  // Activities: one row for each activity with its estimated cost
  let activitiesHtml = '';
  for (let i = 0; i < destination.activities.length; i++) {
    const activity = destination.activities[i];
    let costText = 'Free';
    if (activity.cost > 0) {
      costText = formatMoney(activity.cost);
    }
    activitiesHtml = activitiesHtml + '<div class="activity-row"><span>' + activity.name + '</span><strong>' + costText + '</strong></div>';
  }
  document.getElementById('dest-activities').innerHTML = activitiesHtml;
}
