const inventorySize = 16;
const inventory = Array(inventorySize).fill(null);
let draggedIndex = null;

function renderInventory() {
  const invElement = document.getElementById("inventory");
  invElement.innerHTML = "";

  for (let i = 0; i < inventorySize; i++) {
    const slot = document.createElement("div");
    slot.classList.add("slot");

    const item = inventory[i];
    if (item) {
      // kasih class rarity
      slot.classList.add(item.rarity);

      // gambar item
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.name;
      slot.appendChild(img);

      // kalau stack
      if (item.count > 1) {
        const countLabel = document.createElement("span");
        countLabel.classList.add("item-count");
        countLabel.textContent = "x" + item.count;
        slot.appendChild(countLabel);
      }
    } else {
      slot.textContent = "Empty";
      slot.classList.add("empty");
    }

    // klik hapus 1
    slot.addEventListener("click", () => {
      if (inventory[i]) {
        if (inventory[i].count > 1) {
          inventory[i].count--;
        } else {
          inventory[i] = null;
        }
        renderInventory();
      }
    });

    // drag & drop
    slot.draggable = !!item;
    slot.addEventListener("dragstart", () => { draggedIndex = i; });
    slot.addEventListener("dragover", (e) => {
      e.preventDefault();
      slot.classList.add("drag-over");
    });
    slot.addEventListener("dragleave", () => slot.classList.remove("drag-over"));
    slot.addEventListener("drop", () => {
      slot.classList.remove("drag-over");
      if (draggedIndex !== null && draggedIndex !== i) {
        moveItem(draggedIndex, i);
      }
    });

    invElement.appendChild(slot);
  }
}

// Tambah item dengan gambar & rarity
function addItem(name, rarity, image, amount = 1) {
  // coba stack dulu
  let stackIndex = inventory.findIndex(i => i && i.name === name && i.rarity === rarity);
  if (stackIndex !== -1) {
    inventory[stackIndex].count += amount;
    renderInventory();
    return;
  }

  // cari slot kosong
  const emptyIndex = inventory.findIndex(i => !i);
  if (emptyIndex !== -1) {
    inventory[emptyIndex] = { name, rarity, image, count: amount };
    renderInventory();
  } else {
    alert("Inventory penuh!");
  }
}

function moveItem(from, to) {
  if (!inventory[from]) return;

  if (inventory[to] && inventory[to].name === inventory[from].name && inventory[to].rarity === inventory[from].rarity) {
    // stack kalau sama persis (nama + rarity)
    inventory[to].count += inventory[from].count;
    inventory[from] = null;
  } else {
    // swap
    [inventory[to], inventory[from]] = [inventory[from], inventory[to]];
  }
  renderInventory();
}

function clearInventory() {
  for (let i = 0; i < inventorySize; i++) {
    inventory[i] = null;
  }
  renderInventory();
}

renderInventory();
