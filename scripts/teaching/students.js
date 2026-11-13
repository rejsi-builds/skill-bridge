// Student Management: the students who took one of MY courses on the Learn page.
// Their progress is the lessons they ticked there.

function renderStudents() {

    let html = "";

    for (const course of getMyCourses()) {
        for (const enrollment of getStudentsOf(course.id)) {

            const percent = getProgress(enrollment, course);
            const completed = percent === 100 && countLessons(course) > 0;

            html += `
                <tr>
                    <td>${enrollment.name}</td>
                    <td>${course.title}</td>
                    <td>
                        <div class="progress"><div class="progress-bar ${completed ? "bg-success" : "bg-info"}" style="width: ${percent}%"></div></div>
                        <small>${percent}%</small>
                    </td>
                    <td><span class="badge ${completed ? "bg-primary" : "bg-success"}">${completed ? "Completed" : "Active"}</span></td>
                </tr>
            `;
        }
    }

    if (html === "") {
        html = `<tr><td colspan="4" class="text-muted">No students yet. They appear here when they take one of your published courses.</td></tr>`;
    }

    document.getElementById("studentTableBody").innerHTML = html;
}
