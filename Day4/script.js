// Element Selectors
const noteInput = document.getElementById("note-input");
const charCount = document.getElementById("char-count");
const wordCount = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggle = document.getElementById("theme-toggle");

const MAX_CHARS = 200;

// Update character and word counters & warning status
function updateCounts() {
  const text = noteInput.value;
  const chars = text.length;

  // Words calculation (filter out empty strings caused by extra spaces)
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  charCount.textContent = `${chars} / ${MAX_CHARS} characters`;
  wordCount.textContent = `${words} ${words === 1 ? "word" : "words"}`;

  // Toggle warning class if over limit
  if (chars > MAX_CHARS) {
    charCount.classList.add("warning");
  } else {
    charCount.classList.remove("warning");
  }
}

// Clear input field and localStorage draft
function clearAll() {
  noteInput.value = "";
  localStorage.removeItem("noteDraft");
  updateCounts();
}

// Event Listeners
noteInput.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem("noteDraft", noteInput.value);
});

clearBtn.addEventListener("click", clearAll);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    clearAll();
  }
});

themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  if (newTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
  } else {
    document.body.removeAttribute("data-theme");
  }

  localStorage.setItem("themePreference", newTheme);
});

// Initial Restore on Load
document.addEventListener("DOMContentLoaded", () => {
  // Restore Theme
  const savedTheme = localStorage.getItem("themePreference");
  if (savedTheme === "dark") {
    document.body.setAttribute("data-theme", "dark");
  }

  // Restore Draft
  const savedDraft = localStorage.getItem("noteDraft");
  if (savedDraft) {
    noteInput.value = savedDraft;
  }

  // Initial count update
  updateCounts();
});