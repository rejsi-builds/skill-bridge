// ===== 1. THE SKILLS =====
// An array of objects: each object is one skill with 4 properties.
// To add a new skill, copy one line and change the values.
var skills = [
  { title: "C++ for beginners", major: "Computer Eng", teacher: "Arben", level: "Beginner" },
  { title: "Data structures", major: "Computer Eng", teacher: "Renis", level: "Intermediate" },
  { title: "Java OOP", major: "Software", teacher: "Elira", level: "Intermediate" },
  { title: "HTML and CSS basics", major: "Software", teacher: "Klea", level: "Beginner" },
  { title: "Arduino projects", major: "Electronics", teacher: "Dritan", level: "Beginner" },
  { title: "AutoCAD floor plans", major: "Architecture", teacher: "Ana", level: "Beginner" },
  { title: "Statics made simple", major: "Civil", teacher: "Ermal", level: "Beginner" },
  { title: "Concrete design", major: "Civil", teacher: "Ermal", level: "Advanced" },
  { title: "Excel for business", major: "Business", teacher: "Mira", level: "Beginner" }
];


// ===== 2. SHOW THE CARDS OF ONE DEPARTMENT =====
// Called by the department buttons, e.g. showSkills('Civil').
// It builds the HTML of every matching card and puts it inside <div id="cards">.
function showSkills(major) {
  // the HTML of all the cards, built step by step
  var html = "";

  // go through every skill in the array
  for (var i = 0; i < skills.length; i++) {

    // keep the skill if "All" was clicked, or if its major is the clicked one
    if (major == "All" || skills[i].major == major) {

      // add one card: title, info line and a Save button
      // the Save button calls saveSkill() with the title of this skill
      html = html +
        '<div class="card">' +
          '<h3>' + skills[i].title + '</h3>' +
          '<p>' + skills[i].major + ' · by ' + skills[i].teacher + ' · ' + skills[i].level + '</p>' +
          '<button onclick="saveSkill(\'' + skills[i].title + '\')">Save</button>' +
        '</div>';
    }
  }

  // replace the old cards with the new ones
  document.getElementById("cards").innerHTML = html;
}

// when the page opens, show all the skills
showSkills("All");


// ===== 3. SAVE BUTTON =====
// Shows "... saved!" and removes it after 3 seconds.
function saveSkill(title) {
  document.getElementById("message").innerHTML = title + " saved!";

  // after 3000 milliseconds (3 seconds), empty the message
  setTimeout(function () {
    document.getElementById("message").innerHTML = "";
  }, 3000);
}


// ===== 4. SKILL OF THE DAY =====
// getDay() gives the day of the week as a number:
// 0 = Sunday, 1 = Monday ... 6 = Saturday.
// We use that number to pick one skill, so it changes every day.
var today = new Date().getDay();

document.getElementById("skillOfDay").innerHTML =
  skills[today].title + " · taught by " + skills[today].teacher;


// ===== 5. LIVE ACTIVITY =====
// A new line every 4 seconds (same idea as the changing word on the welcome page).
var activities = [
  "Ermal just started Statics made simple",
  "Ana published a new AutoCAD lesson",
  "Klea completed HTML and CSS basics",
  "Arben joined the weekly challenge",
  "Mira saved Excel for business"
];

// a is the position of the line that is shown now
var a = 0;

function changeActivity() {
  // go to the next line
  a = a + 1;

  // after the last line, start again from the first one
  if (a == activities.length) {
    a = 0;
  }

  // put the line inside <p id="activity">
  document.getElementById("activity").innerHTML = activities[a];
}

// run changeActivity every 4000 milliseconds (4 seconds)
setInterval(changeActivity, 4000);