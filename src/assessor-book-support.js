import { auth, db }
from "../firebase.config.js";

import {
  onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp
}
from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

async function loadBookings() {

    const user = auth.currentUser;

    if (!user) return;

    const q = query(
        collection(db, "BookingSessions"),
        where(
            "assessorUid",
            "==",
            user.uid
        )
    );

    const snapshot =
        await getDocs(q);

    const tableBody =
        document.getElementById("bookingTableBody");

    tableBody.innerHTML = "";

    snapshot.forEach(docSnap => {

        const booking =
            docSnap.data();

        const statusClass =
            `status-${(booking.status || "").toLowerCase()}`;

        tableBody.innerHTML += `
        <tr>
            <td>${booking.learnerName}</td>
            <td>${booking.sessionType}</td>
            <td>${booking.sessionDate}</td>
            <td>${booking.sessionTime}</td>
            <td><span class="${statusClass}">${booking.status}</span></td>
            <td>
                <button
                    onclick="approveBooking('${docSnap.id}')">
                    Approve
                </button>

                <button
                    onclick="rejectBooking('${docSnap.id}')">
                    Reject
                </button>
            </td>
        </tr>
        `;

    });

}

async function updateBookingStatus(bookingId, status) {

    await updateDoc(
        doc(db, "BookingSessions", bookingId),
        {
            status,
            updatedAt: serverTimestamp()
        }
    );

    loadBookings();

}

// inline onclick handlers in the generated rows need these on the global scope
window.approveBooking = (bookingId) => updateBookingStatus(bookingId, "Approved");
window.rejectBooking = (bookingId) => updateBookingStatus(bookingId, "Rejected");

onAuthStateChanged(auth, user => {

    if (user) loadBookings();

});