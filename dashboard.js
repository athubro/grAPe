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

// AP courses and units (simplified example)
const apCourses = {
  "AP African American Studies": ["Unit 1: Introduction to African American Studies"],
  "AP Art & Design: 2D": ["Unit 1: Explore Materials, Processes, and Ideas", "Unit 2: Make Art and Design", "Unit 3: Present Art and Design"],
  "AP Art & Design: 3D": ["Unit 1: Explore Materials, Processes, and Ideas", "Unit 2: Make Art and Design", "Unit 3: Present Art and Design"],
  "AP Art & Design: Drawing": ["Unit 1: Explore Materials, Processes, and Ideas", "Unit 2: Make Art and Design", "Unit 3: Present Art and Design"],
  "AP Art History": [
    "Unit 1: Global Prehistoric Art, 30,000-500 BCE",
    "Unit 2: Ancient Mediterranean Art, 3500-300 BCE",
    "Unit 3: Early European and Colonial American Art, 200-1750 CE",
    "Unit 4: Later European and American Art, 1750-1980 CE",
    "Unit 5: Indigenous American Art, 1000 BCE-1980 CE",
    "Unit 6: African Art, 1100-1980 CE",
    "Unit 7: West and Central Asian Art, 500 BCE-1980 CE",
    "Unit 8: South, East, and Southeast Asian Art, 300 BCE-1980 CE",
    "Unit 9: Art in the Pacific, 700-1980 CE",
    "Unit 10: Global Contemporary Art, 1980 CE to Present"
  ],
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
    "Unit 2: Differentiation - Definition and Fundamental Properties",
    "Unit 3: Differentiation - Composite, Implicit, and Inverse Functions",
    "Unit 4: Contextual Applications of Differentiation",
    "Unit 5: Analytical Applications of Differentiation",
    "Unit 6: Integration and Accumulation of Change",
    "Unit 7: Differential Equations",
    "Unit 8: Applications of Integration"
  ],
  "AP Calculus BC": [
    "Unit 1: Limits and Continuity",
    "Unit 2: Differentiation - Definition and Fundamental Properties",
    "Unit 3: Differentiation - Composite, Implicit, and Inverse Functions",
    "Unit 4: Contextual Applications of Differentiation",
    "Unit 5: Analytical Applications of Differentiation",
    "Unit 6: Integration and Accumulation of Change",
    "Unit 7: Differential Equations",
    "Unit 8: Applications of Integration",
    "Unit 9: Parametric Equations, Polar Coordinates, and Vector-Valued Functions",
    "Unit 10: Infinite Sequences and Series"
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
  "AP Chinese": [
    "Unit 1: Families in Different Societies",
    "Unit 2: The Influence of Language and Culture on Identity",
    "Unit 3: Influences of Beauty and Art",
    "Unit 4: How Science and Technology Affect Our Lives",
    "Unit 5: Factors That Impact the Quality of Life",
    "Unit 6: Environmental, Political, and Societal Challenges"
  ],
  "AP Comparative Government": [
    "Unit 1: Political Systems, Regimes, and Governments",
    "Unit 2: Political Institutions",
    "Unit 3: Political Culture and Participation",
    "Unit 4: Party, Electoral Systems, and Citizen Organizations",
    "Unit 5: Political and Economic Changes and Development"
  ],
  "AP Computer Science A": [
    "Unit 1: Primitive Types",
    "Unit 2: Using Objects",
    "Unit 3: Boolean Expressions and If Statements",
    "Unit 4: Iteration",
    "Unit 5: Writing Classes",
    "Unit 6: Arrays",
    "Unit 7: ArrayLists",
    "Unit 8: 2D Arrays",
    "Unit 9: Inheritance",
    "Unit 10: Recursion"
  ],
  "AP Computer Science Principles": [
    "Unit 1: Creative Development",
    "Unit 2: Data",
    "Unit 3: Algorithms and Programming",
    "Unit 4: Computer Systems and Networks",
    "Unit 5: Impact of Computing"
  ],
  "AP English Language": [
    "Unit 1: Claims, Reasoning, and Evidence",
    "Unit 2: Organizing Information for a Specific Audience",
    "Unit 3: Perspectives and How Arguments Relate",
    "Unit 4: How Writers Develop Arguments, Intros, and Conclusions",
    "Unit 5: How a Writer Brings All Parts of an Argument Together",
    "Unit 6: Position, Perspective, and Bias",
    "Unit 7: Successful and Unsuccessful Arguments",
    "Unit 8: Stylistic Choices",
    "Unit 9: Developing a Complex Argument"
  ],
  "AP English Literature": [
    "Unit 1: Short Fiction I: Introduction to Short Fiction",
    "Unit 2: Poetry I: Introduction to Poetry",
    "Unit 3: Longer Fiction and Drama I: Introduction to Longer Fiction and Drama",
    "Unit 4: Short Fiction II: Character, Conflict, and Storytelling",
    "Unit 5: Poetry II: Structure and Figurative Language",
    "Unit 6: Longer Fiction or Drama II: Literary Techniques in Longer Works",
    "Unit 7: Short Fiction III: Societal and Historical Context",
    "Unit 8: Poetry III: Contrast, Ambiguous Language, and Other Techniques",
    "Unit 9: Longer Fiction or Drama III: Nuanced Analysis"
  ],
  "AP Environmental Science": [
    "Unit 1: The Living World: Ecosystems",
    "Unit 2: The Living World: Biodiversity",
    "Unit 3: Populations",
    "Unit 4: Earth Systems and Resources",
    "Unit 5: Land and Water Use",
    "Unit 6: Energy Resources and Consumption",
    "Unit 7: Atmospheric Pollution",
    "Unit 8: Aquatic and Terrestrial Pollution",
    "Unit 9: Global Change"
  ],
  "AP European History": [
    "Unit 1: Renaissance and Exploration",
    "Unit 2: Age of Reformation",
    "Unit 3: Absolutism and Constitutionalism",
    "Unit 4: Scientific, Philosophical, and Political Developments",
    "Unit 5: Conflict, Crisis, and Reaction in the Late 18th Century",
    "Unit 6: Industrialization and Its Effects",
    "Unit 7: 19th Century Perspectives and Political Developments",
    "Unit 8: 20th Century Global Conflicts",
    "Unit 9: Cold War and Contemporary Europe"
  ],
  "AP French": [
    "Unit 1: Families in Different Societies",
    "Unit 2: The Influence of Language and Culture on Identity",
    "Unit 3: Influences of Beauty and Art",
    "Unit 4: How Science and Technology Affect Our Lives",
    "Unit 5: Factors That Impact the Quality of Life",
    "Unit 6: Environmental, Political, and Societal Challenges"
  ],
  "AP German": [
    "Unit 1: Families in Different Societies",
    "Unit 2: The Influence of Language and Culture on Identity",
    "Unit 3: Influences of Beauty and Art",
    "Unit 4: How Science and Technology Affect Our Lives",
    "Unit 5: Factors That Impact the Quality of Life",
    "Unit 6: Environmental, Political, and Societal Challenges"
  ],
  "AP Human Geography": [
    "Unit 1: Thinking Geographically",
    "Unit 2: Population and Migration Patterns and Processes",
    "Unit 3: Cultural Patterns and Processes",
    "Unit 4: Political Patterns and Processes",
    "Unit 5: Agriculture and Rural Land-Use Patterns and Processes",
    "Unit 6: Cities and Urban Land-Use",
    "Unit 7: Industrial and Economic Development Patterns and Processes"
  ],
  "AP Italian": [
    "Unit 1: Families in Different Societies",
    "Unit 2: The Influence of Language and Culture on Identity",
    "Unit 3: Influences of Beauty and Art",
    "Unit 4: How Science and Technology Affect Our Lives",
    "Unit 5: Factors That Impact the Quality of Life",
    "Unit 6: Environmental, Political, and Societal Challenges"
  ],
  "AP Japanese": [
    "Unit 1: Families in Different Societies",
    "Unit 2: The Influence of Language and Culture on Identity",
    "Unit 3: Influences of Beauty and Art",
    "Unit 4: How Science and Technology Affect Our Lives",
    "Unit 5: Factors That Impact the Quality of Life",
    "Unit 6: Environmental, Political, and Societal Challenges"
  ],
  "AP Latin": [
    "Unit 1: Vergil, Aeneid, Book 1",
    "Unit 2: Vergil, Aeneid, Book 2",
    "Unit 3: Vergil, Aeneid, Book 4",
    "Unit 4: Vergil, Aeneid, Book 6",
    "Unit 5: Catullus, Selected Poems",
    "Unit 6: Caesar, Selected Passages",
    "Unit 7: Cicero, Selected Speeches"
  ],
  "AP Macroeconomics": [
    "Unit 1: Basic Economic Concepts",
    "Unit 2: Economic Indicators and the Business Cycle",
    "Unit 3: National Income and Price Determination",
    "Unit 4: Financial Sector",
    "Unit 5: Long-Run Consequences of Stabilization Policies",
    "Unit 6: Open Economy - International Trade and Finance"
  ],
  "AP Microeconomics": [
    "Unit 1: Basic Economic Concepts",
    "Unit 2: Supply and Demand",
    "Unit 3: Production, Cost, and the Perfect Competition Model",
    "Unit 4: Imperfect Competition",
    "Unit 5: Factor Markets",
    "Unit 6: Market Failure and the Role of Government"
  ],
  "AP Music Theory": [
    "Unit 1: Music Fundamentals I",
    "Unit 2: Music Fundamentals II",
    "Unit 3: Music Fundamentals III",
    "Unit 4: Harmony and Voice Leading I",
    "Unit 5: Harmony and Voice Leading II",
    "Unit 6: Harmony and Voice Leading III",
    "Unit 7: Harmony and Voice Leading IV",
    "Unit 8: Modes and Form"
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
  "AP Physics 2": [
    "Unit 1: Fluids",
    "Unit 2: Thermodynamics",
    "Unit 3: Electric Force, Field, and Potential",
    "Unit 4: Electric Circuits",
    "Unit 5: Magnetism and Electromagnetic Induction",
    "Unit 6: Geometric and Physical Optics",
    "Unit 7: Quantum, Atomic, and Nuclear Physics"
  ],
  "AP Physics C: Electricity & Magnetism": [
    "Unit 1: Electrostatics",
    "Unit 2: Conductors, Capacitors, Dielectrics",
    "Unit 3: Electric Circuits",
    "Unit 4: Magnetic Fields",
    "Unit 5: Electromagnetism"
  ],
  "AP Physics C: Mechanics": [
    "Unit 1: Kinematics",
    "Unit 2: Newton’s Laws of Motion",
    "Unit 3: Work, Energy, and Power",
    "Unit 4: Systems of Particles and Linear Momentum",
    "Unit 5: Rotation",
    "Unit 6: Oscillations",
    "Unit 7: Gravitation"
  ],
  "AP Pre-Calculus": [
    "Unit 1: Polynomial and Rational Functions",
    "Unit 2: Exponential and Logarithmic Functions",
    "Unit 3: Trigonometric and Polar Functions",
    "Unit 4: Functions Involving Parameters, Vectors, and Matrices"
  ],
  "AP Psychology": [
    "Unit 1: Scientific Foundations of Psychology",
    "Unit 2: Biological Basis of Behavior",
    "Unit 3: Sensation and Perception",
    "Unit 4: Learning",
    "Unit 5: Cognitive Psychology",
    "Unit 6: Developmental Psychology",
    "Unit 7: Motivation, Emotion, and Personality",
    "Unit 8: Clinical Psychology",
    "Unit 9: Social Psychology"
  ],
  "AP Research": [
    "Unit 1: Question and Explore",
    "Unit 2: Understand and Analyze",
    "Unit 3: Evaluate Multiple Perspectives",
    "Unit 4: Synthesize Ideas",
    "Unit 5: Team, Transform, and Transmit"
  ],
  "AP Seminar": [
    "Unit 1: Question and Explore",
    "Unit 2: Understand and Analyze",
    "Unit 3: Evaluate Multiple Perspectives",
    "Unit 4: Synthesize Ideas",
    "Unit 5: Team, Transform, and Transmit"
  ],
  "AP Spanish Language": [
    "Unit 1: Families in Different Societies",
    "Unit 2: The Influence of Language and Culture on Identity",
    "Unit 3: Influences of Beauty and Art",
    "Unit 4: How Science and Technology Affect Our Lives",
    "Unit 5: Factors That Impact the Quality of Life",
    "Unit 6: Environmental, Political, and Societal Challenges"
  ],
  "AP Spanish Literature": [
    "Unit 1: La época medieval",
    "Unit 2: El siglo XVI",
    "Unit 3: El siglo XVII",
    "Unit 4: La literatura romántica, realista y naturalista",
    "Unit 5: La Generación del 98 y el Modernismo",
    "Unit 6: Teatro y poesía del siglo XX",
    "Unit 7: El Boom latinoamericano",
    "Unit 8: Escritores contemporáneos de Estados Unidos, y España"
  ],
  "AP Statistics": [
    "Unit 1: Exploring One-Variable Data",
    "Unit 2: Exploring Two-Variable Data",
    "Unit 3: Collecting Data",
    "Unit 4: Probability, Random Variables, and Probability Distributions",
    "Unit 5: Sampling Distributions",
    "Unit 6: Inference for Categorical Data - Proportions",
    "Unit 7: Inference for Quantitative Data - Means",
    "Unit 8: Inference for Categorical Data - Chi-Squares",
    "Unit 9: Inference for Quantitative Data - Slopes"
  ],
  "AP US Government": [
    "Unit 1: Foundations of American Democracy",
    "Unit 2: Interactions Among Branches of Government",
    "Unit 3: Civil Liberties and Civil Rights",
    "Unit 4: American Political Ideologies and Beliefs",
    "Unit 5: Political Participation"
  ],
  "AP US History": [
    "Unit 1: 1491-1607 (Columbus to Jamestown)",
    "Unit 2: 1607-1754 (Colonial Society)",
    "Unit 3: 1754-1800 (American Revolution and Constitution)",
    "Unit 4: 1800-1848 (American Expansion)",
    "Unit 5: 1844-1877 (Civil War and Reconstruction)",
    "Unit 6: 1865-1898 (Gilded Age)",
    "Unit 7: 1898-1945 (Global Conflict)",
    "Unit 8: 1945-1980 (Cold War and Protest)",
    "Unit 9: 1980 to Present (Post-Cold War Shifts)"
  ],
  "AP World History: Modern": [
    "Unit 1: The Global Tapestry",
    "Unit 2: Networks of Exchange",
    "Unit 3: Land-Based Empires",
    "Unit 4: Transoceanic Interactions",
    "Unit 5: Revolutions",
    "Unit 6: Consequences of Industrialization",
    "Unit 7: Global Conflict",
    "Unit 8: Cold War and Decolonization",
    "Unit 9: Globalization"
  ]
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
        if (currentUserDoc.progress?.[courseName]?.[unit]?.passed) passedSpan.textContent = "✅";

        // Unit click → open quiz
        unitBtn.addEventListener("click", () => openUnitQuiz(courseName, unit, passedSpan));
      });

      // Add Final Exam button at the end
      const finalBtn = createEl(
        "button",
        "bg-purple-400 text-white py-2 px-3 rounded w-full mt-2 hover:bg-purple-500",
        "Final Exam"
      );
      unitsDiv.appendChild(finalBtn);
      const finalCheck = createEl("span", "ml-2 text-green-600 font-bold");
      finalBtn.appendChild(finalCheck);
      if (currentUserDoc.finalExams?.[courseName]?.passed) finalCheck.textContent = "✅";

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
    const checked = currentUserDoc.apCourses.includes(course) ? "checked" : "";
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

// Helper function to call Gemini API
async function generateQuiz(course, unit, isFinal = false) {
  const endpoint = "https://api.openai.com/v1/ai/generate"; // Adjust if using actual Gemini endpoint
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer AIzaSyAekCu-kTFwWcxT0UPy58nXlt8ZNA0VsLI`
  };
  const body = {
    model: "gemini-1",
    input: {
      instructions: `Generate a quiz for ${course}, ${unit}. ${isFinal ? "20 questions, mix of MCQs, source analysis, open response" : "5 questions: 3 MCQs, 1 source analysis MCQ, 1 open response"}`,
      schema: {
        type: "json",
        properties: {
          questions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string" },
                choices: { type: "array", items: { type: "string" } },
                correct: { type: "string" },
                type: { type: "string" }, // "mcq" or "source" or "open"
                explanation: { type: "string" }
              }
            }
          }
        },
        required: ["questions"]
      }
    }
  };
  const res = await fetch(endpoint, { method: "POST", headers, body: JSON.stringify(body) });
  const data = await res.json();
  return data.output[0].content.questions; // array of questions
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

// Show quiz modal
async function showQuizModal(course, unit, questions, checkSpan, isFinal) {
  // Create modal dynamically
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

  let score = 0;

  for (const q of questions) {
    const qDiv = createEl("div", "mb-4 p-3 border rounded");
    qDiv.innerHTML = `<p class="font-semibold">${q.question}</p
