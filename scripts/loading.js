/**
 * Retro Pixel-Style Loading Manager
 * Handles the game loading screen
 */
class LoadingManager {
  constructor() {
    this.progress = 0;
    this.started = false;

    // Core elements
    this.progressBar = document.getElementById("loadingProgress");
    this.loadingScreen = document.getElementById("loadingScreen");
    this.loadingText = document.querySelector(".loading-text");
    this.pixelCharacter = document.querySelector(".pixel-character");

    // Fallbacks
    if (!this.progressBar) {
      console.warn("Loading progress bar not found in DOM");
      this.createFallbackProgressBar();
    }
    if (!this.loadingScreen) {
      console.warn("Loading screen not found in DOM");
      this.createFallbackLoadingScreen();
    }
    if (!this.loadingText) {
      console.warn("Loading text not found in DOM");
      this.createFallbackLoadingText();
    }

    // Global GameState init
    window.GameState = window.GameState || {
      ui: {},
      audio: {
        muted: localStorage.getItem("soundMuted") === "true" || false,
      },
    };

    this.loadSounds();
  }

  createFallbackProgressBar() {
    this.progressBar = document.createElement("div");
    this.progressBar.id = "loadingProgress";
    this.progressBar.className = "loading-bar";

    const container = document.createElement("div");
    container.className = "loading-bar-container";
    container.appendChild(this.progressBar);

    if (this.loadingScreen) {
      this.loadingScreen.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
  }

  createFallbackLoadingScreen() {
    this.loadingScreen = document.createElement("div");
    this.loadingScreen.id = "loadingScreen";
    this.loadingScreen.className = "loading-screen";
    document.body.appendChild(this.loadingScreen);
  }

  createFallbackLoadingText() {
    this.loadingText = document.createElement("p");
    this.loadingText.className = "loading-text";
    this.loadingText.textContent = "Loading...";
    (this.loadingScreen || document.body).appendChild(this.loadingText);
  }

  loadSounds() {
    this.sounds = {
      step: this.safeAudio("assets/audio/loading-step.mp3"),
      complete: this.safeAudio("assets/audio/loading-complete.mp3"),
    };
  }

  safeAudio(src) {
    try {
      return new Audio(src);
    } catch {
      return null;
    }
  }

  playSound(name) {
    if (!window.GameState.audio.muted && this.sounds[name]) {
      const sound = this.sounds[name].cloneNode();
      sound.volume = 0.3;
      sound.play().catch(() => {}); // ignore autoplay restriction
    }
  }

  start() {
    if (this.started) return;
    this.started = true;

    if (this.loadingScreen) {
      this.loadingScreen.style.display = "flex";
      this.loadingScreen.style.opacity = "1";

      if (!this.pixelCharacter) {
        this.pixelCharacter = document.createElement("div");
        this.pixelCharacter.className = "pixel-character";
        this.loadingScreen.prepend(this.pixelCharacter);
      }
    }

    this.simulateLoading();
  }

  simulateLoading() {
    const steps = [
      { text: "Initializing game world...", duration: 800 },
      { text: "Loading character data...", duration: 600 },
      { text: "Preparing quests...", duration: 500 },
      { text: "Crafting items...", duration: 400 },
      { text: "Summoning monsters...", duration: 400 },
      { text: "Sharpening pixel edges...", duration: 300 },
      { text: "Starting adventure...", duration: 300 },
    ];

    let currentStep = 0;

    const loadStep = () => {
      if (currentStep >= steps.length) {
        this.playSound("complete");
        this.complete();
        return;
      }

      const step = steps[currentStep];
      if (this.loadingText) this.loadingText.textContent = step.text;
      this.playSound("step");

      const targetProgress = Math.floor(
        ((currentStep + 1) / steps.length) * 100
      );

      this.animateProgress(targetProgress, step.duration, () => {
        currentStep++;
        setTimeout(loadStep, 200);
      });
    };

    setTimeout(loadStep, 400);
  }

  animateProgress(target, duration, callback) {
    const start = this.progress;
    const change = target - start;
    const totalSteps = 8;
    const stepInterval = duration / totalSteps;

    let currentStep = 0;

    const animateStep = () => {
      currentStep++;

      if (currentStep >= totalSteps) {
        this.progress = target;
        this.updateProgressBar();
        callback();
        return;
      }

      const glitch = Math.random() > 0.85 ? 2 : 0;
      this.progress =
        start + Math.floor((change * currentStep) / totalSteps) + glitch;

      this.updateProgressBar();
      setTimeout(animateStep, stepInterval);
    };

    setTimeout(animateStep, stepInterval);
  }

  updateProgressBar() {
    if (this.progressBar) {
      const pixelatedProgress = Math.round(this.progress / 5) * 5;
      this.progressBar.style.width = pixelatedProgress + "%";
      this.progressBar.setAttribute("aria-valuenow", pixelatedProgress);
    }
  }

  complete() {
    document.body.classList.add("pixel-transition");

    setTimeout(() => {
      if (this.loadingScreen) {
        this.loadingScreen.style.opacity = "0";

        setTimeout(() => {
          this.loadingScreen.style.display = "none";
          window.GameState.ui.loadingComplete = true;

          const nextPage = this.loadingScreen.dataset.next || "index.html";
          window.location.href = nextPage;
        }, 600);
      } else {
        window.location.href = "index.html";
      }
    }, 400);
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
