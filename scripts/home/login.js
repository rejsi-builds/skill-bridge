var form = document.getElementById("loginForm");
var email = document.getElementById("email");
var error = document.getElementById("error");

form.onsubmit = function () {
  var saved = localStorage.getItem("user");

  // nobody has signed up yet
  if (saved == null) {
    error.innerHTML = "No account found. Please sign up first.";
    return false;
  }

  var user = JSON.parse(saved);

  if (user.email == email.value) {
    return true;
  } else {
    error.innerHTML = "No account with this email. Please sign up first.";
    return false;
  }
};