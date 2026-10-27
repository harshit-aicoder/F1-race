/**
 * FORMULA 1 RACE INTELLIGENCE — CREATOR PROFILE MANAGER
 * Handles dynamic rendering, interactive photo upload/persistence, and profile sync.
 */

class CreatorProfileManager {
  constructor() {
    this.config = window.CREATOR_CONFIG || {
      name: "Harshit Tiwari",
      role: "Creator & Developer",
      country: "India",
      countryFlag: "🇮🇳",
      description: "Building an immersive Formula 1 analytics experience by combining data science, interactive visualization, and modern web technology.",
      linkedinUrl: "https://www.linkedin.com/in/harshit-tiwari-584a57324/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BBsqwXxeDT%2BqsPlkeArq0tA%3D%3D",
      photoPath: "assets/harshit-tiwari.webp",
      initials: "HT"
    };
    this.storageKey = "f1_creator_custom_photo";
  }

  init() {
    console.log("[CreatorProfile] Initializing profile for:", this.config.name);
    this.populateStaticDetails();
    this.setupPhotoHandler();
    this.bindEvents();
  }

  populateStaticDetails() {
    // Populate all text elements mapped to config
    const nameEls = document.querySelectorAll(".creator-name-display");
    const roleEls = document.querySelectorAll(".creator-role-display");
    const descEls = document.querySelectorAll(".creator-desc-display");
    const countryEls = document.querySelectorAll(".creator-country-display");
    const linkedinLinks = document.querySelectorAll(".creator-linkedin-link");

    nameEls.forEach(el => el.textContent = this.config.name);
    roleEls.forEach(el => el.textContent = this.config.role);
    descEls.forEach(el => el.textContent = this.config.description);
    countryEls.forEach(el => el.textContent = `${this.config.countryFlag} ${this.config.country}`);

    linkedinLinks.forEach(link => {
      link.href = this.config.linkedinUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", `Visit ${this.config.name}'s LinkedIn profile`);
    });

    // Populate Creator Stats Grid
    const statsContainer = document.getElementById("creator-stats-grid");
    if (statsContainer && this.config.stats) {
      statsContainer.innerHTML = this.config.stats.map(s => `
        <div class="creator-stat-badge">
          <div class="creator-stat-label">${s.label}</div>
          <div class="creator-stat-value mono-font">${s.value}</div>
        </div>
      `).join("");
    }

    // Populate Competencies
    const compContainer = document.getElementById("creator-competencies-list");
    if (compContainer && this.config.competencies) {
      compContainer.innerHTML = this.config.competencies.map(c => `
        <span class="creator-tech-pill">${c}</span>
      `).join("");
    }
  }

  setupPhotoHandler() {
    const avatarImg = document.getElementById("creator-avatar-img");
    const avatarMonogram = document.getElementById("creator-avatar-monogram");
    const uploadInput = document.getElementById("creator-photo-upload-input");
    const resetBtn = document.getElementById("creator-photo-reset-btn");

    if (!avatarImg || !avatarMonogram) return;

    // Check localStorage for previously uploaded photo
    const savedPhoto = localStorage.getItem(this.storageKey);

    if (savedPhoto) {
      this.displayCustomImage(savedPhoto);
      if (resetBtn) resetBtn.style.display = "inline-flex";
      return;
    }

    // Try loading configured photo asset
    const testImg = new Image();
    testImg.onload = () => {
      this.displayCustomImage(this.config.photoPath);
    };
    testImg.onerror = () => {
      // Show monogram placeholder
      this.displayMonogram();
    };
    testImg.src = this.config.photoPath;
  }

  displayCustomImage(src) {
    const avatarImg = document.getElementById("creator-avatar-img");
    const avatarMonogram = document.getElementById("creator-avatar-monogram");
    const resetBtn = document.getElementById("creator-photo-reset-btn");

    if (avatarImg && avatarMonogram) {
      avatarImg.src = src;
      avatarImg.style.display = "block";
      avatarMonogram.style.display = "none";
      if (resetBtn) resetBtn.style.display = "inline-flex";
    }

    // Update thumbnail avatars in hero and navbar
    const thumbAvatars = document.querySelectorAll(".creator-thumb-img");
    thumbAvatars.forEach(img => {
      img.src = src;
      img.style.display = "block";
    });
    const thumbMonograms = document.querySelectorAll(".creator-thumb-monogram");
    thumbMonograms.forEach(mono => {
      mono.style.display = "none";
    });
  }

  displayMonogram() {
    const avatarImg = document.getElementById("creator-avatar-img");
    const avatarMonogram = document.getElementById("creator-avatar-monogram");
    const resetBtn = document.getElementById("creator-photo-reset-btn");

    if (avatarImg && avatarMonogram) {
      avatarImg.style.display = "none";
      avatarMonogram.style.display = "flex";
      if (resetBtn) resetBtn.style.display = "none";
    }
  }

  bindEvents() {
    const uploadInput = document.getElementById("creator-photo-upload-input");
    const triggerBtn = document.getElementById("creator-photo-upload-trigger");
    const dropZone = document.getElementById("creator-avatar-frame");
    const resetBtn = document.getElementById("creator-photo-reset-btn");

    // Click on trigger button or avatar frame opens file dialog
    if (triggerBtn && uploadInput) {
      triggerBtn.addEventListener("click", () => uploadInput.click());
    }

    // File selection
    if (uploadInput) {
      uploadInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          this.handleImageFile(file);
        }
      });
    }

    // Drag & Drop
    if (dropZone) {
      ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.add("drag-over");
        });
      });

      ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropZone.classList.remove("drag-over");
        });
      });

      dropZone.addEventListener("drop", (e) => {
        const files = e.dataTransfer.files;
        if (files && files[0]) {
          this.handleImageFile(files[0]);
        }
      });
    }

    // Reset photo button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        localStorage.removeItem(this.storageKey);
        this.displayMonogram();
      });
    }
  }

  handleImageFile(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, WebP).");
      return;
    }

    // Limit size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      try {
        localStorage.setItem(this.storageKey, dataUrl);
      } catch (err) {
        console.warn("[CreatorProfile] LocalStorage quota exceeded, displaying in session:", err);
      }
      this.displayCustomImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }
}

// Mount on DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  window.creatorProfile = new CreatorProfileManager();
  window.creatorProfile.init();
});
