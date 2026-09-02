// ============================================
// FULL-SCREEN SCALE
// Scales the 541 × 1058 design canvas to fill the viewport.
// ============================================
function scaleToFit() {
  const container = document.querySelector('.container-main');
  if (!container) return;
  const designW = 541;
  const designH = 1058;
  // Scale based on width only so the container always fills the full screen width.
  // If the scaled height exceeds the viewport the page scrolls vertically.
  const scale = window.innerWidth / designW;
  container.style.transform = `scale(${scale})`;
  container.style.transformOrigin = 'top left';
  container.style.left = '0';
  container.style.top  = '0';
  // Tell the body how tall the scaled canvas actually is so the
  // browser knows when to show the vertical scrollbar.
  document.body.style.height = `${designH * scale}px`;
}
window.addEventListener('resize', scaleToFit);
document.addEventListener('DOMContentLoaded', scaleToFit);

// ============================================
// HARDCODED TEST DATA (no Firestore)
// ============================================
const questions = [
  {
    level: 1,
    code: 'const totalHours = tasks.___(\n  (___, t) => ___ + t.hours,\n  0\n);',
    blanks: 3,
    answers: ['reduce', 'acc', 'acc'],
    options: ['reduce', 'map', 'sum', 'filter', 'acc', 'acc'],
    hint: 'Blank 1 starts with: "r"',
  },
  {
    level: 1,
    code: 'const names = users.___(\n  (user) => user.___\n);',
    blanks: 2,
    answers: ['map', 'name'],
    options: ['map', 'filter', 'forEach', 'name', 'id', 'age'],
    hint: 'Blank 1 is an array method that transforms each element.',
  },
  {
    level: 2,
    code: 'const adults = people.___(\n  (p) => p.age ___ 18\n);',
    blanks: 2,
    answers: ['filter', '>='],
    options: ['filter', 'find', 'map', '>=', '>', '==='],
    hint: 'Blank 1 returns a new array with elements that pass a test.',
  },
  {
    level: 2,
    code: 'const result = arr.___(\n  (a, b) => a.___(b)\n);',
    blanks: 2,
    answers: ['reduce', 'concat'],
    options: ['reduce', 'flat', 'join', 'concat', 'push', 'merge'],
    hint: 'Think about combining arrays into one.',
  },
  {
    level: 3,
    code: 'async function getData() {\n  const res = await ___("/api/data");\n  const data = await res.___();\n  return data;\n}',
    blanks: 2,
    answers: ['fetch', 'json'],
    options: ['fetch', 'get', 'axios', 'json', 'text', 'parse'],
    hint: 'The browser API for making HTTP requests.',
  },
  {
    level: 3,
    code: 'const unique = [...new ___(arr)];\nconsole.___("Unique items:", unique);',
    blanks: 2,
    answers: ['Set', 'log'],
    options: ['Set', 'Map', 'Array', 'log', 'warn', 'dir'],
    hint: 'This data structure only stores unique values.',
  },
  {
    level: 4,
    code: 'class Animal {\n  ___(name) {\n    this.___ = name;\n  }\n}',
    blanks: 2,
    answers: ['constructor', 'name'],
    options: ['constructor', 'init', 'create', 'name', 'type', 'self'],
    hint: 'The special method called when creating a new instance.',
  },
  {
    level: 4,
    code: 'const [first, ...___] = items;\nconst obj = { ...defaults, ...___};',
    blanks: 2,
    answers: ['rest', 'overrides'],
    options: ['rest', 'remaining', 'others', 'overrides', 'config', 'props'],
    hint: 'The spread/rest operator collects remaining elements.',
  },
];

// ============================================
// GAME STATE
// ============================================
let state = {
  currentQuestion: 0,
  level: 1,
  lives: 3,
  score: 0,
  hints: 2,
  timer: 30,
  timerInterval: null,
  selectedAnswers: [],
  activeBlank: 0,
  correctCount: 0,
  totalAttempts: 0,
};

// ============================================
// INIT
// ============================================
window.addEventListener('DOMContentLoaded', () => {
  loadQuestion();
  startTimer();
});

function updateStats() {
  document.getElementById('level').textContent = state.level;
  document.getElementById('lives').textContent = state.lives;
  document.getElementById('score').textContent = state.score;
  document.getElementById('hints').textContent = state.hints;
}

// ============================================
// TIMER
// ============================================
function startTimer() {
  clearInterval(state.timerInterval);
  state.timer = 30;
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

// ============================================
// LOAD QUESTION
// ============================================
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

// ============================================
// INTERACTION
// ============================================
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

// ============================================
// SUBMIT
// ============================================
function submitAnswer() {
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

    showFeedback('correct', `Points: +${points}\n\nBonus Time: +5 seconds`);

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
      showGameOver();
    } else {
      showFeedback('incorrect', `Life Lost: -1\nLives Remaining: ${state.lives}`);
    }
  }
}

// ============================================
// HINTS
// ============================================
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
  document.getElementById('hint-feedback').classList.add('hidden');
}

// ============================================
// NAVIGATION
// ============================================
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
}

function playAgain() {
  state = {
    currentQuestion: 0,
    level: 1,
    lives: 3,
    score: 0,
    hints: 2,
    timer: 30,
    timerInterval: null,
    selectedAnswers: [],
    activeBlank: 0,
    correctCount: 0,
    totalAttempts: 0,
  };
  updateStats();
  loadQuestion();
}

// ============================================
// FEEDBACK HELPERS
// ============================================
function hideAllFeedback() {
  document.querySelectorAll('.feedback-modal').forEach((el) => el.classList.add('hidden'));
  document.getElementById('game-area').classList.remove('hidden');
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
  }
}

function showGameOver() {
  clearInterval(state.timerInterval);
  hideAllFeedback();
  document.getElementById('game-area').classList.add('hidden');

  const accuracy = state.totalAttempts > 0
    ? Math.round((state.correctCount / state.totalAttempts) * 100)
    : 0;

  const details = `Final Score: ${state.score}\nHighest Level: ${state.level}\nCorrect Answers: ${state.correctCount}\nAccuracy: ${accuracy}%`;

  document.getElementById('game-over-details').textContent = details;
  document.getElementById('game-over').classList.remove('hidden');
}

