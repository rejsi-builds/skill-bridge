// My Courses: the list, create / edit / delete and the status buttons.
// The status decides if students see the course on the Learn page (Published only).

function renderCourses() {

    const filter = document.getElementById("courseFilter").value;
    const myCourses = getMyCourses();

    let html = "";
    let totalStudents = 0;

    for (const course of myCourses) {

        const students = getStudentsOf(course.id).length;
        totalStudents += students;

        if (filter !== "All" && course.status !== filter) {
            continue;
        }

        // Badge color
        let badgeClass = "bg-secondary";
        if (course.status === "Published") {
            badgeClass = "bg-success";
        } else if (course.status === "Draft") {
            badgeClass = "bg-warning text-dark";
        }

        // "3 / 25" and a Full badge when there is a limit
        let limitText = "";
        let fullBadge = "";
        if (course.limit > 0) {
            limitText = " / " + course.limit;
            if (students >= course.limit) {
                fullBadge = `<span class="badge bg-danger">Full</span>`;
            }
        }

        html += `
            <div class="col-md-6 col-lg-4">
                <div class="course-card clickable" onclick="openCourseContent(${course.id})">
                    <div class="course-image mb-3"><i class="bi ${course.icon}"></i></div>
                    <div class="d-flex justify-content-between mb-2">
                        <span>
                            <span class="badge ${badgeClass}">${course.status}</span>
                            ${fullBadge}
                        </span>
                        <small class="text-muted">${course.difficulty}</small>
                    </div>
                    <h5 class="fw-bold">${course.title}</h5>
                    <p class="text-muted small">${course.description}</p>
                    <p class="small mb-3"><i class="bi bi-tag"></i> ${course.category}
                        <span class="mx-2">|</span><i class="bi bi-people"></i> ${students}${limitText} students</p>
                    <p class="small text-muted">${course.chapters.length} chapters · ${countLessons(course)} lessons</p>
                    <div class="d-flex gap-2 flex-wrap">
                        <button class="btn btn-outline-primary btn-sm flex-grow-1" onclick="event.stopPropagation(); editCourse(${course.id})"><i class="bi bi-pencil"></i> Edit</button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="event.stopPropagation(); openCourseContent(${course.id})"><i class="bi bi-journal-text"></i> Content</button>
                        <button class="btn btn-outline-danger btn-sm" onclick="event.stopPropagation(); deleteCourse(${course.id})" title="Delete"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    if (html === "") {
        html = `<div class="col-12"><p class="text-muted mb-0">No courses match this filter.</p></div>`;
    }

    document.getElementById("courseList").innerHTML = html;
    document.getElementById("totalCourses").textContent = myCourses.length;
    document.getElementById("totalStudents").textContent = totalStudents;
}


// Create / edit

function openCreateModal() {
    document.getElementById("courseForm").reset();
    document.getElementById("editId").value = "";
    document.getElementById("modalTitle").textContent = "Create New Course";
    openModal("courseModal");
}

function editCourse(id) {

    const course = getCourse(id);

    document.getElementById("editId").value = course.id;
    document.getElementById("courseTitle").value = course.title;
    document.getElementById("courseDescription").value = course.description;
    document.getElementById("courseCategory").value = course.category;
    document.getElementById("courseDifficulty").value = course.difficulty;
    document.getElementById("courseObjectives").value = course.objectives;
    document.getElementById("coursePrerequisites").value = course.prerequisites;
    document.getElementById("courseLimit").value = course.limit === 0 ? "" : course.limit;
    document.getElementById("courseStatus").value = course.status;
    document.getElementById("modalTitle").textContent = "Edit Course";
    openModal("courseModal");
}

function saveCourse() {

    const form = document.getElementById("courseForm");
    if (!form.reportValidity()) {
        return;
    }

    const editId = document.getElementById("editId").value;
    const category = document.getElementById("courseCategory").value;

    // Edit an existing course, or start a new one
    let course = null;
    if (editId !== "") {
        course = getCourse(editId);
    }

    if (course === null) {
        course = {
            id: nextId(courses),
            lecturer: currentUser.fullName,
            icon: "",
            category: "",
            chapters: [],
            materials: [],
            assignments: [],
            quizzes: [],
            webinars: []
        };
        courses.push(course);
    }

    // New icon when the category is new or changed
    if (course.icon === "" || course.category !== category) {
        course.icon = Store.iconFor(category);
    }

    course.title = cleanText(document.getElementById("courseTitle").value);
    course.description = cleanText(document.getElementById("courseDescription").value);
    course.category = category;
    course.difficulty = document.getElementById("courseDifficulty").value;
    course.objectives = cleanText(document.getElementById("courseObjectives").value);
    course.prerequisites = cleanText(document.getElementById("coursePrerequisites").value);
    course.limit = Number(document.getElementById("courseLimit").value) || 0;
    course.status = document.getElementById("courseStatus").value;

    saveData();
    closeModal("courseModal");
    renderAll();
}

function deleteCourse(id) {

    const course = getCourse(id);
    const students = getStudentsOf(id).length;

    let message = "Delete \"" + course.title + "\"? Its lessons, assignments and webinars are deleted too.";
    if (students > 0) {
        message += "\n\n" + students + " student(s) took this course. They will lose access to it.";
    }

    if (!confirm(message)) {
        return;
    }

    const remaining = [];
    for (const item of courses) {
        if (item.id !== course.id) {
            remaining.push(item);
        }
    }
    courses = remaining;

    if (activeCourseId === course.id) {
        closeCourseContent();
    }

    saveData();
    renderAll();
}


// Publish / Draft / Archive buttons: ask which of my courses (by number)
function changeCourseStatus(status) {

    const myCourses = getMyCourses();

    if (myCourses.length === 0) {
        alert("Create a course first.");
        return;
    }

    let options = "";
    myCourses.forEach((course, index) => {
        options += (index + 1) + ". " + course.title + " (" + course.status + ")\n";
    });

    const choice = prompt("Choose a course number to mark as " + status + ":\n" + options);
    if (choice === null) {
        return;
    }

    const course = myCourses[Number(choice) - 1];
    if (course === undefined) {
        alert("Please enter a valid course number.");
        return;
    }

    course.status = status;
    saveData();
    renderAll();
}
