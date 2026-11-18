// Skill Exchange uses the SAME shared Store as the Learn and Teach pages.

const learnSkill = document.getElementById("learnSkill");
const teachSkill = document.getElementById("teachSkill");
const mentorsList = document.getElementById("mentorsList");
const learnersList = document.getElementById("learnersList");
const profileModal = document.getElementById("profileModal");
const follows = new Set();
const connections = new Set();
let profiles = [];
let lastFocusedButton = null;

// Shared store entries can come from editable course/student fields.
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map(word => word.charAt(0).toUpperCase()).join("");
}

function tags(items, type = "") {
  if (!items.length) return '<span class="student-subtitle">Not listed</span>';
  return `<div class="tag-list ${type}">${items.map(item =>
    `<span>${escapeHTML(item)}</span>`).join("")}</div>`;
}

// Build profiles from courses and enrollments, instead of making up new names.
function buildProfiles(data) {
  const courses = Array.isArray(data.courses) ? data.courses : [];
  const enrollments = Array.isArray(data.enrollments) ? data.enrollments : [];
  const currentEmail = String(Store.currentUser.email).toLowerCase();
  const currentName = Store.currentUser.fullName;
  const byId = new Map(courses.map(course => [String(course.id), course]));
  const lecturers = new Map();
  const students = new Map();

  // Course lecturers can offer guidance in the subjects they teach.
  // The store does NOT contain their email addresses, so we won't invent any.
  for (const course of courses) {
    const name = String(course.lecturer || "").trim();
    const category = String(course.category || "").trim();
    if (!name || name === currentName) continue;
    const key = name.toLowerCase();
    if (!lecturers.has(key)) {
      lecturers.set(key, {
        id: `lecturer:${key}`, name, email: "", role: "Course lecturer",
        skills: [], wants: [], courseNames: [], progress: []
      });
    }
    const person = lecturers.get(key);
    if (category && !person.skills.includes(category)) person.skills.push(category);
    if (course.title && !person.courseNames.includes(course.title)) {
      person.courseNames.push(course.title);
    }
  }

  // Students and student emails come directly from actual enrollment records.
  for (const enrollment of enrollments) {
    const email = String(enrollment.email || "").trim();
    const name = String(enrollment.name || "").trim();
    if (!name || !email || email.toLowerCase() === currentEmail) continue;
    const course = byId.get(String(enrollment.courseId));
    if (!course) continue;
    const key = email.toLowerCase();
    if (!students.has(key)) {
      students.set(key, {
        id: `student:${key}`, name, email, role: "Student",
        skills: [], wants: [], courseNames: [], progress: []
      });
    }
    const person = students.get(key);
    const category = String(course.category || "").trim();
    if (category && !person.wants.includes(category)) person.wants.push(category);
    if (course.title && !person.courseNames.includes(course.title)) {
      person.courseNames.push(course.title);
    }
    const lessons = (course.chapters || []).flatMap(chapter => chapter.lessons || []);
    const done = Array.isArray(enrollment.doneLessons) ? enrollment.doneLessons : [];
    const completed = lessons.filter(lesson => done.some(id => String(id) === String(lesson.id))).length;
    person.progress.push({ title: course.title, completed, total: lessons.length });

    // Only count course categories as demonstrated experience if all
    // recorded lessons have actually been completed in the shared data.
    if (category && lessons.length > 0 && completed === lessons.length &&
        !person.skills.includes(category)) person.skills.push(category);
  }

  return [...lecturers.values(), ...students.values()];
}

function emailMarkup(person) {
  // Email is available for enrolled students, but not for lecturer-only profiles.
  if (!person.email) {
    return '<span class="student-email">Email not available in shared store</span>';
  }
  const validEmail = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(person.email);
  if (!validEmail) return '<span class="student-email">No valid email on record</span>';
  const email = escapeHTML(person.email);
  return `<a class="student-email" href="mailto:${email}">${email}</a>`;
}

function studentCard(person) {
  const id = escapeHTML(person.id);
  const details = person.role === "Course lecturer"
    ? `Teaches: ${person.courseNames.join(", ")}`
    : person.progress.map(course => `${course.title}: ${course.completed}/${course.total} lessons`).join(" · ");
  return `
    <article class="student-card">
      <div class="student-top">
        <span class="avatar" aria-hidden="true">${escapeHTML(initials(person.name))}</span>
        <div>
          <h4>${escapeHTML(person.name)}</h4>
          <p class="student-subtitle">${escapeHTML(person.role)}<br>${escapeHTML(details)}</p>
        </div>
      </div>
      <p class="skill-label">Can help with</p>${tags(person.skills)}
      <p class="skill-label">Learning interests</p>${tags(person.wants, "wants")}
      ${emailMarkup(person)}
      <div class="student-actions">
        <button type="button" class="btn view-profile" data-id="${id}" data-action="profile">View Profile</button>
        <button type="button" class="btn ${follows.has(person.id) ? "is-active" : ""}" data-id="${id}" data-action="follow">${follows.has(person.id) ? "✓ Following" : "+ Follow"}</button>
        <button type="button" class="btn btn-main ${connections.has(person.id) ? "is-active" : ""}" data-id="${id}" data-action="connect">${connections.has(person.id) ? "✓ Connected" : "+ Connect"}</button>
      </div>
    </article>`;
}

function renderStudents() {
  const subjectToLearn = learnSkill.value;
  const subjectToTeach = teachSkill.value;
  const mentors = profiles.filter(person => person.skills.includes(subjectToLearn));
  const learners = profiles.filter(person => person.role === "Student" &&
    person.wants.includes(subjectToTeach));

  mentorsList.innerHTML = mentors.length
    ? mentors.map(studentCard).join("")
    : '<p class="empty-text">No matches for this subject in the shared store.</p>';
  learnersList.innerHTML = learners.length
    ? learners.map(studentCard).join("")
    : '<p class="empty-text">No enrolled students for this subject yet.</p>';
}

function fillFilters() {
  const categories = [...new Set(Store.load().courses.map(course => course.category)
    .filter(Boolean))].sort();
  const selectedLearn = learnSkill.value;
  const selectedTeach = teachSkill.value;
  const teachingCategories = Store.load().courses.filter(course =>
    course.lecturer === Store.currentUser.fullName).map(course => course.category);

  for (const select of [learnSkill, teachSkill]) {
    select.innerHTML = "";
    for (const category of categories) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    }
  }
  const defaultLearn = Store.currentUser.interests.find(item => categories.includes(item));
  learnSkill.value = categories.includes(selectedLearn) ? selectedLearn : (defaultLearn || categories[0] || "");
  const defaultTeach = teachingCategories.find(item => categories.includes(item));
  teachSkill.value = categories.includes(selectedTeach) ? selectedTeach : (defaultTeach || categories[0] || "");
}

function refreshFromStore() {
  if (typeof Store === "undefined") return;
  profiles = buildProfiles(Store.load());
  fillFilters();
  renderStudents();
}

learnSkill.addEventListener("change", renderStudents);
teachSkill.addEventListener("change", renderStudents);

function handleStudentAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const id = button.dataset.id;
  const action = button.dataset.action;
  if (action === "profile") {
    openProfile(id);
    return;
  }
  const set = action === "follow" ? follows : connections;
  if (set.has(id)) set.delete(id);
  else set.add(id);
  renderStudents();
}
mentorsList.addEventListener("click", handleStudentAction);
learnersList.addEventListener("click", handleStudentAction);

function openProfile(id) {
  const person = profiles.find(item => item.id === id);
  if (!person) return;
  lastFocusedButton = document.activeElement;
  const details = person.role === "Course lecturer"
    ? `Courses taught: ${person.courseNames.join(", ")}`
    : person.progress.map(course =>
        `${course.title}: ${course.completed} of ${course.total} lessons completed`).join(" · ");
  document.getElementById("profileTitle").textContent = "Profile";
  document.getElementById("profileContent").innerHTML = `
    <div class="profile-large">
      <span class="avatar">${escapeHTML(initials(person.name))}</span>
      <div><h3>${escapeHTML(person.name)}</h3><p>${escapeHTML(person.role)}</p></div>
    </div>
    <p class="skill-label">${person.role === "Course lecturer" ? "Teaching" : "Course progress"}</p>
    <p>${escapeHTML(details)}</p>
    <p class="skill-label">Can help with</p>${tags(person.skills)}
    <p class="skill-label">Interested in learning</p>${tags(person.wants, "wants")}
    <p class="skill-label">Contact email</p>${emailMarkup(person)}
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
profileModal.addEventListener("click", event => {
  if (event.target === profileModal) closeProfile();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !profileModal.hidden) closeProfile();
});

// Updates when returning from Learn/Teach or when another tab edits shared data.
window.addEventListener("pageshow", refreshFromStore);
window.addEventListener("storage", event => {
  if (event.key === Store.key) refreshFromStore();
});

refreshFromStore();