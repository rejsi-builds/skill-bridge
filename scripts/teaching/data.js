// DATA FOR THE TEACH PAGE.
// The data comes from the shared store (scripts/shared_LT/store.js), which the Learn pages
// use too. The courses taught by the logged-in user are the ones shown on this page.
// The other files only use the variables and functions defined here.
//
// The logged-in user is Store.currentUser (the user from login / sign up, or the demo
// user Alex). Every course is linked to its lecturer by EMAIL (course.lecturerEmail),
// so a new account has no courses, no students, no webinars and no assignments here.

const currentUser = Store.currentUser;

// Courses saved by an older version only have the lecturer's NAME. Give them the
// lecturer's email (built the same way as in the store's demo data), so Store.isMyCourse()
// can match by email and a new account with the same name does not get someone else's courses.
function addMissingLecturerEmails() {

    const store = Store.load();
    let changed = false;

    for (const course of store.courses) {
        if (course.lecturerEmail !== undefined) {
            continue;
        }

        if (course.lecturer === Store.demoUser.fullName) {
            course.lecturerEmail = Store.demoUser.email;
        } else {
            course.lecturerEmail = course.lecturer.toLowerCase().replace(" ", ".") + "@epoka.edu.al";
        }
        changed = true;
    }

    if (changed) {
        Store.save(store);
    }
}

addMissingLecturerEmails();

// ALL courses of the store (the page only shows the ones taught by the logged-in user)
let courses = Store.load().courses;

// The course whose content is open (null = none)
let activeCourseId = null;


// ---------- Saving ----------

// Save the courses. Call this after every change.
// The Learn pages read them from the store.
function saveData() {

    const store = Store.load();
    store.courses = courses;

    // The students of a deleted course are removed too
    const kept = [];
    for (const enrollment of store.enrollments) {
        if (getCourse(enrollment.courseId) !== undefined) {
            kept.push(enrollment);
        }
    }
    store.enrollments = kept;

    Store.save(store);
}


// ---------- Functions the pages use ----------

function getCourse(id) {
    return courses.find(course => course.id === Number(id));
}

// Only the courses taught by the logged-in user
function getMyCourses() {
    return courses.filter(course => Store.isMyCourse(course));
}

// The students who took a course on the Learn page (always read fresh from the store)
function getEnrollments() {
    return Store.load().enrollments;
}

function getStudentsOf(courseId) {
    return getEnrollments().filter(enrollment => enrollment.courseId === Number(courseId));
}

function countLessons(course) {
    let total = 0;

    for (const chapter of course.chapters) {
        total += chapter.lessons.length;
    }

    return total;
}

// Percentage (0 to 100) of the lessons a student has finished
function getProgress(enrollment, course) {
    const total = countLessons(course);

    if (total === 0) {
        return 0;
    }

    let done = 0;
    for (const chapter of course.chapters) {
        for (const lesson of chapter.lessons) {
            if (enrollment.doneLessons.includes(lesson.id)) {
                done++;
            }
        }
    }

    return Math.round(done / total * 100);
}

// Next free id in a list of objects that have an id
function nextId(list) {
    let highest = 0;

    for (const item of list) {
        if (item.id > highest) {
            highest = item.id;
        }
    }

    return highest + 1;
}

// Lesson ids are unique inside a course (the Learn page saves progress by lesson id)
function nextLessonId(course) {
    let highest = 0;

    for (const chapter of course.chapters) {
        for (const lesson of chapter.lessons) {
            if (lesson.id > highest) {
                highest = lesson.id;
            }
        }
    }

    return highest + 1;
}

// Today as "YYYY-MM-DD"
function todayText() {
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return now.getFullYear() + "-" + month + "-" + day;
}

// The Learn pages show titles and descriptions as HTML, so a "<" typed in a form
// could break the page. This replaces the dangerous characters.
function cleanText(text) {
    return text.trim()
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

// <option> list with the courses taught by the logged-in user
function courseOptions(selectedId) {

    let html = `<option value="">Select a course</option>`;

    for (const course of getMyCourses()) {
        const selected = course.id === selectedId ? "selected" : "";
        html += `<option value="${course.id}" ${selected}>${course.title}</option>`;
    }

    return html;
}

// Everyone registered for a webinar: the students of its course (automatic)
// plus the people the lecturer added by hand
function getRegistrants(course, webinar) {

    const list = [];

    for (const student of getStudentsOf(course.id)) {
        list.push({ name: student.name, email: student.email, auto: true, index: -1 });
    }

    for (let i = 0; i < webinar.registrations.length; i++) {
        const person = webinar.registrations[i];

        let alreadyThere = false;
        for (const item of list) {
            if (item.email.toLowerCase() === person.email.toLowerCase()) {
                alreadyThere = true;
            }
        }

        if (!alreadyThere) {
            list.push({ name: person.name, email: person.email, auto: false, index: i });
        }
    }

    return list;
}

// "Upcoming", "Completed" or "Cancelled"
function getWebinarStatus(webinar) {
    if (webinar.status === "Cancelled") {
        return "Cancelled";
    }

    const webinarDate = new Date(webinar.date + "T" + webinar.time);

    if (webinarDate < new Date()) {
        return "Completed";
    }
    return "Upcoming";
}