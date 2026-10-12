// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA0JtnG9S_aENZ4y9mWTHKXKGGkIOoNXCY",
  authDomain: "skills-track-364b2.firebaseapp.com",
  databaseURL: "https://skills-track-364b2-default-rtdb.firebaseio.com",
  projectId: "skills-track-364b2",
  storageBucket: "skills-track-364b2.firebasestorage.app",
  messagingSenderId: "576489522201",
  appId: "1:576489522201:web:d465e8a633367410881688",
  measurementId: "G-8ESJQTZKZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);