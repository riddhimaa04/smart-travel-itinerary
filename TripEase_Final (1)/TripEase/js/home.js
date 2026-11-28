/* home.js - shows the featured destinations on the home page */

const featuredList = document.getElementById('featured-list');

const allDestinations = getDestinations();

let cardsHtml = '';
for (let i = 0; i < allDestinations.length; i++) {
  // Only destinations marked featured: true are shown here
  if (allDestinations[i].featured === true) {
    cardsHtml = cardsHtml + makeDestinationCard(allDestinations[i]);
  }
}
featuredList.innerHTML = cardsHtml;
