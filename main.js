// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  setPersistence, 
  browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";

// Firebase config
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

// ✅ Force persistence to LOCAL so user stays signed in across tabs & reloads
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Persistence set to LOCAL (user stays signed in).");
  })
  .catch((error) => {
    console.error("Persistence error:", error);
  });

// Run after DOM loads
document.addEventListener("DOMContentLoaded", () => {
  // Email login
  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "dashboard.html";
      } catch (error) {
        alert(error.message);
      }
    });
  }

  // Google login
  const googleLogin = document.getElementById("googleLogin");
  if (googleLogin) {
    googleLogin.addEventListener("click", async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        // Check if new user → go to AP selection, otherwise dashboard
        if (auth.currentUser.metadata.creationTime === auth.currentUser.metadata.lastSignInTime) {
          window.location.href = "ap-selection.html";
        } else {
          window.location.href = "dashboard.html";
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }
});
