/* Course content panel: shown below the course cards when you click a course.
It lists the lessons (click to read, tick when finished) and the assignments. */

function openCourse(id) {
    renderDetails(id);

    let panel = document.getElementById("coursePanel");
    panel.classList.remove("hidden");
    panel.scrollIntoView({ behavior: "smooth" });
}

function closeCourse() {
    document.getElementById("coursePanel").classList.add("hidden");
}

function renderDetails(id) {

    let course = getCourse(id);

    document.getElementById("detailTitle").textContent = course.title;
    document.getElementById("detailLecturer").textContent = course.lecturer;

    let detailBody = document.getElementById("detailBody");
    detailBody.innerHTML = "";

    let hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Click a lesson to read it, tick the box when you finish it.";
    detailBody.append(hint);

    // Chapters and their lessons
    course.chapters.forEach((chapter) => {

        let chapterTitle = document.createElement("p");
        chapterTitle.className = "chapter";
        chapterTitle.textContent = chapter.title;
        detailBody.append(chapterTitle);

        chapter.lessons.forEach((lesson) => {

            // Tick box: tick or untick the lesson
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = lesson.done;
            checkbox.addEventListener("change", () => {
                toggleLesson(course, lesson);
            });

            // Lesson title: opens the lesson window
            let lessonButton = document.createElement("button");
            lessonButton.className = "link";
            lessonButton.textContent = lesson.title;
            lessonButton.addEventListener("click", () => {
                openLesson(course, lesson);
            });

            if (lesson.done) {
                lessonButton.classList.add("done");
            }

            let leftBox = document.createElement("span");
            leftBox.append(checkbox);
            leftBox.append(lessonButton);

            let minutesText = document.createElement("small");
            minutesText.textContent = lesson.minutes + " min";

            let row = document.createElement("div");
            row.className = "lesson";
            row.append(leftBox);
            row.append(minutesText);

            detailBody.append(row);
        });
    });

    // Assignments
    let assignmentsTitle = document.createElement("h4");
    assignmentsTitle.textContent = "Assignments";
    detailBody.append(assignmentsTitle);

    course.assignments.forEach((assignment) => {
        detailBody.append(showTasks(assignment.title, assignment.details, dueDate(assignment)));
    });
}

// Mark a lesson as finished or unfinished
function toggleLesson(course, lesson) {

    lesson.done = !lesson.done;
    saveData();

    renderDetails(course.id);
    renderAll();
}
