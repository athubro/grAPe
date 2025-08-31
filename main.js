// Firebase imports
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

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
const db = getFirestore(app);

// Elements
const loginForm = document.getElementById("loginForm");
const signupLink = document.getElementById("signupLink");
const googleLogin = document.getElementById("googleLogin");

// Login with email/password
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    alert(error.message);
  }
});

// Sign up new users
signupLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", userCred.user.uid), {
      apSelected: false,
      createdAt: new Date()
    });
  } catch (error) {
    alert(error.message);
  }
});

// Google Login
googleLogin.addEventListener("click", async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const userDoc = doc(db, "users", result.user.uid);
    const snap = await getDoc(userDoc);
    if (!snap.exists()) {
      await setDoc(userDoc, { apSelected: false, createdAt: new Date() });
    }
  } catch (error) {
    alert(error.message);
  }
});

// Route users after login
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists() && userDoc.data().apSelected) {
      window.location.href = "dashboard.html";
    } else {
      window.location.href = "ap-select.html";
    }
  }
});
