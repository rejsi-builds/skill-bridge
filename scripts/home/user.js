// Profile page: display the logged-in user's details
// currentUser is defined in store.js

function getInitials(name) {
    const words = name.split(" ");
    return words[0][0] + words[words.length - 1][0];
}

function renderProfile() {

    // show the user who logged in or signed up;
    // if there is none, show the demo user (Alex) from store.js
    let currentUser = Store.currentUser;
    const saved = localStorage.getItem("loggedInUser");
    if (saved !== null) {
        currentUser = JSON.parse(saved);
    }

    let interests = "";

    for (const interest of currentUser.interests) {
        interests += `<span class="badge">${interest}</span>`;
    }

    document.getElementById("profileCard").innerHTML = `
        <div class="avatar">${getInitials(currentUser.fullName)}</div>

        <div class="profile-info">
            <h2>${currentUser.fullName}</h2>

            <p class="label">Email</p>
            <p class="value">${currentUser.email}</p>

            <p class="label">Major</p>
            <p class="value">${currentUser.major}</p>

            <p class="label">Interests</p>
            <p class="value">${interests}</p>

            <p class="label">Skills</p>
            <p class="value">${currentUser.skills}</p>
        </div>
    `;
}

renderProfile();