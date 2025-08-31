import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const googleLoginBtn = document.getElementById("google-login");
const emailLoginBtn = document.getElementById("email-login");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

// Google Login
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      handleUser(result.user);
    } catch (error) {
      console.error(error.message);
    }
  });
}

// Email Login
if (emailLoginBtn) {
  emailLoginBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // if user doesn’t exist → create account
      if (error.code === "auth/user-not-found") {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        console.error(error.message);
      }
    }
  });
}

// Check auth state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    await handleUser(user);
  }
});

async function handleUser(user) {
  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    // User already exists → go to dashboard
    window.location.href = "dashboard.html";
  } else {
    // New user → send to AP selection page
    await setDoc(userRef, {
      email: user.email,
      apCourses: [], // store later after selection
      createdAt: new Date(),
    });
    window.location.href = "ap-selection.html";
  }
}
