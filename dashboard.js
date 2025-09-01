// ========================= Firebase (CDN v11) =========================
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

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
const GEMINI_API_KEY = "AIzaSyAekCu-kTFwWcxT0UPy58nXlt8ZNA0VsLI"; // move server-side in production
const GEMINI_MODEL = "gemini-1.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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
  if (!res.ok) throw new Error(`Gemini error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

async function generateQuiz(course, unit, isFinal = false) {
  const count = isFinal ? 20 : 5;
  const prompt = `
You are generating AP-style questions for ${course}, topic: ${unit}.
${isFinal ? "Make 20 questions (16 MCQ, at least 2 source-analysis, 4 open-response)." 
           : "Make 5 questions (3 MCQ, 1 source-analysis, 1 open-response)."}
For MCQs: include 4 choices, 'correct', and 'explanation'.
For open: include 'rubric'.
Output JSON only.
`;
  const schema = {
    type: "object",
    properties: {
      questions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string" },
            question: { type: "string" },
            source: { type: "string" },
            choices: { type: "array", items: { type: "string" } },
            correct: { type: "string" },
            explanation: { type: "string" },
            rubric: { type: "string" }
          }
        }
      }
    }
  };
  const { questions } = await geminiJSON(prompt, schema);
  return questions;
}

async function gradeOpenResponse(course, unit, question, rubric, userAnswer) {
  const schema = {
    type: "object",
    properties: {
      pass: { type: "boolean" },
      feedback: { type: "string" }
    }
  };
  const prompt = `
Course: ${course}
Unit: ${unit}
Question: ${question}
Rubric: ${rubric}

Student answer:
${userAnswer}

Decide pass/fail and give short feedback.
Output JSON.
`;
  return await geminiJSON(prompt, schema);
}

// ========================= AP Courses =========================
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
    "Unit 2: Differentiation",
    "Unit 3: Composite & Implicit Functions",
    "Unit 4: Applications of Differentiation",
    "Unit 5: Integration",
    "Unit 6: Differential Equations",
    "Unit 7: Applications of Integration"
  ]
  // Add more courses...
};

// ========================= DOM Elements =========================
const welcome = document.getElementById("welcome");
const apList = document.getElementById("ap-list");
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
  if (text) el.textContent = text;
  return el;
}
function nameFromEmail(email) {
  return (email || "Student").split("@")[0];
}

// Render user’s courses + units
function renderAPCoursesForUser(selected, progressDoc = {}) {
  apList.innerHTML = "";
  if (!selected || selected.length === 0) {
    apList.textContent = "No courses selected. Open settings.";
    return;
  }
  selected.forEach(courseName => {
    const units = apCourses[courseName];
    if (!units) return;
    const courseBtn = createEl("button","bg-purple-600 text-white p-3 rounded mb-2",courseName);
    apList.appendChild(courseBtn);

    const unitsDiv = createEl("div","hidden ml-4 mb-4");
    apList.appendChild(unitsDiv);

    courseBtn.addEventListener("click", () => {
      unitsDiv.classList.toggle("hidden");
      unitsDiv.innerHTML = "";
      units.forEach(unit => {
        const unitBtn = createEl("button","block bg-purple-200 rounded p-2 mb-1",unit);
        const check = createEl("span","ml-2 text-green-600");
        if (progressDoc?.[courseName]?.[unit]?.passed) check.textContent = "✅";
        unitBtn.addEventListener("click", () => openUnitQuiz(courseName, unit, check));
        unitsDiv.appendChild(unitBtn);
        unitsDiv.appendChild(check);
      });
      const finalBtn = createEl("button","block bg-purple-500 text-white rounded p-2 mt-2","Final Exam");
      const finalCheck = createEl("span","ml-2 text-green-600");
      finalBtn.addEventListener("click",()=>openFinalExam(courseName,finalCheck));
      unitsDiv.appendChild(finalBtn);
      unitsDiv.appendChild(finalCheck);
    });
  });
}

// ========================= Quiz Flow =========================
async function openUnitQuiz(course, unit, checkSpan) {
  const qs = await generateQuiz(course, unit, false);
  await showQuizModal(course, unit, qs, 5, 5, checkSpan, false);
}
async function openFinalExam(course, checkSpan) {
  const qs = await generateQuiz(course, "Final Exam", true);
  await showQuizModal(course, "Final Exam", qs, 20, 18, checkSpan, true);
}

async function showQuizModal(course, unit, questions, totalCount, passThreshold, checkSpan, isFinal) {
  const modal = document.createElement("div");
  modal.className="fixed inset-0 bg-black/50 flex items-center justify-center";
  modal.innerHTML=`
    <div class="bg-white p-6 rounded max-w-2xl w-full">
      <h2 class="font-bold mb-4">${course} — ${unit}</h2>
      <div id="quizContent"></div>
      <button id="closeQuiz" class="mt-4 bg-gray-200 px-3 py-1 rounded">Close</button>
    </div>`;
  document.body.appendChild(modal);
  const quizContent = modal.querySelector("#quizContent");
  modal.querySelector("#closeQuiz").onclick=()=>modal.remove();

  let index=0, score=0;
  async function renderNext(){
    quizContent.innerHTML="";
    if(index>=questions.length){
      const passed=score>=passThreshold;
      quizContent.textContent=`${passed?"Passed":"Try again"} — ${score}/${totalCount}`;
      const user=auth.currentUser;
      if(user){
        const ref=doc(db,"users",user.uid);
        if(isFinal){
          await setDoc(ref,{finalExams:{[course]:{passed,score}}},{merge:true});
          if(passed) checkSpan.textContent="✅";
        } else {
          await setDoc(ref,{progress:{[course]:{[unit]:{passed,score}}}},{merge:true});
          if(passed) checkSpan.textContent="✅";
        }
      }
      return;
    }
    const q=questions[index];
    const card=createEl("div","border p-3 rounded mb-3");
    card.appendChild(createEl("p","font-semibold",q.question));

    if(q.type==="mcq"||q.type==="source"){
      q.choices.forEach(choice=>{
        const btn=createEl("button","block border rounded p-2 w-full mb-1",choice);
        btn.onclick=()=>{
          if(choice===q.correct){score++;}
          index++;renderNext();
        };
        card.appendChild(btn);
      });
    } else if(q.type==="open"){
      const ta=document.createElement("textarea");
      ta.className="w-full border p-2 mb-2";
      const submit=createEl("button","bg-purple-600 text-white px-3 py-1 rounded","Submit");
      submit.onclick=async()=>{
        const res=await gradeOpenResponse(course,unit,q.question,q.rubric,ta.value);
        if(res.pass) score++;
        index++;renderNext();
      };
      card.appendChild(ta);
      card.appendChild(submit);
    }
    quizContent.appendChild(card);
  }
  renderNext();
}

// ========================= Modals =========================
function openSettings(){settingsModal.classList.remove("hidden");}
function closeSettingsModal(){settingsModal.classList.add("hidden");}
function openReselect(){reselectModal.classList.remove("hidden");}
function closeReselectModal(){reselectModal.classList.add("hidden");}
function populateReselectForm(selected=[]){
  reselectForm.innerHTML="";
  Object.keys(apCourses).forEach(course=>{
    const label=createEl("label","block mb-1");
    const input=document.createElement("input");
    input.type="checkbox";input.value=course;
    if(selected.includes(course)) input.checked=true;
    label.appendChild(input);label.append(course);
    reselectForm.appendChild(label);
  });
}

// ========================= Auth Flow =========================
onAuthStateChanged(auth, async (user)=>{
  if(!user){
    window.location.href="index.html";
    return;
  }
  welcome.textContent=`Welcome, ${user.displayName||nameFromEmail(user.email)}`;

  const ref=doc(db,"users",user.uid);
  let snap=await getDoc(ref);
  if(!snap.exists()){
    await setDoc(ref,{apCourses:[],progress:{},finalExams:{}});
    snap=await getDoc(ref);
  }
  const data=snap.data();
  renderAPCoursesForUser(data.apCourses||[], data.progress||{});

  settingsBtn.onclick=openSettings;
  closeSettings.onclick=closeSettingsModal;
  reselectBtn.onclick=openReselect;
  closeReselect.onclick=closeReselectModal;
  populateReselectForm(data.apCourses||[]);
  saveReselect.onclick=async()=>{
    const selected=Array.from(reselectForm.querySelectorAll("input:checked")).map(cb=>cb.value);
    await setDoc(ref,{apCourses:selected},{merge:true});
    renderAPCoursesForUser(selected,data.progress||{});
    reselectModal.classList.add("hidden");
  };
  logoutBtn.onclick=async()=>{await signOut(auth);window.location.href="index.html";};
});
