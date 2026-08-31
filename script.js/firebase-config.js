import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
 
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "skillstrack-362c4.firebaseapp.com",
  databaseURL: "https://skillstrack-362c4-default-rtdb.firebaseio.com",
  projectId: "skillstrack-362c4",
};
 
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const DB_URL = firebaseConfig.databaseURL;
 
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
};
 
export async function getIdToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
}