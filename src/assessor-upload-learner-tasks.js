

import { auth, db } from "../firebase.config.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Sidebar

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

// Elements and learner data


const learnerSelect = document.getElementById("learnerSelect");
const allLearnersBtn = document.getElementById("allLearnersBtn");
const taskForm = document.getElementById("uploadTaskForm");
const taskUploadMessage = document.getElementById("taskUploadMessage");

const learnersMap = new Map();

let currentUser = null;
let learnersLoaded = false;


// Display status messages


function showMessage(message, type = "info") {
    if (!taskUploadMessage) return;

    taskUploadMessage.textContent = message;
    taskUploadMessage.className = `task-upload-message ${type}`;
}


// Load learners from Firestore
async function loadLearners() {
    if (!learnerSelect) return;

    learnerSelect.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Loading learners...";
    placeholder.disabled = true;
    placeholder.selected = true;

    learnerSelect.appendChild(placeholder);
    learnerSelect.disabled = true;
    allLearnersBtn.disabled = true;

    try {
        const snapshot = await getDocs(
            collection(db, "Learners")
        );

        learnersMap.clear();

        learnerSelect.replaceChildren();

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select a learner";
        defaultOption.disabled = true;
        defaultOption.selected = true;

        learnerSelect.appendChild(defaultOption);

        // The ALL option allows assignment to every learner.
        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "All learners";

        learnerSelect.appendChild(allOption);

        snapshot.forEach((docSnap) => {
            const learner = docSnap.data();

            // Prefer the document's uid field if present.
            // Otherwise, use the Firestore document ID.
            const learnerUid = learner.uid || docSnap.id;

            const firstName =
                learner.name || learner.firstName || "";

            const surname =
                learner.surname || learner.lastName || "";

            const learnerName =
                `${firstName} ${surname}`.trim() ||
                learner.displayName ||
                learner.email ||
                "Unnamed learner";

            const learnerRecord = {
                id: docSnap.id,
                learnerUid,
                name: learnerName,
                email: learner.email || ""
            };

            learnersMap.set(docSnap.id, learnerRecord);

            const option = document.createElement("option");

            // Use the Firestore document ID as the selection value.
            option.value = docSnap.id;
            option.textContent = learnerName;

            learnerSelect.appendChild(option);
        });

        learnersLoaded = true;
        learnerSelect.disabled = false;
        allLearnersBtn.disabled = snapshot.empty;

        if (snapshot.empty) {
            showMessage(
                "No learners were found in the Learners collection.",
                "info"
            );
        } else {
            showMessage(
                `${snapshot.size} learner(s) loaded successfully.`,
                "info"
            );
        }

        console.log("Learners loaded:", snapshot.size);

    } catch (error) {
        console.error("Error loading learners:", error);

        learnerSelect.replaceChildren();

        const errorOption = document.createElement("option");
        errorOption.value = "";
        errorOption.textContent = "Could not load learners";
        errorOption.disabled = true;
        errorOption.selected = true;

        learnerSelect.appendChild(errorOption);

        learnerSelect.disabled = true;
        allLearnersBtn.disabled = true;

        showMessage(
            "Unable to load learners. Please check your connection and try again.",
            "error"
        );
    }
}



// Learner selection shortcuts


function updateLearnerSelection() {
    if (!allLearnersBtn || !learnerSelect) return;

    allLearnersBtn.classList.toggle(
        "active",
        learnerSelect.value === "all"
    );
}

learnerSelect?.addEventListener("change", () => {
    updateLearnerSelection();
});

allLearnersBtn?.addEventListener("click", () => {
    if (!learnersLoaded || learnersMap.size === 0) {
        showMessage("No learners are available to assign.", "error");
        return;
    }

    learnerSelect.value = "all";
    updateLearnerSelection();
});



// Upload learner task


taskForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!currentUser) {
        showMessage("Please sign in before uploading a task.", "error");
        return;
    }

    if (!learnersLoaded) {
        showMessage("Please wait for the learner list to load.", "error");
        return;
    }

    const selectedLearnerId = learnerSelect.value;

    const taskTitle = document
        .getElementById("taskTitle")
        .value
        .trim();

    const taskDescription = document
        .getElementById("taskDescription")
        .value
        .trim();

    const dueDate = document
        .getElementById("dueDate")
        .value;

    if (
        !selectedLearnerId ||
        !taskTitle ||
        !taskDescription ||
        !dueDate
    ) {
        showMessage("Please complete all fields.", "error");
        return;
    }

    let selectedLearners = [];

    if (selectedLearnerId === "all") {
        selectedLearners = Array.from(learnersMap.values());
    } else {
        const learner = learnersMap.get(selectedLearnerId);

        if (!learner) {
            showMessage(
                "The selected learner could not be found. Please select again.",
                "error"
            );
            return;
        }

        selectedLearners = [learner];
    }

    if (selectedLearners.length === 0) {
        showMessage("There are no learners to assign this task to.", "error");
        return;
    }

    const uploadButton = taskForm.querySelector(".task-upload-btn");
    const cancelButton = taskForm.querySelector(".task-cancel-btn");

    uploadButton.disabled = true;
    cancelButton.disabled = true;

    const originalButtonText = uploadButton.textContent;
    uploadButton.textContent = "Uploading...";

    let uploadedCount = 0;
    const failedLearners = [];

    showMessage("Uploading task(s)...", "info");

    try {
        for (const learner of selectedLearners) {
            try {
                await addDoc(
                    collection(db, "LearnerTasks"),
                    {
                        learnerUid: learner.learnerUid,
                        learnerName: learner.name,
                        learnerEmail: learner.email,

                        taskTitle,
                        taskDescription,
                        dueDate,

                        createdByUid: currentUser.uid,
                        createdByEmail: currentUser.email || "",

                        createdAt: serverTimestamp(),
                        status: "Pending"
                    }
                );

                uploadedCount++;

            } catch (error) {
                console.error(
                    `Failed to upload task for ${learner.name}:`,
                    error
                );

                failedLearners.push(learner.name);
            }
        }

        if (failedLearners.length === 0) {
            showMessage(
                `Task uploaded successfully for ${uploadedCount} learner(s).`,
                "success"
            );

            taskForm.reset();
            updateLearnerSelection();

        } else if (uploadedCount > 0) {
            showMessage(
                `Uploaded for ${uploadedCount} learner(s). Failed for: ${failedLearners.join(", ")}. Please retry for the learners who failed.`,
                "error"
            );

        } else {
            showMessage(
                "The task could not be uploaded. Please try again.",
                "error"
            );
        }

    } catch (error) {
        console.error("Task upload error:", error);

        showMessage(
            `Error uploading task: ${error.message}`,
            "error"
        );

    } finally {
        uploadButton.disabled = false;
        cancelButton.disabled = false;
        uploadButton.textContent = originalButtonText;
    }
});


// Authentication


onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (!user) {
        learnersLoaded = false;

        if (learnerSelect) {
            learnerSelect.disabled = true;
        }

        if (allLearnersBtn) {
            allLearnersBtn.disabled = true;
        }

        if (taskForm) {
            taskForm.querySelector(".task-upload-btn").disabled = true;
        }

        showMessage("Please sign in to upload learner tasks.", "error");
        return;
    }

    if (taskForm) {
        taskForm.querySelector(".task-upload-btn").disabled = false;
    }

    await loadLearners();
});
