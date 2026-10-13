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
// sidebar //
window.toggleSidebar = function () {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");

  if (!sidebar || !toggleBtn) return;

  const isCollapsed = sidebar.classList.toggle("is-collapsed");
  toggleBtn.classList.toggle("is-collapsed", isCollapsed);
  toggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
};
//elements//
const taskRows = document.getElementById("taskRows");
const taskSearch = document.getElementById("taskSearch");
const refreshBtn = document.getElementById("refreshBtn");

let allTasks = [];

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
// changing values into text and substituting special HTML characters
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
// getting subject progress summary
function getProgressSummary(tasks) {
  const summary = new Map();

  tasks.forEach((task) => {
    const subjectName =
      (task.subject && String(task.subject).trim()) ||
      (task.taskTitle && String(task.taskTitle).trim()) ||
      "General";

    const entry = summary.get(subjectName) || {
      subject: subjectName,
      total: 0,
      completed: 0
    };

    entry.total += 1;
    if (isCompletedStatus(task.status)) {
      entry.completed += 1;
    }

    summary.set(subjectName, entry);
  });

  return [...summary.values()]
    .map((entry) => ({
      ...entry,
      percentage: entry.total ? Math.round((entry.completed / entry.total) * 100) : 0
    }))
    .sort((a, b) => {
      if (b.percentage !== a.percentage) return b.percentage - a.percentage;
      return a.subject.localeCompare(b.subject);
    });
}
// rendering progress summary
function renderProgress() {
  if (!taskRows) return;

  const searchTerm = (taskSearch?.value || "").trim().toLowerCase();
  const totalTasks = allTasks.length;
  const inProgressTasks = allTasks.filter((task) => isInProgressStatus(task.status)).length;
  const completedTasks = allTasks.filter((task) => isCompletedStatus(task.status)).length;
  const overallPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const summary = getProgressSummary(allTasks);

  const filteredSummary = summary.filter((entry) => {
    const haystack = `${entry.subject} ${entry.percentage}% ${entry.completed}/${entry.total}`.toLowerCase();
    return haystack.includes(searchTerm);
  });

  if (!totalTasks) {
    taskRows.innerHTML = `
      <div class="subject-card">
        <div class="subject-card-header">NO PROGRESS FOUND</div>
        <div class="subject-row">
          <span class="subject-row-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Status
          </span>
          <span>No tasks uploaded yet.</span>
        </div>
      </div>
    `;
    return;
  }

  const cards = filteredSummary
    .map((entry) => `
      <div class="subject-card" data-subject="${escapeHtml(entry.subject).toLowerCase()}">
        <div class="subject-card-header">${escapeHtml(entry.subject).toUpperCase()}</div>
        <div class="subject-row">
          <span class="subject-row-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M3 12h18"/>
              <path d="M12 3v18"/>
            </svg>
            Completion
          </span>
          <span>${entry.completed}/${entry.total} tasks</span>
        </div>
        <div class="subject-row">
          <span class="subject-row-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 2v20"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            Progress
          </span>
          <span class="tag-pill ${entry.percentage >= 50 ? "total" : ""}">${entry.percentage}%</span>
        </div>
      </div>
    `)
    .join("");

  taskRows.innerHTML = `
    <div class="subject-card">
      <div class="subject-card-header">OVERALL PROGRESS</div>
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
    ${cards || `
      <div class="subject-card">
        <div class="subject-card-header">NO MATCHES</div>
        <div class="subject-row">
          <span class="subject-row-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Search
          </span>
          <span>No matching task group found.</span>
        </div>
      </div>
    `}
  `;
}
// loading learner progress from Firestore
async function loadLearnerProgress(user) {
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
      .sort((taskA, taskB) => {
        const a = taskA.dueDate || taskA.createdAt || 0;
        const b = taskB.dueDate || taskB.createdAt || 0;

        if (a?.toDate) return a.toDate().getTime() - b.toDate().getTime();
        return new Date(a).getTime() - new Date(b).getTime();
      });

    renderProgress();
  } catch (error) {
    console.error("Error loading learner progress:", error);

    if (taskRows) {
      taskRows.innerHTML = `
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
            <span>Unable to load progress.</span>
          </div>
        </div>
      `;
    }
  }
}
// adding event listeners for learner progress
if (taskSearch) {
  taskSearch.addEventListener("input", renderProgress);
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    if (auth.currentUser) {
      loadLearnerProgress(auth.currentUser);
    } else {
      renderProgress();
    }
  });
}
// checking authentication state and loading learner progress
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    allTasks = [];
    renderProgress();

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
            <span>Please sign in to view your progress.</span>
          </div>
        </div>
      `;
    }
    return;
  }

  await loadLearnerProgress(user);
});

