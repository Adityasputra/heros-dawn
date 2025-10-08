export class FooterTips {
  constructor() {
    this.tips = [
      "💡 Tip: Click items in your inventory to see details",
      "⚔️ Tip: Battle enemies to gain experience and gold",
      "🛒 Tip: Visit the shop to buy better equipment",
      "📜 Tip: Complete quests for valuable rewards",
      "🎵 Tip: Toggle music with the music button",
      "💾 Tip: Your progress is automatically saved",
    ];

    this.currentTip = 0;
    this.tipElement = document.getElementById("footerTip");

    if (this.tipElement) {
      this.startRotation();
    }
  }

  startRotation() {
    // Change tip every 10 seconds
    setInterval(() => {
      this.showNextTip();
    }, 10000);
  }

  showNextTip() {
    if (this.tipElement) {
      this.currentTip = (this.currentTip + 1) % this.tips.length;
      this.tipElement.textContent = this.tips[this.currentTip];
    }
  }

  static updateSaveStatus(message) {
    const statusElement = document.getElementById("saveStatusText");
    if (statusElement) {
      statusElement.textContent = message;
    }
  }
}
