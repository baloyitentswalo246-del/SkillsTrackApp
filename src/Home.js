// Display options (usually done in HTML)
console.log("Choose Role to Sign in");
console.log("Learner");
console.log("Assessor");

// Wires a button id to a destination page, skipping pages that don't have the button.
function wireNav(buttonId, href) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    btn.addEventListener("click", function () {
        window.location.href = href;
    });
}

// Learner Sign-in Button
wireNav("learnerBtn", "learner-signin.html");

// Assessor Sign-in Button
wireNav("assessorBtn", "assessor-signin.html");

// Register for Assessor Button
wireNav("registerAssessorBtn", "assessor-registration.html");

// Register for Learner Button
wireNav("registerLearnerBtn", "registerLearner.html");
