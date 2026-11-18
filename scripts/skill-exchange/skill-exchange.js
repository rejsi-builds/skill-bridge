// SkillBridge demo: all data is local, with no login or backend required.

// Two short example quizzes. Add more quiz objects here later.
const quizzes = {
  web: {
    title: "HTML, CSS & JavaScript Basics",
    topic: "Programming",
    participants: 214,
    questions: [
      {
        question: "Which HTML element is used to create a hyperlink?",
        options: ["Anchor", "Paragraph", "Image", "Heading"],
        correct: 0,
        explanation: "The anchor element creates links to web pages or sections."
      },
      {
        question: "Which CSS property changes the color of text?",
        options: ["background", "font-size", "color", "border"],
        correct: 2,
        explanation: "The color property sets the text color."
      },
      {
        question: "Which JavaScript keyword lets you reassign a variable?",
        options: ["const", "let", "fixed", "static"],
        correct: 1,
        explanation: "Variables declared with let can be reassigned."
      },
      {
        question: "What is CSS Flexbox mainly used for?",
        options: ["Saving files", "Arranging elements", "Connecting databases", "Checking passwords"],
        correct: 1,
        explanation: "Flexbox is a CSS layout system for aligning and arranging elements."
      }
    ]
  },

  general: {
    title: "Architecture Basics",
    topic: "Architecture",
    participants: 386,
    questions: [
      {
        question: "What does a floor plan mainly show?",
        options: [
          "The layout of rooms and walls",
          "The colors on a building facade",
          "A view of the building from the street",
          "The height of nearby trees"
        ],
        correct: 0,
        explanation: "A floor plan shows the arrangement of rooms, walls, doors and other features from above."
      },
      {
        question: "On a drawing with a scale of 1:100, what does 1 cm represent in real life?",
        options: [
          "1 cm",
          "10 cm",
          "100 cm",
          "1,000 cm"
        ],
        correct: 2,
        explanation: "At a 1:100 scale, 1 cm on the drawing represents 100 cm (1 meter) in real life."
      },
      {
        question: "Which drawing shows a building as if it has been cut vertically to reveal the inside?",
        options: [
          "Elevation",
          "Section",
          "Site plan",
          "Floor plan"
        ],
        correct: 1,
        explanation: "A section drawing shows a vertical cut through a building, revealing interior spaces and heights."
      },
      {
        question: "Which feature usually helps a building use less energy for heating and cooling?",
        options: [
          "Longer corridors",
          "More decorative lighting",
          "Larger door handles",
          "Better thermal insulation"
        ],
        correct: 3,
        explanation: "Good thermal insulation reduces heat transfer, helping a building stay comfortable with less energy."
      }
    ]
  }
};

// Example students; these are fictional and use example.com addresses.
const students = [
  { id: 1, name: "Sara Hoxha", major: "Computer Engineering", year: "3rd year", email: "sara.hoxha@example.com", skills: ["Programming", "Web Development"], wants: ["Design"] },
  { id: 2, name: "Daniel Kola", major: "Computer Engineering", year: "4th year", email: "daniel.kola@example.com", skills: ["Programming", "Data Analysis"], wants: ["Photography"] },
  { id: 3, name: "Mira Dervishi", major: "Architecture", year: "2nd year", email: "mira.dervishi@example.com", skills: ["Design", "Photography"], wants: ["Programming"] },
  { id: 4, name: "Arben Leka", major: "Business Informatics", year: "2nd year", email: "arben.leka@example.com", skills: ["Data Analysis", "Languages"], wants: ["Programming"] },
  { id: 5, name: "Eva Basha", major: "Graphic Design", year: "3rd year", email: "eva.basha@example.com", skills: ["Design", "Web Development"], wants: ["Programming"] },
  { id: 6, name: "Leo Marku", major: "Applied Languages", year: "1st year", email: "leo.marku@example.com", skills: ["Languages", "Photography"], wants: ["Web Development"] },
  { id: 7, name: "Noel Gashi", major: "Software Engineering", year: "3rd year", email: "noel.gashi@example.com", skills: ["Programming", "Languages"], wants: ["Data Analysis"] }
];

// Switch between the two tabs (buttons inside the white panel).
const challengesTab = document.getElementById("challengesTab");
const exchangeTab = document.getElementById("exchangeTab");
const challengesPanel = document.getElementById("challengesPanel");
const exchangePanel = document.getElementById("exchangePanel");

function showTab(name) {
  const onChallenges = name === "challenges";
  challengesPanel.hidden = !onChallenges;
  exchangePanel.hidden = onChallenges;
  challengesTab.classList.toggle("active", onChallenges);
  exchangeTab.classList.toggle("active", !onChallenges);
  challengesTab.setAttribute("aria-selected", String(onChallenges));
  exchangeTab.setAttribute("aria-selected", String(!onChallenges));
}
challengesTab.addEventListener("click", () => showTab("challenges"));
exchangeTab.addEventListener("click", () => showTab("exchange"));

document.getElementById("quizFilter").addEventListener("change", event => {
  document.querySelectorAll(".quiz-card").forEach(card => {
    card.hidden = event.target.value !== "all" && event.target.value !== card.dataset.category;
  });
});

// Quiz popup: choose an answer, see the score, review answers or retry.
const quizModal = document.getElementById("quizModal");
const quizContent = document.getElementById("quizContent");
let currentQuizId = "web";
let questionIndex = 0;
let answers = [];
let completedAttempt = false;
let lastFocusedButton = null;

function openQuiz(id) {
  currentQuizId = id;
  questionIndex = 0;
  answers = Array(quizzes[id].questions.length).fill(null);
  completedAttempt = false;
  lastFocusedButton = document.activeElement;
  document.getElementById("modalTitle").textContent = quizzes[id].title;
  document.getElementById("modalTopic").textContent = quizzes[id].topic;
  quizModal.hidden = false;
  document.body.style.overflow = "hidden";
  showQuestion();
  document.getElementById("closeQuiz").focus();
}

function closeQuiz() {
  quizModal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocusedButton) lastFocusedButton.focus();
}

function showQuestion() {
  const quiz = quizzes[currentQuizId];
  const item = quiz.questions[questionIndex];
  const total = quiz.questions.length;
  quizContent.innerHTML = `
    <div class="question-progress"><span>Question ${questionIndex + 1} of ${total}</span><span>${Math.round((questionIndex / total) * 100)}% done</span></div>
    <div class="progress-track"><div class="progress-fill" style="width:${((questionIndex + 1) / total) * 100}%"></div></div>
    <h3 class="question-heading">${item.question}</h3>
    ${item.options.map((option, index) => `
      <label class="choice"><input type="radio" name="quizAnswer" value="${index}" ${answers[questionIndex] === index ? "checked" : ""}><span>${option}</span></label>
    `).join("")}
    <div class="popup-actions">
      ${questionIndex > 0 ? '<button type="button" class="btn" id="previousQuestion">Back</button>' : ""}
      <button type="button" class="btn btn-main" id="nextQuestion" ${answers[questionIndex] === null ? "disabled" : ""}>
        ${questionIndex === total - 1 ? "Finish Quiz" : "Next Question"}
      </button>
    </div>
  `;
  document.querySelectorAll('input[name="quizAnswer"]').forEach(input => {
    input.addEventListener("change", () => {
      answers[questionIndex] = Number(input.value);
      document.getElementById("nextQuestion").disabled = false;
    });
  });
  const previous = document.getElementById("previousQuestion");
  if (previous) previous.addEventListener("click", () => { questionIndex--; showQuestion(); });
  document.getElementById("nextQuestion").addEventListener("click", () => {
    if (answers[questionIndex] === null) return;
    if (questionIndex < total - 1) { questionIndex++; showQuestion(); }
    else showResults();
  });
}

function showResults() {
  const quiz = quizzes[currentQuizId];
  const correct = quiz.questions.filter((item, i) => answers[i] === item.correct).length;
  const score = Math.round(correct / quiz.questions.length * 100);
  // One participant is added in this browser when an attempt finishes (not on review).
  if (!completedAttempt) {
    completedAttempt = true;
    quiz.participants++;
    document.getElementById(currentQuizId + "Participants").textContent = quiz.participants;
  }
  quizContent.innerHTML = `
    <div class="result-area"><h3>Quiz Completed!</h3><div class="score">${score} / 100 points</div>
    <p>You answered ${correct} out of ${quiz.questions.length} questions correctly.</p></div>
    <div class="popup-actions">
      <button type="button" class="btn" id="reviewAnswers">Review Answers</button>
      <button type="button" class="btn btn-main" id="retryQuiz">Try Again</button>
    </div>
  `;
  document.getElementById("reviewAnswers").addEventListener("click", showReview);
  document.getElementById("retryQuiz").addEventListener("click", () => openQuiz(currentQuizId));
}

function showReview() {
  const quiz = quizzes[currentQuizId];
  quizContent.innerHTML = `
    <h3 class="question-heading">Review Your Answers</h3>
    ${quiz.questions.map((item, i) => `
      <div class="answer-review">
        <h4>${i + 1}. ${item.question}</h4>
        <p class="${answers[i] === item.correct ? "right-answer" : "wrong-answer"}">Your answer: ${item.options[answers[i]]} ${answers[i] === item.correct ? "✓" : "✗"}</p>
        <p class="right-answer">Correct answer: ${item.options[item.correct]}</p>
        <p>${item.explanation}</p>
      </div>`).join("")}
    <div class="popup-actions"><button type="button" class="btn btn-main" id="backToScore">Back to Score</button></div>
  `;
  document.getElementById("backToScore").addEventListener("click", showResults);
}

document.querySelectorAll(".take-quiz").forEach(button => {
  button.addEventListener("click", () => openQuiz(button.dataset.quiz));
});
document.getElementById("closeQuiz").addEventListener("click", closeQuiz);
quizModal.addEventListener("click", event => { if (event.target === quizModal) closeQuiz(); });

// Skill Exchange: find students who can teach your chosen subject or learn from you.
const follows = new Set();
const connections = new Set();
const learnSkill = document.getElementById("learnSkill");
const teachSkill = document.getElementById("teachSkill");
const mentorsList = document.getElementById("mentorsList");
const learnersList = document.getElementById("learnersList");

function initials(name) { return name.split(" ").map(word => word[0]).join(""); }
function tags(items, type = "") {
  return `<div class="tag-list ${type}">${items.map(skill => `<span>${skill}</span>`).join("")}</div>`;
}
function studentCard(student) {
  return `
    <article class="student-card">
      <div class="student-top">
        <span class="avatar" aria-hidden="true">${initials(student.name)}</span>
        <div><h4>${student.name}</h4><p class="student-subtitle">${student.major}<br>${student.year}</p></div>
      </div>
      <p class="skill-label">Can help with</p>${tags(student.skills)}
      <p class="skill-label">Wants to learn</p>${tags(student.wants, "wants")}
      <a class="student-email" href="mailto:${student.email}">${student.email}</a>
      <div class="student-actions">
        <button type="button" class="btn view-profile" data-id="${student.id}" data-action="profile">View Profile</button>
        <button type="button" class="btn ${follows.has(student.id) ? "is-active" : ""}" data-id="${student.id}" data-action="follow">${follows.has(student.id) ? "✓ Following" : "+ Follow"}</button>
        <button type="button" class="btn btn-main ${connections.has(student.id) ? "is-active" : ""}" data-id="${student.id}" data-action="connect">${connections.has(student.id) ? "✓ Connected" : "+ Connect"}</button>
      </div>
    </article>
  `;
}
function renderStudents() {
  const mentors = students.filter(student => student.skills.includes(learnSkill.value));
  const learners = students.filter(student => student.wants.includes(teachSkill.value));
  mentorsList.innerHTML = mentors.length ? mentors.map(studentCard).join("") : '<p class="empty-text">No students in this sample. Choose another subject.</p>';
  learnersList.innerHTML = learners.length ? learners.map(studentCard).join("") : '<p class="empty-text">No students in this sample. Choose another subject.</p>';
}
learnSkill.addEventListener("change", renderStudents);
teachSkill.addEventListener("change", renderStudents);

// Event delegation also works after the student cards are redrawn.
function handleStudentAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = Number(button.dataset.id);
  const action = button.dataset.action;
  if (action === "profile") { openProfile(id); return; }
  const group = action === "follow" ? follows : connections;
  if (group.has(id)) group.delete(id); else group.add(id);
  renderStudents();
}
mentorsList.addEventListener("click", handleStudentAction);
learnersList.addEventListener("click", handleStudentAction);

// Simple profile popup with the student's example email and skills.
const profileModal = document.getElementById("profileModal");
function openProfile(id) {
  const student = students.find(item => item.id === id);
  if (!student) return;
  lastFocusedButton = document.activeElement;
  document.getElementById("profileTitle").textContent = "Student Profile";
  document.getElementById("profileContent").innerHTML = `
    <div class="profile-large"><span class="avatar">${initials(student.name)}</span>
      <div><h3>${student.name}</h3><p>${student.major} · ${student.year}</p></div>
    </div>
    <p class="skill-label">Skills and knowledge</p>${tags(student.skills)}
    <p class="skill-label">Interested in learning</p>${tags(student.wants, "wants")}
    <p class="skill-label">Contact email</p>
    <a class="profile-email" href="mailto:${student.email}">${student.email}</a>
  `;
  profileModal.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("closeProfile").focus();
}
function closeProfile() {
  profileModal.hidden = true;
  document.body.style.overflow = "";
  if (lastFocusedButton && lastFocusedButton.isConnected) lastFocusedButton.focus();
}
document.getElementById("closeProfile").addEventListener("click", closeProfile);
profileModal.addEventListener("click", event => { if (event.target === profileModal) closeProfile(); });
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (!quizModal.hidden) closeQuiz();
  if (!profileModal.hidden) closeProfile();
});

renderStudents();