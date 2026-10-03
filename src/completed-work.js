import { auth, db } from "./firebase.js";

import {
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


async function getCompletedWork() {

    // Get the authenticated user's ID
    const user = auth.currentUser;

    if (!user) {
        alert("Please sign in first.");
        return;
    }

    const authenticatedUserID = user.uid;

    try {

        // Connect to Submissions collection
        const submissionsRef = collection(db, "Submissions");

        // Find completed work belonging to this learner
        const completedQuery = query(
            submissionsRef,
            where("LearnerID", "==", authenticatedUserID),
            where("Status", "==", "Completed")
        );

        // Retrieve records
        const snapshot = await getDocs(completedQuery);

        // Where we will display the completed work
        const completedWork = document.getElementById("completedWork");

        // Check if records exist
        if (!snapshot.empty) {

            completedWork.innerHTML = "";

            // FOR EACH Record
            snapshot.forEach(function(doc) {

                const record = doc.data();

                completedWork.innerHTML += `
                    <div class="work-record">

                        <h3>${record.TaskTitle}</h3>

                        <p>
                            Completion Date:
                            ${record.CompletionDate}
                        </p>

                        <p>
                            Status:
                            ${record.Status}
                        </p>

                    </div>
                `;

            });

        } else {

            // No records found
            completedWork.innerHTML =
                "<p>No completed work found</p>";
        }

    } catch (error) {

        console.log(error);
        alert("Unable to load completed work.");

    }
}


// Run the function
getCompletedWork();