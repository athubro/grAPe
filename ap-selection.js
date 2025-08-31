import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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

const apCourses = [
  "AP Art History", "AP Biology", "AP Calculus AB", "AP Calculus BC", "AP Chemistry",
  "AP Chinese Language and Culture", "AP Comparative Government and Politics", "AP Computer Science A",
  "AP Computer Science Principles", "AP Drawing", "AP English Language and Composition",
  "AP English Literature and Composition", "AP Environmental Science", "AP European History",
  "AP French Language and Culture", "AP German Language and Culture", "AP Human Geography",
  "AP Italian Language and Culture", "AP Japanese Language and Culture", "AP Latin",
  "AP Macroeconomics", "AP Microeconomics", "AP Music Theory", "AP Physics 1", "AP Physics 2",
  "AP Physics C: Electricity and Magnetism", "AP Physics C: Mechanics", "AP Psychology",
  "AP Research", "AP Seminar", "AP Spanish Language and Culture", "AP Spanish Literature and Culture",
  "AP Statistics", "AP Studio Art 2-D Design", "AP Studio Art 3-D Design", "AP U.S. Government and Politics",
  "AP United States History", "AP World History: Modern", "AP Capstone Diploma Program"
];

// Populate form
const apListDiv = document.getElementById("ap-list");
apCourses.forEach(course => {
  const id = course.replace(/\s+/g, "_");
  apListDiv.innerHTML += `
    <label>
      <input type="checkbox" value="${course}" id="${id}"> ${course}
    </label>
  `;
});

// Handle submit
document.getElementById("apForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const selected = [];
  document.querySelectorAll("input[type=checkbox]:checked").forEach(cb => selected.push(cb.value));

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { apCourses: selected });
      window.location.href = "dashboard.html";
    }
  });
});
