// The word in the hero ("Learn ___") changes every 2 seconds

// all the words we want to show
var words = ["Java", "AutoCAD", "Statics", "Excel", "Arduino", "C++"];

// w is the position of the word that is shown now (0 = "Java")
var w = 0;

function changeWord() {
  // go to the next word
  w = w + 1;

  // after the last word, start again from the first one
  if (w == words.length) {
    w = 0;
  }

  // put the word inside <span id="word">
  document.getElementById("word").innerHTML = words[w];
}

// run changeWord every 2000 milliseconds (2 seconds)
setInterval(changeWord, 2000);