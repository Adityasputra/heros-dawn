class LoadingManager {
  constructor() {
    this.progress = 0;
    this.progressBar = document.getElementById("loadingProgress");
    this.loadingScreen = document.getElementById("loadingScreen");
    this.loadingText = document.querySelector(".loading-text");

    if (!this.progressBar) {
      console.warn("Loading progress bar not found in DOM");
    }
    if (!this.loadingScreen) {
      console.warn("Loading screen not found in DOM");
    }
    if (!this.loadingText) {
      console.warn("Loading text not found in DOM");
    }

    window.GameState = window.GameState || { ui: {} };
  }

  start() {
    if (this.loadingScreen) {
      this.loadingScreen.style.display = "flex";
      this.loadingScreen.style.opacity = "1";
    }
    this.simulateLoading();
  }

  simulateLoading() {
    const steps = [
      { text: "Initializing game world...", duration: 800 },
      { text: "Loading character data...", duration: 600 },
      { text: "Preparing quests...", duration: 500 },
      { text: "Setting up inventory...", duration: 400 },
      { text: "Starting adventure...", duration: 300 },
    ];

    let currentStep = 0;

    const loadStep = () => {
      if (currentStep >= steps.length) {
        this.complete();
        return;
      }

      const step = steps[currentStep];
      if (this.loadingText) {
        this.loadingText.textContent = step.text;
      }

      const targetProgress = ((currentStep + 1) / steps.length) * 100;
      this.animateProgress(targetProgress, step.duration, () => {
        currentStep++;
        setTimeout(loadStep, 100);
      });
    };

    setTimeout(loadStep, 400);
  }

  animateProgress(target, duration, callback) {
    const start = this.progress;
    const change = target - start;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      this.progress = start + change * this.easeOutCubic(progress);
      if (this.progressBar) {
        this.progressBar.style.width = this.progress + "%";
        this.progressBar.setAttribute(
          "aria-valuenow",
          this.progress.toFixed(0)
        );
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        callback();
      }
    };

    requestAnimationFrame(animate);
  }

  easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  complete() {
    setTimeout(() => {
      if (this.loadingScreen) {
        this.loadingScreen.style.opacity = "0";
        setTimeout(() => {
          this.loadingScreen.style.display = "none";
          window.GameState.ui.loadingComplete = true;

          window.location.href = "index.html";
        }, 500);
      } else {
        window.location.href = "index.html";
      }
    }, 300);
  }
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { LoadingManager };
} else {
  window.LoadingManager = new LoadingManager();
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    if (window.LoadingManager) {
      window.LoadingManager.start();
    }
  }, 100);
});
