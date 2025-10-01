document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
  const musicBtn = document.getElementById("musicBtn");
  const musicOnIcon = document.getElementById("musicOnIcon");
  const musicOffIcon = document.getElementById("musicOffIcon");
  const enterGameBtn = document.getElementById("enterGame");
  const settingsBtn = document.getElementById("settingsBtn");
  const aboutBtn = document.getElementById("aboutBtn");

  // Game State Management
  const GameState = {
    musicEnabled: localStorage.getItem("musicEnabled") === "true" || false,
    soundEnabled: localStorage.getItem("soundEnabled") !== "false", // default true
    pixelDensity: localStorage.getItem("pixelDensity") || "medium",

    save() {
      localStorage.setItem("musicEnabled", this.musicEnabled);
      localStorage.setItem("soundEnabled", this.soundEnabled);
      localStorage.setItem("pixelDensity", this.pixelDensity);
    },
  };

  // Enhanced Audio System
  const AudioManager = {
    bgm: new Audio("assets/audio/bgm.mp3"),
    sounds: {
      click: new Audio("assets/audio/click.mp3"),
      hover: new Audio("assets/audio/hover.mp3"),
      enter: new Audio("assets/audio/enter.mp3"),
    },

    // Play background music with fade in
    playBgm() {
      this.bgm.loop = true;
      this.bgm.volume = 0;

      const promise = this.bgm.play().catch((err) => {
        console.warn("Autoplay blocked until user interaction:", err);
      });

      // Fade in if playback started successfully
      if (promise !== undefined) {
        promise
          .then(() => {
            this.fadeIn(this.bgm, 0.5, 1500);
          })
          .catch(() => {});
      }
    },

    // Stop background music with fade out
    stopBgm() {
      this.fadeOut(this.bgm, 800, () => {
        this.bgm.pause();
        this.bgm.currentTime = 0;
      });
    },

    // Play a sound effect
    playSound(soundName) {
      if (!GameState.soundEnabled) return;

      // Clone to allow overlapping sounds
      const sound = this.sounds[soundName].cloneNode();
      sound.volume = 0.7;
      sound.play().catch(() => {});
    },

    // Fade audio in
    fadeIn(audioElement, targetVolume, duration) {
      const startVolume = audioElement.volume;
      const diff = targetVolume - startVolume;
      const steps = 20;
      const stepTime = duration / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          audioElement.volume = targetVolume;
          clearInterval(fadeInterval);
          return;
        }

        // Step volume change (with pixel style steps, not smooth)
        audioElement.volume = startVolume + diff * (currentStep / steps);
      }, stepTime);
    },

    // Fade audio out
    fadeOut(audioElement, duration, callback) {
      const startVolume = audioElement.volume;
      const steps = 10;
      const stepTime = duration / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        if (currentStep >= steps) {
          audioElement.volume = 0;
          clearInterval(fadeInterval);
          if (callback) callback();
          return;
        }

        // Step volume change (with pixel style steps, not smooth)
        audioElement.volume = startVolume * (1 - currentStep / steps);
      }, stepTime);
    },
  };

  // UI Animation System
  const UIEffects = {
    // Add pixel dust particles when clicking buttons
    createPixelDust(x, y) {
      const colors = ["#f8b700", "#ff3c3c", "#52c336", "#4b2d83"];
      const container = document.createElement("div");
      container.className = "pixel-dust-container";
      container.style.position = "fixed";
      container.style.left = `${x}px`;
      container.style.top = `${y}px`;
      container.style.pointerEvents = "none";
      container.style.zIndex = "1000";

      // Create 8 pixels
      for (let i = 0; i < 8; i++) {
        const pixel = document.createElement("div");
        pixel.className = "pixel-dust";

        // Pixel styling
        pixel.style.width = "4px";
        pixel.style.height = "4px";
        pixel.style.position = "absolute";
        pixel.style.backgroundColor =
          colors[Math.floor(Math.random() * colors.length)];

        // Random direction
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 40;
        const duration = 500 + Math.random() * 500;

        // Apply animation
        pixel.animate(
          [
            {
              transform: "translate(0, 0)",
              opacity: 1,
            },
            {
              transform: `translate(${Math.cos(angle) * distance}px, ${
                Math.sin(angle) * distance
              }px)`,
              opacity: 0,
            },
          ],
          {
            duration: duration,
            easing: "steps(8)",
            fill: "forwards",
          }
        );

        container.appendChild(pixel);
      }

      document.body.appendChild(container);

      // Remove after animation finishes
      setTimeout(() => {
        container.remove();
      }, 1500);
    },

    // Add hover effects to all buttons
    initButtonEffects() {
      const buttons = document.querySelectorAll("button");

      buttons.forEach((button) => {
        button.addEventListener("mouseenter", () => {
          AudioManager.playSound("hover");
        });

        button.addEventListener("click", (e) => {
          AudioManager.playSound("click");
          this.createPixelDust(e.clientX, e.clientY);
        });
      });
    },
  };

  // Initialize UI and state
  function init() {
    // Set initial icon state based on saved preference
    if (GameState.musicEnabled) {
      musicOnIcon.style.display = "inline";
      musicOffIcon.style.display = "none";

      // Try to start music if enabled
      AudioManager.bgm.muted = false;
      AudioManager.playBgm();
    } else {
      musicOnIcon.style.display = "none";
      musicOffIcon.style.display = "inline";
      AudioManager.bgm.muted = true;
    }

    // Initialize UI effects
    UIEffects.initButtonEffects();

    // Create starry background (retro effect)
    createStarryBackground();
  }

  // Create a pixelated starry background
  function createStarryBackground() {
    const stars = document.createElement("div");
    stars.className = "stars";

    // Add random stars
    for (let i = 0; i < 50; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.animationDelay = `${Math.random() * 2}s`;
      stars.appendChild(star);
    }

    document.body.appendChild(stars);
  }

  // Button Event Listeners
  musicBtn.addEventListener("click", () => {
    GameState.musicEnabled = !GameState.musicEnabled;

    if (GameState.musicEnabled) {
      musicOnIcon.style.display = "inline";
      musicOffIcon.style.display = "none";
      AudioManager.bgm.muted = false;
      AudioManager.playBgm();
    } else {
      musicOnIcon.style.display = "none";
      musicOffIcon.style.display = "inline";
      AudioManager.stopBgm();
    }

    // Save preference
    GameState.save();
  });

  // "Enter Game" button
  if (enterGameBtn) {
    enterGameBtn.addEventListener("click", () => {
      AudioManager.playSound("enter");

      // Simulate game loading with pixel transition
      document.body.classList.add("pixel-transition-out");

      setTimeout(() => {
        window.location.href = "play.html";
      }, 1200);
    });
  }

  // Initialize
  init();
});