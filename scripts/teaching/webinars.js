// Webinars. They are saved inside the course they belong to.
// Students who took the course see them in the Schedule tab (with the meeting link),
// and they count as registered automatically.

// All webinars of my courses, each one together with its course
function getAllWebinars() {

    const list = [];

    for (const course of getMyCourses()) {
        for (const webinar of course.webinars) {
            list.push({ course: course, webinar: webinar });
        }
    }

    return list;
}

function findWebinar(courseId, webinarId) {

    const course = getCourse(courseId);

    for (const webinar of course.webinars) {
        if (webinar.id === webinarId) {
            return webinar;
        }
    }
    return null;
}

function renderWebinars() {

    const filter = document.getElementById("webinarFilter").value;
    const search = document.getElementById("webinarSearch").value.toLowerCase();

    // Keep the ones that match the filter and the search
    const shown = [];
    for (const item of getAllWebinars()) {
        const status = getWebinarStatus(item.webinar);
        const text = (item.webinar.title + " " + item.webinar.description + " " + item.course.title).toLowerCase();

        if ((filter === "All" || filter === status) && text.includes(search)) {
            shown.push(item);
        }
    }

    // Closest first
    shown.sort((a, b) => (a.webinar.date + a.webinar.time).localeCompare(b.webinar.date + b.webinar.time));

    let html = "";

    for (const item of shown) {

        const course = item.course;
        const webinar = item.webinar;
        const status = getWebinarStatus(webinar);
        const count = getRegistrants(course, webinar).length;
        const percent = Math.min(100, count / webinar.capacity * 100);
        const ids = course.id + ", " + webinar.id;

        let badgeClass = "bg-danger";
        if (status === "Upcoming") {
            badgeClass = "bg-success";
        } else if (status === "Completed") {
            badgeClass = "bg-secondary";
        }

        let requiredBadge = `<span class="badge bg-light text-dark">Optional</span>`;
        if (webinar.required) {
            requiredBadge = `<span class="badge bg-warning text-dark">Required</span>`;
        }

        let linkButton = "";
        if (webinar.link !== "" && status === "Upcoming") {
            linkButton = `<a class="btn btn-outline-primary btn-sm" href="${webinar.link}" target="_blank"><i class="bi bi-box-arrow-up-right"></i> Meeting link</a>`;
        }

        let cancelButton = "";
        if (status === "Upcoming") {
            cancelButton = `<button class="btn btn-outline-danger btn-sm" onclick="cancelWebinar(${ids})">Cancel</button>`;
        }

        html += `
            <div class="col-md-6">
                <div class="course-card">
                    <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                        <span class="badge ${badgeClass}">${status}</span>
                        ${requiredBadge}
                        <small class="text-muted">${course.title}</small>
                    </div>
                    <h5 class="fw-bold">${webinar.title}</h5>
                    <p class="text-muted small">${webinar.description}</p>
                    <p class="small mb-2"><i class="bi bi-calendar-event text-brand"></i> ${webinar.date} at ${webinar.time}</p>
                    <p class="small mb-2"><i class="bi bi-clock text-brand"></i> ${webinar.duration} minutes</p>
                    <p class="small mb-3"><i class="bi bi-people text-brand"></i> ${count} / ${webinar.capacity} registered</p>
                    <div class="progress mb-3"><div class="progress-bar" style="width: ${percent}%"></div></div>
                    <div class="d-flex gap-2 flex-wrap">
                        ${linkButton}
                        <button class="btn btn-outline-secondary btn-sm" onclick="openRegistrations(${ids})">Registrations</button>
                        <button class="btn btn-outline-primary btn-sm" onclick="openWebinarModal(${ids})">Edit</button>
                        ${cancelButton}
                        <button class="btn btn-outline-danger btn-sm" onclick="deleteWebinar(${ids})" title="Delete"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    }

    if (html === "") {
        html = `<div class="col-12"><p class="text-muted mb-0">No webinars found. Schedule your first live session.</p></div>`;
    }

    document.getElementById("webinarList").innerHTML = html;

    // The three numbers above the list
    let upcoming = 0;
    let completed = 0;
    let registrations = 0;

    for (const item of getAllWebinars()) {
        const status = getWebinarStatus(item.webinar);
        if (status === "Upcoming") {
            upcoming++;
        }
        if (status === "Completed") {
            completed++;
        }
        registrations += getRegistrants(item.course, item.webinar).length;
    }

    document.getElementById("upcomingWebinarCount").textContent = upcoming;
    document.getElementById("completedWebinarCount").textContent = completed;
    document.getElementById("webinarRegistrationCount").textContent = registrations;
}


// Schedule / edit
// openWebinarModal() = new webinar, openWebinarModal(courseId, webinarId) = edit

function openWebinarModal(courseId, webinarId) {

    if (getMyCourses().length === 0) {
        alert("Create a course first. A webinar belongs to one of your courses.");
        return;
    }

    document.getElementById("webinarForm").reset();
    document.getElementById("webinarDate").min = todayText();

    if (courseId === undefined) {
        document.getElementById("webinarModalTitle").textContent = "Schedule Webinar";
        document.getElementById("webinarOldCourseId").value = "";
        document.getElementById("webinarId").value = "";
        document.getElementById("webinarCourse").innerHTML = courseOptions(0);
        document.getElementById("webinarTime").value = "18:00";
        document.getElementById("webinarDuration").value = 60;
        document.getElementById("webinarCapacity").value = 30;
    } else {
        const webinar = findWebinar(courseId, webinarId);

        document.getElementById("webinarModalTitle").textContent = "Edit Webinar";
        document.getElementById("webinarOldCourseId").value = courseId;
        document.getElementById("webinarId").value = webinarId;
        document.getElementById("webinarCourse").innerHTML = courseOptions(courseId);
        document.getElementById("webinarTitle").value = webinar.title;
        document.getElementById("webinarDescription").value = webinar.description;
        document.getElementById("webinarDate").value = webinar.date;
        document.getElementById("webinarTime").value = webinar.time;
        document.getElementById("webinarDuration").value = webinar.duration;
        document.getElementById("webinarLink").value = webinar.link;
        document.getElementById("webinarCapacity").value = webinar.capacity;
        document.getElementById("webinarRequired").checked = webinar.required;
    }

    openModal("webinarModal");
}

function saveWebinar() {

    const form = document.getElementById("webinarForm");
    if (!form.reportValidity()) {
        return;
    }

    const newCourse = getCourse(document.getElementById("webinarCourse").value);
    const oldCourseId = document.getElementById("webinarOldCourseId").value;
    const webinarId = document.getElementById("webinarId").value;
    const capacity = Number(document.getElementById("webinarCapacity").value);

    // Edit an existing webinar, or start a new one
    let webinar = null;
    if (webinarId !== "") {
        webinar = findWebinar(oldCourseId, Number(webinarId));
    }

    if (webinar !== null && capacity < getRegistrants(newCourse, webinar).length) {
        alert("Maximum participants cannot be lower than the number of existing registrations.");
        return;
    }

    if (webinar === null) {
        webinar = { id: nextId(newCourse.webinars), status: "Scheduled", registrations: [] };
        newCourse.webinars.push(webinar);
    } else if (Number(oldCourseId) !== newCourse.id) {
        // The webinar moved to another course
        const oldCourse = getCourse(oldCourseId);
        const remaining = [];
        for (const item of oldCourse.webinars) {
            if (item.id !== webinar.id) {
                remaining.push(item);
            }
        }
        oldCourse.webinars = remaining;

        webinar.id = nextId(newCourse.webinars);
        newCourse.webinars.push(webinar);
    }

    webinar.title = cleanText(document.getElementById("webinarTitle").value);
    webinar.description = cleanText(document.getElementById("webinarDescription").value);
    webinar.date = document.getElementById("webinarDate").value;
    webinar.time = document.getElementById("webinarTime").value;
    webinar.duration = Number(document.getElementById("webinarDuration").value);
    webinar.link = cleanText(document.getElementById("webinarLink").value);
    webinar.capacity = capacity;
    webinar.required = document.getElementById("webinarRequired").checked;

    saveData();
    closeModal("webinarModal");
    renderAll();
}


// Registrations

function openRegistrations(courseId, webinarId) {
    document.getElementById("registrationForm").reset();
    document.getElementById("regCourseId").value = courseId;
    document.getElementById("regWebinarId").value = webinarId;
    renderRegistrations();
    openModal("registrationModal");
}

function renderRegistrations() {

    const courseId = Number(document.getElementById("regCourseId").value);
    const webinarId = Number(document.getElementById("regWebinarId").value);

    const course = getCourse(courseId);
    const webinar = findWebinar(courseId, webinarId);
    const registrants = getRegistrants(course, webinar);

    document.getElementById("registrationTitle").textContent = "Registrations: " + webinar.title;
    document.getElementById("registrationInfo").textContent =
        registrants.length + " of " + webinar.capacity + " places taken. Students who took \"" +
        course.title + "\" are registered automatically.";

    let html = "";
    for (const person of registrants) {

        let action = `<small class="text-muted">Student of this course</small>`;
        if (!person.auto) {
            action = `<button class="btn btn-sm btn-link text-danger" onclick="removeRegistration(${person.index})">Remove</button>`;
        }

        html += `
            <div class="d-flex justify-content-between align-items-center border-bottom py-2">
                <span>${person.name} <small class="text-muted">${person.email}</small></span>
                ${action}
            </div>
        `;
    }

    if (html === "") {
        html = `<p class="text-muted">No registrations yet.</p>`;
    }

    document.getElementById("registrationList").innerHTML = html;
}

function saveRegistration() {

    const form = document.getElementById("registrationForm");
    if (!form.reportValidity()) {
        return;
    }

    const courseId = Number(document.getElementById("regCourseId").value);
    const webinarId = Number(document.getElementById("regWebinarId").value);

    const course = getCourse(courseId);
    const webinar = findWebinar(courseId, webinarId);
    const registrants = getRegistrants(course, webinar);

    const name = cleanText(document.getElementById("regName").value);
    const email = document.getElementById("regEmail").value.trim().toLowerCase();

    if (getWebinarStatus(webinar) !== "Upcoming") {
        alert("Registration is only available for upcoming webinars.");
        return;
    }

    for (const person of registrants) {
        if (person.email.toLowerCase() === email) {
            alert("This email is already registered.");
            return;
        }
    }

    if (registrants.length >= webinar.capacity) {
        alert("This webinar has reached its participant limit.");
        return;
    }

    webinar.registrations.push({ name: name, email: cleanText(email) });

    saveData();
    document.getElementById("registrationForm").reset();
    renderRegistrations();
    renderAll();
}

function removeRegistration(index) {

    if (!confirm("Remove this registration?")) {
        return;
    }

    const courseId = Number(document.getElementById("regCourseId").value);
    const webinarId = Number(document.getElementById("regWebinarId").value);

    const webinar = findWebinar(courseId, webinarId);
    webinar.registrations.splice(index, 1);

    saveData();
    renderRegistrations();
    renderAll();
}


// Cancel / delete

function cancelWebinar(courseId, webinarId) {

    const webinar = findWebinar(courseId, webinarId);

    if (!confirm("Cancel \"" + webinar.title + "\"? Students will no longer see it in their Schedule.")) {
        return;
    }

    webinar.status = "Cancelled";
    saveData();
    renderAll();
}

function deleteWebinar(courseId, webinarId) {

    if (!confirm("Permanently delete this webinar and its registrations?")) {
        return;
    }

    const course = getCourse(courseId);

    const remaining = [];
    for (const webinar of course.webinars) {
        if (webinar.id !== webinarId) {
            remaining.push(webinar);
        }
    }
    course.webinars = remaining;

    saveData();
    renderAll();
}
