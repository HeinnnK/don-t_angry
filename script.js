
const STORAGE_KEY = "nannApologyData";

const levelAnger = {
  1: 30,
  2: 60,
  3: 90
};

let selectedLevel = 2;
let anger = levelAnger[selectedLevel];
let tapCount = 0;
let impactTimer;

const $ = id => document.getElementById(id);

const screens = document.querySelectorAll(".screen");
const levelButtons = document.querySelectorAll(".level-option");

function showScreen(screenId) {
  screens.forEach(screen => {
    screen.classList.toggle("active", screen.id === screenId);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      level: selectedLevel,
      anger,
      tapCount
    }));
  } catch (error) {
    console.warn("Progress could not be saved.", error);
  }
}

function updateLevelSelection() {
  levelButtons.forEach(button => {
    const selected = Number(button.dataset.level) === selectedLevel;

    button.classList.toggle("selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.querySelector(".level-check").textContent =
      selected ? "✓" : "○";
  });

  $("finalLevel").textContent = `Anger Level ${selectedLevel}`;
}

function updateAnger() {
  anger = Math.max(0, Math.min(100, anger));

  $("angerText").textContent = `${anger}%`;
  $("angerFill").style.width = `${anger}%`;
  $("angerMeter").setAttribute("aria-valuenow", String(anger));
  $("finalAnger").textContent = `${anger}%`;

  if (anger > 70) {
    $("angerMessage").textContent = "Still very angry? 🥺";
  } else if (anger > 40) {
    $("angerMessage").textContent = "Let's take it one tap at a time 💗";
  } else if (anger > 0) {
    $("angerMessage").textContent = "A little calmer, perhaps? 🌷";
  } else {
    $("angerMessage").textContent =
      "The meter is at 0%! Let's talk kindly 💖";
  }

  saveProgress();
}

function updateTapCount() {
  $("tapCount").textContent = `Tap count: ${tapCount}`;
  $("finalTaps").textContent = String(tapCount);
}

function updateBumps() {
  $("bumpOne").classList.toggle("visible", tapCount >= 3);
  $("bumpTwo").classList.toggle("visible", tapCount >= 8);
  $("bumpThree").classList.toggle("visible", tapCount >= 15);
}

// Choose an anger level.
levelButtons.forEach(button => {
  button.addEventListener("click", () => {
    selectedLevel = Number(button.dataset.level);
    updateLevelSelection();
    saveProgress();
  });
});

// Start a fresh round at the selected level.
$("startButton").addEventListener("click", () => {
  anger = levelAnger[selectedLevel];
  tapCount = 0;

  updateLevelSelection();
  updateAnger();
  updateTapCount();
  updateBumps();

  $("punchMessage").textContent =
    "Tap my face! It's only a cartoon 😅";

  showScreen("punchScreen");
});

// Play the cartoon tap animation.
function playImpact() {
  const stage = $("characterStage");
  const impact = $("impact");

  stage.classList.remove("hit");
  void stage.offsetWidth;
  stage.classList.add("hit");

  impact.classList.remove("show");
  void impact.offsetWidth;

  const effects = ["BOOP!", "POW!", "BONK!", "PAP!"];
  impact.textContent =
    effects[Math.floor(Math.random() * effects.length)];

  impact.classList.add("show");

  clearTimeout(impactTimer);
  impactTimer = setTimeout(() => {
    impact.classList.remove("show");
  }, 450);
}

// One direct tap = one percentage point less, until 0%.
function tapCartoon() {
  if (anger > 0) {
    anger = Math.max(0, anger - 1);
  }

  tapCount += 1;

  updateAnger();
  updateTapCount();
  updateBumps();
  playImpact();

  if (anger === 0) {
    $("punchMessage").textContent =
      "The meter is at zero! Let's make up with kindness 💗";
  } else if (tapCount >= 15) {
    $("punchMessage").textContent =
      "Maximum cartoon bumps! Time for a little break 😵‍💫";
  } else if (tapCount >= 8) {
    $("punchMessage").textContent =
      "Those cartoon cheeks are getting puffy! 🟣";
  } else if (tapCount >= 3) {
    $("punchMessage").textContent =
      "Oh no, little cartoon bumps! 💢";
  } else {
    $("punchMessage").textContent =
      "Tap registered! Exactly 1% less 💗";
  }
}

$("cartoon").addEventListener("click", tapCartoon);

// Allow keyboard users to interact with the cartoon too.
$("cartoon").addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    tapCartoon();
  }
});

// Reset the current round.
$("resetTapButton").addEventListener("click", () => {
  anger = levelAnger[selectedLevel];
  tapCount = 0;

  updateAnger();
  updateTapCount();
  updateBumps();

  $("punchMessage").textContent =
    "Fresh start! Tap the cartoon face 💗";
});

// Go directly to the final apology message.
$("finishButton").addEventListener("click", () => {
  $("finalMessage").textContent =
    "I'm sorry, Nann. I hope we can talk when you're ready. 💗";

  $("finalLevel").textContent = `Anger Level ${selectedLevel}`;
  $("finalAnger").textContent = `${anger}%`;
  $("finalTaps").textContent = String(tapCount);

  showScreen("finishScreen");
});

// Back buttons.
document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => {
    showScreen(button.dataset.go);
  });
});

// Start a new round.
$("restartButton").addEventListener("click", () => {
  selectedLevel = 2;
  anger = levelAnger[selectedLevel];
  tapCount = 0;

  updateLevelSelection();
  updateAnger();
  updateTapCount();
  updateBumps();

  $("punchMessage").textContent =
    "Tap my face! It's only a cartoon 😅";

  $("finalMessage").textContent =
    "I hope we can talk when you're ready. 💗";

  showScreen("welcomeScreen");
});

// Restore saved progress after a page refresh.
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

  if (saved && [1, 2, 3].includes(Number(saved.level))) {
    selectedLevel = Number(saved.level);

    anger = Number.isFinite(saved.anger)
      ? Math.max(0, Math.min(100, saved.anger))
      : levelAnger[selectedLevel];

    tapCount = Number.isFinite(saved.tapCount)
      ? Math.max(0, Math.floor(saved.tapCount))
      : 0;
  }
} catch (error) {
  console.warn("Saved progress could not be restored.", error);
}

// Initialize the page.
updateLevelSelection();
updateAnger();
updateTapCount();
updateBumps();
