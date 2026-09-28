// Display options (usually done in HTML)
console.log("Choose Role to Sign in");
console.log("Learner");
console.log("Assessor");

// Learner Sign-in Button
document.getElementById("learnerBtn").addEventListener("click", function () {
    window.location.href = "learner-signin.html";
});

// Assessor Sign-in Button
document.getElementById("assessorBtn").addEventListener("click", function () {
    window.location.href = "assessor-signin.html";
});

// Register for Assessor Button
document.getElementById("registerAssessorBtn").addEventListener("click", function () {
    window.location.href = "assessor-registration.html";
});

// Register for Learner Button
document.getElementById("registerLearnerBtn").addEventListener("click", function () {
    window.location.href = "learner-registration.html";
});
