// My Learning Journey page: tabs, welcome, progress, courses, take course.

function openModal(id) {
    document.getElementById(id).classList.add("open");
}

function closeModal(id) {
    document.getElementById(id).classList.remove("open");
}

function showTab(name) {
    closeCourse();

    let tabs = ["courses", "schedule", "tasks"];

    tabs.forEach((tab) => {
        let page = document.getElementById(tab + "Tab");
        let button = document.getElementById(tab + "Button");

        if (tab === name) {
            page.classList.remove("hidden");
            button.classList.add("active");
        } else {
            page.classList.add("hidden");
            button.classList.remove("active");
        }
    });
}


// Welcome message and overall progress

function renderWelcome() {

    let firstName = currentUser.fullName.split(" ")[0];
    let taken = getTakenCourses().length;

    let plural = "";
    if (taken > 1) {
        plural = "s";
    }

    document.getElementById("welcomeTitle").textContent = "Welcome back, " + firstName + "!";

    if (taken === 0) {
        document.getElementById("welcomeText").textContent =
            "You have not taken a course yet. Click \"Take Course\" to get started.";
    } else {
        document.getElementById("welcomeText").textContent =
            "You are taking " + taken + " course" + plural + ". Keep going, every lesson counts.";
    }
}

function renderOverallProgress() {

    let total = 0;
    let done = 0;

    getTakenCourses().forEach((course) => {
        let counts = countLessons(course);
        total += counts.total;
        done += counts.done;
    });

    let percent = 0;
    if (total > 0) {
        percent = Math.round(done / total * 100);
    }

    document.getElementById("overallPercent").textContent = percent + "%";
    document.getElementById("overallBar").style.width = percent + "%";
    document.getElementById("overallText").textContent = done + " of " + total + " lessons completed";
}


// My Courses + filter based on its status

function renderCourses() {

    let filter = document.getElementById("courseFilter").value;

    let courseList = document.getElementById("courseList");
    courseList.innerHTML = "";

    getTakenCourses().forEach((course) => {

        let completed = isCompleted(course);
        let progress = getProgress(course);

        if (filter === "completed" && !completed) {
            return;
        }
        if (filter === "inprogress" && completed) {
            return;
        }

        let icon = document.createElement("i");
        icon.className = "bi " + course.icon;

        let image = document.createElement("div");
        image.className = "course-image";
        image.append(icon);

        // Status badge and difficulty
        let badge = document.createElement("span");
        badge.className = "badge blue";
        badge.textContent = "In Progress";

        if (completed) {
            badge.className = "badge green";
            badge.textContent = "Completed";
        }

        let difficulty = document.createElement("small");
        difficulty.textContent = course.difficulty;

        let top = document.createElement("div");
        top.className = "course-top";
        top.append(badge);
        top.append(difficulty);

        // Title and lecturer
        let title = document.createElement("h3");
        title.textContent = course.title;

        let lecturer = document.createElement("p");
        lecturer.className = "lecturer";
        lecturer.textContent = "Lecturer: " + course.lecturer;

        // Progress bar
        let fill = document.createElement("div");
        fill.style.width = progress + "%";

        if (completed) {
            fill.className = "complete";
        }

        let bar = document.createElement("div");
        bar.className = "bar";
        bar.append(fill);

        let percentText = document.createElement("small");
        percentText.textContent = progress + "% complete";

        // The card: a click opens the course content
        let card = document.createElement("div");
        card.className = "course-card";
        card.append(image);
        card.append(top);
        card.append(title);
        card.append(lecturer);
        card.append(bar);
        card.append(percentText);

        card.addEventListener("click", () => {
            openCourse(course.id);
        });

        courseList.append(card);
    });

    if (courseList.children.length === 0) {
        let emptyText = document.createElement("p");
        emptyText.className = "empty";
        emptyText.textContent = "No courses here yet.";
        courseList.append(emptyText);
    }
}


// "Take a course" modal

function openTakeCourse() {
    renderAvailable();
    openModal("takeModal");
}

function renderAvailable() {

    let availableList = document.getElementById("availableList");
    availableList.innerHTML = "";

    courses.forEach((course) => {

        if (course.enrolled) {
            return;
        }

        let title = document.createElement("strong");
        title.textContent = course.title;

        let description = document.createElement("p");
        description.textContent = course.description;

        let info = document.createElement("small");
        info.textContent = "Lecturer: " + course.lecturer + " · " + course.category + " · " + course.difficulty;

        let leftBox = document.createElement("div");
        leftBox.append(title);
        leftBox.append(description);
        leftBox.append(info);

        let takeButton = document.createElement("button");
        takeButton.textContent = "Take";
        takeButton.addEventListener("click", () => {
            takeCourse(course);
        });

        let row = document.createElement("div");
        row.className = "available";
        row.append(leftBox);
        row.append(takeButton);

        availableList.append(row);
    });

    if (availableList.children.length === 0) {
        let emptyText = document.createElement("p");
        emptyText.className = "empty";
        emptyText.textContent = "You have taken every available course.";
        availableList.append(emptyText);
    }
}

function takeCourse(course) {
    course.enrolled = true;
    saveData();

    renderAll();
    renderAvailable();
}


function renderAll() {
    renderWelcome();
    renderOverallProgress();
    renderCourses();
    renderSchedule();
    renderTasks();
}

document.addEventListener("DOMContentLoaded", () => {

    // Tabs
    document.getElementById("coursesButton").addEventListener("click", () => {
        showTab("courses");
    });
    document.getElementById("scheduleButton").addEventListener("click", () => {
        showTab("schedule");
    });
    document.getElementById("tasksButton").addEventListener("click", () => {
        showTab("tasks");
    });

    // My courses: filter and "Take Course" button
    document.getElementById("courseFilter").addEventListener("change", renderCourses);
    document.getElementById("takeButton").addEventListener("click", openTakeCourse);

    // Closing the windows
    document.getElementById("closePanelButton").addEventListener("click", closeCourse);
    document.getElementById("closeTakeButton").addEventListener("click", () => {
        closeModal("takeModal");
    });
    document.getElementById("closeLessonX").addEventListener("click", () => {
        closeModal("lessonModal");
    });
    document.getElementById("closeLessonButton").addEventListener("click", () => {
        closeModal("lessonModal");
    });

    // Lesson window: finish the lesson
    document.getElementById("lessonDone").addEventListener("click", markLessonDone);

    renderAll();
});
