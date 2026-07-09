/**
 * Professional Quiz Application - JS Logic
 * Architecture: Module pattern utilizing modern ES6+ features.
 */

// --- STATE MANAGEMENT ---
const state = {
  questions: [],
  currentQuestionIndex: 0,
  score: 0,
  timePerQuestion: 15,
  timeLeft: 15,
  timerInterval: null,
  answersRecord: [],
  settings: {
    category: "frontend",
    difficulty: "medium",
    amount: 5,
  },
};

// --- DOM ELEMENTS ---
const UI = {
  screens: {
    setup: document.getElementById("setup-screen"),
    quiz: document.getElementById("quiz-screen"),
    results: document.getElementById("results-screen"),
  },
  forms: { setup: document.getElementById("setup-form") },
  quiz: {
    questionText: document.getElementById("question-text"),
    optionsContainer: document.getElementById("options-container"),
    questionCounter: document.getElementById("question-counter"),
    scoreTracker: document.getElementById("score-tracker"),
    progressBar: document.getElementById("progress-bar"),
    timer: document.getElementById("timer"),
    btnNext: document.getElementById("btn-next"),
  },
  results: {
    scorePercentage: document.getElementById("score-percentage"),
    scorePath: document.getElementById("score-path"),
    correctAnswers: document.getElementById("correct-answers"),
    wrongAnswers: document.getElementById("wrong-answers"),
    motivationalMessage: document.getElementById("motivational-message"),
    btnRestart: document.getElementById("btn-restart"),
    btnHome: document.getElementById("btn-home"),
  },
  global: {
    themeToggle: document.getElementById("theme-toggle"),
    highScoreDisplay: document.getElementById("high-score-display"),
  },
};

// --- DATA FETCHING (Mocking an API with Async/Await) ---
const fetchQuestions = async (amount, category, difficulty) => {
  // In a real app, this would be a fetch() call to OpenTDB or a custom REST API.
  // We use a Promise to simulate network latency and demonstrate async/await.
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock data generation based on constraints
      const mockDb = [
        {
          q: "What does HTML stand for?",
          options: [
            "Hyper Text Markup Language",
            "Home Tool Markup Language",
            "Hyperlinks and Text Markup Language",
            "Hyper Tool Multi Language",
          ],
          a: 0,
        },
        {
          q: "Which property is used to change the background color in CSS?",
          options: ["color", "bgcolor", "background-color", "bg-color"],
          a: 2,
        },
        {
          q: "Which JavaScript keyword is used to declare a variable that cannot be reassigned?",
          options: ["let", "var", "const", "static"],
          a: 2,
        },
        {
          q: "What is the correct syntax for referring to an external script called 'app.js'?",
          options: [
            "<script src='app.js'>",
            "<script href='app.js'>",
            "<script ref='app.js'>",
            "<script name='app.js'>",
          ],
          a: 0,
        },
        {
          q: "How do you select an element with id 'demo' in CSS?",
          options: [".demo", "#demo", "demo", "*demo"],
          a: 1,
        },
        {
          q: "Which array method adds one or more elements to the end of an array?",
          options: ["pop()", "push()", "shift()", "unshift()"],
          a: 1,
        },
        {
          q: "What does CSS grid-template-columns do?",
          options: [
            "Defines rows",
            "Defines background",
            "Defines the columns of the grid",
            "Aligns items",
          ],
          a: 2,
        },
      ];

      // Randomize and slice based on amount requested
      const shuffled = [...mockDb].sort(() => 0.5 - Math.random());
      resolve(shuffled.slice(0, amount));
    }, 800); // 800ms simulated network delay
  });
};

// --- CORE FUNCTIONS ---

// Theme Initialization
const initTheme = () => {
  const savedTheme = localStorage.getItem("quiz-theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
};

const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("quiz-theme", newTheme);
  updateThemeIcon(newTheme);
};

const updateThemeIcon = (theme) => {
  UI.global.themeToggle.innerHTML =
    theme === "light"
      ? '<i class="fa-solid fa-moon"></i>'
      : '<i class="fa-solid fa-sun" style="color: var(--color-yellow);"></i>';
};

// High Score Management
const updateHighScoreDisplay = () => {
  const best = localStorage.getItem("quiz-high-score") || 0;
  UI.global.highScoreDisplay.textContent = `Best: ${best}%`;
};

const saveHighScore = (percentage) => {
  const currentBest = parseInt(localStorage.getItem("quiz-high-score") || 0);
  if (percentage > currentBest) {
    localStorage.setItem("quiz-high-score", percentage);
    updateHighScoreDisplay();
    triggerConfetti(); // Bonus feature
  }
};

// Screen Navigation
const switchScreen = (screenName) => {
  Object.values(UI.screens).forEach((screen) => {
    screen.classList.remove("active");
    screen.classList.add("hidden");
  });
  UI.screens[screenName].classList.remove("hidden");
  // Small timeout to allow display:block to apply before animation
  setTimeout(() => UI.screens[screenName].classList.add("active"), 10);
};

// Quiz Initialization
const startQuiz = async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button");
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Loading...';
  btn.disabled = true;

  // Destructure setup values
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const difficulty = document.getElementById("difficulty").value;

  try {
    const data = await fetchQuestions(amount, category, difficulty);

    // Reset State
    state.questions = data;
    state.currentQuestionIndex = 0;
    state.score = 0;
    state.answersRecord = [];

    switchScreen("quiz");
    renderQuestion();
  } catch (error) {
    console.error("Failed to load questions:", error);
    alert("Failed to load questions. Please try again.");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
};

// Render Question UI
const renderQuestion = () => {
  const currentQ = state.questions[state.currentQuestionIndex];
  UI.quiz.questionText.textContent = currentQ.q;

  // Update Progress UI
  const progressPercent =
    (state.currentQuestionIndex / state.questions.length) * 100;
  UI.quiz.progressBar.style.width = `${progressPercent}%`;
  UI.quiz.questionCounter.textContent = `Question ${state.currentQuestionIndex + 1}/${state.questions.length}`;
  UI.quiz.scoreTracker.textContent = `Score: ${state.score}`;

  // Generate Options
  UI.quiz.optionsContainer.innerHTML = "";
  UI.quiz.btnNext.classList.add("hidden");

  currentQ.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.classList.add("option-btn", "ripple");
    btn.textContent = opt;
    btn.dataset.index = index; // Store index for validation
    UI.quiz.optionsContainer.appendChild(btn);
  });

  startTimer();
};

// Timer Logic utilizing Closures and setInterval
const startTimer = () => {
  clearInterval(state.timerInterval);
  state.timeLeft = state.timePerQuestion;
  UI.quiz.timer.textContent = state.timeLeft;
  UI.quiz.timer.parentElement.classList.remove("danger");

  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    UI.quiz.timer.textContent = state.timeLeft;

    if (state.timeLeft <= 5) {
      UI.quiz.timer.parentElement.classList.add("danger");
    }

    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      handleTimeOut();
    }
  }, 1000);
};

// Event Delegation for handling Option Clicks
const handleOptionClick = (e) => {
  // Only target option buttons
  const btn = e.target.closest(".option-btn");
  if (!btn || UI.quiz.optionsContainer.classList.contains("locked")) return;

  clearInterval(state.timerInterval);
  UI.quiz.optionsContainer.classList.add("locked"); // Prevent double-clicking

  const selectedIndex = parseInt(btn.dataset.index);
  const correctIndex = state.questions[state.currentQuestionIndex].a;
  const isCorrect = selectedIndex === correctIndex;

  // Visual Feedback
  btn.classList.add("selected");

  // Highlight correct/wrong
  Array.from(UI.quiz.optionsContainer.children).forEach((child) => {
    const idx = parseInt(child.dataset.index);
    if (idx === correctIndex) child.classList.add("correct");
    else if (idx === selectedIndex && !isCorrect) child.classList.add("wrong");
  });

  if (isCorrect) state.score += 10;

  state.answersRecord.push(isCorrect);
  UI.quiz.btnNext.classList.remove("hidden");
};

const handleTimeOut = () => {
  UI.quiz.optionsContainer.classList.add("locked");
  const correctIndex = state.questions[state.currentQuestionIndex].a;

  Array.from(UI.quiz.optionsContainer.children).forEach((child) => {
    if (parseInt(child.dataset.index) === correctIndex) {
      child.classList.add("correct");
    }
  });

  state.answersRecord.push(false); // Counted as wrong
  UI.quiz.btnNext.classList.remove("hidden");
};

const nextQuestion = () => {
  UI.quiz.optionsContainer.classList.remove("locked");
  state.currentQuestionIndex++;

  if (state.currentQuestionIndex < state.questions.length) {
    renderQuestion();
  } else {
    endQuiz();
  }
};

// Results Calculation & UI
const endQuiz = () => {
  clearInterval(state.timerInterval);
  switchScreen("results");

  const totalQuestions = state.questions.length;
  const correctCount = state.answersRecord.filter(Boolean).length;
  const wrongCount = totalQuestions - correctCount;
  const percentage = Math.round((correctCount / totalQuestions) * 100);

  // Update Text Stats
  UI.results.correctAnswers.textContent = correctCount;
  UI.results.wrongAnswers.textContent = wrongCount;

  // Animate Circular Progress
  UI.results.scorePercentage.textContent = `${percentage}%`;
  UI.results.scorePath.setAttribute("stroke-dasharray", `${percentage}, 100`);

  // Dynamic Motivational Message
  let msg = "Keep Practicing!";
  if (percentage === 100) msg = "Perfect Score! Masterful!";
  else if (percentage >= 80) msg = "Excellent Work!";
  else if (percentage >= 60) msg = "Good Job! Room for improvement.";
  UI.results.motivationalMessage.textContent = msg;

  saveHighScore(percentage);
};

// Micro-interaction: Confetti Effect (Factory Function approach)
const triggerConfetti = () => {
  // A lightweight vanilla JS confetti implementation
  const colors = ["#FDEB9E", "#7AE2CF", "#077A7D"];
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.backgroundColor =
      colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + "vw";
    confetti.style.top = "-10px";
    confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";
    confetti.style.zIndex = "9999";
    confetti.style.transition = "all 2s ease-out";

    document.body.appendChild(confetti);

    // Force reflow
    confetti.getBoundingClientRect();

    confetti.style.top = "100vh";
    confetti.style.transform = `rotate(${Math.random() * 360}deg)`;

    setTimeout(() => confetti.remove(), 2000);
  }
};

// --- EVENT LISTENERS INITIALIZATION ---
const initApp = () => {
  initTheme();
  updateHighScoreDisplay();

  UI.global.themeToggle.addEventListener("click", toggleTheme);
  UI.forms.setup.addEventListener("submit", startQuiz);

  // Event Delegation for options
  UI.quiz.optionsContainer.addEventListener("click", handleOptionClick);
  UI.quiz.btnNext.addEventListener("click", nextQuestion);

  UI.results.btnRestart.addEventListener("click", () => switchScreen("setup"));
  UI.results.btnHome.addEventListener("click", () => switchScreen("setup"));
};

// Boot App
document.addEventListener("DOMContentLoaded", initApp);
