// main.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdOUtoPjAHyXoxBJPJvAVsveMuPA2vUSQ",
  authDomain: "grape-mcps.firebaseapp.com",
  projectId: "grape-mcps",
  storageBucket: "grape-mcps.firebasestorage.app",
  messagingSenderId: "909399056268",
  appId: "1:909399056268:web:3ac13a43d1e1846649c0a9",
  measurementId: "G-X2DELV9RFD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  const googleBtn = document.getElementById("google-login");
  const emailBtn = document.getElementById("email-login");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  // Google login
  if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        handleUser(result.user);
      } catch (err) {
        console.error(err);
        alert(err.message);
      }
    });
  }

  // Email/password login
  if (emailBtn) {
    emailBtn.addEventListener("click", async () => {
      const email = emailInput.value;
      const password = passwordInput.value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (err) {
        // If user doesn’t exist → create account
        if (err.code === "auth/user-not-found") {
          try {
            await createUserWithEmailAndPassword(auth, email, password);
          } catch (createErr) {
            console.error(createErr);
            alert(createErr.message);
          }
        } else {
          console.error(err);
          alert(err.message);
        }
      }
    });
  }

  // Auth state listener
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      handleUser(user);
    }
  });
});

// Handle new/existing user
async function handleUser(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // User exists → go to dashboard
    window.location.href = "dashboard.html";
  } else {
    // New user → create document and go to AP selection
    await setDoc(userRef, {
      email: user.email,
      apCourses: [],
      createdAt: new Date(),
    });
    window.location.href = "ap-selection.html";
  }
}
