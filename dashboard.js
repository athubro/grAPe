import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
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

const welcome = document.getElementById("welcome");
const apList = document.getElementById("ap-list");

// Modals
const settingsModal = document.getElementById("settingsModal");
const reselectModal = document.getElementById("reselectModal");
const reselectForm = document.getElementById("reselectForm");

const settingsBtn = document.getElementById("settingsBtn");
const logoutBtn = document.getElementById("logoutBtn");
const closeSettings = document.getElementById("closeSettings");
const reselectBtn = document.getElementById("reselectBtn");

const saveReselect = document.getElementById("saveReselect");
const closeReselect = document.getElementById("closeReselect");

// AP courses list
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

let currentUser = null;
let currentUserDoc = null;

// Display AP courses
function renderAPCourses(courses) {
  apList.innerHTML = "";
  courses.forEach(course => {
    const card = document.createElement("div");
    card.className = "bg-purple-600 text-white p-4 rounded-xl shadow hover:bg-purple-700 transition";
    card.textContent = course;
    apList.appendChild(card);
  });
}

// Open settings modal
settingsBtn.addEventListener("click", () => settingsModal.classList.remove("hidden"));
closeSettings.addEventListener("click", () => settingsModal.classList.add("hidden"));

// Open reselect modal
reselectBtn.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
  reselectModal.classList.remove("hidden");

  // Populate reselect form
  reselectForm.innerHTML = "";
  apCourses.forEach(course => {
    const label = document.createElement("label");
    label.className = "bg-white p-2 rounded-xl shadow hover:bg-purple-100 cursor-pointer flex items-center";
    const checked = currentUserDoc.apCourses.includes(course) ? "checked" : "";
    label.innerHTML = `<input type="checkbox" name="apCourses" value="${course}" class="mr-2" ${checked}>
                       <span class="text-purple-700 font-semibold">${course}</span>`;
    reselectForm.appendChild(label);
  });
});

// Close reselect modal
closeReselect.addEventListener("click", () => reselectModal.classList.add("hidden"));

// Save reselect
saveReselect.addEventListener("click", async () => {
  const selected = [...document.querySelectorAll('input[name="apCourses"]:checked')].map(el => el.value);
  const userRef = doc(db, "users", currentUser.uid);
  await setDoc(userRef, { apCourses: selected }, { merge: true });
  currentUserDoc.apCourses = selected; // update local copy
  renderAPCourses(selected);
  reselectModal.classList.add("hidden");
});

// Log out
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.removeItem("username");
  window.location.href = "index.html";
});

// Auth listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      currentUserDoc = userSnap.data();

      // Set welcome name
      let username = localStorage.getItem("username");
      if (!username) username = user.email.split("@")[0];
      welcome.textContent = `Welcome to your dashboard, ${username}`;

      // Display AP courses
      if (currentUserDoc.apCourses && currentUserDoc.apCourses.length > 0) {
        renderAPCourses(currentUserDoc.apCourses);
      } else {
        apList.innerHTML = "<p class='text-purple-700'>No AP courses selected.</p>";
      }
    }
  }
});
