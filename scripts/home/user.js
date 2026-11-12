// Profile page: display the logged-in user's details
// currentUser is defined in store.js

function getInitials(name) {
    const words = name.split(" ");
    return words[0][0] + words[words.length - 1][0];
}

function renderProfile() {

    let interests = "";

    for (const interest of currentUser.interests) {
        interests += <span class="badge">${interest}</span>;
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