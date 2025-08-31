import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAekCu-kTFwWcxT0UPy58nXlt8ZNA0VsLI",
  authDomain: "grape-mcps.firebaseapp.com",
  projectId: "grape-mcps",
  storageBucket: "grape-mcps.firebasestorage.app",
  messagingSenderId: "909399056268",
  appId: "1:909399056268:web:3ac13a43d1e1846649c0a9"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elements
const welcome = document.getElementById("welcome");
const apList = document.getElementById("ap-list");

const settingsModal = document.getElementById("settingsModal");
const reselectModal = document.getElementById("reselectModal");
const reselectForm = document.getElementById("reselectForm");

const settingsBtn = document.getElementById("settingsBtn");
const logoutBtn = document.getElementById("logoutBtn");
const closeSettings = document.getElementById("closeSettings");
const reselectBtn = document.getElementById("reselectBtn");
const saveReselect = document.getElementById("saveReselect");
const closeReselect = document.getElementById("closeReselect");

// Shortened AP courses list
const apCourses = {
  "AP Biology": ["Unit 1: Chemistry of Life", "Unit 2: Cell Structure", "Unit 3: Genetics"],
  "AP Calculus AB": ["Unit 1: Limits", "Unit 2: Differentiation", "Unit 3: Integration"],
  "AP English Literature": ["Unit 1: Poetry", "Unit 2: Short Fiction", "Unit 3: Drama"],
  "AP US History": ["Unit 1: Colonial Period", "Unit 2: Revolution", "Unit 3: Civil War"],
  "AP Latin": ["Unit 1: Vergil, Aeneid Book 1", "Unit 2: Vergil, Aeneid Book 2"]
};

// Current user
let currentUser = null;
let currentUserDoc = null;

// Helper to create element
function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
}

// Render AP courses
function renderAPCourses(courses) {
  apList.innerHTML = "";
  Object.keys(courses).forEach(courseName => {
    const courseBtn = createEl(
      "button",
      "bg-purple-600 text-white p-4 rounded-xl shadow w-64 hover:bg-purple-700 mb-2",
      courseName
    );
    apList.appendChild(courseBtn);

    // Units container
    const unitsDiv = createEl("div", "ml-4 mb-4 hidden");
    apList.appendChild(unitsDiv);

    courseBtn.addEventListener("click", () => {
      unitsDiv.classList.toggle("hidden");
      unitsDiv.innerHTML = "";
      courses[courseName].forEach(unit => {
        const unitBtn = createEl(
          "button",
          "bg-purple-200 text-purple-700 py-2 px-3 rounded mb-1 w-full text-left hover:bg-purple-300",
          unit
        );
        unitsDiv.appendChild(unitBtn);

        // Checkmark if passed
        const passedSpan = createEl("span", "ml-2 text-green-600 font-bold");
        unitBtn.appendChild(passedSpan);
        if (currentUserDoc?.progress?.[courseName]?.[unit]?.passed) passedSpan.textContent = "✅";

        // Unit click → open quiz
        unitBtn.addEventListener("click", () => openUnitQuiz(courseName, unit, passedSpan));
      });

      // Add Final Exam button
      const finalBtn = createEl(
        "button",
        "bg-purple-400 text-white py-2 px-3 rounded w-full mt-2 hover:bg-purple-500",
        "Final Exam"
      );
      unitsDiv.appendChild(finalBtn);
      const finalCheck = createEl("span", "ml-2 text-green-600 font-bold");
      finalBtn.appendChild(finalCheck);
      if (currentUserDoc?.finalExams?.[courseName]?.passed) finalCheck.textContent = "✅";

      finalBtn.addEventListener("click", () => openFinalExam(courseName, finalCheck));
    });
  });
}

// Settings modal
settingsBtn.addEventListener("click", () => settingsModal.classList.remove("hidden"));
closeSettings.addEventListener("click", () => settingsModal.classList.add("hidden"));
reselectBtn.addEventListener("click", () => {
  settingsModal.classList.add("hidden");
  reselectModal.classList.remove("hidden");
  populateReselect();
});
closeReselect.addEventListener("click", () => reselectModal.classList.add("hidden"));
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});
saveReselect.addEventListener("click", saveReselectCourses);

// Populate Reselect
function populateReselect() {
  reselectForm.innerHTML = "";
  Object.keys(apCourses).forEach(course => {
    const label = createEl("label", "flex items-center mb-2 cursor-pointer bg-white p-2 rounded shadow hover:bg-purple-100");
    const checked = currentUserDoc?.apCourses?.includes(course) ? "checked" : "";
    label.innerHTML = `<input type="checkbox" name="apCourses" value="${course}" class="mr-2" ${checked}><span class="text-purple-700 font-semibold">${course}</span>`;
    reselectForm.appendChild(label);
  });
}

// Save reselect
async function saveReselectCourses() {
  const selected = [...document.querySelectorAll('input[name="apCourses"]:checked')].map(el => el.value);
  const userRef = doc(db, "users", currentUser.uid);
  await setDoc(userRef, { apCourses: selected }, { merge: true });
  currentUserDoc.apCourses = selected;
  renderAPCourses(apCourses);
  reselectModal.classList.add("hidden");
}

// ---------------- Gemini AI Integration ----------------

async function generateQuiz(course, unit, isFinal = false) {
  // Placeholder: return dummy questions
  return [
    { question: "Sample Q1", choices: ["A","B","C"], correct:"A", type:"mcq", explanation:"Explanation" },
    { question: "Sample Q2", choices: ["A","B","C"], correct:"B", type:"mcq", explanation:"Explanation" }
  ];
}

// ---------------- Unit Quiz Modal ----------------

async function openUnitQuiz(course, unit, passedSpan) {
  const quizQuestions = await generateQuiz(course, unit);
  await showQuizModal(course, unit, quizQuestions, passedSpan, false);
}

async function openFinalExam(course, finalCheck) {
  const quizQuestions = await generateQuiz(course, "Final Exam", true);
  await showQuizModal(course, "Final Exam", quizQuestions, finalCheck, true);
}

async function showQuizModal(course, unit, questions, checkSpan, isFinal) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg">
      <h2 class="text-xl font-bold text-purple-700 mb-4">${course} - ${unit} Quiz</h2>
      <div id="quizContent"></div>
      <button id="closeQuiz" class="mt-4 w-full bg-gray-200 text-purple-700 py-2 rounded hover:bg-gray-300">Close</button>
    </div>
  `;
  document.body.appendChild(modal);
  const quizContent = modal.querySelector("#quizContent");
  const closeBtn = modal.querySelector("#closeQuiz");
  closeBtn.addEventListener("click", () => modal.remove());

  questions.forEach(q => {
    const qDiv = createEl("div", "mb-4 p-3 border rounded");
    qDiv.innerHTML = `<p class="font-semibold">${q.question}</p>`;
    quizContent.appendChild(qDiv);
  });

  checkSpan.textContent = "✅"; // mark passed
}

// ---------------- Auth ----------------
onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);
    currentUserDoc = docSnap.exists() ? docSnap.data() : { apCourses: [] };
    welcome.textContent = `Welcome, ${user.displayName || "Student"}!`;
    renderAPCourses(apCourses);
  } else {
    window.location.href = "index.html";
  }
});
