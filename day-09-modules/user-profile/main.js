import { characterData } from "./data.js";
import { generateBattleCard } from "./utils.js";

let appState = [...characterData];
let currentSquadValue = 0;

const gridContainer = document.getElementById("roster-grid");
const filterContainer = document.getElementById("filter-container");
const squadValueDisplay = document.getElementById("squad-value");
const toastElement = document.getElementById("action-toast");

const renderRoster = (data) => {
  gridContainer.innerHTML = data
    .map((char) => generateBattleCard(char))
    .join("");
};

const showToast = (name) => {
  toastElement.textContent = `${name} joined your squad!`;
  toastElement.classList.add("show");
  setTimeout(() => {
    toastElement.classList.remove("show");
  }, 2500);
};

gridContainer.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("hire-btn") &&
    !e.target.classList.contains("hired")
  ) {
    const charId = e.target.getAttribute("data-target-id");
    const price = parseInt(e.target.getAttribute("data-price"));

    const characterIndex = appState.findIndex((char) => char.id === charId);

    appState[characterIndex].isHired = true;

    currentSquadValue += price;
    squadValueDisplay.textContent = `¥${currentSquadValue.toLocaleString()}`;

    e.target.classList.add("hired");
    e.target.textContent = "Acquired";

    showToast(appState[characterIndex].name);
  }
});

filterContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("filter-btn")) {
    document
      .querySelectorAll(".filter-btn")
      .forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    const selectedRole = e.target.getAttribute("data-role");

    if (selectedRole === "All") {
      renderRoster(appState);
    } else {
      const filteredData = appState.filter(
        (char) => char.role === selectedRole,
      );
      renderRoster(filteredData);
    }
  }
});

renderRoster(appState);
