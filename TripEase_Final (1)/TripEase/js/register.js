/* register.js - the Register page: checks the form and creates a customer account */

const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');

// Returns an error message, or an empty text if everything is fine
function checkRegistration(name, email, password, confirmPassword) {
  if (name === '') { return 'Please enter your name.'; }
  if (email.includes('@') === false || email.includes('.') === false) { return 'Please enter a valid email address.'; }
  if (emailAlreadyUsed(email)) { return 'This email is already registered. Please log in.'; }
  if (password.length < 6) { return 'The password must have at least 6 characters.'; }
  if (password !== confirmPassword) { return 'The two passwords do not match.'; }
  return '';
}

registerForm.addEventListener('submit', function (event) {
  event.preventDefault();

  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;
  const confirmPassword = document.getElementById('register-confirm').value;

  const problem = checkRegistration(name, email, password, confirmPassword);
  if (problem !== '') {
    registerMessage.textContent = problem;
    return;
  }

  registerUser(name, email, password);              // also logs the new user in
  setFlash('Account created. Welcome to TripEase, ' + name + '!');
  window.location.href = 'my-trips.html';
});
