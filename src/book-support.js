import { auth, db }
from "../firebase.config.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

window.toggleSidebar = function () {

    const sidebar =
        document.querySelector(".sidebar");

    const button =
        document.getElementById("sidebar-toggle");

    sidebar.classList.toggle("is-collapsed");

    button.classList.toggle("is-collapsed");
};

let assessorsMap = {};

async function loadAssessors() {

  const assessorSelect =
    document.getElementById("assessorSelect");

  try {

    const snapshot =
      await getDocs(
        collection(db, "Assessors")
      );

   snapshot.forEach(docSnap => {

  const assessor =
    docSnap.data();

 assessorsMap[docSnap.id] = assessor;
 
  const option =
    document.createElement("option");

  option.value =
    docSnap.id;

  option.textContent =
    `${assessor.name} ${assessor.surname}`;

  assessorSelect.appendChild(option);

});

  } catch (error) {

    console.error(
      "Error loading assessors:",
      error
    );

  }

}

loadAssessors();

async function loadMyBookings() {

  const user = auth.currentUser;

  if (!user) return;

  const tableBody =
    document.getElementById("myBookingsTableBody");

  try {

    const q = query(
      collection(db, "BookingSessions"),
      where("learnerUid", "==", user.uid)
    );

    const snapshot = await getDocs(q);

    console.log("My bookings found:", snapshot.size, "for uid:", user.uid);

    if (snapshot.empty) {

      tableBody.innerHTML =
        `<tr><td colspan="5">No bookings yet.</td></tr>`;

      return;

    }

    tableBody.innerHTML = "";

    snapshot.forEach(docSnap => {

      const booking = docSnap.data();

      const statusClass =
        `status-${(booking.status || "").toLowerCase()}`;

      tableBody.innerHTML += `
      <tr>
          <td>${booking.assessorName}</td>
          <td>${booking.sessionType}</td>
          <td>${booking.sessionDate}</td>
          <td>${booking.sessionTime}</td>
          <td><span class="${statusClass}">${booking.status}</span></td>
      </tr>
      `;

    });

  } catch (error) {

    console.error("Error loading my bookings:", error);

    tableBody.innerHTML =
      `<tr><td colspan="5">Error loading bookings: ${error.message}</td></tr>`;

  }

}

onAuthStateChanged(auth, user => {

  if (user) loadMyBookings();

});

const confirmBtn =
document.getElementById("confirmBtn");


const bookingMessage =
document.getElementById("bookingMessage");

confirmBtn.addEventListener("click", async () => {

  try {

    const user = auth.currentUser;

    if (!user) {

      bookingMessage.textContent =
      "Please sign in.";

      return;
    }

    const assessorSelect =
    document.getElementById("assessorSelect");


const selectedAssessor =
assessorsMap[
  assessorSelect.value
];

console.log(selectedAssessor);



    const sessionDate =
document.getElementById("sessionDate").value;

const sessionTime =
document.getElementById("sessionTime").value;

const sessionType =
document.getElementById("sessionType").value;

    const description =
    document
      .getElementById("bookingDescription")
      .value
      .trim();

console.log("Assessor:", assessorSelect.value);
console.log("Date:", sessionDate);
console.log("Time:", sessionTime);
console.log("Mode:", selectedMode);
console.log("Session Type:", sessionType);

    if (
  !sessionDate ||
  !sessionTime ||
  !sessionType ||
  !assessorSelect.value
) {

  bookingMessage.textContent =
  "Please complete all fields.";

  return;
}

    bookingMessage.textContent =
    "Saving booking...";

   await addDoc(
  collection(db, "BookingSessions"),
  {

   assessorUid:
assessorSelect.value,

assessorName:
`${selectedAssessor.name} ${selectedAssessor.surname}`,

    learnerUid: user.uid,

    learnerName:
      user.displayName,

    learnerEmail:
      user.email,

    assessorUid:
      assessorSelect.value,

    sessionDate,

    sessionTime,

    sessionType,

    sessionMode: selectedMode,

    description,

    status: "Pending",

    createdAt:
      serverTimestamp()

  }
);
    bookingMessage.textContent =
    "Booking submitted successfully.";

    loadMyBookings();

  } catch (error) {

    console.error(error);

    bookingMessage.textContent =
    error.message;

  }

});
let selectedMode = "";

document
  .querySelectorAll("#modeChips .chip")
  .forEach(chip => {

    chip.addEventListener("click", () => {

      document
        .querySelectorAll("#modeChips .chip")
        .forEach(btn =>
          btn.classList.remove("selected")
        );

      chip.classList.add("selected");

      selectedMode = chip.dataset.value;

      const message =
        document.getElementById(
          "modeSelectionMessage"
        );

      if (selectedMode === "Online") {

        message.textContent =
          "Online session selected. The assessor will contact you virtually.";

        message.className =
          "mode-selection-message mode-online";

      } else {

        message.textContent =
          "On-Site session selected. Please attend at campus.";

        message.className =
          "mode-selection-message mode-onsite";

      }

    });

  });

 