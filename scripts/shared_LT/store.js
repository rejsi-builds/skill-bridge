// SHARED STORE. Used by BOTH sides of the app (Learn and Teach).
// This is what links the pages together: the Teach page saves courses, lessons,
// assignments and webinars here, the Learn page reads them, and the Learn page
// saves the enrollments that the Teach page reads.
//
// For now everything is saved in the browser (localStorage), so it stays only
// in this browser. When the C# API is ready, only load() and save() change.
//
// What is saved:
//   courses      - written by the lecturer (Teach page)
//   enrollments  - written by the student (Learn page): the course they took,
//                  the lessons they ticked and the assignments they submitted

const Store = {

    key: "skillbridge_store_v1",

    // The logged-in user (demo)
    currentUser: {
        fullName: "Alex Johnson",
        email: "alex.johnson@epoka.edu.al",
        major: "Software Engineering",
        interests: ["Programming", "Design", "Photography"],
        skills: "Java, Git"
    },

    // Icon for each category (used when a lecturer creates a course)
    icons: {
        "Programming": "bi-code-slash",
        "Languages": "bi-translate",
        "Music": "bi-music-note-beamed",
        "Design": "bi-palette",
        "Photography": "bi-camera",
        "Business": "bi-briefcase",
        "Other": "bi-book"
    },

    iconFor: function (category) {
        if (Store.icons[category] === undefined) {
            return "bi-book";
        }
        return Store.icons[category];
    },


    // ---------- Load / save ----------

    // Get everything from the browser. The first time, start with the demo data.
    load: function () {
        const saved = localStorage.getItem(Store.key);

        if (saved !== null) {
            const data = JSON.parse(saved);
            if (Array.isArray(data.courses) && Array.isArray(data.enrollments)) {
                return data;
            }
        }

        const demo = makeDemoData();
        Store.save(demo);
        return demo;
    },

    // Returns true if it worked
    save: function (data) {
        try {
            localStorage.setItem(Store.key, JSON.stringify(data));
            return true;
        } catch (error) {
            alert("Your browser could not save the changes.");
            return false;
        }
    },

    // Load the newest data, let a function change it, save it.
    // Used so that two open pages do not overwrite each other's work.
    update: function (change) {
        const data = Store.load();
        change(data);
        Store.save(data);
    },

    // Delete everything and go back to the demo data
    reset: function () {
        localStorage.removeItem(Store.key);
        return Store.load();
    },


    // ---------- Lesson files ----------
    // A file is { name, url }. The url is a link (https://...) or a path inside the
    // project (for example "files/notes.pdf"). basePath is the way back to the project
    // folder from the current page: "../../" from tabs/learning, "../" from tabs.
    fileUrl: function (file, basePath) {
        if (file === null || file === undefined) {
            return null;
        }

        let url = file.url;

        if (!url.startsWith("http") && !url.startsWith("/")) {
            url = basePath + url;
        }

        return { name: file.name, url: url };
    }
};


// ---------- Demo data ----------

// Date as "YYYY-MM-DD", n days from today (so the demo dates always look current)
function dayOffset(n) {
    const date = new Date();
    date.setDate(date.getDate() + n);

    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return date.getFullYear() + "-" + month + "-" + day;
}

function makeDemoData() {

    const currentUser = Store.currentUser;
    const courses = [];
    const enrollments = [];

    // Adds one course and gives an id to everything inside it.
    //   takenByUser - the logged-in user already took it
    //   students    - other students: name, email and how many lessons they finished
    //   due / day   - number of days from today
    function addCourse(def) {

        const id = courses.length + 1;
        const lessonIds = [];
        const doneByUser = [];
        const chapters = [];
        let lessonId = 0;

        for (let i = 0; i < def.chapters.length; i++) {
            const lessons = [];

            for (const lesson of def.chapters[i].lessons) {
                lessonId++;
                lessonIds.push(lessonId);

                if (lesson.done) {
                    doneByUser.push(lessonId);
                }

                lessons.push({
                    id: lessonId,
                    title: lesson.title,
                    minutes: lesson.minutes,
                    text: lesson.text,
                    file: lesson.file || null
                });
            }

            chapters.push({ id: i + 1, title: def.chapters[i].title, lessons: lessons });
        }

        const assignments = [];
        const assignmentList = def.assignments || [];
        for (let i = 0; i < assignmentList.length; i++) {
            const a = assignmentList[i];
            assignments.push({ id: i + 1, title: a.title, details: a.details, due: dayOffset(a.due) });
        }

        const webinars = [];
        const webinarList = def.webinars || [];
        for (let i = 0; i < webinarList.length; i++) {
            const w = webinarList[i];
            webinars.push({
                id: i + 1,
                title: w.title,
                description: w.description || "",
                date: dayOffset(w.day),
                time: w.time,
                duration: w.duration || 60,
                link: w.link || "",
                capacity: w.capacity || 30,
                required: w.required === true,
                status: "Scheduled",
                registrations: []
            });
        }

        courses.push({
            id: id,
            title: def.title,
            lecturer: def.lecturer,
            category: def.category,
            difficulty: def.difficulty,
            description: def.description,
            icon: def.icon,
            status: def.status || "Published",
            limit: def.limit || 0,
            objectives: def.objectives || "",
            prerequisites: def.prerequisites || "",
            chapters: chapters,
            materials: [],
            quizzes: [],
            assignments: assignments,
            webinars: webinars
        });

        if (def.takenByUser) {
            enrollments.push({
                email: currentUser.email, name: currentUser.fullName, courseId: id,
                doneLessons: doneByUser, submitted: []
            });
        }

        for (const student of def.students || []) {
            enrollments.push({
                email: student.email, name: student.name, courseId: id,
                doneLessons: lessonIds.slice(0, student.done), submitted: []
            });
        }
    }


        // ----- Courses taught by other lecturers (the logged-in user is a student here) -----

        addCourse({
            title: "Python for Beginners",
            lecturer: "Sarah Miller",
            category: "Programming",
            difficulty: "Beginner",
            description: "Learn the fundamentals of Python programming.",
            icon: "bi-code-slash",
            takenByUser: true,
            chapters: [
                {
                    title: "Chapter 1: Introduction",
                    lessons: [
                        { title: "Lesson 1: Getting Started", minutes: 10, done: true,
                          text: "Python is a beginner-friendly programming language. In this lesson you install Python, open the terminal and run your first program: print('Hello, world!')" },
                        { title: "Lesson 2: Basic Concepts", minutes: 15, done: true,
                          text: "A variable stores a value, for example age = 20. Python has numbers, text (strings) and True/False values.\nUse the type() function to check what kind of value a variable holds." }
                    ]
                },
                {
                    title: "Chapter 2: Control Flow",
                    lessons: [
                        { title: "Lesson 3: If Statements", minutes: 12, done: true,
                          text: "An if statement runs code only when a condition is true.\n\nif age >= 18:\n    print('Adult')\nelse:\n    print('Minor')" },
                        { title: "Lesson 4: Loops", minutes: 18, done: false,
                          text: "A loop repeats code. A for loop goes through a list, a while loop repeats until a condition is false.\nRead the attached cheat sheet for examples.",
                          file: { name: "python-loops-cheatsheet.pdf", url: "files/python-loops-cheatsheet.pdf" } }
                    ]
                }
            ],
            assignments: [
                { title: "Number guessing game", details: "Paste your Python code and explain how it works.", due: 2 },
                { title: "Simple calculator", details: "Upload your calculator as a .py file.", due: 9 }
            ],
            webinars: [
                { day: 1, time: "10:00", title: "Live Q&A: Functions" },
                { day: 8, time: "10:00", title: "Live coding: Loops" }
            ]
        });

        addCourse({
            title: "Photography Basics",
            lecturer: "Marco Rossi",
            category: "Photography",
            difficulty: "Beginner",
            description: "Learn composition, lighting and photography.",
            icon: "bi-camera",
            takenByUser: true,
            chapters: [
                {
                    title: "Chapter 1: The Camera",
                    lessons: [
                        { title: "Lesson 1: Camera Types", minutes: 10, done: true,
                          text: "Compact cameras are small and easy to use. DSLR and mirrorless cameras have interchangeable lenses and give you more control. A smartphone is good enough to start with." },
                        { title: "Lesson 2: Exposure Triangle", minutes: 20, done: false,
                          text: "Exposure depends on three settings: aperture, shutter speed and ISO. The attached diagram shows how they work together.",
                          file: { name: "exposure-triangle.png", url: "files/exposure-triangle.png" } },
                        { title: "Lesson 3: Focus Modes", minutes: 12, done: false,
                          text: "Single focus locks on one point, continuous focus follows a moving subject. Use single focus for portraits and continuous focus for sports." }
                    ]
                }
            ],
            assignments: [
                { title: "Take 5 photos using the rule of thirds", details: "Upload a .zip with your 5 photos.", due: -1 }
            ],
            webinars: [
                { day: 1, time: "16:00", title: "Live shoot: Natural Light" },
                { day: 5, time: "16:00", title: "Portrait critique session" }
            ]
        });

        addCourse({
            title: "Intro to HTML",
            lecturer: "Elena Petrova",
            category: "Programming",
            difficulty: "Beginner",
            description: "Build your first web page from scratch.",
            icon: "bi-filetype-html",
            takenByUser: true,
            chapters: [
                {
                    title: "Chapter 1: The Basics",
                    lessons: [
                        { title: "Lesson 1: Tags and Elements", minutes: 10, done: true,
                          text: "HTML pages are built from elements. An element has an opening tag, content and a closing tag, for example <p>Hello</p>" },
                        { title: "Lesson 2: Links and Images", minutes: 12, done: true,
                          text: "Use <a href=\"page.html\">text</a> for links and <img src=\"photo.jpg\" alt=\"description\"> for images. Always write an alt text." }
                    ]
                }
            ],
            assignments: [
                { title: "Build a personal page", details: "Upload your index.html file.", due: 6 }
            ]
        });

        addCourse({
            title: "UI/UX Fundamentals",
            lecturer: "Elena Petrova",
            category: "Design",
            difficulty: "Intermediate",
            description: "Discover the principles of user interface design.",
            icon: "bi-palette",
            chapters: [
                {
                    title: "Chapter 1: Design Principles",
                    lessons: [
                        { title: "Lesson 1: Layout and Spacing", minutes: 14,
                          text: "Good layouts group related things together and leave enough empty space around them. Use a grid and keep the spacing consistent." },
                        { title: "Lesson 2: Color and Typography", minutes: 16,
                          text: "Pick one main color and one accent color. Use at most two fonts and make sure the text is easy to read against the background." }
                    ]
                }
            ],
            assignments: [
                { title: "Redesign a login page", details: "Upload a screenshot or PDF of your new design.", due: 14 }
            ],
            webinars: [
                { day: 3, time: "12:00", title: "Wireframing workshop" }
            ]
        });

        addCourse({
            title: "Spanish for Travelers",
            lecturer: "Lucia Fernandez",
            category: "Languages",
            difficulty: "Beginner",
            description: "Useful phrases and conversation for your next trip.",
            icon: "bi-translate",
            chapters: [
                {
                    title: "Chapter 1: First Words",
                    lessons: [
                        { title: "Lesson 1: Greetings", minutes: 8,
                          text: "Hola = Hello\nBuenos días = Good morning\nBuenas noches = Good night\nAdiós = Goodbye" },
                        { title: "Lesson 2: Ordering Food", minutes: 12,
                          text: "Quisiera un café, por favor = I would like a coffee, please.\nLa cuenta, por favor = The bill, please." }
                    ]
                }
            ],
            assignments: [
                { title: "Order a meal in Spanish", details: "Write the conversation you would have when ordering a meal.", due: 10 }
            ],
            webinars: [
                { day: 2, time: "18:00", title: "Live conversation practice" }
            ]
        });


        // ----- Courses taught by the logged-in user (shown on the Teach page) -----

        addCourse({
            title: "Java Essentials",
            lecturer: currentUser.fullName,
            category: "Programming",
            difficulty: "Beginner",
            description: "Learn Java from your first program to your first classes.",
            icon: "bi-code-slash",
            limit: 25,
            objectives: "Write, compile and run simple Java programs.",
            prerequisites: "None",
            chapters: [
                {
                    title: "Chapter 1: Getting Started",
                    lessons: [
                        { title: "Lesson 1: Installing the JDK", minutes: 10,
                          text: "The JDK contains the compiler (javac) and the runtime (java). Install it, then check the version with: java -version" },
                        { title: "Lesson 2: Your First Program", minutes: 15,
                          text: "Every Java program starts in a main method.\n\npublic class Hello {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, world!\");\n    }\n}" }
                    ]
                },
                {
                    title: "Chapter 2: Object-Oriented Basics",
                    lessons: [
                        { title: "Lesson 3: Classes and Objects", minutes: 20,
                          text: "A class is a blueprint, an object is one thing built from it. A Student class can have a name and a method study()." }
                    ]
                }
            ],
            assignments: [
                { title: "Build a bank account class", details: "Create a BankAccount class with deposit and withdraw methods.", due: 7 }
            ],
            webinars: [
                { day: 3, time: "17:00", title: "Live Q&A: Classes", description: "Ask anything about classes and objects.",
                  link: "https://meet.google.com/abc-defg-hij", capacity: 30, duration: 60 }
            ],
            students: [
                { name: "Emma Wilson", email: "emma.wilson@epoka.edu.al", done: 2 },
                { name: "Daniel Smith", email: "daniel.smith@epoka.edu.al", done: 3 }
            ]
        });

        addCourse({
            title: "Git for Teams",
            lecturer: currentUser.fullName,
            category: "Programming",
            difficulty: "Intermediate",
            description: "Branches, merges and pull requests for group projects.",
            icon: "bi-code-slash",
            status: "Draft",
            limit: 20,
            chapters: [
                {
                    title: "Chapter 1: Branching",
                    lessons: [
                        { title: "Lesson 1: Branches and Merges", minutes: 15,
                          text: "A branch is a separate line of work. Create one with: git switch -c my-feature" }
                    ]
                }
            ]
        });

        addCourse({
            title: "Mobile Photography",
            lecturer: currentUser.fullName,
            category: "Photography",
            difficulty: "Beginner",
            description: "Take better photos with the phone you already have.",
            icon: "bi-camera",
            limit: 20,
            chapters: [
                {
                    title: "Chapter 1: Shooting with a Phone",
                    lessons: [
                        { title: "Lesson 1: Light and Angles", minutes: 10,
                          text: "Shoot near a window, avoid the flash and try a low angle to make your subject look bigger." },
                        { title: "Lesson 2: Editing Basics", minutes: 12,
                          text: "Adjust exposure first, then contrast, then color. Small changes look better than big ones." }
                    ]
                }
            ],
            assignments: [
                { title: "Edit a photo three ways", details: "Upload the original and your three edited versions.", due: 5 }
            ],
            students: [
                { name: "Sophie Turner", email: "sophie.turner@epoka.edu.al", done: 1 }
            ]
        });


    return { courses: courses, enrollments: enrollments };
}
