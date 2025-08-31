// ========================= Firebase (CDN v11) =========================
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// --- Your Firebase project ---
const firebaseConfig = {
  apiKey: "AIzaSyAekCu-kTFwWcxT0UPy58nXlt8ZNA0VsLI",
  authDomain: "grape-mcps.firebaseapp.com",
  projectId: "grape-mcps",
  storageBucket: "grape-mcps.firebasestorage.app",
  messagingSenderId: "909399056268",
  appId: "1:909399056268:web:3ac13a43d1e1846649c0a9"
};

// Initialize only once
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ========================= Gemini API Setup =========================
// WARNING: for demo only. In production, proxy from your server to keep keys secret.
const GEMINI_API_KEY = "AIzaSyAekCu-kTFwWcxT0UPy58nXlt8ZNA0VsLI"; // <-- replace or move server-side
const GEMINI_MODEL = "gemini-1.5-flash"; // fast & cheap, supports JSON schema
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// Unified JSON generator with response schema
async function geminiJSON(prompt, schema) {
  const body = {
    contents: [{ role: "user", parts: [{ text: prompt }]}],
    generationConfig: {
      response_mime_type: "application/json",
      response_schema: schema
    }
  };
  const res = await fetch(GEMINI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini error: ${res.status} ${t}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No JSON text returned by Gemini");
  try {
    return JSON.parse(text);
  } catch (e) {
    // Sometimes it returns already-parsed objects; fallback
    return typeof text === "string" ? JSON.parse(text) : text;
  }
}

// Generate a quiz (5 Qs for unit, 20 for final)
async function generateQuiz(course, unit, isFinal = false) {
  const count = isFinal ? 20 : 5;
  const mcqs = isFinal ? 16 : 3; // leave room for source + open
  const schema = {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["mcq", "source", "open"] },
            question: { type: "string" },
            source: { type: "string" },
            choices: { type: "array", items: { type: "string" } },
            correct: { type: "string" },
            explanation: { type: "string" },
            rubric: { type: "string" }
          },
          required: ["type", "question"]
        }
      }
    },
    required: ["questions"]
  };

  const prompt = `
You are generating exam-quality questions like AP ${course}.
Topic: ${unit}.
Make ${count} questions. If not final: exactly 3 standard MCQs, 1 source-analysis MCQ (provide a short primary/secondary source excerpt in "source"), and 1 open-response.
If final: 20 questions total—mix of 16 MCQs (at least 2 source-analysis MCQs) and 4 open-response.
For every MCQ and source-analysis MCQ:
- Provide "choices" (exactly 4 strings), "correct" (must be exactly one of the choices), and a brief "explanation".
For every open-response:
- Provide a concise "rubric" describing what a correct answer must include.

Output strictly as JSON matching the schema.
No extra prose—only valid JSON.
`;

  const { questions } = await geminiJSON(prompt, schema);
  return questions;
}

// Evaluate an open response
async function gradeOpenResponse(course, unit, question, rubric, userAnswer) {
  const schema = {
    type: "object",
    properties: {
      pass: { type: "boolean" },
      feedback: { type: "string" }
    },
    required: ["pass", "feedback"]
  };

  const prompt = `
Course: ${course}
Unit: ${unit}
Open-response question: ${question}
Rubric: ${rubric}

Student answer:
${userAnswer}

Decide pass/fail (true/false) according to the rubric, and give a short explanation why.
Output JSON only.
`;
  return await geminiJSON(prompt, schema);
}

// ========================= Minimal AP Units (extend as needed) =========================
// Keep this list manageable in code. You can add all courses later—logic won't change.
const apCourses = {
  "AP Biology": [
    "Unit 1: Chemistry of Life",
    "Unit 2: Cell Structure and Function",
    "Unit 3: Cellular Energetics",
    "Unit 4: Cell Communication and Cell Cycle",
    "Unit 5: Heredity",
    "Unit 6: Gene Expression and Regulation",
    "Unit 7: Natural Selection",
    "Unit 8: Ecology"
  ],
  "AP Calculus AB": [
    "Unit 1: Limits and Continuity",
    "Unit 2: Differentiation: Definition and Fundamental Properties",
    "Unit 3: Differentiation: Composite, Implicit, and Inverse Functions",
    "Unit 4: Contextual Applications of Differentiation",
    "Unit 5: Analytical Applications of Differentiation",
    "Unit 6: Integration and Accumulation of Change",
    "Unit 7: Differential Equations",
    "Unit 8: Applications of Integration"
  ],
  "AP Chemistry": [
    "Unit 1: Atomic Structure and Properties",
    "Unit 2: Molecular and Ionic Bonding",
    "Unit 3: Intermolecular Forces and Properties",
    "Unit 4: Chemical Reactions",
    "Unit 5: Kinetics",
    "Unit 6: Thermodynamics",
    "Unit 7: Equilibrium",
    "Unit 8: Acids and Bases",
    "Unit 9: Applications of Thermodynamics"
  ],
  "AP Physics 1": [
    "Unit 1: Kinematics",
    "Unit 2: Dynamics",
    "Unit 3: Circular Motion and Gravitation",
    "Unit 4: Energy",
    "Unit 5: Momentum",
    "Unit 6: Simple Harmonic Motion",
    "Unit 7: Torque and Rotational Motion"
  ],
  "AP Statistics": [
    "Unit 1: Exploring One-Variable Data",
    "Unit 2: Exploring Two-Variable Data",
    "Unit 3: Collecting Data",
    "Unit 4: Probability, Random Variables, and Probability Distributions",
    "Unit 5: Sampling Distributions",
    "Unit 6: Inference for Categorical Data: Proportions",
    "Unit 7: Inference for Quantitative Data: Means",
    "Unit 8: Inference for Categorical Data: Chi-Square",
    "Unit 9: Inference for Quantitative Data: Slopes"
  ]
};

// ========================= DOM Elements =========================
const welcome = document.getElementById("welcome");          // h1
const apList = document.getElementById("ap-list");           // grid
const settingsBtn = document.getElementById("settingsBtn");
const settingsModal = document.getElementById("settingsModal");
const closeSettings = document.getElementById("closeSettings");
const logoutBtn = document.getElementById("logoutBtn");

const reselectBtn = document.getElementById("reselectBtn");
const reselectModal = document.getElementById("reselectModal");
const reselectForm = document.getElementById("reselectForm");
const saveReselect = document.getElementById("saveReselect");
const closeReselect = document.getElementById("closeReselect");

// ========================= Helpers =========================
function createEl(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}
function nameFromEmail(email) {
  return (email || "Student").split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
}

// Render just the user's selected courses
function renderAPCoursesForUser(selected, progressDoc = {}) {
  apList.innerHTML = "";

  if (!selected || selected.length === 0) {
    const note = createEl("div", "text-purple-600 text-center mt-6", "No courses selected yet. Open settings → Reselect AP Courses.");
    apList.appendChild(note);
    return;
  }

  selected.forEach(courseName => {
    const units = apCourses[courseName];
    if (!units) return;

    const courseBtn = createEl(
      "button",
      "bg-purple-600 text-white p-4 rounded-xl shadow w-64 hover:bg-purple-700 mb-2",
      courseName
    );
    apList.appendChild(courseBtn);

    const unitsDiv = createEl("div", "ml-2 mb-4 hidden w-full max-w-lg");
    apList.appendChild(unitsDiv);

    courseBtn.addEventListener("click", () => {
      unitsDiv.classList.toggle("hidden");
      unitsDiv.innerHTML = "";

      units.forEach(unit => {
        const row = createEl("div", "flex items-center gap-2 mb-2");
        const unitBtn = createEl(
          "button",
          "bg-purple-200 text-purple-700 py-2 px-3 rounded text-left hover:bg-purple-300 flex-1",
          unit
        );
        const check = createEl("span", "text-green-600 font-bold ml-1");
        if (progressDoc?.[courseName]?.[unit]?.passed) check.textContent = "✅";

        unitBtn.addEventListener("click", () => openUnitQuiz(courseName, unit, check));
        row.appendChild(unitBtn);
        row.appendChild(check);
        unitsDiv.appendChild(row);
      });

      // Final Exam
      const finalRow = createEl("div", "flex items-center gap-2 mt-2");
      const finalBtn = createEl(
        "button",
        "bg-purple-500 text-white py-2 px-3 rounded hover:bg-purple-600 flex-1",
        "Final Exam"
      );
      const finalCheck = createEl("span", "text-green-600 font-bold ml-1");
      finalRow.appendChild(finalBtn);
      finalRow.appendChild(finalCheck);
      unitsDiv.appendChild(finalRow);

      finalBtn.addEventListener("click", () => openFinalExam(courseName, finalCheck));
    });
  });
}

// ========================= Modals: Settings / Reselect =========================
function openSettings() { settingsModal.classList.remove("hidden"); }
function closeSettingsModal() { settingsModal.classList.add("hidden"); }
function openReselect() {
  settingsModal.classList.add("hidden");
  reselectModal.classList.remove("hidden");
}
function closeReselectModal() { reselectModal.classList.add("hidden"); }

function populateReselectForm(selected = []) {
  reselectForm.innerHTML = "";
  Object.keys(apCourses).forEach(course => {
    const label = createEl("label", "flex items-center mb-2 cursor-pointer bg-white p-2 rounded shadow hover:bg-purple-100");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = course;
    input.name = "apCourses";
    input.className = "mr-2 course-checkbox";
    if (selected.includes(course)) input.checked = true;
    const span = createEl("span", "text-purple-700 font-semibold", course);
    label.appendChild(input);
    label.appendChild(span);
    reselectForm.appendChild(label);
  });
}

// ========================= Quiz Modal / Flow =========================
async function openUnitQuiz(course, unit, checkSpan) {
  try {
    const qs = await generateQuiz(course, unit, false);
    await showQuizModal(course, unit, qs, 5, 5, checkSpan, false);
  } catch (e) {
    alert("Could not generate quiz. Check your AI key or try again.");
    console.error(e);
  }
}

async function openFinalExam(course, checkSpan) {
  try {
    const qs = await generateQuiz(course, "Final Exam", true);
    await showQuizModal(course, "Final Exam", qs, 20, 18, checkSpan, true);
  } catch (e) {
    alert("Could not generate final exam. Check your AI key or try again.");
    console.error(e);
  }
}

async function showQuizModal(course, unit, questions, totalCount, passThreshold, checkSpan, isFinal) {
  const modal = document.createElement("div");
  modal.className = "fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50";
  modal.innerHTML = `
    <div class="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg">
      <h2 class="text-xl font-bold text-purple-700 mb-4">${course} — ${unit} Quiz</h2>
      <div id="quizContent" class="space-y-4"></div>
      <div id="quizFooter" class="mt-4 flex items-center justify-between">
        <div class="text-sm text-purple-700" id="quizProgress">0 / ${totalCount}</div>
        <button id="closeQuiz" class="bg-gray-200 text-purple-700 py-2 px-4 rounded hover:bg-gray-300">Close</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const quizContent = modal.querySelector("#quizContent");
  const quizProgress = modal.querySelector("#quizProgress");
  const closeBtn = modal.querySelector("#closeQuiz");
  closeBtn.addEventListener("click", () => modal.remove());

  let index = 0;
  let score = 0;

  async function renderNext() {
    quizContent.innerHTML = "";
    quizProgress.textContent = `${index} / ${totalCount}`;
    if (index >= questions.length) {
      // Done
      const passed = score >= passThreshold;
      const result = createEl("div", "p-4 rounded bg-purple-50");
      result.innerHTML = `
        <div class="text-lg font-semibold ${passed ? "text-green-700" : "text-red-700"}">
          ${passed ? "Passed!" : "Try again"} — Score: ${score}/${totalCount}
        </div>
      `;
      quizContent.appendChild(result);

      // Save progress
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "users", user.uid);
          if (isFinal) {
            await setDoc(userRef, { finalExams: { [course]: { passed, score } } }, { merge: true });
            if (passed && checkSpan) checkSpan.textContent = "✅";
          } else {
            await setDoc(userRef, { progress: { [course]: { [unit]: { passed, score } } } }, { merge: true });
            if (passed && checkSpan) checkSpan.textContent = "✅";
          }
        }
      } catch (e) {
        console.warn("Failed to save progress", e);
      }
      return;
    }

    const q = questions[index];
    const card = createEl("div", "p-4 border rounded");
    const qText = createEl("p", "font-semibold mb-2", q.question || "Question");
    card.appendChild(qText);

    if (q.type === "source" && q.source) {
      const src = createEl("pre", "bg-purple-50 p-3 rounded text-sm whitespace-pre-wrap mb-2", q.source);
      card.appendChild(src);
    }

    if (q.type === "mcq" || q.type === "source") {
      const choices = q.choices?.slice(0, 4) || [];
      const list = createEl("div", "space-y-2");
      choices.forEach(choice => {
        const btn = createEl("button", "w-full text-left border rounded p-2 hover:bg-purple-50", choice);
        btn.addEventListener("click", () => {
          if (choice === q.correct) {
            btn.classList.add("border-green-500");
            score++;
            index++;
            renderNext();
          } else {
            btn.classList.add("border-red-500");
            // Show AI explanation (already provided by Gemini in q.explanation)
            const exp = createEl("div", "mt-2 text-sm text-purple-800");
            exp.textContent = q.explanation
              ? `Explanation: ${q.explanation}`
              : `Correct answer: ${q.correct}`;
            card.appendChild(exp);
            // After showing explanation, move to next after short delay
            setTimeout(() => { index++; renderNext(); }, 1400);
          }
        });
        list.appendChild(btn);
      });
      card.appendChild(list);
    } else if (q.type === "open") {
      const ta = document.createElement("textarea");
      ta.className = "w-full border rounded p-2 h-28";
      ta.placeholder = "Type your response...";
      const submit = createEl("button", "mt-3 bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700", "Submit");
      const fb = createEl("div", "mt-2 text-sm");

      submit.addEventListener("click", async () => {
        submit.disabled = true;
        submit.textContent = "Grading…";
        try {
          const res = await gradeOpenResponse(course, unit, q.question, q.rubric || "Be correct and concise.", ta.value || "");
          if (res.pass) {
            fb.className = "mt-2 text-sm text-green-700";
            fb.textContent = "Accepted ✅";
            score++;
          } else {
            fb.className = "mt-2 text-sm text-red-700";
            fb.textContent = `Not accepted ❌ — ${res.feedback || "See rubric."}`;
          }
        } catch (e) {
          fb.className = "mt-2 text-sm text-red-700";
          fb.textContent = "Error grading answer.";
          console.error(e);
        } finally {
          card.appendChild(fb);
          setTimeout(() => { index++; renderNext(); }, 1400);
        }
      });

      card.appendChild(ta);
      card.appendChild(submit);
    } else {
      // Fallback as MCQ if type missing
      const msg = createEl("div", "text-sm text-purple-700", "Invalid question type; skipping.");
      card.appendChild(msg);
      setTimeout(() => { index++; renderNext(); }, 500);
    }

    quizContent.appendChild(card);
  }

  renderNext();
}

// ========================= Auth Flow (Old-Style: single listener) =========================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Not logged in — go back to login
    window.location.href = "index.html";
    return;
  }

  // Set welcome name
  welcome.textContent = `Welcome, ${user.displayName || nameFromEmail(user.email)}`;

  // Load/create user doc
  const userRef = doc(db, "users", user.uid);
  let snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, { apCourses: [], progress: {}, finalExams: {} }, { merge: true });
    snap = await getDoc(userRef);
  }
  const userDoc = snap.data();

  // Render selected courses only
  renderAPCoursesForUser(userDoc.apCourses || [], userDoc.progress || {});

  // Settings / Reselect / Logout handlers
  settingsBtn?.addEventListener("click", openSettings);
  closeSettings?.addEventListener("click", closeSettingsModal);
  reselectBtn?.addEventListener("click", openReselect);
  closeReselect?.addEventListener("click", closeReselectModal);

  // Populate reselect modal with current selection
  populateReselectForm(userDoc.apCourses || []);

  // Save reselection
  saveReselect?.addEventListener("click", async () => {
    const userNow = auth.currentUser;
    if (!userNow) return alert("You must be logged in to save.");
    const selected = Array.from(document.querySelectorAll(".course-checkbox:checked")).map(cb => cb.value);
    await setDoc(userRef, { apCourses: selected }, { merge: true });
    populateReselectForm(selected);
    renderAPCoursesForUser(selected, userDoc.progress || {});
    reselectModal.classList.add("hidden");
  });

  // Logout
  logoutBtn?.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "index.html";
  });
});
