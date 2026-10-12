// Client-side only setup (Auth + Firestore) so the app runs on the free Spark plan, no Cloud Functions/Blaze required.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGJN1dsIrlN-ppApHgwiONOrPrcE1rbec",
  authDomain: "skillstrackapp-e0a34.firebaseapp.com",
  projectId: "skillstrackapp-e0a34",
  storageBucket: "skillstrackapp-e0a34.firebasestorage.app",
  messagingSenderId: "373706968444",
  appId: "1:373706968444:web:7c5f61bf281a553cdde8f9",
  measurementId: "G-K9L5ENZDNH"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);