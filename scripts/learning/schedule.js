// Schedule tab: upcoming webinars from the courses you took

function renderSchedule() {

    // 1. Get the upcoming webinars from the courses I took
    let webinars = [];

    getTakenCourses().forEach((course) => {
        course.webinars.forEach((webinar) => {
            if (daysUntil(webinar.date) >= 0) {
                webinars.push({
                    date: webinar.date,
                    time: webinar.time,
                    title: webinar.title,
                    courseTitle: course.title,
                    lecturer: course.lecturer
                });
            }
        });
    });

    // Earliest first
    webinars.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

    // 2. Show them
    let scheduleList = document.getElementById("scheduleList");
    scheduleList.innerHTML = "";

    if (webinars.length === 0) {
        let emptyText = document.createElement("p");
        emptyText.className = "empty";
        emptyText.textContent = "No webinars scheduled yet.";
        scheduleList.append(emptyText);
        return;
    }

    webinars.forEach((webinar) => {

        let date = toDate(webinar.date);

        // <strong>Live Q&A</strong>
        let titleText = document.createElement("strong");
        titleText.textContent = webinar.title;

        // <small>Python for Beginners · Sarah Miller</small>
        let courseText = document.createElement("small");
        courseText.textContent = webinar.courseTitle + " · " + webinar.lecturer;

        let leftBox = document.createElement("span");
        leftBox.append(titleText);
        leftBox.append(courseText);

        // <small>10:00</small>
        let timeText = document.createElement("small");
        timeText.textContent = webinar.time;

        // "Nov 9" with the time below it
        let rightBox = document.createElement("span");
        rightBox.className = "due";
        rightBox.textContent = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        rightBox.append(timeText);

        let row = document.createElement("div");
        row.className = "task";
        row.append(leftBox);
        row.append(rightBox);

        scheduleList.append(row);
    });
}
