const bingoGrid = document.getElementById("bingo-grid");
const newCardButton = document.getElementById("new-card-button");
const clearButton = document.getElementById("clear-button");

const STORAGE_KEY = "bingo-card-poc-state";

const columns = [
  { letter: "B", min: 1, max: 15 },
  { letter: "I", min: 16, max: 30 },
  { letter: "N", min: 31, max: 45 },
  { letter: "G", min: 46, max: 60 },
  { letter: "O", min: 61, max: 75 },
];

let currentCard = null;
let markedPositions = new Set();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function drawUniqueNumbers(min, max, count) {
  const values = new Set();

  while (values.size < count) {
    values.add(randomInt(min, max));
  }

  return Array.from(values);
}

function createBingoCard() {
  const card = [];

  columns.forEach((column) => {
    card.push(drawUniqueNumbers(column.min, column.max, 5));
  });

  card[2][2] = "FREE";

  return card;
}

function positionKey(columnIndex, rowIndex) {
  return `${columnIndex}-${rowIndex}`;
}

function saveState() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      card: currentCard,
      markedPositions: Array.from(markedPositions),
    })
  );
}

function loadState() {
  const rawState = localStorage.getItem(STORAGE_KEY);

  if (!rawState) {
    return false;
  }

  const state = JSON.parse(rawState);

  if (!Array.isArray(state.card) || state.card.length !== 5) {
    return false;
  }

  currentCard = state.card;
  markedPositions = new Set(Array.isArray(state.markedPositions) ? state.markedPositions : []);
  markedPositions.add(positionKey(2, 2));

  return true;
}

function createCell(value, columnIndex, rowIndex) {
  const cell = document.createElement("button");
  const key = positionKey(columnIndex, rowIndex);
  const isMarked = markedPositions.has(key);

  cell.type = "button";
  cell.className = "bingo-cell";
  cell.textContent = value;
  cell.setAttribute("aria-pressed", String(isMarked));
  cell.dataset.column = String(columnIndex);
  cell.dataset.row = String(rowIndex);

  if (value === "FREE") {
    cell.classList.add("free");
  }

  if (isMarked) {
    cell.classList.add("marked");
  }

  cell.addEventListener("click", () => {
    cell.classList.toggle("marked");

    if (cell.classList.contains("marked")) {
      markedPositions.add(key);
    } else {
      markedPositions.delete(key);
    }

    cell.setAttribute("aria-pressed", String(cell.classList.contains("marked")));
    saveState();
  });

  return cell;
}

function renderCard() {
  bingoGrid.replaceChildren();

  for (let rowIndex = 0; rowIndex < 5; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < 5; columnIndex += 1) {
      const value = currentCard[columnIndex][rowIndex];
      bingoGrid.appendChild(createCell(value, columnIndex, rowIndex));
    }
  }
}

function generateNewCard() {
  currentCard = createBingoCard();
  markedPositions = new Set([positionKey(2, 2)]);
  renderCard();
  saveState();
}

function clearMarks() {
  markedPositions = new Set([positionKey(2, 2)]);
  renderCard();
  saveState();
}

newCardButton.addEventListener("click", generateNewCard);
clearButton.addEventListener("click", clearMarks);

if (!loadState()) {
  generateNewCard();
} else {
  renderCard();
}