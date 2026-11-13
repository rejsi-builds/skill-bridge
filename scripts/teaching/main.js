// Teach page: windows (modals) and drawing everything.
// The data comes from data.js. Each part of the page has its own file.

// Windows (modals)
function openModal(id) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).show();
}

function closeModal(id) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(id)).hide();
}

function renderAll() {
    renderCourses();
    renderCourseContent();
    renderStudents();
    renderAssessments();
    renderWebinars();
}

renderAll();
