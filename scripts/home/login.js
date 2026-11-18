var form = document.getElementById("loginForm");
var email = document.getElementById("email");
var error = document.getElementById("error");
var password = document.getElementById("password");

// password of the demo account (Alex)
var demoPassword = "alex1234";

form.onsubmit = function () {

  // demo account: Alex (from store.js) goes straight to his profile
  if (email.value == Store.currentUser.email) {
    if (password.value == demoPassword) {
      localStorage.removeItem("loggedInUser");   // the profile shows Alex
      return true;
    } else {
      error.innerHTML = "Wrong password.";
      return false;
    }
  }

  var saved = localStorage.getItem("user");

  // nobody has signed up yet
  if (saved == null) {
    error.innerHTML = "No account found. Please sign up first.";
    return false;
  }

  var user = JSON.parse(saved);

  if (user.email != email.value) {
    error.innerHTML = "No account with this email. Please sign up first.";
    return false;
  }

  // check the password saved at sign up
  if (user.password == password.value) {
    localStorage.setItem("loggedInUser", saved);   // the profile shows this user
    return true;
  } else {
    error.innerHTML = "Wrong password.";
    return false;
  }
};