// Course content: chapters, lessons and learning resources of the selected course.
// The text and file of a lesson are what the students read on the Learn page.

function openCourseContent(courseId) {
    activeCourseId = courseId;
    renderCourseContent();

    const section = document.getElementById("courseContentSection");
    section.classList.remove("d-none");
    section.scrollIntoView({ behavior: "smooth" });
}

function closeCourseContent() {
    activeCourseId = null;
    document.getElementById("courseContentSection").classList.add("d-none");
}

function renderCourseContent() {

    const course = getCourse(activeCourseId);

    if (course === undefined) {
        document.getElementById("courseContentSection").classList.add("d-none");
        return;
    }

    document.getElementById("selectedCourseTitle").textContent = course.title;

    // Chapters and their lessons
    let chaptersHtml = "";

    course.chapters.forEach((chapter, index) => {

        const show = index === 0 ? "show" : "";
        const collapsed = index === 0 ? "" : "collapsed";

        let lessonsHtml = "";
        for (const lesson of chapter.lessons) {

            let icons = "";
            if (lesson.text !== "") {
                icons += `<i class="bi bi-card-text ms-2 text-muted" title="Has text"></i>`;
            }
            if (lesson.file !== null) {
                icons += `<i class="bi bi-paperclip ms-1 text-muted" title="${lesson.file.name}"></i>`;
            }

            lessonsHtml += `
                <div class="list-group-item d-flex justify-content-between align-items-center gap-2">
                    <span><i class="bi bi-play-circle text-brand me-2"></i>${lesson.title}${icons}</span>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge bg-light text-dark">${lesson.minutes} min</span>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteLesson(${chapter.id}, ${lesson.id})" title="Remove lesson"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            `;
        }

        if (lessonsHtml === "") {
            lessonsHtml = `<p class="text-muted small">No lessons in this chapter yet.</p>`;
        } else {
            lessonsHtml = `<div class="list-group mb-3">${lessonsHtml}</div>`;
        }

        chaptersHtml += `
            <div class="accordion-item">
                <h2 class="accordion-header">
                    <button class="accordion-button ${collapsed}" type="button"
                            data-bs-toggle="collapse" data-bs-target="#chapterBody${chapter.id}">
                        <i class="bi bi-collection me-2 text-brand"></i>${chapter.title}
                        <span class="badge bg-light text-dark ms-2">${chapter.lessons.length} lessons</span>
                    </button>
                </h2>
                <div id="chapterBody${chapter.id}" class="accordion-collapse collapse ${show}"
                     data-bs-parent="#chaptersAccordion">
                    <div class="accordion-body">
                        ${lessonsHtml}
                        <button class="btn btn-outline-primary btn-sm" onclick="openLessonModal(${chapter.id})">
                            <i class="bi bi-plus-lg"></i> Add Lesson
                        </button>
                        <button class="btn btn-outline-danger btn-sm ms-2" onclick="deleteChapter(${chapter.id})">
                            <i class="bi bi-trash"></i> Remove Chapter
                        </button>
                    </div>
                </div>
            </div>
        `;
    });

    if (chaptersHtml === "") {
        chaptersHtml = `<p class="text-muted mb-3">This course does not have any chapters yet. Add a chapter to start organizing its lessons.</p>`;
    }

    // Learning resources
    let materialsHtml = "";
    for (const item of course.materials) {

        let link = `<span class="small text-muted">No URL provided</span>`;
        if (item.url !== "") {
            link = `<a class="small" href="${item.url}" target="_blank">Open resource</a>`;
        }

        let notes = "";
        if (item.notes !== "") {
            notes = `<p class="small text-muted mb-0 mt-1">${item.notes}</p>`;
        }

        materialsHtml += `
            <div class="d-flex justify-content-between align-items-center border rounded-3 p-3 mb-2 gap-2">
                <div class="text-break">
                    <i class="bi bi-link-45deg text-brand me-2"></i><strong>${item.title}</strong>
                    ${notes}
                    ${link}
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteResource(${item.id})" title="Remove resource"><i class="bi bi-trash"></i></button>
            </div>
        `;
    }

    if (materialsHtml === "") {
        materialsHtml = `<p class="text-muted small">No learning resources have been added to this course yet.</p>`;
    }

    document.getElementById("selectedCourseContent").innerHTML = `
        <div class="row g-3 mb-3">
            <div class="col-sm-4"><div class="border rounded-3 p-3 h-100"><div class="text-muted small">Chapters</div><div class="stat-number">${course.chapters.length}</div></div></div>
            <div class="col-sm-4"><div class="border rounded-3 p-3 h-100"><div class="text-muted small">Lessons</div><div class="stat-number">${countLessons(course)}</div></div></div>
            <div class="col-sm-4"><div class="border rounded-3 p-3 h-100"><div class="text-muted small">Resources</div><div class="stat-number">${course.materials.length}</div></div></div>
        </div>

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h6 class="fw-bold mb-0"><i class="bi bi-collection text-brand me-2"></i>Chapters &amp; Lessons</h6>
            <button class="btn btn-primary btn-sm" onclick="openChapterModal()"><i class="bi bi-plus-lg"></i> Add Chapter</button>
        </div>
        <div class="accordion mb-4" id="chaptersAccordion">${chaptersHtml}</div>

        <hr>

        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <h6 class="fw-bold mb-0"><i class="bi bi-folder text-brand me-2"></i>Learning Materials &amp; Resources</h6>
            <button class="btn btn-outline-primary btn-sm" onclick="openResourceModal()"><i class="bi bi-plus-lg"></i> Add Resource</button>
        </div>
        ${materialsHtml}
    `;
}


// Chapters

function openChapterModal() {
    document.getElementById("chapterForm").reset();
    openModal("chapterModal");
}

function saveChapter() {

    const form = document.getElementById("chapterForm");
    if (!form.reportValidity()) {
        return;
    }

    const course = getCourse(activeCourseId);

    course.chapters.push({
        id: nextId(course.chapters),
        title: cleanText(document.getElementById("chapterTitle").value),
        lessons: []
    });

    saveData();
    closeModal("chapterModal");
    renderAll();
}

function deleteChapter(chapterId) {

    if (!confirm("Delete this chapter and all its lessons?")) {
        return;
    }

    const course = getCourse(activeCourseId);

    const remaining = [];
    for (const chapter of course.chapters) {
        if (chapter.id !== chapterId) {
            remaining.push(chapter);
        }
    }
    course.chapters = remaining;

    saveData();
    renderAll();
}


// Lessons

function openLessonModal(chapterId) {
    document.getElementById("lessonForm").reset();
    document.getElementById("lessonChapterId").value = chapterId;
    openModal("lessonModal");
}

function saveLesson() {

    const form = document.getElementById("lessonForm");
    if (!form.reportValidity()) {
        return;
    }

    const course = getCourse(activeCourseId);
    const chapterId = Number(document.getElementById("lessonChapterId").value);

    let chapter = null;
    for (const item of course.chapters) {
        if (item.id === chapterId) {
            chapter = item;
        }
    }

    // The file is optional: a name and a link (https://... or a path like files/notes.pdf)
    let file = null;
    const fileUrl = document.getElementById("lessonFileUrl").value.trim();

    if (fileUrl !== "") {
        let fileName = document.getElementById("lessonFileName").value.trim();
        if (fileName === "") {
            fileName = "Attached file";
        }
        file = { name: cleanText(fileName), url: cleanText(fileUrl) };
    }

    chapter.lessons.push({
        id: nextLessonId(course),
        title: cleanText(document.getElementById("lessonTitle").value),
        minutes: Number(document.getElementById("lessonMinutes").value),
        text: document.getElementById("lessonText").value.trim(),
        file: file
    });

    saveData();
    closeModal("lessonModal");
    renderAll();
}

function deleteLesson(chapterId, lessonId) {

    const course = getCourse(activeCourseId);

    for (const chapter of course.chapters) {
        if (chapter.id === chapterId) {
            const remaining = [];
            for (const lesson of chapter.lessons) {
                if (lesson.id !== lessonId) {
                    remaining.push(lesson);
                }
            }
            chapter.lessons = remaining;
        }
    }

    saveData();
    renderAll();
}


// Learning resources

function openResourceModal() {
    document.getElementById("resourceForm").reset();
    openModal("resourceModal");
}

function saveResource() {

    const form = document.getElementById("resourceForm");
    if (!form.reportValidity()) {
        return;
    }

    const course = getCourse(activeCourseId);

    course.materials.push({
        id: nextId(course.materials),
        title: cleanText(document.getElementById("resourceTitle").value),
        url: cleanText(document.getElementById("resourceUrl").value),
        notes: cleanText(document.getElementById("resourceNotes").value)
    });

    saveData();
    closeModal("resourceModal");
    renderAll();
}

function deleteResource(resourceId) {

    const course = getCourse(activeCourseId);

    const remaining = [];
    for (const item of course.materials) {
        if (item.id !== resourceId) {
            remaining.push(item);
        }
    }
    course.materials = remaining;

    saveData();
    renderAll();
}
