let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },

]
function searchNotes(word) {
  const lowerWord = word.toLowerCase();
  return notes.filter((note) => note.text.toLowerCase().includes(lowerWord));
}

function longestNote() {
  if (notes.length === 0) return null;
  return notes.reduce((max, note) =>
    note.text.length > max.text.length ? note : max
  );
}


function countByCategory() {
  const counts = {};
  for (const note of notes) {
    counts[note.category] = (counts[note.category] || 0) + 1;
  }
  return counts;
}

function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const label = total === 1 ? "note" : "notes";

  const categories = Object.entries(counts)
    .map(([cat, count]) => `${count} ${cat}`)
    .join(", ");

  return `${total} ${label}: ${categories}.`;
}

function isDuplicate(text) {
  const cleanInput = text.trim().toLowerCase();
  return notes.some((note) => note.text.trim().toLowerCase() === cleanInput);
}

function addNote(text, category) {
  const validCategories = ["personal", "work", "study"];

  if (typeof text !== "string") {
    console.log("Failed to add note: Text must be a string.");
    return false;
  }

  const trimmed = text.trim();

  if (trimmed.length < 1 || trimmed.length > 200) {
    console.log("Failed to add note: Length must be between 1 and 200 characters.");
    return false;
  }

  if (!validCategories.includes(category)) {
    console.log("Failed to add note: Invalid category. Must be personal, work, or study.");
    return false;
  }

  if (isDuplicate(text)) {
    console.log("Failed to add note: Note already exists.");
    return false;
  }

  const nextId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  notes.push({ id: nextId, text: trimmed, category });
  return true;
}


console.log("--- Testing searchNotes ---");
console.log(searchNotes("javascript")); 


console.log(searchNotes("python")); 

console.log("\n--- Testing longestNote ---");
console.log(longestNote()); 

const tempNotes = notes;
notes = [];
console.log(longestNote()); 
notes = tempNotes; 

console.log("\n--- Testing countByCategory ---");
console.log(countByCategory()); 

const singleNoteBackup = notes;
notes = [{ id: 1, text: "Solo note", category: "work" }];
console.log(countByCategory()); 
notes = singleNoteBackup; 

console.log("\n--- Testing getSummary ---");
console.log(getSummary()); 


const summaryBackup = notes;
notes = [{ id: 1, text: "Only one", category: "personal" }];
console.log(getSummary()); 
notes = summaryBackup; 

console.log("\n--- Testing isDuplicate ---");
console.log(isDuplicate("  buy milk and BREAD  ")); 

console.log(isDuplicate("Buy chocolate milk")); 


console.log("\n--- Testing addNote ---");
console.log(addNote(" Plan grocery shopping list ", "personal")); 


console.log(addNote("Call mum", "personal")); 


console.log(addNote("", "work")); 

console.log(addNote("Read documentation", "hobbies")); 
