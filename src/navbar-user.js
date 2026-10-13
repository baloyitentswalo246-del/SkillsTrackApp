import { auth } from "../firebase.config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const USER_TEXT_SELECTORS = [
  "#learner-text",
  "#current-user-name",
  ".learner-text",
  ".current-user-name"
];

function getDisplayName(user) {
  if (!user) return "Guest";

  if (user.displayName && user.displayName.trim()) {
    return user.displayName.trim();
  }

  if (user.email && user.email.trim()) {
    return user.email.split("@")[0];
  }

  return "User";
}

function updateNavbarUser(user) {
  const displayName = getDisplayName(user);

  USER_TEXT_SELECTORS.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((element) => {
      if (element) {
        element.textContent = displayName;
      }
    });
  });
}

async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }

  const currentPath = window.location.pathname || "";
  const targetPath = currentPath.includes("/src/") ? "../src/index.html" : "src/index.html";
  window.location.href = targetPath;
}

window.logoutUser = logoutUser;

function ensureLogoutButton() {
  const existingButton = document.querySelector(".logout-pill, .logout-btn, [data-logout-button]");
  if (existingButton) {
    existingButton.dataset.logoutButton = "true";
    existingButton.removeEventListener("click", logoutUser);
    existingButton.addEventListener("click", logoutUser);
    return;
  }

  const targetContainer = document.querySelector(".navbar-content") || document.querySelector(".user-panel") || document.querySelector(".topbar") || document.querySelector("main");
  if (!targetContainer) return;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "logout-pill";
  button.dataset.logoutButton = "true";
  button.setAttribute("aria-label", "Logout");
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
    </svg>
    Logout
  `;
  button.addEventListener("click", logoutUser);

  if (targetContainer.classList && targetContainer.classList.contains("user-panel")) {
    targetContainer.insertAdjacentElement("afterend", button);
  } else if (targetContainer.classList && targetContainer.classList.contains("topbar")) {
    targetContainer.insertAdjacentElement("afterend", button);
  } else if (targetContainer.classList && targetContainer.classList.contains("navbar-content")) {
    targetContainer.appendChild(button);
  } else {
    targetContainer.appendChild(button);
  }
}

onAuthStateChanged(auth, (user) => {
  updateNavbarUser(user);
  if (user) {
    ensureLogoutButton();
  }
});

document.addEventListener("DOMContentLoaded", ensureLogoutButton);
