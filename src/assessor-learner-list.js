
import { auth, db } from "../firebase.config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";


// ------------------------------------
// Sidebar
// ------------------------------------

window.toggleSidebar = function () {
    const sidebar = document.querySelector(".sidebar");
    const button = document.getElementById("sidebar-toggle");

    if (!sidebar || !button) return;

    sidebar.classList.toggle("is-collapsed");
    button.classList.toggle("is-collapsed");

    button.setAttribute(
        "aria-expanded",
        String(!sidebar.classList.contains("is-collapsed"))
    );
};


// ------------------------------------
// Elements
// ------------------------------------

const learnersList = document.getElementById("learnersList");
const learnerSearch = document.getElementById("learnerSearch");
const learnersMessage = document.getElementById("learnersMessage");

const detailsDialog = document.getElementById("learnerDetailsDialog");
const detailsContent = document.getElementById("learnerDetailsContent");

const closeDialogBtn = document.getElementById("closeLearnerDialog");
const closeDialogDoneBtn = document.getElementById("closeLearnerDialogBtn");

let learners = [];
let currentUser = null;


// ------------------------------------
// Messages
// ------------------------------------

function showMessage(message) {
    learnersMessage.textContent = message;
}


// ------------------------------------
// Safe text helper
// ------------------------------------

function addDetail(label, value) {
    const paragraph = document.createElement("p");
    const strong = document.createElement("strong");

    strong.textContent = `${label}: `;

    paragraph.appendChild(strong);
    paragraph.appendChild(
        document.createTextNode(value || "Not provided")
    );

    detailsContent.appendChild(paragraph);
}


// ------------------------------------
// Load learners
// ------------------------------------

async function loadLearners() {
    learnersList.replaceChildren();
    showMessage("Loading learners...");

    try {
        const snapshot = await getDocs(
            collection(db, "Learners")
        );

        learners = snapshot.docs.map((docSnap) => {
            const data = docSnap.data();

            const firstName =
                data.name || data.firstName || "";

            const surname =
                data.surname || data.lastName || "";

            return {
                id: docSnap.id,
                uid: data.uid || docSnap.id,
                name:
                    `${firstName} ${surname}`.trim() ||
                    data.displayName ||
                    data.email ||
                    "Unnamed learner",
                email: data.email || "",
                phone: data.phone || data.phoneNumber || "",
                ...data
            };
        });

        // Keep the display name predictable.
        learners = learners.map((learner) => ({
            ...learner,
            displayName:
                `${learner.name || ""} ${
                    learner.surname || learner.lastName || ""
                }`.trim() ||
                learner.displayName ||
                learner.email ||
                "Unnamed learner"
        }));

        console.log("Learners loaded:", learners.length);

        renderLearners(learners);

    } catch (error) {
        console.error("Error loading learners:", error);

        learnersList.replaceChildren();
        showMessage(
            "Unable to load learners. Check your Firestore permissions and connection."
        );
    }
}


// ------------------------------------
// Render learner cards
// ------------------------------------

function renderLearners(list) {
    learnersList.replaceChildren();

    if (list.length === 0) {
        showMessage(
            learners.length === 0
                ? "No learners found in the Learners collection."
                : "No learners match your search."
        );
        return;
    }

    showMessage(`${list.length} learner(s) found.`);

    list.forEach((learner) => {
        const card = document.createElement("article");
        card.className = "learner-card";

        const info = document.createElement("div");
        info.className = "learner-card-info";

        const icon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("class", "learner-profile-icon");
        icon.setAttribute("aria-hidden", "true");

        const head = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        head.setAttribute("cx", "12");
        head.setAttribute("cy", "8");
        head.setAttribute("r", "4");

        const body = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        body.setAttribute(
            "d",
            "M4 21v-2a8 8 0 0 1 16 0v2"
        );

        icon.append(head, body);

        const name = document.createElement("p");
        name.className = "learner-name";
        name.textContent = learner.displayName;

        info.append(icon, name);

        const viewButton = document.createElement("button");
        viewButton.type = "button";
        viewButton.className = "learner-view-btn";

        const eye = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
        );

        eye.setAttribute("viewBox", "0 0 24 24");
        eye.setAttribute("aria-hidden", "true");

        const eyeShape = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
        );

        eyeShape.setAttribute(
            "d",
            "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"
        );

        const pupil = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle"
        );

        pupil.setAttribute("cx", "12");
        pupil.setAttribute("cy", "12");
        pupil.setAttribute("r", "3");

        eye.append(eyeShape, pupil);
        viewButton.append(eye, document.createTextNode("View"));

        viewButton.addEventListener("click", () => {
            viewLearner(learner);
        });

        card.append(info, viewButton);
        learnersList.appendChild(card);
    });
}


// ------------------------------------
// Search learners
// ------------------------------------

learnerSearch.addEventListener("input", () => {
    const searchTerm = learnerSearch.value
        .trim()
        .toLowerCase();

    const filteredLearners = learners.filter((learner) => {
        const searchableText = [
            learner.displayName,
            learner.name,
            learner.surname,
            learner.firstName,
            learner.lastName,
            learner.email,
            learner.uid,
            learner.id
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return searchableText.includes(searchTerm);
    });

    renderLearners(filteredLearners);
});


// ------------------------------------
// View learner details
// ------------------------------------

function viewLearner(learner) {
    detailsContent.replaceChildren();

    addDetail("Name", learner.displayName);
    addDetail("Email", learner.email);
    addDetail("Phone", learner.phone);
    addDetail("Learner ID", learner.uid || learner.id);

    if (typeof detailsDialog.showModal === "function") {
        detailsDialog.showModal();
    } else {
        showMessage("Your browser does not support the details dialog.");
    }
}


// ------------------------------------
// Close details dialog
// ------------------------------------

function closeDetailsDialog() {
    if (detailsDialog.open) {
        detailsDialog.close();
    }
}

closeDialogBtn.addEventListener("click", closeDetailsDialog);
closeDialogDoneBtn.addEventListener("click", closeDetailsDialog);


// ------------------------------------
// Authentication
// ------------------------------------

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!currentUser) {
        learners = [];
        learnersList.replaceChildren();
        learnerSearch.disabled = true;

        showMessage("Please sign in to view learners.");
        return;
    }

    learnerSearch.disabled = false;

    await loadLearners();
});
