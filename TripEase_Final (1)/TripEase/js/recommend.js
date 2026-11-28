/* =====================================================
   recommend.js - Smart AI Trip Recommendations
   (a transparent RULE-BASED system, not machine learning)

   How it works:
   1. The user fills in the form (type, budget, days, style).
   2. For every destination we add up points using 4 simple rules.
   3. The points add up to a score out of 100 (= the match percentage).
   4. We sort the destinations from highest to lowest score and show the best ones.
   ===================================================== */

// Points given by each rule (30 + 30 + 20 + 20 = 100)
const POINTS_TYPE = 30;
const POINTS_BUDGET = 30;
const POINTS_DAYS = 20;
const POINTS_STYLE = 20;

// Destinations scoring below this are not shown
const MINIMUM_SCORE = 50;

// Get the page elements we need
const recommendForm = document.getElementById('recommend-form');
const formMessage = document.getElementById('form-message');
const resultsBox = document.getElementById('results');

// ---------- Step 1: give ONE destination a score ----------
// "prefs" holds what the user typed: prefs.type, prefs.budget, prefs.days, prefs.style
function scoreDestination(d, prefs) {
  const goodReasons = [];     // reasons that earned points
  const badReasons = [];      // reasons that earned no points (or only some)

  // Rule 1: destination type (30 points)
  let typePoints = 0;
  if (prefs.type === 'Any') {
    typePoints = POINTS_TYPE;
    goodReasons.push('You had no preferred destination type, so every type scores full points');
  } else if (d.type === prefs.type) {
    typePoints = POINTS_TYPE;
    goodReasons.push('Matches your preferred type: ' + d.type);
  } else {
    badReasons.push('It is a ' + d.type + ' destination, not ' + prefs.type);
  }

  // Rule 2: budget (30 points; 15 points if it is up to 20% over budget)
  let budgetPoints = 0;
  if (d.cost <= prefs.budget) {
    budgetPoints = POINTS_BUDGET;
    goodReasons.push('Estimated cost ' + formatMoney(d.cost) + ' is within your budget of ' + formatMoney(prefs.budget));
  } else if (d.cost <= prefs.budget * 1.2) {
    budgetPoints = POINTS_BUDGET / 2;
    badReasons.push('Estimated cost ' + formatMoney(d.cost) + ' is slightly above your budget (half points)');
  } else {
    badReasons.push('Estimated cost ' + formatMoney(d.cost) + ' is well above your budget of ' + formatMoney(prefs.budget));
  }

  // Rule 3: number of days (20 points; 10 points if only 1 day outside the ideal range)
  let daysPoints = 0;
  if (prefs.days >= d.minDays && prefs.days <= d.maxDays) {
    daysPoints = POINTS_DAYS;
    goodReasons.push('Your ' + prefs.days + ' days fits the ideal ' + d.minDays + ' to ' + d.maxDays + ' days');
  } else if (prefs.days === d.minDays - 1 || prefs.days === d.maxDays + 1) {
    daysPoints = POINTS_DAYS / 2;
    badReasons.push('Your ' + prefs.days + ' days is close to the ideal ' + d.minDays + ' to ' + d.maxDays + ' days (half points)');
  } else {
    badReasons.push('The ideal trip length is ' + d.minDays + ' to ' + d.maxDays + ' days, not ' + prefs.days);
  }

  // Rule 4: travel style (20 points)
  let stylePoints = 0;
  if (d.styles.includes(prefs.style)) {
    stylePoints = POINTS_STYLE;
    goodReasons.push('Suits a ' + prefs.style + ' travel style');
  } else {
    badReasons.push('Does not especially suit a ' + prefs.style + ' travel style');
  }

  // Add the four parts together
  const totalScore = typePoints + budgetPoints + daysPoints + stylePoints;

  return {
    destination: d,
    score: totalScore,
    typePoints: typePoints,
    budgetPoints: budgetPoints,
    daysPoints: daysPoints,
    stylePoints: stylePoints,
    goodReasons: goodReasons,
    badReasons: badReasons
  };
}

// ---------- Step 2: score every destination, rank them, keep the best ----------
// FUTURE AI: this is the only function the page depends on for its results.
// To use a real AI API later, replace the inside of this function so that it
// still returns a list of results in the same shape (destination, score, reasons...).
function getRecommendations(prefs) {
  const allDestinations = getDestinations();
  const results = [];

  for (let i = 0; i < allDestinations.length; i++) {
    const result = scoreDestination(allDestinations[i], prefs);
    if (result.score >= MINIMUM_SCORE) {
      results.push(result);
    }
  }

  // Sort from the highest score to the lowest (if scores are equal, the higher rating comes first)
  results.sort(function (a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return b.destination.rating - a.destination.rating;
  });

  return results.slice(0, 5);      // keep only the top 5
}

// ---------- Step 3: show the results on the page ----------
function makeResultCard(result, rank) {
  const d = result.destination;

  let goodHtml = '';
  for (let i = 0; i < result.goodReasons.length; i++) {
    goodHtml = goodHtml + '<li class="reason-good">✔ ' + result.goodReasons[i] + '</li>';
  }
  let badHtml = '';
  for (let i = 0; i < result.badReasons.length; i++) {
    badHtml = badHtml + '<li class="reason-bad">✖ ' + result.badReasons[i] + '</li>';
  }

  return `
    <article class="result-card">
      <div class="result-top">
        <div>
          <p class="result-rank">#${rank} recommendation</p>
          <h3>${getTypeEmoji(d.type)} ${d.name}</h3>
          <p class="card-region">${d.region} · ${d.type}</p>
        </div>
        <div class="match-box">
          <span class="match-number">${result.score}%</span>
          <span class="match-label">match</span>
        </div>
      </div>

      <div class="score-bar"><div class="score-fill" style="width: ${result.score}%;"></div></div>

      <h4>Why we recommend it</h4>
      <ul class="reason-list">${goodHtml}${badHtml}</ul>

      <p class="breakdown">
        Score breakdown: Type ${result.typePoints}/${POINTS_TYPE} +
        Budget ${result.budgetPoints}/${POINTS_BUDGET} +
        Days ${result.daysPoints}/${POINTS_DAYS} +
        Style ${result.stylePoints}/${POINTS_STYLE} =
        <strong>${result.score}/100</strong>
      </p>

      <div class="result-buttons">
        <a href="destination.html?id=${d.id}" class="button button-outline">View details</a>
        <a href="create-trip.html?destination=${d.id}" class="button">Plan this trip</a>
      </div>
    </article>`;
}

function showResults(results) {
  if (results.length === 0) {
    resultsBox.innerHTML = '<p class="message-box">No destinations matched your preferences well enough (a match needs at least ' + MINIMUM_SCORE + '%). Try a higher budget, a different number of days or another destination type.</p>';
    return;
  }

  let html = '<h2>Your top matches</h2>';
  for (let i = 0; i < results.length; i++) {
    html = html + makeResultCard(results[i], i + 1);
  }
  resultsBox.innerHTML = html;
}

// ---------- Step 4: run when the user submits the form ----------
recommendForm.addEventListener('submit', function (event) {
  event.preventDefault();                       // stop the page from reloading

  // Read the form values (number inputs give text, so Number() converts them)
  const prefs = {
    type: document.getElementById('destination-type').value,
    budget: Number(document.getElementById('budget').value),
    days: Number(document.getElementById('days').value),
    style: document.getElementById('travel-style').value
  };

  // Check the numbers before using them
  if (prefs.budget <= 0) {
    formMessage.textContent = 'Please enter a budget greater than 0.';
    return;
  }
  if (prefs.days < 1 || prefs.days > 30) {
    formMessage.textContent = 'Please enter a number of days between 1 and 30.';
    return;
  }
  formMessage.textContent = '';

  const results = getRecommendations(prefs);
  showResults(results);
  resultsBox.scrollIntoView();                  // move down to the results
});
