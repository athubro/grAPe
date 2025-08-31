// main.js
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();

// Make sure Firebase remembers login
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Persistence error:", error.message);
});

// ===== SIGN UP =====
document.getElementById("signup-btn")?.addEventListener("click", () => {
  const email = document.getElementById("signup-email").value;
  const password = document.getElementById("signup-password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User signed up:", userCredential.user);
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error("Signup error:", error.message);
      alert(error.message);
    });
});

// ===== LOGIN =====
document.getElementById("login-btn")?.addEventListener("click", () => {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("User logged in:", userCredential.user);
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      console.error("Login error:", error.message);
      alert(error.message);
    });
});

// ===== LOGOUT =====
document.getElementById("logout-btn")?.addEventListener("click", () => {
  signOut(auth).then(() => {
    console.log("User signed out");
    window.location.href = "index.html";
  });
});

// ===== AUTO REDIRECT IF ALREADY LOGGED IN =====
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User already signed in:", user.uid);
    if (window.location.pathname.includes("index.html") || window.location.pathname === "/") {
      window.location.href = "dashboard.html";
    }
  }
});
