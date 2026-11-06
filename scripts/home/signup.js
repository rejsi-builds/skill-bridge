var form = document.getElementById("signupForm");
var email = document.getElementById("email");
var error = document.getElementById("error");

form.onsubmit = function () {
  if (email.value.endsWith("@epoka.edu.al")) {
    return true;
  } else {
    error.innerHTML = "Only @epoka.edu.al emails can register.";
    return false;
  }
};