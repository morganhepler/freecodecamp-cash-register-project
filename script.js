// DOM Elements
const changeDue = document.getElementById("change-due");
const changeDueContainer = document.getElementById("change-due-container");
const overlay = document.getElementById("overlay");
const cash = document.getElementById("cash");
const purchaseBtn = document.getElementById("purchase-btn");
const itemPrice = document.getElementById("item-price");
const changeInDrawer = document.getElementById("change-in-drawer");
const doneBtn = document.getElementById("done-btn");

const coffeeContainer = document.getElementById("coffee-container");
const teaContainer = document.getElementById("tea-container");
const pastryContainer = document.getElementById("pastry-container");

// Currency and Drawer
const currencyInCents = [1,5,10,25,100,500,1000,2000,10000];
let price = 0;
let cid = [
  ["PENNY", 1.01], ["NICKEL", 2.05], ["DIME", 3.1], ["QUARTER", 4.25],
  ["ONE", 90], ["FIVE", 55], ["TEN", 20], ["TWENTY", 60], ["ONE HUNDRED", 100]
];

// Menu Items
const menuItems = [
  ...[
    ["Brewed Coffee", 2.5], ["Espresso",2.25], ["Americano",2.75],
    ["Cappuccino",3.5], ["Latte",3.75], ["Mocha",4], ["Iced Coffee",3]
  ].map(i => ({type:'coffee', name:i[0], price:i[1]})),
  ...[
    ["Black Tea",2.25], ["Green Tea",2.25], ["Matcha Latte",3.75], ["Chai Latte",3.5]
  ].map(i => ({type:'tea', name:i[0], price:i[1]})),
  ...[
    ["Croissant",2.75], ["Muffin",2.5], ["Scone",2.75], ["Cinnamon Roll",3], ["Cookie",1.75]
  ].map(i => ({type:'pastry', name:i[0], price:i[1]}))
];

// Display Menu Items
function displayItems() {
  menuItems.forEach(item => {
    const container = document.getElementById(`${item.type}-container`);
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = item.price;
    input.name = 'menu-items';
    label.append(input, ` ${item.name} ($${item.price.toFixed(2)})`);
    container.appendChild(label);
  });
}

// Update UI
function updateUI() {
  itemPrice.textContent = `$${price.toFixed(2)}`;
  changeInDrawer.innerHTML = '';
  cid.forEach(el => {
    const div = document.createElement('div');
    div.classList.add('drawer-item');
    div.innerHTML = `<span class="currency">${el[0]}</span> <span class="amount">$${el[1].toFixed(2)}</span>`;
    changeInDrawer.appendChild(div);
  });
}

// Update Drawer Status
function updateStatus(status, changeBreakdown) {
  changeDue.textContent = `Status: ${status}`;
  changeBreakdown.forEach(el => {
    const p = document.createElement('p');
    p.textContent = `${el[0]}: $${el[1].toFixed(2)}`;
    changeDue.appendChild(p);
  });
}

// Handle Change Calculation
function handleChange(change) {
  let changeInCents = Math.round(change*100);
  let cidInCents = cid.map(el => Math.round(el[1]*100));
  const totalCidInCents = cidInCents.reduce((a,b)=>a+b,0);
  let changeBreakdown = [];

  if (changeInCents > totalCidInCents) {
    updateStatus("INSUFFICIENT_FUNDS", []);
  }
  else if (changeInCents === totalCidInCents) {
    updateStatus("CLOSED", cid.filter(el => el[1] > 0));
  } 
  else {
    for (let i = currencyInCents.length-1; i >= 0; i--) {
      let used = 0;
      let available = cidInCents[i];
      while (changeInCents >= currencyInCents[i] && available > 0) {
        changeInCents -= currencyInCents[i];
        available -= currencyInCents[i];
        used += currencyInCents[i];
      }
      cidInCents[i] = available;
      if (used > 0) {
        changeBreakdown.push([cid[i][0], used/100]);
      }
    }
    if (changeInCents > 0) {
        updateStatus("INSUFFICIENT_FUNDS", []);
    }
    else {
      updateStatus("OPEN", changeBreakdown);
      cid.forEach((el,index) => el[1] = cidInCents[index]/100);
    }
  }
}

// Check Cash Value
function checkCashValue() {
  const cashValue = Number(cash.value);
  if (cashValue < price) { 
    alert("Customer does not have enough money to purchase the item"); 
    return; 
  }
  changeDueContainer.style.display = "block";
  overlay.style.display = "block";
  if (cashValue === price) {
    changeDue.textContent = "No change due - customer paid with exact cash";
  }
  else {
    handleChange(cashValue-price);
  }
  updateUI();
}

// Update price
function updatePrice(item) {
  const val = parseFloat(item.value);
  price += item.checked ? val : -val;
  updateUI();
}

// Reset Order
function resetOrder() {
  changeDueContainer.style.display = "none";
  overlay.style.display = "none";
  cash.value = "";
  document.querySelectorAll('input[name="menu-items"]').forEach(i => i.checked = false);
  price = 0;
  updateUI();
}

// Initialize
displayItems();
document.querySelectorAll('input[name="menu-items"]').forEach(i => i.addEventListener('change',() => updatePrice(i)));
purchaseBtn.addEventListener('click', checkCashValue);
doneBtn.addEventListener('click', resetOrder);
updateUI();
