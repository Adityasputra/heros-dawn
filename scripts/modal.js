/**
 * Modal Manager for Hero's Dawn
 * Handles modal functionality for settings and about dialogs
 */
class ModalManager {
  constructor() {
    // Cache DOM elements
    this.settingsBtn = document.getElementById('settingsBtn');
    this.aboutBtn = document.getElementById('aboutBtn');
    this.settingsModal = document.getElementById('settingsModal');
    this.aboutModal = document.getElementById('aboutModal');
    this.saveSettingsBtn = document.getElementById('saveSettings');
    
    // All close buttons
    this.closeButtons = document.querySelectorAll('.close-btn');
    
    // Settings form elements (CRT Effect dihapus)
    this.musicVolume = document.getElementById('musicVolume');
    this.sfxVolume = document.getElementById('sfxVolume');
    this.pixelDensity = document.getElementById('pixelDensity');
    
    // Settings values
    this.sliderValues = document.querySelectorAll('.slider-value');
    
    // Initialize
    this.initSettings();
    this.bindEvents();
  }
  
  initSettings() {
    // Load saved settings from localStorage
    if (localStorage.getItem('musicVolume')) {
      this.musicVolume.value = localStorage.getItem('musicVolume');
      this.updateSliderValue(this.musicVolume);
    }
    
    if (localStorage.getItem('sfxVolume')) {
      this.sfxVolume.value = localStorage.getItem('sfxVolume');
      this.updateSliderValue(this.sfxVolume);
    }
    
    if (localStorage.getItem('pixelDensity')) {
      this.pixelDensity.value = localStorage.getItem('pixelDensity');
    }
    
    // CRT Effect initialization dihapus
  }
  
  bindEvents() {
    // Open Settings modal
    this.settingsBtn.addEventListener('click', () => {
      this.openModal(this.settingsModal);
      this.playSound('click');
    });
    
    // Open About modal
    this.aboutBtn.addEventListener('click', () => {
      this.openModal(this.aboutModal);
      this.playSound('click');
    });
    
    // Close buttons
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        this.closeModal(modal);
        this.playSound('click');
      });
    });
    
    // Close modal when clicking outside content
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeModal(e.target);
      }
    });
    
    // Close modal with ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => this.closeModal(modal));
      }
    });
    
    // Save settings
    this.saveSettingsBtn.addEventListener('click', () => {
      this.saveSettings();
      this.closeModal(this.settingsModal);
      this.playSound('click');
      
      // Show settings saved notification
      this.showNotification('Settings saved!');
    });
    
    // Update slider values in real-time
    this.musicVolume.addEventListener('input', () => this.updateSliderValue(this.musicVolume));
    this.sfxVolume.addEventListener('input', () => this.updateSliderValue(this.sfxVolume));
    
    // CRT Effect event listener dihapus
  }
  
  openModal(modal) {
    if (!modal) return;
    
    // Close any open modals first
    const openModals = document.querySelectorAll('.modal.show');
    openModals.forEach(m => this.closeModal(m));
    
    // Show the modal with pixel-style animation
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Add class to body to prevent scrolling
    document.body.classList.add('modal-open');
  }
  
  closeModal(modal) {
    if (!modal) return;
    
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }
  
  updateSliderValue(slider) {
    const valueDisplay = slider.nextElementSibling;
    if (valueDisplay) {
      valueDisplay.textContent = `${slider.value}%`;
    }
    
    // If we have audio manager, update volume in real-time
    if (window.AudioManager) {
      if (slider.id === 'musicVolume') {
        window.AudioManager.setBgmVolume(slider.value / 100);
      } else if (slider.id === 'sfxVolume') {
        window.AudioManager.setSfxVolume(slider.value / 100);
      }
    }
  }
  
  // toggleCrtEffect function dihapus
  
  saveSettings() {
    // Save all settings to localStorage (CRT Effect dihapus)
    localStorage.setItem('musicVolume', this.musicVolume.value);
    localStorage.setItem('sfxVolume', this.sfxVolume.value);
    localStorage.setItem('pixelDensity', this.pixelDensity.value);
    
    // Apply settings to game
    this.applySettings();
  }
  
  applySettings() {
    // Apply to global game state if available
    if (window.GameState) {
      window.GameState.settings = {
        musicVolume: this.musicVolume.value / 100,
        sfxVolume: this.sfxVolume.value / 100,
        pixelDensity: this.pixelDensity.value
        // crtEffect dihapus
      };
    }
    
    // CRT Effect apply dihapus
    
    // Apply pixel density
    document.documentElement.setAttribute('data-pixel-density', this.pixelDensity.value);
  }
  
  showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type} pixel-border`;
    notification.textContent = message;
    
    // Add to the DOM
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  playSound(soundName) {
    if (window.AudioManager && typeof window.AudioManager.playSound === 'function') {
      window.AudioManager.playSound(soundName);
    }
  }
}

// Initialize modal manager
document.addEventListener('DOMContentLoaded', () => {
  window.ModalManager = new ModalManager();
});