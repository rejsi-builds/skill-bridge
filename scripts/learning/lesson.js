// Lesson window: shows the lesson text and the attached file
// A lesson can have text, a file, or both.

// The course and lesson that are open in the window
let readCourse = null;
let readLesson = null;

// <div class="file-box"><strong>notes.pdf</strong></div>
function showFile(file) {

    let nameText = document.createElement("strong");
    nameText.textContent = file.name;

    let box = document.createElement("div");
    box.className = "file-box";
    box.append(nameText);

    return box;
}

function openLesson(course, lesson) {

    readCourse = course;
    readLesson = lesson;

    document.getElementById("lessonTitle").textContent = lesson.title;
    document.getElementById("lessonInfo").textContent = course.title + " · " + lesson.minutes + " min";

    // The text the lecturer posted
    let textBox = document.getElementById("lessonText");
    textBox.textContent = lesson.text;

    if (lesson.text === "") {
        textBox.classList.add("hidden");
    } else {
        textBox.classList.remove("hidden");
    }

    // The file the lecturer attached, if there is one
    let fileBox = document.getElementById("lessonFile");
    fileBox.innerHTML = "";

    if (lesson.file !== null) {
        fileBox.append(showFile(lesson.file));
    }

    // Nothing posted yet
    if (lesson.text === "" && lesson.file === null) {
        textBox.textContent = "The lecturer has not posted any content for this lesson yet.";
        textBox.classList.remove("hidden");
    }

    // The button says what a click will do
    let doneButton = document.getElementById("lessonDone");

    if (lesson.done) {
        doneButton.textContent = "Mark as not done";
    } else {
        doneButton.textContent = "Mark as done";
    }

    openModal("lessonModal");
}

// Mark the lesson as finished (or not finished) from the lesson window
function markLessonDone() {
    closeModal("lessonModal");
    toggleLesson(readCourse, readLesson);
}
