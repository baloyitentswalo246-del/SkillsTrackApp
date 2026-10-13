import { auth, db } from "../firebase.config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
// elements
const outstandingCards = document.getElementById("outstandingCards");
const outstandingSearch = document.getElementById("outstandingSearch");
const refreshBtn = document.getElementById("refreshBtn");

let outstandingTasks = [];
// changing values into text and substituting special HTML characters
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
// formatting date values for display
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
// returning tasks that match the search query
function getVisibleTasks() {
  const queryText = (outstandingSearch?.value || "").trim().toLowerCase();

  return outstandingTasks.filter((task) => {
    const haystack = [
      task.taskTitle,
      task.taskDescription,
      task.subject,
      task.status,
      task.learnerName,
      task.submissionText
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(queryText);
  });
}
// rendering task cards
function renderCards() {
  if (!outstandingCards) return;

  const visibleTasks = getVisibleTasks();

  if (!visibleTasks.length) {
    outstandingCards.innerHTML = `
      <div class="subject-card">
        <div class="subject-card-header">NO OUTSTANDING TASKS</div>
        <div class="subject-row">
          <span class="subject-row-label">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Status
          </span>
          <span>No outstanding tasks right now.</span>
        </div>
      </div>
    `;
    return;
  }

  outstandingCards.innerHTML = visibleTasks
    .map((task) => {
      const taskTitle = task.taskTitle || "Untitled task";
      const status = task.status || "Pending";
      const submissionText = task.submissionText || "";

      return `
        <div class="subject-card" data-subject="${escapeHtml(taskTitle).toLowerCase()}">
          <div class="subject-card-header">${escapeHtml(taskTitle).toUpperCase()}</div>
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
            <span class="tag-pill ${status.toLowerCase() === "completed" ? "total" : ""}">${status}</span>
          </div>
          <div class="subject-row">
            <span class="subject-row-label">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Task
            </span>
            <span>${escapeHtml(task.taskDescription || "No description provided")}</span>
          </div>
          <div class="subject-row" style="display:block;">
            <label for="task-${task.id}" class="subject-row-label" style="display:block; margin-bottom:8px;">
              Your work
            </label>
            <textarea id="task-${task.id}" class="outstanding-textarea" data-task-id="${task.id}" rows="5" placeholder="Write your answer or notes for this task...">${escapeHtml(submissionText)}</textarea>
          </div>
          <div class="subject-row" style="justify-content:flex-end; gap:12px;">
            <button type="button" class="subject-action-btn task-save-btn" data-save-task="${task.id}">Save Draft</button>
            <button type="button" class="subject-action-btn task-submit-btn" data-submit-task="${task.id}">Submit</button>
          </div>
        </div>
      `;
    })
    .join("");

  const saveButtons = outstandingCards.querySelectorAll(".task-save-btn");
  const submitButtons = outstandingCards.querySelectorAll(".task-submit-btn");

  saveButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const taskId = button.dataset.saveTask;
      await saveTaskWork(taskId, false);
    });
  });

  submitButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const taskId = button.dataset.submitTask;
      await saveTaskWork(taskId, true);
    });
  });
}

async function saveTaskWork(taskId, submit) {
  const task = outstandingTasks.find((entry) => entry.id === taskId);

  if (!task) return;

  const textarea = outstandingCards.querySelector(`textarea[data-task-id="${taskId}"]`);
  const value = (textarea?.value || "").trim();

  try {
    const updateObject = {
      submissionText: value,
      updatedAt: serverTimestamp(),
      status: submit ? "Submitted" : value ? "In Progress" : "Pending"
    };

    if (submit) {
      updateObject.submittedAt = serverTimestamp();
    }

    await updateDoc(doc(db, "LearnerTasks", taskId), updateObject);

    const taskIndex = outstandingTasks.findIndex((entry) => entry.id === taskId);

    if (taskIndex >= 0) {
      const nextTask = { ...outstandingTasks[taskIndex], ...updateObject, submissionText: value };
      outstandingTasks[taskIndex] = nextTask;
    }

    if (submit) {
      outstandingTasks = outstandingTasks.filter((entry) => entry.id !== taskId);
    }

    renderCards();
  } catch (error) {
    console.error("Error updating task submission:", error);
    alert("Unable to save this task right now. Please try again.");
  }
}
// loading outstanding tasks from Firestore
async function loadOutstandingTasks(user) {
  try {
    const q = query(
      collection(db, "LearnerTasks"),
      where("learnerUid", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    outstandingTasks = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
      .filter((task) => {
        const status = String(task.status || "").toLowerCase();
        return status !== "completed" && status !== "submitted";
      })
      .sort((taskA, taskB) => {
        const a = taskA.dueDate || taskA.createdAt || 0;
        const b = taskB.dueDate || taskB.createdAt || 0;

        if (a && typeof a.toDate === "function" && b && typeof b.toDate === "function") {
          return a.toDate().getTime() - b.toDate().getTime();
        }

        return new Date(a).getTime() - new Date(b).getTime();
      });

    renderCards();
  } catch (error) {
    console.error("Error loading outstanding tasks:", error);

    if (outstandingCards) {
      outstandingCards.innerHTML = `
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
            <span>Unable to load outstanding work.</span>
          </div>
        </div>
      `;
    }
  }
}
// adding event listeners for search and refresh
if (outstandingSearch) {
  outstandingSearch.addEventListener("input", renderCards);
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", () => {
    if (auth.currentUser) {
      loadOutstandingTasks(auth.currentUser);
    } else {
      renderCards();
    }
  });
}
// checking authentication state and loading outstanding tasks
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    outstandingTasks = [];
    renderCards();

    if (outstandingCards) {
      outstandingCards.innerHTML = `
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
            <span>Please sign in to view your outstanding work.</span>
          </div>
        </div>
      `;
    }
    return;
  }

  await loadOutstandingTasks(user);
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
