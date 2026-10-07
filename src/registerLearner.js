import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "../firebase.config.js";

const form = document.getElementById('registerForm');
const message = document.getElementById('message');
const registerBtn = document.getElementById("registerBtn");


if (!form || !message || !registerBtn) {
  throw new Error("Registration form elements are missing from the page.");
}

function validateRegistration({name, email, password}) {
  const errors = [];

  if (typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    errors.push("Please enter a valid email");
  }

  if (password.length < 6) {
    errors.push("Password must be 6 characters or more");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const data = {name, email, password};
  const validation = validateRegistration(data);

  if (!validation.valid) {
    message.textContent = validation.errors.join(" | ");
    return;
  }

  try {
    registerBtn.disabled = true;
    message.textContent = "Creating your account...";

    const [firstName, ...rest] = name.split(" ");
    const surname = rest.join(" ");

    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });

    await setDoc(doc(db, "Learners", credential.user.uid), {
      name: firstName,
      surname,
      email,
      registrationDate: serverTimestamp(),
      lastLogin: serverTimestamp(),
      progress: 0,
      role: "Learner",
      status: "Active",
    });

    message.textContent = "Registration successful!";
    window.location.href = "learner-signin.html";
  } catch (error) {
    console.error(error);
    message.textContent = error.message || "Registration failed";
  } finally {
    registerBtn.disabled = false;
  }
});
