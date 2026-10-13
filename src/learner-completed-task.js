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
// elements
const taskRows = document.getElementById("taskRows");
const taskSearch = document.getElementById("taskSearch");
const refreshBtn = document.getElementById("refreshBtn");

let allTasks = [];

function normalizeStatus(value = "") {
  return String(value).trim().toLowerCase();
}

function isCompletedStatus(status) {
  const normalized = normalizeStatus(status);
  return ["completed", "submitted", "done", "finished", "passed", "success"].includes(normalized);
}
// Changing values into text and substituting special HTML characters
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
// getting date value for sorting
function getDateValue(value) {
  if (!value) return Number.MAX_SAFE_INTEGER;

  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return Number.MAX_SAFE_INTEGER;
  }

  return date.getTime();
}

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
// rendering tasks
function renderTasks() {
  if (!taskRows) return;

  const searchText = (taskSearch?.value || "").trim().toLowerCase();

  const filteredTasks = allTasks.filter((task) => {
    const haystack = [
      task.taskTitle,
      task.taskDescription,
      task.status,
      task.submissionText,
      task.subject,
      task.learnerName
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchText);
  });

  if (!filteredTasks.length) {
    taskRows.innerHTML = `
      <div class="subject-card">
        <div class="subject-card-header">NO COMPLETED WORK</div>
        <div class="subject-row">
          <span class="subject-row-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Status
          </span>
          <span>No submitted work yet.</span>
        </div>
      </div>
    `;
    return;
  }

  taskRows.innerHTML = filteredTasks
    .map((task) => {
      const status = task.status || "Submitted";
      const title = task.taskTitle || "Untitled task";
      const submissionText = task.submissionText || "No work submitted yet.";

      return `
        <div class="subject-card" data-task="${escapeHtml(title).toLowerCase()}">
          <div class="subject-card-header">${escapeHtml(title).toUpperCase()}</div>
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
            <span class="tag-pill total">${status}</span>
          </div>
          <div class="subject-row">
            <span class="subject-row-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Task
            </span>
            <span>${escapeHtml(task.taskDescription || "No description")}</span>
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
}
// loading completed tasks from Firestore
async function loadCompletedTasks(user) {
  try {
    const q = query(
      collection(db, "LearnerTasks"),
      where("learnerUid", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    allTasks = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
      .filter((task) => isCompletedStatus(task.status))
      .sort((taskA, taskB) => getDateValue(taskA.dueDate) - getDateValue(taskB.dueDate));

    renderTasks();
  } catch (error) {
    console.error("Error loading completed tasks:", error);

    if (taskRows) {
      taskRows.innerHTML = `
        <div class="subject-card">
          <div class="subject-card-header">TASK LOAD FAILED</div>
          <div class="subject-row">
            <span class="subject-row-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Status
            </span>
            <span>Unable to load completed work.</span>
          </div>
        </div>
      `;
    }
  }
}
// adding event listeners for completed tasks
if (taskSearch) {
  taskSearch.addEventListener("input", renderTasks);
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    if (auth.currentUser) {
      loadCompletedTasks(auth.currentUser);
    } else {
      renderTasks();
    }
  });
}
// checking authentication state and loading completed tasks
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    allTasks = [];
    renderTasks();

    if (taskRows) {
      taskRows.innerHTML = `
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
            <span>Please sign in to view completed work.</span>
          </div>
        </div>
      `;
    }
    return;
  }

  await loadCompletedTasks(user);
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

