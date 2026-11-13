/* DATA FOR THE LEARN PAGES.
Reads the courses and enrollments from the shared store (scripts/shared/store.js), which the Teach page uses too.
The other files only use the variables and functions defined here. */

const currentUser = Store.currentUser;

function toDate(text) {
    return new Date(text + "T00:00:00");
}

function daysUntil(text) {
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.round((toDate(text) - today) / 86400000);
}


/* Courses
They come from the Teach page. Every course gets two extra things for this student:
enrolled - the student took the course (saved as an "enrollment")
lesson.done - the student ticked the lesson (saved in the enrollment)

Rules that link the two sides:
- students only see PUBLISHED courses (Draft and Archived stay hidden)
- a course that is full (Maximum Students) can not be taken any more
- a course you already took stays visible, even if the lecturer archives it
- cancelled webinars are not shown */

const HIDE_OWN_COURSES = false;

function buildCourses() {

    let store = Store.load();
    let list = [];

    store.courses.forEach((course) => {

        // "return" inside forEach means: skip this course
        if (HIDE_OWN_COURSES && course.lecturer === currentUser.fullName) {
            return;
        }

        // Count the students and find my enrollment (null if I did not take the course)
        let students = 0;
        let myEnrollment = null;

        store.enrollments.forEach((enrollment) => {
            if (enrollment.courseId === course.id) {
                students++;

                if (enrollment.email === currentUser.email) {
                    myEnrollment = enrollment;
                }
            }
        });

        let isFull = course.limit > 0 && students >= course.limit;

        if (myEnrollment === null && (course.status !== "Published" || isFull)) {
            return;
        }

        let doneLessons = [];
        let submitted = [];

        if (myEnrollment !== null) {
            doneLessons = myEnrollment.doneLessons;
            submitted = myEnrollment.submitted;
        }

        // Chapters and lessons (each lesson knows if I finished it)
        let chapters = [];

        course.chapters.forEach((chapter) => {

            let lessons = [];

            chapter.lessons.forEach((lesson) => {
                lessons.push({
                    id: lesson.id,
                    title: lesson.title,
                    minutes: lesson.minutes,
                    done: doneLessons.includes(lesson.id),
                    text: lesson.text || "",
                    file: Store.fileUrl(lesson.file, "../../")
                });
            });

            chapters.push({ title: chapter.title, lessons: lessons });
        });

        // Assignments set by the lecturer
        let assignments = [];

        course.assignments.forEach((assignment) => {
            assignments.push({
                id: assignment.id,
                title: assignment.title,
                details: assignment.details,
                due: assignment.due,
                done: submitted.includes(assignment.id)
            });
        });

        // Webinars (live sessions) that are not cancelled
        let webinars = [];

        course.webinars.forEach((webinar) => {
            if (webinar.status !== "Cancelled") {
                webinars.push({
                    date: webinar.date,
                    time: webinar.time,
                    title: webinar.title
                });
            }
        });

        list.push({
            id: course.id,
            title: course.title,
            lecturer: course.lecturer,
            category: course.category,
            difficulty: course.difficulty,
            description: course.description,
            icon: course.icon,
            enrolled: myEnrollment !== null,
            chapters: chapters,
            assignments: assignments,
            webinars: webinars
        });
    });

    return list;
}

const courses = buildCourses();


// Save what the student did (took a course, ticked a lesson).
// Call this after every change. The Teach page reads it to show its students.
function saveData() {

    Store.update((store) => {

        courses.forEach((course) => {

            // Find my enrollment in this course (-1 = I have none)
            let index = -1;

            store.enrollments.forEach((enrollment, i) => {
                if (enrollment.email === currentUser.email && enrollment.courseId === course.id) {
                    index = i;
                }
            });

            // Not enrolled (any more): remove it
            if (!course.enrolled) {
                if (index !== -1) {
                    store.enrollments.splice(index, 1);
                }
                return;
            }

            // Enrolled for the first time: add it
            if (index === -1) {
                store.enrollments.push({
                    email: currentUser.email,
                    name: currentUser.fullName,
                    courseId: course.id,
                    doneLessons: [],
                    submitted: []
                });
                index = store.enrollments.length - 1;
            }

            let enrollment = store.enrollments[index];

            // Save the lessons I finished
            enrollment.doneLessons = [];

            course.chapters.forEach((chapter) => {
                chapter.lessons.forEach((lesson) => {
                    if (lesson.done) {
                        enrollment.doneLessons.push(lesson.id);
                    }
                });
            });

            // Save the assignments I submitted
            enrollment.submitted = [];

            course.assignments.forEach((assignment) => {
                if (assignment.done) {
                    enrollment.submitted.push(assignment.id);
                }
            });
        });
    });
}


function getCourse(id) {
    for (const course of courses) {
        if (course.id === id) {
            return course;
        }
    }
    return null;
}

function getTakenCourses() {
    let taken = [];

    courses.forEach((course) => {
        if (course.enrolled) {
            taken.push(course);
        }
    });

    return taken;
}

function countLessons(course) {
    let total = 0;
    let done = 0;

    course.chapters.forEach((chapter) => {
        chapter.lessons.forEach((lesson) => {
            total++;

            if (lesson.done) {
                done++;
            }
        });
    });

    return { total: total, done: done };
}

// Percentage from 0 to 100
function getProgress(course) {
    let counts = countLessons(course);

    if (counts.total === 0) {
        return 0;
    }
    return Math.round(counts.done / counts.total * 100);
}

function isCompleted(course) {
    return getProgress(course) === 100;
}
