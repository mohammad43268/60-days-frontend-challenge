const balance = document.getElementById("total-amount");
const money_plus = document.getElementById("total-income");
const money_minus = document.getElementById("total-expense");
const list = document.getElementById("list");
const form = document.getElementById("tracker-form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");

let transactions = [];

function generateID() {
  return Math.floor(Math.random() * 100000000);
}

function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === "" || amount.value.trim() === "") {
    alert("Please add a description and amount");
    return;
  }

  const transaction = {
    id: generateID(),
    text: text.value,
    amount: +amount.value,
    category: category.value,
    date: new Date().toLocaleDateString(),
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();

  text.value = "";
  amount.value = "";
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");

  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  item.innerHTML = `
        <div>
            <strong>${transaction.text}</strong> <br>
            <small style="color: #aaa">${transaction.category} | ${transaction.date}</small>
        </div>
        <div>
            <span>${sign}$${Math.abs(transaction.amount)}</span>
            <button class="delete-btn" onclick="removeTransaction(${transaction.id})">X</button>
        </div>
    `;

  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount);
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);

  const expense = (
    amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) *
    -1
  ).toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `+$${income}`;
  money_minus.innerText = `-$${expense}`;
}

function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id);
  init();
}

function init() {
  list.innerHTML = "";
  transactions.forEach(addTransactionDOM);
  updateValues();
}

init();

form.addEventListener("submit", addTransaction);
