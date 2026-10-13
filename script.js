
import {
  collection,
  getDocs,
  addDoc,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  increment,
  serverTimestamp,
  setDoc,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

import { auth, db } from "../firebase.config.js";

/* ==========================================
   GAME RESULTS - FIRESTORE
   ========================================== */

// Each play-through receives a unique Firestore document ID.
let gameResultId = null;
let gameOverHandled = false;
let finalSavePromise = null;

function startNewGameRecord() {
  gameResultId = doc(collection(db, "GameResults")).id;
  gameOverHandled = false;
  finalSavePromise = null;
}

function calculateAccuracy() {
  return state.totalAttempts > 0
    ? Math.round(
        (state.correctCount / state.totalAttempts) * 100
      )
    : 0;
}

// Save the learner's ongoing progress.
async function saveProgress() {
  const user = auth.currentUser;

  if (!user) {
    console.warn("Progress not saved: learner is not signed in.");
    return;
  }

  try {
    await updateDoc(doc(db, "Learners", user.uid), {
      progress: state.currentQuestion + 1,
      level: state.level,
      score: state.score,
      lastPlayed: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving game progress:", error);
  }
}

// Save one final result per game session.
async function saveFinalResults() {
  // Reuse an existing save operation if game over fires twice.
  if (finalSavePromise) {
    return finalSavePromise;
  }

  finalSavePromise = (async () => {
    const user = auth.currentUser;

    if (!user) {
      console.warn(
        "Game result cannot be saved: learner is not signed in."
      );
      return false;
    }

    // Also protects against a missing session ID.
    if (!gameResultId) {
      startNewGameRecord();
    }

    const completedAllQuestions =
      state.currentQuestion >= questions.length;

    const accuracy = calculateAccuracy();

    const result = {
      learnerUid: user.uid,
      learnerName:
        user.displayName ||
        user.email ||
        "Unknown learner",
      learnerEmail: user.email || "",

      gameName: "Code Challenge",
      gameType: "Coding Quiz",

      score: state.score,
      highestLevel: state.level,
      correctAnswers: state.correctCount,
      totalAttempts: state.totalAttempts,
      accuracy: accuracy,
      livesRemaining: state.lives,

      questionsAvailable: questions.length,
      status: completedAllQuestions
        ? "Completed"
        : "Game Over",

      createdAt: serverTimestamp()
    };

    try {
      // Create a new GameResults document for this play-through.
      // A stable ID prevents repeated calls creating duplicate records.
      await setDoc(
        doc(db, "GameResults", gameResultId),
        result
      );

      console.log("Game result saved:", gameResultId);

    } catch (error) {
      console.error("Failed to save game result:", error);

      // Allow a later retry if the write failed.
      finalSavePromise = null;
      return false;
    }

    // Update the learner's aggregate statistics if their document exists.
    try {
      const learnerRef = doc(db, "Learners", user.uid);

      await runTransaction(db, async (transaction) => {
        const learnerSnapshot = await transaction.get(learnerRef);

        if (!learnerSnapshot.exists()) {
          return;
        }

        const learnerData = learnerSnapshot.data();

        transaction.update(learnerRef, {
          finalScore: state.score,
          highestLevel: Math.max(
            Number(learnerData.highestLevel || 0),
            state.level
          ),
          accuracy: accuracy,
          gamesPlayed:
            Number(learnerData.gamesPlayed || 0) + 1,
          lastPlayed: serverTimestamp()
        });
      });

    } catch (error) {
      // The GameResults record has already been saved.
      console.error(
        "Game result saved, but learner statistics failed to update:",
        error
      );
    }

    return true;
  })();

  return finalSavePromise;
}


let questions = [];

async function seedQuestionsIfEmpty() {
  const snapshot = await getDocs(
    collection(db, "Questions")
  );

  if (!snapshot.empty) {
    return;
  }

  const starterQuestions = [
    {
      level: 1,
      code: `const totalHours = tasks.___(
  (___, t) => ___ + t.hours,
  0
);`,
      blanks: 3,
      answers: ["reduce", "acc", "acc"],
      options: ["reduce", "map", "sum", "acc"],
      hint: "Blank 1 starts with: r",
      active: true,
      order: 1
    },
    {
      level: 1,
      code: `const names = users.___(
  (user) => user.___
);`,
      blanks: 2,
      answers: ["map", "name"],
      options: ["map", "forEach", "name", "id", "age"],
      hint: "Blank 1 is an array method that transforms each element.",
      active: true,
      order: 2
    },
    {
      level: 2,
      code: `const adults = people.___(
  (p) => p.age ___ 18
);`,
      blanks: 2,
      answers: ["filter", ">="],
      options: ["filter", "find", ">=", ">", "==="],
      hint: "Blank 1 returns a new array with elements that pass a test.",
      active: true,
      order: 3
    },
    {
      level: 2,
      code: `const result = arr.___(
  (a, b) => a.___(b)
);`,
      blanks: 2,
      answers: ["reduce", "concat"],
      options: ["reduce", "join", "concat", "push", "merge"],
      hint: "Think about combining arrays into one.",
      active: true,
      order: 4
    },
    {
      level: 3,
      code: `async function getData() {
  const res = await ___("/api/data");
  const data = await res.___();
  return data;
}`,
      blanks: 2,
      answers: ["fetch", "json"],
      options: ["fetch", "axios", "json", "text", "parse"],
      hint: "The browser API for making HTTP requests.",
      active: true,
      order: 5
    },
    {
      level: 3,
      code: `const unique = [...new ___(arr)];
console.___("Unique items:", unique);`,
      blanks: 2,
      answers: ["Set", "log"],
      options: ["Set", "Map", "log", "warn", "dir"],
      hint: "This data structure only stores unique values.",
      active: true,
      order: 6
    },
    {
      level: 4,
      code: `class Animal {
  ___(name) {
    this.___ = name;
  }
}`,
      blanks: 2,
      answers: ["constructor", "name"],
      options: ["constructor", "create", "name", "type", "self"],
      hint: "The special method called when creating a new instance.",
      active: true,
      order: 7
    },
    {
      level: 4,
      code: `const [first, ...___] = items;
const obj = { ...defaults, ...___ };`,
      blanks: 2,
      answers: ["rest", "overrides"],
      options: [
        "rest",
        "remaining",
        "others",
        "overrides",
        "config",
        "props"
      ],
      hint: "The spread/rest operator collects remaining elements.",
      active: true,
      order: 8
    }
  ];

  try {
    for (const question of starterQuestions) {
      await addDoc(
        collection(db, "Questions"),
        question
      );
    }

    console.log("Starter questions created successfully.");
  } catch (error) {
    console.error("Failed to seed questions:", error);
  }
}

// FIRESTORE


async function loadQuestionsFromFirestore() {
  try {
    const questionsQuery = query(
      collection(db, "Questions"),
      where("active", "==", true),
      orderBy("order")
    );

    const snapshot = await getDocs(questionsQuery);

    questions = snapshot.docs.map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data()
    }));

    if (questions.length === 0) {
      throw new Error("No questions found.");
    }

    console.log(`Loaded ${questions.length} questions`);

  } catch (error) {
    console.error("Failed to load questions:", error);
    alert("Failed to load questions.");
  }
}

// GAME STATE

let state = {
  currentQuestion: 0,
  level: 1,
  lives: 3,
  score: 0,
  hints: 2,
  timer: 60,
  timerInterval: null,
  selectedAnswers: [],
  activeBlank: 0,
  correctCount: 0,
  totalAttempts: 0,
};

// INIT

window.addEventListener("DOMContentLoaded", async () => {

  if (!document.querySelector(".bottom-panel-rect")) {
    return;
  }

  try {

    // Creates Questions collection only if it doesn't exist
    await seedQuestionsIfEmpty();

    // Loads questions into the questions array
    await loadQuestionsFromFirestore();

    startNewGameRecord();
    loadQuestion();

  } catch (error) {
    console.error("Game startup failed:", error);
  }
});

function setBottomPanelResultMode(isActive) {
  const panel = document.querySelector('.bottom-panel-rect');
  if (!panel) return;
  panel.classList.toggle('result-active', isActive);
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle');
  if (!sidebar || !toggleBtn) return;

  const isCollapsed = sidebar.classList.toggle('is-collapsed');
  toggleBtn.classList.toggle('is-collapsed', isCollapsed);
  toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
}

function updateStats() {
  document.getElementById('level').textContent = state.level;
  document.getElementById('lives').textContent = state.lives;
  document.getElementById('score').textContent = state.score;
  document.getElementById('hints').textContent = state.hints;
}

// TIMER

function startTimer() {
  clearInterval(state.timerInterval);
  state.timer = 60;
  updateTimerDisplay();
  state.timerInterval = setInterval(() => {
    state.timer--;
    updateTimerDisplay();
    if (state.timer <= 0) {
      clearInterval(state.timerInterval);
      handleTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = String(Math.floor(state.timer / 60)).padStart(2, '0');
  const secs = String(state.timer % 60).padStart(2, '0');
  document.getElementById('timer').textContent = `${mins}:${secs}`;
}

function handleTimeout() {
  state.lives--;
  updateStats();
  if (state.lives <= 0) {
    showGameOver();
  } else {
    showFeedback('incorrect', `Time's up!\n\nLife Lost: -1\nLives Remaining: ${state.lives}`);
  }
}


// LOAD QUESTION

function loadQuestion() {
  hideAllFeedback();

  if (state.currentQuestion >= questions.length) {
    showGameOver();
    return;
  }

  const q = questions[state.currentQuestion];
  state.level = q.level;
  state.selectedAnswers = new Array(q.blanks).fill(null);
  state.activeBlank = 0;

  // Render code with blank placeholders
  let codeHtml = q.code.replace(/___/g, () => '___');
  const parts = codeHtml.split('___');
  let rendered = '';
  for (let i = 0; i < parts.length; i++) {
    rendered += escapeHtml(parts[i]);
    if (i < q.blanks) {
      rendered += `<span class="blank ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="selectBlank(${i})">Blank ${i + 1}</span>`;
    }
  }
  document.getElementById('code-display').innerHTML = rendered;

  // Render blank labels
  const blanksArea = document.getElementById('blanks-area');
  blanksArea.innerHTML = '';
  for (let i = 0; i < q.blanks; i++) {
    blanksArea.innerHTML += `
      <div class="blank-row">
        <span class="blank-label">Blank ${i + 1}:</span>
        <span class="blank-answer" id="blank-answer-${i}" onclick="selectBlank(${i})"></span>
      </div>`;
  }

  // Render options
  const optionsEl = document.getElementById('options');
  optionsEl.innerHTML = '';
  q.options.forEach((opt) => {
    const btn = document.createElement('div');
    btn.className = 'option-box';
    btn.textContent = opt;
    btn.onclick = () => pickOption(opt, btn);
    optionsEl.appendChild(btn);
  });

  document.getElementById('game-area').classList.remove('hidden');
  updateStats();
  startTimer();
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
 
// INTERACTION
 
function selectBlank(index) {
  state.activeBlank = index;
  document.querySelectorAll('.blank').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });
}

function pickOption(value, btnEl) {
  const q = questions[state.currentQuestion];
  const i = state.activeBlank;

  // Clear previous selection for this blank
  if (state.selectedAnswers[i] !== null) {
    document.querySelectorAll('.option-box').forEach((el) => {
      if (el.textContent === state.selectedAnswers[i] && el.classList.contains('used')) {
        el.classList.remove('used', 'selected');
      }
    });
  }

  state.selectedAnswers[i] = value;

  // Update UI
  btnEl.classList.add('selected', 'used');

  // Update blank display
  const blankInCode = document.querySelector(`.blank[data-index="${i}"]`);
  if (blankInCode) {
    blankInCode.textContent = value;
    blankInCode.classList.add('filled');
  }

  const blankAnswer = document.getElementById(`blank-answer-${i}`);
  if (blankAnswer) {
    blankAnswer.textContent = value;
    blankAnswer.classList.add('filled');
  }

  // Auto-advance to next blank
  if (i < q.blanks - 1) {
    selectBlank(i + 1);
  }
}

// SUBMIT

async function submitAnswer() {
  const q = questions[state.currentQuestion];
  state.totalAttempts++;

  if (state.selectedAnswers.includes(null)) {
    alert('Please fill in all blanks before submitting.');
    return;
  }

  clearInterval(state.timerInterval);

  const isCorrect = q.answers.every((ans, i) => state.selectedAnswers[i] === ans);

 if (isCorrect) {
  state.correctCount++;

  const points = 10 * state.level;
  state.score += points;

  updateStats();

  await saveProgress();

  showFeedback(
    'correct',
    `Points: +${points}\n\nBonus Time: +5 seconds`
  );

    // Check level up
    const nextQ = questions[state.currentQuestion + 1];
    if (nextQ && nextQ.level > q.level) {
      setTimeout(() => {
        hideAllFeedback();
        showLevelComplete(q.level);
      }, 1500);
    }
  } else {
    state.lives--;
    updateStats();

    if (state.lives <= 0) {
      async function saveFinalResults() {
  const user = auth.currentUser;

  if (!user) {
    return;
  }

  const accuracy =
    state.totalAttempts > 0
      ? Math.round(
          (state.correctCount / state.totalAttempts) * 100
        )
      : 0;

  try {
    await updateDoc(
      doc(db, "Learners", user.uid),
      {
        finalScore: state.score,
        highestLevel: state.level,
        accuracy: accuracy,
        gamesPlayed: increment(1),
        lastPlayed: serverTimestamp()
      }
    );
  } catch (error) {
    console.error("Failed to save final results:", error);
  }
}
      showGameOver();
    } else {
      showFeedback('incorrect', `Life Lost: -1\nLives Remaining: ${state.lives}`);
    }
  }
}

// HINTS

function useHint() {
  if (state.hints <= 0) {
    alert('No hints remaining!');
    return;
  }
  state.hints--;
  updateStats();

  const q = questions[state.currentQuestion];
  showFeedback('hint', `${q.hint}\n\nHints Left: ${state.hints}`);
}

function closeHint() {
  hideAllFeedback();
}


// NAVIGATION

function nextQuestion() {
  state.currentQuestion++;
  loadQuestion();
}

function tryAgain() {
  loadQuestion();
}

function continueGame() {
  state.currentQuestion++;
  state.hints++;
  updateStats();
  loadQuestion();
}

function showLevelComplete(completedLevel) {
  const details = `Level: ${completedLevel}\n\nScore Earned: ${state.score}\nBonus: +50\nNew Hint Earned: +1\nUnlocked Level ${completedLevel + 1}`;
  state.score += 50;
  updateStats();

  document.getElementById('game-area').classList.add('hidden');
  const el = document.getElementById('level-complete');
  document.getElementById('level-details').textContent = details;
  el.classList.remove('hidden');
  setBottomPanelResultMode(true);
}


function playAgain() {
  clearInterval(state.timerInterval);

  state = {
    currentQuestion: 0,
    level: 1,
    lives: 3,
    score: 0,
    hints: 2,
    timer: 60,
    timerInterval: null,
    selectedAnswers: [],
    activeBlank: 0,
    correctCount: 0,
    totalAttempts: 0
  };

  // Give this play-through its own GameResults document.
  startNewGameRecord();

  updateStats();

  document.getElementById("game-over").classList.add("hidden");
  document.getElementById("level-complete").classList.add("hidden");

  loadQuestion();
}


// FEEDBACK HELPERS

function hideAllFeedback() {
  document.querySelectorAll('.feedback-modal').forEach((el) => el.classList.add('hidden'));
  document.getElementById('game-area').classList.remove('hidden');
  setBottomPanelResultMode(false);
}

function showFeedback(type, message) {
  hideAllFeedback();
  const map = {
    correct: ['correct-feedback', 'correct-details'],
    incorrect: ['incorrect-feedback', 'incorrect-details'],
    hint: ['hint-feedback', 'hint-text'],
  };
  if (map[type]) {
    document.getElementById('game-area').classList.add('hidden');
    document.getElementById(map[type][0]).classList.remove('hidden');
    document.getElementById(map[type][1]).textContent = message;
    setBottomPanelResultMode(true);
  }
}

async function showGameOver() {
  if (gameOverHandled) return;

  gameOverHandled = true;
  clearInterval(state.timerInterval);

  // Save the final score before showing the results.
  const saved = await saveFinalResults();

  hideAllFeedback();

  document.getElementById("game-area").classList.add("hidden");

  const accuracy = calculateAccuracy();

  const details = [
    `Final Score: ${state.score}`,
    `Highest Level: ${state.level}`,
    `Correct Answers: ${state.correctCount}`,
    `Accuracy: ${accuracy}%`,
    "",
    saved
      ? "Game results saved successfully."
      : "Could not save results. Please check your connection and try again."
  ].join("\n");

  document.getElementById("game-over-details").textContent = details;
  document.getElementById("game-over").classList.remove("hidden");

  setBottomPanelResultMode(true);
}


window.toggleSidebar = toggleSidebar;
window.useHint = useHint;
window.submitAnswer = submitAnswer;
window.selectBlank = selectBlank;
window.closeHint = closeHint;
window.nextQuestion = nextQuestion;
window.tryAgain = tryAgain;
window.continueGame = continueGame;
window.playAgain = playAgain;