var form = document.getElementById("signupForm");
var email = document.getElementById("email");
var error = document.getElementById("error");

// the other fields
var fullName = document.getElementById("fullName");
var major = document.getElementById("major");
var skills = document.getElementById("skills");
var password = document.getElementById("password");
var boxes = document.getElementsByClassName("interest");

form.onsubmit = function () {

  // put the ticked interests in an array
  var interests = [];
  for (var i = 0; i < boxes.length; i++) {
    if (boxes[i].checked) {
      interests.push(boxes[i].value);
    }
  }

  // extra checks
  if (fullName.value.length < 3) {
    error.innerHTML = "Please write your full name.";
    return false;
  }

  if (interests.length == 0) {
    error.innerHTML = "Choose at least one interest.";
    return false;
  }

  if (password.value.length < 6) {
    error.innerHTML = "Password must have at least 6 characters.";
    return false;
  }

  if (email.value.endsWith("@epoka.edu.al")) {

    // save the user in localStorage
    var user = {
      fullName: fullName.value,
      email: email.value,
      major: major.value,
      interests: interests,
      skills: skills.value
    };
    localStorage.setItem("user", JSON.stringify(user));

    return true;
  } else {
    error.innerHTML = "Only @epoka.edu.al emails can register.";
    return false;
  }
};