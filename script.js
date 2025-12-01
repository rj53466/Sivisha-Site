// Main initialization
document.addEventListener("DOMContentLoaded", initializeApp);

function initializeApp() {
  document.getElementById("year").textContent = new Date().getFullYear();
  initScrollEffects();
  initNavigation();
  initFormHandling();
  initScrollAnimations();
}

/* Header scroll state */
function initScrollEffects() {
  const siteHeader = document.querySelector(".site-header");
  if (!siteHeader) return;

  window.addEventListener("scroll", () => {
    siteHeader.classList.toggle("scrolled", window.scrollY > 40);
  });
}

/* Navigation + smooth scroll */
function initNavigation() {
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const isExpanded = mainNav.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isExpanded);
    });

    // Close mobile nav when clicking outside
    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 680 &&
        mainNav.classList.contains("open") &&
        !mainNav.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });

    // Close mobile nav on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && mainNav.classList.contains("open")) {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  // Smooth scroll for nav links
  document.querySelectorAll('nav a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const id = link.getAttribute("href").substring(1);
      scrollToSection(id);
    });
  });
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const headerOffset = 72;
  const rect = el.getBoundingClientRect();
  const offsetTop = rect.top + window.scrollY - headerOffset;

  window.scrollTo({
    top: offsetTop,
    behavior: "smooth",
  });

  // Close mobile nav after navigation
  if (window.innerWidth <= 680) {
    const mainNav = document.getElementById("mainNav");
    const navToggle = document.getElementById("navToggle");
    if (mainNav && navToggle) {
      mainNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  }
}

// Expose for inline onclick in HTML
window.scrollToSection = scrollToSection;

/* Back-to-top + reveal animations */
function initScrollAnimations() {
  const backToTop = document.getElementById("backToTop");

  if (backToTop) {
    window.addEventListener("scroll", () => {
      backToTop.classList.toggle("visible", window.scrollY > 320);
    });

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    backToTop.addEventListener("click", scrollToTop);
    backToTop.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        scrollToTop();
      }
    });
  }

  const revealElements = document.querySelectorAll(".reveal, .reveal-child");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            if (!entry.target.classList.contains("reveal-child")) {
              observer.unobserve(entry.target);
            }
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    // Fallback: show everything
    revealElements.forEach((el) => el.classList.add("in-view"));
  }
}

/* Contact form validation */
function initFormHandling() {
    const contactForm = document.getElementById("contactForm");
    const formStatus = document.getElementById("formStatus");
  
    if (!contactForm || !formStatus) return;
  
    function sanitiseInput(value) {
      // basic trimming and restriction of control characters
      return value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
    }
  
    function validateEmail(email) {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      return pattern.test(email);
    }
  
    function validateName(name) {
      const pattern = /^[A-Za-z0-9 .,'-]{2,120}$/;
      return pattern.test(name);
    }
  
    function validatePhone(phone) {
      if (!phone) return true; // optional
      const pattern = /^[0-9+\-() ]{6,20}$/;
      return pattern.test(phone);
    }
  
    function showFieldError(field, message) {
      const formField = field.closest(".form-field");
      if (!formField) return;
  
      formField.classList.add("form-field-error");
  
      let errorElement = formField.querySelector(".field-error");
      if (!errorElement) {
        errorElement = document.createElement("p");
        errorElement.className = "field-error";
        errorElement.style.cssText =
          "color:#b91c1c;font-size:0.72rem;margin-top:0.2rem;";
        formField.appendChild(errorElement);
      }
      errorElement.textContent = message;
    }
  
    function clearFieldErrors() {
      contactForm
        .querySelectorAll(".form-field-error")
        .forEach((el) => el.classList.remove("form-field-error"));
      contactForm
        .querySelectorAll(".field-error")
        .forEach((el) => el.remove());
    }
  
    function showFormStatus(message, type) {
      formStatus.textContent = message;
      formStatus.className = "form-status " + type;
      formStatus.setAttribute("tabindex", "-1");
      formStatus.focus();
    }
  
    // Submit handler: only blocks invalid, lets valid submit go to FormSubmit
    contactForm.addEventListener("submit", (event) => {
      clearFieldErrors();
      formStatus.textContent = "";
      formStatus.className = "form-status";
  
      const nameField = contactForm.elements["name"];
      const emailField = contactForm.elements["email"];
      const phoneField = contactForm.elements["phone"];
      const typeField = contactForm.elements["type"];
      const messageField = contactForm.elements["message"];
  
      const name = sanitiseInput(nameField.value);
      const email = sanitiseInput(emailField.value);
      const phone = sanitiseInput(phoneField.value);
      const type = typeField.value;
      const message = sanitiseInput(messageField.value);
  
      let isValid = true;
      let firstErrorField = null;
  
      // Validate name
      if (!name || !validateName(name)) {
        showFieldError(
          nameField,
          "Please enter a valid full name (letters, numbers, spaces, and basic punctuation)."
        );
        isValid = false;
        firstErrorField = firstErrorField || nameField;
      }
  
      // Validate email
      if (!email || !validateEmail(email)) {
        showFieldError(emailField, "Please enter a valid email address.");
        isValid = false;
        firstErrorField = firstErrorField || emailField;
      }
  
      // Validate phone
      if (!validatePhone(phone)) {
        showFieldError(
          phoneField,
          "Please enter a valid phone number (digits, spaces, +, -, () only)."
        );
        isValid = false;
        firstErrorField = firstErrorField || phoneField;
      }
  
      // Validate type
      if (!type) {
        showFieldError(
          typeField,
          "Please select how you are contacting Sivisha Industries."
        );
        isValid = false;
        firstErrorField = firstErrorField || typeField;
      }
  
      // Validate message
      if (!message || message.length < 20) {
        showFieldError(
          messageField,
          "Please provide a short description of your enquiry (at least 20 characters)."
        );
        isValid = false;
        firstErrorField = firstErrorField || messageField;
      }
  
      // If invalid, prevent FormSubmit from sending and show message
      if (!isValid) {
        event.preventDefault();
        showFormStatus("Please check the highlighted fields above.", "error");
        if (firstErrorField) {
          firstErrorField.focus();
        }
        return;
      }
  
      // If valid: do NOT preventDefault -> browser will POST to FormSubmit.co
      // FormSubmit will handle email + redirect / success page.
    });
  
    // Real-time validation on blur (kept as-is)
    const formFields = contactForm.querySelectorAll("input, textarea, select");
    formFields.forEach((field) => {
      field.addEventListener("blur", () => {
        const value = sanitiseInput(field.value);
        let isValid = true;
        let errorMessage = "";
  
        if (field.name === "name" && value && !validateName(value)) {
          isValid = false;
          errorMessage = "Please enter a valid full name.";
        } else if (field.type === "email" && value && !validateEmail(value)) {
          isValid = false;
          errorMessage = "Please enter a valid email address.";
        } else if (field.type === "tel" && value && !validatePhone(value)) {
          isValid = false;
          errorMessage = "Please enter a valid phone number.";
        }
  
        if (field.name === "message" && value && value.length < 20) {
          isValid = false;
          errorMessage = "Message must be at least 20 characters.";
        }
  
        const formField = field.closest(".form-field");
        if (!formField) return;
  
        if (!isValid) {
          formField.classList.add("form-field-error");
          let errorElement = formField.querySelector(".field-error");
          if (!errorElement) {
            errorElement = document.createElement("p");
            errorElement.className = "field-error";
            errorElement.style.cssText =
              "color:#b91c1c;font-size:0.72rem;margin-top:0.2rem;";
            formField.appendChild(errorElement);
          }
          errorElement.textContent = errorMessage;
        } else {
          formField.classList.remove("form-field-error");
          const errorElement = formField.querySelector(".field-error");
          if (errorElement) errorElement.remove();
        }
      });
    });
  }
  

/* Hero auto slideshow */
(function () {
  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  if (!slides.length) return;

  let currentIndex = 0;
  const INTERVAL_MS = 6000;
  let timerId = null;

  function showSlide(index) {
    slides.forEach((slide, i) =>
      slide.classList.toggle("active", i === index)
    );
    dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    currentIndex = index;
  }

  function nextSlide() {
    const nextIndex = (currentIndex + 1) % slides.length;
    showSlide(nextIndex);
  }

  function startTimer() {
    stopTimer();
    timerId = setInterval(nextSlide, INTERVAL_MS);
  }

  function stopTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  // Auto-play
  startTimer();

  // Manual dots
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      showSlide(index);
      startTimer();
    });
  });

  // Pause on hover (desktop)
  const slider = document.querySelector(".hero-slider");
  if (slider) {
    slider.addEventListener("mouseenter", stopTimer);
    slider.addEventListener("mouseleave", startTimer);
  }
})();
