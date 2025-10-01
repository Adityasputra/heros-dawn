// /**
//  * Currency management system for the game
//  */

// // Player's currency state
// let playerCurrency = {
//   gold: 0,
//   gems: 0,
//   tokens: 0,
// };

// // Load currency from localStorage
// export function loadCurrency() {
//   const savedCurrency = localStorage.getItem("playerCurrency");
//   if (savedCurrency) {
//     try {
//       playerCurrency = JSON.parse(savedCurrency);
//     } catch (e) {
//       console.error("Failed to parse saved currency:", e);
//     }
//   }

//   // Update UI
//   updateCurrencyDisplay();
// }

// // Save currency to localStorage
// export function saveCurrency() {
//   localStorage.setItem("playerCurrency", JSON.stringify(playerCurrency));
// }

// // Update the currency display in the UI
// export function updateCurrencyDisplay() {
//   const goldElement = document.getElementById("playerGold");
//   if (goldElement) {
//     goldElement.textContent = playerCurrency.gold.toLocaleString();
//   }
// }

// // Get current gold amount
// export function getGold() {
//   return playerCurrency.gold;
// }

// // Add gold to player's wallet
// export function addGold(amount) {
//   if (amount <= 0) return false;

//   playerCurrency.gold += amount;
//   updateCurrencyDisplay();
//   saveCurrency();

//   // Animate gold gain
//   animateGoldChange(amount, true);

//   return true;
// }

// // Remove gold from player's wallet
// export function removeGold(amount) {
//   if (amount <= 0) return false;
//   if (playerCurrency.gold < amount) return false;

//   playerCurrency.gold -= amount;
//   updateCurrencyDisplay();
//   saveCurrency();

//   // Animate gold loss
//   animateGoldChange(amount, false);

//   return true;
// }

// // Check if player has enough gold
// export function hasEnoughGold(amount) {
//   return playerCurrency.gold >= amount;
// }

// // Animate gold change
// function animateGoldChange(amount, isGain) {
//   const goldElement = document.getElementById("playerGold");
//   if (!goldElement) return;

//   // Create floating number element
//   const floatingNumber = document.createElement("div");
//   floatingNumber.className = `floating-number ${isGain ? "gain" : "loss"}`;
//   floatingNumber.textContent = `${
//     isGain ? "+" : "-"
//   }${amount.toLocaleString()}`;

//   // Position it near the gold display
//   const goldRect = goldElement.getBoundingClientRect();
//   floatingNumber.style.left = `${goldRect.left + goldRect.width / 2}px`;
//   floatingNumber.style.top = `${goldRect.top}px`;

//   // Add to document
//   document.body.appendChild(floatingNumber);

//   // Remove after animation completes
//   setTimeout(() => {
//     document.body.removeChild(floatingNumber);
//   }, 2000);

//   // Flash gold amount to indicate change
//   goldElement.classList.add("flash");
//   setTimeout(() => {
//     goldElement.classList.remove("flash");
//   }, 500);
// }
