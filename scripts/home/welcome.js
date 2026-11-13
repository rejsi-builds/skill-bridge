// ===== 1. CYCLING WORD IN THE HERO =====
var words = ["Java", "AutoCAD", "Statics", "Excel", "Arduino", "C++"];
var w = 0;

setInterval(function () {
  w = w + 1;
  if (w == words.length) {
    w = 0;
  }
  document.getElementById("word").innerHTML = words[w];
}, 2000);


// ===== 2. STATS COUNT UP =====
var skills = 0;
var teachers = 0;
var majors = 0;

var counter = setInterval(function () {
  if (skills < 120) {
    skills = skills + 1;
  }
  if (teachers < 45) {
    teachers = teachers + 1;
  }
  if (majors < 12) {
    majors = majors + 1;
  }

  document.getElementById("skills").innerHTML = skills;
  document.getElementById("teachers").innerHTML = teachers;
  document.getElementById("majors").innerHTML = majors;

  if (skills == 120) {
    clearInterval(counter);
  }
}, 20);


// ===== 3. LEARNER STORIES =====
var stories = [
  "Ana helped 8 first-years pass their AutoCAD project and now teaches every Thursday.",
  "Ermal was failing Statics. After two sessions with a classmate he passed, and now he teaches it.",
  "Klea taught HTML to a Business student and learned Excel in return.",
  "Dritan built his first Arduino robot after one weekend of lessons from a friend."
];
var s = 0;

function showStory() {
  document.getElementById("storyText").innerHTML = stories[s];
  document.getElementById("avatar").innerHTML = stories[s].charAt(0);
}

function nextStory() {
  s = s + 1;
  if (s == stories.length) {
    s = 0;
  }
  showStory();
}

function prevStory() {
  s = s - 1;
  if (s < 0) {
    s = stories.length - 1;
  }
  showStory();
}

document.getElementById("next").onclick = nextStory;
document.getElementById("prev").onclick = prevStory;

setInterval(nextStory, 6000);