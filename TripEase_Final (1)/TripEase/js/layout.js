/* =====================================================
   layout.js - draws the navbar and footer on EVERY page,
   protects pages that need a login, and shows "flash" messages.

   Each HTML page has two empty tags:
     <header id="site-header"></header>   and   <footer id="site-footer"></footer>
   (common.js must be loaded before this file)
   ===================================================== */

// Pages that need a logged-in user, and pages only the admin may open
const loginRequiredPages = ['create-trip.html', 'my-trips.html', 'trip.html'];
const adminOnlyPages = ['admin.html'];

// Finds the name of the page we are on, e.g. "explore.html"
function getCurrentFileName() {
  const parts = window.location.pathname.split('/');
  const lastPart = parts[parts.length - 1];
  if (lastPart === '') {
    return 'index.html';
  }
  return lastPart;
}

// If the visitor is not allowed on this page, send them somewhere else.
// Returns true when we are redirecting (so the rest of the page is not drawn).
function checkPageAccess() {
  const file = getCurrentFileName();
  const user = getCurrentUser();

  if (loginRequiredPages.includes(file) && user === null) {
    setFlash('Please log in to continue.', 'error');
    window.location.replace('login.html?next=' + encodeURIComponent(file + window.location.search));
    return true;
  }
  if (adminOnlyPages.includes(file) && (user === null || user.role !== 'admin')) {
    setFlash('That page is for the admin only.', 'error');
    window.location.replace(user === null ? 'login.html?next=' + file : 'index.html');
    return true;
  }
  return false;
}

// Builds the HTML text of the navigation bar (it changes with the login state)
function makeNavbarHtml() {
  const currentFile = getCurrentFileName();
  const user = getCurrentUser();

  // Menu links: everybody sees the first three; the others depend on the user
  const links = [
    { file: 'index.html', text: 'Home' },
    { file: 'explore.html', text: 'Explore' },
    { file: 'recommend.html', text: 'AI Recommendations' }
  ];
  if (user !== null) {
    links.push({ file: 'my-trips.html', text: 'My Trips' });
  }
  if (user !== null && user.role === 'admin') {
    links.push({ file: 'admin.html', text: 'Admin' });
  }

  let linksHtml = '';
  for (let i = 0; i < links.length; i++) {
    let activeClass = '';
    if (links[i].file === currentFile) {
      activeClass = ' active';
    }
    linksHtml = linksHtml + '<a href="' + links[i].file + '" class="nav-link' + activeClass + '">' + links[i].text + '</a>';
  }

  // Right side: login/register buttons OR the user's name, favorites count and logout
  let accountHtml = '';
  if (user === null) {
    accountHtml = '<a href="login.html" class="nav-link">Login</a><a href="register.html" class="button button-outline button-small">Sign up</a>';
  } else {
    accountHtml = '<a href="my-trips.html#favorites" class="nav-link" title="My favorites">♥ <span id="favorite-count">' + getFavoriteIds().length + '</span></a>' +
      '<span class="nav-user">Hi, ' + user.name.split(' ')[0] + '</span>' +
      '<button type="button" class="button button-outline button-small" onclick="handleLogout()">Logout</button>';
  }

  return `
    <div class="container navbar-inner">
      <a href="index.html" class="logo"><span class="logo-icon">T</span>TripEase</a>
      <nav class="nav-links">
        ${linksHtml}
        ${accountHtml}
        <a href="create-trip.html" class="button button-small">Plan a Trip</a>
      </nav>
    </div>`;
}

// Builds the HTML text of the footer
function makeFooterHtml() {
  return `
    <div class="container footer-inner">
      <div>
        <p class="footer-logo">TripEase</p>
        <p class="footer-tagline">Plan. Organize. Explore.</p>
      </div>
      <p class="footer-note">College project &middot; Rule-based recommendations &middot; Sample data + LocalStorage</p>
    </div>`;
}

// Run everything
const isRedirecting = checkPageAccess();
if (isRedirecting === false) {
  document.getElementById('site-header').innerHTML = makeNavbarHtml();
  document.getElementById('site-footer').innerHTML = makeFooterHtml();
  showFlashIfAny();                    // the flash message is shown on the NEXT page, not on the page we leave
}
