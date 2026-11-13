//  1. THE SKILLS (an array of objects) 
var skills = [
  { title: "C++ for beginners", major: "Computer Eng", teacher: "Arben", level: "Beginner", text: "Variables, loops and functions with simple examples." },
  { title: "Data structures", major: "Computer Eng", teacher: "Renis", level: "Intermediate", text: "Arrays, lists, stacks and queues explained step by step." },
  { title: "Java OOP", major: "Software", teacher: "Elira", level: "Intermediate", text: "Classes, objects and inheritance for your Java projects." },
  { title: "HTML and CSS basics", major: "Software", teacher: "Klea", level: "Beginner", text: "Build your first web page from scratch." },
  { title: "Arduino projects", major: "Electronics", teacher: "Dritan", level: "Beginner", text: "Make LEDs blink and read sensors with Arduino." },
  { title: "Logic circuits", major: "Electronics", teacher: "Luka", level: "Intermediate", text: "Gates, truth tables and simple circuits." },
  { title: "AutoCAD floor plans", major: "Architecture", teacher: "Ana", level: "Beginner", text: "Draw your first floor plan, from walls to doors." },
  { title: "SketchUp modeling", major: "Architecture", teacher: "Sara", level: "Intermediate", text: "Turn your plans into 3D models." },
  { title: "Statics made simple", major: "Civil", teacher: "Ermal", level: "Beginner", text: "Forces, moments and free body diagrams." },
  { title: "Concrete design", major: "Civil", teacher: "Ermal", level: "Advanced", text: "Beams, slabs and reinforcement for your project." },
  { title: "Excel for business", major: "Business", teacher: "Mira", level: "Beginner", text: "Formulas, tables and charts you will use every day." },
  { title: "Marketing plans", major: "Business", teacher: "Besa", level: "Intermediate", text: "Write a simple marketing plan for a real product." },
  { title: "Microeconomics basics", major: "Economics", teacher: "Arta", level: "Beginner", text: "Supply, demand and prices without the stress." },
  { title: "Legal writing", major: "Law", teacher: "Endri", level: "Advanced", text: "Write clear legal arguments and case notes." }
];

var chosenMajor = "All";
var saved = [];   // saved[i] is true when skill number i is saved


//  2. SHOW THE SKILL CARDS 
function showSkills() {
  var search = document.getElementById("search").value.toLowerCase();
  var level = document.getElementById("level").value;
  var html = "";
  var count = 0;

  for (var i = 0; i < skills.length; i++) {
    var skill = skills[i];

    var matchMajor = (chosenMajor == "All" || skill.major == chosenMajor);
    var matchLevel = (level == "All levels" || skill.level == level);
    var matchSearch = skill.title.toLowerCase().includes(search);

    if (matchMajor && matchLevel && matchSearch) {
      count = count + 1;

      var heart = "&#9825;";          // empty heart
      var heartClass = "heart";
      if (saved[i] == true) {
        heart = "&#9829;";            // full heart
        heartClass = "heart saved";
      }

      html = html +
        '<div class="card">' +
          '<h3>' + skill.title + '</h3>' +
          '<p class="info">' + skill.major + ' · by ' + skill.teacher + '</p>' +
          '<p>' + skill.text + '</p>' +
          '<div class="card-bottom">' +
            '<span class="badge ' + skill.level.toLowerCase() + '">' + skill.level + '</span>' +
            '<button class="' + heartClass + '" onclick="saveSkill(' + i + ')">' + heart + '</button>' +
          '</div>' +
        '</div>';
    }
  }

  if (count == 0) {
    html = "<p>No skills found. Try another search.</p>";
  }

  document.getElementById("cards").innerHTML = html;
  document.getElementById("resultCount").innerHTML = "Showing " + count + " skills";
}


//  3. DEPARTMENT BUTTONS 
function pickMajor(name) {
  chosenMajor = name;

  var buttons = document.getElementsByClassName("category");
  for (var i = 0; i < buttons.length; i++) {
    if (buttons[i].innerHTML == name) {
      buttons[i].className = "category active";
    } else {
      buttons[i].className = "category";
    }
  }

  showSkills();
}


//  4. SEARCH AND LEVEL 
document.getElementById("search").addEventListener("input", showSkills);
document.getElementById("level").addEventListener("change", showSkills);


//  5. SAVE A SKILL (the heart) 
function saveSkill(i) {
  var message = document.getElementById("savedMessage");

  if (saved[i] == true) {
    saved[i] = false;
    message.innerHTML = skills[i].title + " removed";
  } else {
    saved[i] = true;
    message.innerHTML = skills[i].title + " saved!";
  }

  showSkills();

  setTimeout(function () {
    message.innerHTML = "";
  }, 3000);
}


//  6. WEEKLY CHALLENGE COUNTDOWN 
var challengeDate = new Date("2026-11-30T10:00:00");

function updateCountdown() {
  var now = new Date();
  var diff = challengeDate - now;   // milliseconds left

  if (diff <= 0) {
    document.getElementById("countdown").innerHTML = "The challenge has started!";
    return;
  }

  var days = Math.floor(diff / (1000 * 60 * 60 * 24));
  var hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  var minutes = Math.floor(diff / (1000 * 60)) % 60;
  var seconds = Math.floor(diff / 1000) % 60;

  document.getElementById("countdown").innerHTML =
    days + "d " + hours + "h " + minutes + "m " + seconds + "s";
}

updateCountdown();
setInterval(updateCountdown, 1000);


// 7. SKILL OF THE DAY 
var today = new Date().getDay();   // 0 = Sunday ... 6 = Saturday
var skillOfDay = skills[today];

document.getElementById("sotdTitle").innerHTML = skillOfDay.title;
document.getElementById("sotdInfo").innerHTML =
  skillOfDay.major + " · taught by " + skillOfDay.teacher + " · " + skillOfDay.level;


//  8. LIVE ACTIVITY 
var activities = [
  "Ermal just started Statics made simple",
  "Sara published a new SketchUp lesson",
  "Klea completed HTML and CSS basics",
  "Arben joined the weekly challenge",
  "Mira saved Excel for business",
  "Luka swapped Logic circuits for Java OOP",
  "Besa finished Marketing plans lesson 3"
];
var shown = [];
var a = 0;

function addActivity() {
  shown.unshift(activities[a]);   // add to the top
  if (shown.length > 5) {
    shown.pop();                  // keep only the last 5
  }

  a = a + 1;
  if (a == activities.length) {
    a = 0;
  }

  var html = "";
  for (var i = 0; i < shown.length; i++) {
    html = html + "<li>" + shown[i] + "</li>";
  }
  document.getElementById("feed").innerHTML = html;
}

addActivity();
addActivity();
addActivity();
setInterval(addActivity, 4000);


//  START: show all cards when the page opens 
showSkills();