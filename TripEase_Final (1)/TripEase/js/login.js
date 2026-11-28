/* login.js - the Login page (mock login, see README for limitations) */

const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');

// Only allow going back to one of our own pages (not to another website)
function isSafePage(address) {
  return address.includes('.html') && !address.includes('//') && !address.includes(':');
}

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (email === '' || password === '') {
    loginMessage.textContent = 'Please enter your email and password.';
    return;
  }

  const user = loginUser(email, password);          // null if email/password are wrong
  if (user === null) {
    loginMessage.textContent = 'Wrong email or password.';
    return;
  }

  setFlash('Welcome back, ' + user.name + '!');

  // Where to go next: the page the user wanted, or a default page
  let nextPage = getQueryValue('next');
  if (nextPage === null || isSafePage(nextPage) === false) {
    nextPage = (user.role === 'admin') ? 'admin.html' : 'my-trips.html';
  }
  window.location.href = nextPage;
});
