import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db } from "../firebase.config.js";

const form = document.getElementById('loginForm');
const message = document.getElementById('message');

const email = document.getElementById('email');
const password = document.getElementById('password');

function showMessage(text, type) {
    message.textContent = text;
    message.classList.remove('success', 'error');
    message.classList.add(type);
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!email.value.trim() || !password.value) {
        showMessage('Email and password are required.', 'error');
        return;
    }

    try {
        const credential = await signInWithEmailAndPassword(auth, email.value.trim(), password.value);
        await setDoc(doc(db, "Assessors", credential.user.uid), { lastLogin: serverTimestamp() }, { merge: true });

        showMessage('Sign in successful!', 'success');
        window.location.href = "assessorDashboard.html";
    } catch (error) {
        console.error(error);
        showMessage(error.message || 'Sign in failed', 'error');
    }
});


