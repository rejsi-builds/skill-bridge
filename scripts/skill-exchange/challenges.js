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

document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !quizModal.hidden) {
        closeQuiz();
    }
});