// Quizzes and assignments. They are saved inside the course they belong to.
// Assignments show up in the Tasks tab of the students who took the course.

function renderAssessments() {

    let quizHtml = "";
    let assignmentHtml = "";

    for (const course of getMyCourses()) {

        for (const quiz of course.quizzes) {
            quizHtml += `
                <div class="border-top pt-2 mt-2 small">
                    <strong>${quiz.title}</strong><br>${course.title}
                    <button class="btn btn-sm btn-link text-danger" onclick="deleteQuiz(${course.id}, ${quiz.id})">Delete</button>
                </div>
            `;
        }

        for (const assignment of course.assignments) {
            assignmentHtml += `
                <div class="border-top pt-2 mt-2 small">
                    <strong>${assignment.title}</strong><br>${course.title} · Due ${assignment.due}
                    <button class="btn btn-sm btn-link text-danger" onclick="deleteAssignment(${course.id}, ${assignment.id})">Delete</button>
                </div>
            `;
        }
    }

    if (quizHtml === "") {
        quizHtml = `<p class="small text-muted mb-0">No quizzes created yet.</p>`;
    }
    if (assignmentHtml === "") {
        assignmentHtml = `<p class="small text-muted mb-0">No assignments created yet.</p>`;
    }

    document.getElementById("quizList").innerHTML = quizHtml;
    document.getElementById("assignmentList").innerHTML = assignmentHtml;
}


// Quizzes

function openQuizModal() {

    if (getMyCourses().length === 0) {
        alert("Create a course first.");
        return;
    }

    document.getElementById("quizForm").reset();
    document.getElementById("quizCourse").innerHTML = courseOptions(0);
    openModal("quizModal");
}

function saveQuiz() {

    const form = document.getElementById("quizForm");
    if (!form.reportValidity()) {
        return;
    }

    const course = getCourse(document.getElementById("quizCourse").value);

    course.quizzes.push({
        id: nextId(course.quizzes),
        title: cleanText(document.getElementById("quizTitle").value),
        question: cleanText(document.getElementById("quizQuestion").value),
        options: [
            cleanText(document.getElementById("quizOption1").value),
            cleanText(document.getElementById("quizOption2").value),
            cleanText(document.getElementById("quizOption3").value),
            cleanText(document.getElementById("quizOption4").value)
        ],
        correct: Number(document.getElementById("quizCorrect").value)
    });

    saveData();
    closeModal("quizModal");
    renderAll();
}

function deleteQuiz(courseId, quizId) {

    if (!confirm("Delete this quiz?")) {
        return;
    }

    const course = getCourse(courseId);

    const remaining = [];
    for (const quiz of course.quizzes) {
        if (quiz.id !== quizId) {
            remaining.push(quiz);
        }
    }
    course.quizzes = remaining;

    saveData();
    renderAll();
}


// Assignments

function openAssignmentModal() {

    if (getMyCourses().length === 0) {
        alert("Create a course first.");
        return;
    }

    document.getElementById("assignmentForm").reset();
    document.getElementById("assignmentCourse").innerHTML = courseOptions(0);
    document.getElementById("assignmentDue").min = todayText();
    openModal("assignmentModal");
}

function saveAssignment() {

    const form = document.getElementById("assignmentForm");
    if (!form.reportValidity()) {
        return;
    }

    const course = getCourse(document.getElementById("assignmentCourse").value);

    course.assignments.push({
        id: nextId(course.assignments),
        title: cleanText(document.getElementById("assignmentTitle").value),
        details: cleanText(document.getElementById("assignmentDetails").value),
        due: document.getElementById("assignmentDue").value
    });

    saveData();
    closeModal("assignmentModal");
    renderAll();
}

function deleteAssignment(courseId, assignmentId) {

    if (!confirm("Delete this assignment?")) {
        return;
    }

    const course = getCourse(courseId);

    const remaining = [];
    for (const assignment of course.assignments) {
        if (assignment.id !== assignmentId) {
            remaining.push(assignment);
        }
    }
    course.assignments = remaining;

    saveData();
    renderAll();
}
