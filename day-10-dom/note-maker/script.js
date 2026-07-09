document.addEventListener("DOMContentLoaded", () => {
  const onboardingOverlay = document.getElementById("onboarding-overlay");
  const onboardingForm = document.getElementById("onboarding-form");
  const usernameInput = document.getElementById("username-input");
  const appContainer = document.getElementById("app-container");
  const greeting = document.getElementById("greeting");
  const noteForm = document.getElementById("note-form");
  const notesGrid = document.getElementById("notes-grid");
  const emptyState = document.getElementById("empty-state");
  const syncStatus = document.getElementById("sync-status");
  const addNoteBtn = document.getElementById("add-note-btn");

  let currentUser = localStorage.getItem("glassNotesUser");
  let notes = [];

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  init();

  async function init() {
    if (!currentUser) {
      onboardingOverlay.classList.remove("hidden");
      return;
    }

    onboardingOverlay.classList.add("hidden");
    appContainer.classList.remove("hidden");
    greeting.textContent = `Hello, ${currentUser}! 👋`;

    await fetchAndRenderNotes();
  }

  onboardingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = usernameInput.value.trim();

    if (!name) return;

    localStorage.setItem("glassNotesUser", name);
    currentUser = name;

    init();
  });

  noteForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("note-title").value.trim();
    const content = document.getElementById("note-content").value.trim();
    const color = document.querySelector(
      'input[name="note-color"]:checked',
    ).value;

    if (!title || !content) return;

    const note = {
      id: crypto.randomUUID(),
      title,
      content,
      color,
      date: new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    addNoteBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';
    addNoteBtn.disabled = true;

    await saveNote(note);

    noteForm.reset();

    document.querySelector('input[name="note-color"]').checked = true;

    addNoteBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Save Note';
    addNoteBtn.disabled = false;

    await fetchAndRenderNotes();
  });

  notesGrid.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-btn");

    if (!deleteBtn) return;

    deleteNote(deleteBtn.dataset.id);
  });

  async function updateSyncStatus(syncing) {
    syncStatus.innerHTML = syncing
      ? '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Syncing...'
      : '<i class="fa-solid fa-cloud-check"></i> Synced to Local';

    syncStatus.style.color = syncing ? "#8CC0DE" : "#666";
  }

  async function fetchAndRenderNotes() {
    await updateSyncStatus(true);

    await delay(400);

    notes = JSON.parse(localStorage.getItem("glassNotesData") || "[]");

    renderNotes();
    await updateSyncStatus(false);
  }

  async function saveNote(note) {
    await updateSyncStatus(true);

    await delay(600);

    notes.unshift(note);

    localStorage.setItem("glassNotesData", JSON.stringify(notes));

    await updateSyncStatus(false);
  }

  async function deleteNote(id) {
    await updateSyncStatus(true);

    await delay(400);

    notes = notes.filter((note) => note.id !== id);

    localStorage.setItem("glassNotesData", JSON.stringify(notes));

    renderNotes();

    await updateSyncStatus(false);
  }

  function renderNotes() {
    notesGrid.innerHTML = "";

    if (!notes.length) {
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");

    const fragment = document.createDocumentFragment();

    notes.forEach((note) => {
      const card = document.createElement("div");

      card.className = "note-card glass-panel";
      card.style.background = `rgba(${hexToRgb(note.color)}, 0.6)`;

      card.innerHTML = `
        <h4>${escapeHTML(note.title)}</h4>
        <p>${escapeHTML(note.content)}</p>
        <span class="note-date">${note.date}</span>
        <button class="delete-btn" data-id="${note.id}" aria-label="Delete Note">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      `;

      fragment.appendChild(card);
    });

    notesGrid.appendChild(fragment);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : "255, 255, 255";
  }

  function escapeHTML(str) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };

    return str.replace(/[&<>'"]/g, (char) => map[char]);
  }
});
