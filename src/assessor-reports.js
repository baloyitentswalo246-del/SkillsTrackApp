
import { db } from "../firebase.config.js";

import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

window.toggleSidebar = function () {
  const sidebar = document.querySelector(".sidebar");
  const toggleBtn = document.getElementById("sidebar-toggle");

  if (!sidebar || !toggleBtn) return;

  const isCollapsed = sidebar.classList.toggle("is-collapsed");
  toggleBtn.classList.toggle("is-collapsed", isCollapsed);
  toggleBtn.setAttribute("aria-expanded", String(!isCollapsed));
};

const reportsContainer = document.getElementById("reportsContainer");
const reportsSearch = document.getElementById("reportsSearch");

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

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function renderReports() {
  if (!reportsContainer) return;

  const searchTerm = (reportsSearch?.value || "").trim().toLowerCase();

  const filteredTasks = allTasks.filter((task) => {
    const haystack = [
      task.learnerName,
      task.taskTitle,
      task.subject,
      task.status,
      task.submissionText,
      task.taskDescription,
      String(task.markPercentage ?? task.percentage ?? 0)
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(searchTerm);
  });

  if (!filteredTasks.length) {
    reportsContainer.innerHTML = `
      <div class="subject-card">
        <div class="subject-card-header">NO REPORT DATA</div>
        <div class="subject-row">
          <span class="subject-row-label">Status</span>
          <span>No marked learner work available.</span>
        </div>
      </div>
    `;
    return;
  }

  const groupedByLearner = new Map();

  filteredTasks.forEach((task) => {
    const learnerName = task.learnerName || "Unknown learner";

    if (!groupedByLearner.has(learnerName)) {
      groupedByLearner.set(learnerName, []);
    }

    groupedByLearner.get(learnerName).push(task);
  });

  reportsContainer.innerHTML = [...groupedByLearner.entries()]
    .map(([learnerName, tasks]) => {
      const totalTasks = tasks.length;
      const taskPercentages = tasks.map((task) => Number(task.markPercentage ?? task.percentage ?? task.grade ?? 0) || 0);
      const completedTasks = tasks.filter((task) => isCompletedStatus(task.status)).length;
      const inProgressTasks = tasks.filter((task) => isInProgressStatus(task.status)).length;
      const overallPercentage = totalTasks ? Math.round(taskPercentages.reduce((sum, value) => sum + value, 0) / totalTasks) : 0;

      const taskCards = tasks
        .map((task) => {
          const taskTitle = task.taskTitle || "Untitled task";
          const status = String(task.status || "Pending");
          const markPercentage = Math.min(100, Math.max(0, Number(task.markPercentage ?? task.percentage ?? task.grade ?? 0) || 0));
          const submissionText = task.submissionText || "No learner submission yet.";

          return `
            <div class="subject-card">
              <div class="subject-card-header">${escapeHtml(taskTitle).toUpperCase()}</div>
              <div class="subject-row">
                <span class="subject-row-label">Learner</span>
                <span>${escapeHtml(learnerName)}</span>
              </div>
              <div class="subject-row">
                <span class="subject-row-label">Due Date</span>
                <span>${formatDate(task.dueDate)}</span>
              </div>
              <div class="subject-row">
                <span class="subject-row-label">Status</span>
                <span class="tag-pill ${status.toLowerCase() === "completed" || status.toLowerCase() === "submitted" ? "total" : ""}">${status}</span>
              </div>
              <div class="subject-row">
                <span class="subject-row-label">Grade</span>
                <span class="tag-pill total">${markPercentage}%</span>
              </div>
              <div class="subject-row" style="display:block;">
                <span class="subject-row-label" style="display:block; margin-bottom:8px;">Submitted work</span>
                <span>${escapeHtml(submissionText)}</span>
              </div>
            </div>
          `;
        })
        .join("");

      return `
        <div class="subject-card">
          <div class="subject-card-header">${escapeHtml(learnerName).toUpperCase()} REPORT</div>
          <div class="subject-row">
            <span class="subject-row-label">Total Tasks</span>
            <span>${totalTasks}</span>
          </div>
          <div class="subject-row">
            <span class="subject-row-label">In Progress</span>
            <span>${inProgressTasks}</span>
          </div>
          <div class="subject-row">
            <span class="subject-row-label">Completed</span>
            <span>${completedTasks}</span>
          </div>
          <div class="subject-row">
            <span class="subject-row-label">Progress</span>
            <span class="tag-pill total">${overallPercentage}%</span>
          </div>
        </div>
        ${taskCards}
      `;
    })
    .join("");
}

async function loadReports() {
  try {
    const params = new URLSearchParams(window.location.search);
    const learnerFilter = params.get("learnerId");

    let taskQuery;

    if (learnerFilter) {
      taskQuery = query(
        collection(db, "LearnerTasks"),
        where("learnerUid", "==", learnerFilter)
      );
    } else {
      taskQuery = collection(db, "LearnerTasks");
    }

    const snapshot = await getDocs(taskQuery);

    allTasks = snapshot.docs
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

    renderReports();
  } catch (error) {
    console.error("Error loading reports:", error);

    if (reportsContainer) {
      reportsContainer.innerHTML = `
        <div class="subject-card">
          <div class="subject-card-header">REPORTS LOAD FAILED</div>
          <div class="subject-row">
            <span class="subject-row-label">Status</span>
            <span>Unable to fetch learner task reports.</span>
          </div>
        </div>
      `;
    }
  }
}

if (reportsSearch) {
  reportsSearch.addEventListener("input", renderReports);
}

loadReports();

