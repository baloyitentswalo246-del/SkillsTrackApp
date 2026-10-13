
import { auth, db } from "../firebase.config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// calling elements
const learnerProgressSelect = document.getElementById("learnerProgressSelect");
const learnerProgressSearch = document.getElementById("learnerProgressSearch");
const learnerProgressContainer = document.getElementById("learnerProgressContainer");
const refreshProgressBtn = document.getElementById("refreshProgressBtn");

let learners = [];
let progressTasks = [];
// changing values into text and substituting special HTML characters
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
// date formatting
function formatDate(value) {
  if (!value) return "No due date";

  if (typeof value.toDate === "function") {
    return value.toDate().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}
//checking status of tasks
function normalizeStatus(value = "") {
  return String(value).trim().toLowerCase();
}

function isCompletedStatus(status) {
  const normalized = normalizeStatus(status);
  return [
    "completed",
    "submitted",
    "done",
    "finished",
    "passed",
    "success"
  ].includes(normalized);
}

function isInProgressStatus(status) {
  const normalized = normalizeStatus(status);
  return [
    "in progress",
    "pending",
    "draft",
    "not started",
    "started"
  ].includes(normalized);
}
// reader for progress cards
function renderProgressCards() {
  if (!learnerProgressContainer) return;

  const searchTerm = (learnerProgressSearch?.value || "").trim().toLowerCase();
  const filteredTasks = progressTasks.filter((task) => {
    const haystack = [
      task.learnerName,
      task.taskTitle,
      task.subject,
      task.status,
      task.submissionText,
      task.taskDescription
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchTerm);
  });

  if (!filteredTasks.length) {
    learnerProgressContainer.innerHTML = `
      <div class="subject-card">
        <div class="subject-card-header">NO TASKS FOUND</div>
        <div class="subject-row">
          <span class="subject-row-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Status
          </span>
          <span>No learner submission available.</span>
        </div>
      </div>
    `;
    return;
  }

  const learnerGroups = new Map();
// grouping tasks by learner
  filteredTasks.forEach((task) => {
    const learnerName = task.learnerName || "Unknown learner";
    if (!learnerGroups.has(learnerName)) {
      learnerGroups.set(learnerName, []);
    }
    learnerGroups.get(learnerName).push(task);
  });
// rendering progress cards for each learner
  learnerProgressContainer.innerHTML = [...learnerGroups.entries()]
    .map(([learnerName, tasks]) => {
      const totalTasks = tasks.length;
      const inProgressTasks = tasks.filter((task) => isInProgressStatus(task.status)).length;
      const completedTasks = tasks.filter((task) => isCompletedStatus(task.status)).length;
      const overallPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const taskCards = tasks
        .map((task) => {
          const taskTitle = task.taskTitle || "Untitled task";
          const status = String(task.status || "Pending");
          const submissionText = task.submissionText || "No learner submission yet.";

          return `
            <div class="subject-card" data-learner="${escapeHtml(learnerName).toLowerCase()}">
              <div class="subject-card-header">${escapeHtml(taskTitle).toUpperCase()}</div>
              <div class="subject-row">
                <span class="subject-row-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 20a8 8 0 0 1 16 0"/>
                  </svg>
                  Learner
                </span>
                <span>${escapeHtml(learnerName)}</span>
              </div>
              <div class="subject-row">
                <span class="subject-row-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  Due Date
                </span>
                <span>${formatDate(task.dueDate)}</span>
              </div>
              <div class="subject-row">
                <span class="subject-row-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  Status
                </span>
                <span class="tag-pill ${status.toLowerCase() === "completed" || status.toLowerCase() === "submitted" ? "total" : ""}">${status}</span>
              </div>
              <div class="subject-row" style="display:block;">
                <span class="subject-row-label" style="display:block; margin-bottom:8px;">
                  Submitted work
                </span>
                <span>${escapeHtml(submissionText)}</span>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="subject-card">
          <div class="subject-card-header">${escapeHtml(learnerName).toUpperCase()} PROGRESS</div>
          <div class="subject-row">
            <span class="subject-row-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 12h18"/>
                <path d="M12 3v18"/>
              </svg>
              Total Tasks
            </span>
            <span>${totalTasks}</span>
          </div>
          <div class="subject-row">
            <span class="subject-row-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 2v20"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              In Progress
            </span>
            <span>${inProgressTasks}</span>
          </div>
          <div class="subject-row">
            <span class="subject-row-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Completed
            </span>
            <span>${completedTasks}</span>
          </div>
          <div class="subject-row">
            <span class="subject-row-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="9"/>
                <path d="M12 7v5l3 3"/>
              </svg>
              Progress
            </span>
            <span class="tag-pill total">${overallPercentage}%</span>
          </div>
        </div>
        ${taskCards}
      `;
    })
    .join("");
}
// loading learners from Firestore
async function loadLearners() {
  try {
    const snapshot = await getDocs(collection(db, "Learners"));

    learners = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const fullName = [data.name, data.surname, data.lastName].filter(Boolean).join(" ").trim();

      return {
        id: docSnap.id,
        uid: data.uid || docSnap.id,
        name: fullName || data.displayName || data.email || "Unnamed learner",
        email: data.email || ""
      };
    });

    if (learnerProgressSelect) {
      learnerProgressSelect.innerHTML = '<option value="all">All learners</option>' +
        learners
          .map((learner) => `<option value="${learner.uid}">${escapeHtml(learner.name)}</option>`)
          .join("");
    }
  } catch (error) {
    console.error("Error loading learners:", error);
  }
}
// loading progress tasks from Firestore
async function loadProgressTasks() {
  try {
    if (!learnerProgressSelect) return;

    const learnerUid = learnerProgressSelect.value;
    let querySnapshot;

    if (learnerUid && learnerUid !== "all") {
      querySnapshot = await getDocs(query(
        collection(db, "LearnerTasks"),
        where("learnerUid", "==", learnerUid)
      ));
    } else {
      querySnapshot = await getDocs(collection(db, "LearnerTasks"));
    }

    progressTasks = querySnapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
      .sort((taskA, taskB) => {
        const a = taskA.dueDate || taskA.createdAt || 0;
        const b = taskB.dueDate || taskB.createdAt || 0;

        if (a && typeof a.toDate === "function" && b && typeof b.toDate === "function") {
          return a.toDate().getTime() - b.toDate().getTime();
        }

        return new Date(a).getTime() - new Date(b).getTime();
      });

    renderProgressCards();
  } catch (error) {
    console.error("Error loading learner progress:", error);

    if (learnerProgressContainer) {
      learnerProgressContainer.innerHTML = `
        <div class="subject-card">
          <div class="subject-card-header">PROGRESS LOAD FAILED</div>
          <div class="subject-row">
            <span class="subject-row-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Status
            </span>
            <span>Unable to load learner progress.</span>
          </div>
        </div>
      `;
    }
  }
}
//addin event listeners for learner progress 
if (learnerProgressSelect) {
  learnerProgressSelect.addEventListener("change", loadProgressTasks);
}

if (learnerProgressSearch) {
  learnerProgressSearch.addEventListener("input", renderProgressCards);
}

if (refreshProgressBtn) {
  refreshProgressBtn.addEventListener("click", () => {
    loadProgressTasks();
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (learnerProgressContainer) {
      learnerProgressContainer.innerHTML = `
        <div class="subject-card">
          <div class="subject-card-header">SIGN IN REQUIRED</div>
          <div class="subject-row">
            <span class="subject-row-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Status
            </span>
            <span>Please sign in as an assessor to view progress.</span>
          </div>
        </div>
      `;
    }
    return;
  }

  await loadLearners();
  await loadProgressTasks();
});
// sidebar
window.toggleSidebar = function () {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");

  if (!sidebar || !toggleBtn) return;

  const isCollapsed = sidebar.classList.toggle("is-collapsed");
  toggleBtn.classList.toggle("is-collapsed", isCollapsed);
  toggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
};

