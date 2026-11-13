// Tasks tab: assignments from the courses you took

// "Due Nov 12"
function dueDate(assignment) {
    let date = toDate(assignment.due).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return "Due " + date;
}

// One assignment row. The Tasks tab and the course content panel both use it.
//   <div class="task"> <span>title + details</span> <span class="due">Due Nov 12</span> </div>
function showTasks(title, details, dueText) {

    let titleText = document.createElement("strong");
    titleText.textContent = title;

    let detailsText = document.createElement("small");
    detailsText.textContent = details;

    let leftBox = document.createElement("span");
    leftBox.append(titleText);
    leftBox.append(detailsText);

    let rightBox = document.createElement("span");
    rightBox.className = "due";
    rightBox.textContent = dueText;

    let row = document.createElement("div");
    row.className = "task";
    row.append(leftBox);
    row.append(rightBox);

    return row;
}

function renderTasks() {

    // 1. Get all assignments from the courses I took
    let tasks = [];

    getTakenCourses().forEach((course) => {
        course.assignments.forEach((assignment) => {
            tasks.push({ courseTitle: course.title, assignment: assignment });
        });
    });

    // Closest deadline first
    tasks.sort((a, b) => a.assignment.due.localeCompare(b.assignment.due));

    // 2. Show them
    let taskList = document.getElementById("taskList");
    taskList.innerHTML = "";

    if (tasks.length === 0) {
        let emptyText = document.createElement("p");
        emptyText.className = "empty";
        emptyText.textContent = "No assignments yet.";
        taskList.append(emptyText);
        return;
    }

    tasks.forEach((task) => {
        taskList.append(showTasks(task.assignment.title, task.courseTitle, dueDate(task.assignment)));
    });
}
