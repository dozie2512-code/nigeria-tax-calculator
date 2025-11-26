/**
 * Auth page script - handles signup and login
 * Uses SHA-256 for client-side password hashing
 * Stores auth token in localStorage and redirects on success
 */

// Configuration
const API_BASE_URL = "API_BASE_URL"; // Replace with your backend URL (e.g., "https://api.example.com")
const SIGNUP_ENDPOINT = "/api/auth/signup";
const LOGIN_ENDPOINT = "/api/auth/login";
const TOKEN_KEY = "ntc_auth_token";
const REDIRECT_URL = "/dashboard.html";

/**
 * Computes SHA-256 hex hash of a string using Web Crypto API.
 * @param {string} str - The string to hash
 * @returns {Promise<string>} - Hex digest of the hash
 */
async function sha256Hex(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Builds a full URL from the base URL and endpoint path.
 * @param {string} endpoint - The API endpoint path
 * @returns {string} - Full URL
 */
function buildUrl(endpoint) {
  const base = (API_BASE_URL || "").replace(/\/+$/, "");
  const path = endpoint.startsWith("/") ? endpoint : "/" + endpoint;
  return base + path;
}

/**
 * Sends a JSON POST request to the specified endpoint.
 * @param {string} endpoint - API endpoint path
 * @param {object} payload - JSON payload to send
 * @returns {Promise<{ok: boolean, status: number, body: object}>}
 */
async function postJson(endpoint, payload) {
  const url = buildUrl(endpoint);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = { success: false, message: "Invalid JSON response" };
  }

  return {
    ok: response.ok,
    status: response.status,
    body: body,
  };
}

/**
 * Shows a message in a form message element.
 * @param {HTMLElement} el - Message element
 * @param {string} message - Message text
 * @param {string} type - Message type: 'error', 'success', or 'info'
 */
function showMessage(el, message, type = "info") {
  if (!el) return;
  el.textContent = message;
  el.className = "form-message show " + type;
}

/**
 * Hides a message element.
 * @param {HTMLElement} el - Message element
 */
function hideMessage(el) {
  if (!el) return;
  el.textContent = "";
  el.className = "form-message";
}

/**
 * Validates an email address format.
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Extracts token from API response (handles various response formats).
 * @param {object} body - Response body
 * @returns {string|null}
 */
function extractToken(body) {
  if (!body) return null;
  if (body.token) return body.token;
  if (body.data && body.data.token) return body.data.token;
  if (body.accessToken) return body.accessToken;
  if (body.access_token) return body.access_token;
  return null;
}

/**
 * Stores auth token in localStorage and redirects to dashboard.
 * @param {string} token - Auth token
 */
function handleAuthSuccess(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  window.location.href = REDIRECT_URL;
}

/**
 * Checks if user is already authenticated.
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!localStorage.getItem(TOKEN_KEY);
}

// DOM Elements
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginMsg = document.getElementById("loginMsg");
const signupMsg = document.getElementById("signupMsg");

// Modal elements (for modal-based UI)
const openLoginBtn = document.getElementById("openLogin");
const openSignupBtn = document.getElementById("openSignup");
const heroSignupBtn = document.getElementById("heroSignup");
const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");

/**
 * Switches to the specified tab.
 * @param {string} tabId - Tab ID to switch to ('login' or 'signup')
 */
function switchTab(tabId) {
  tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });
  tabContents.forEach((content) => {
    content.classList.toggle("active", content.id === tabId + "Tab");
  });
}

/**
 * Opens a modal.
 * @param {HTMLElement} modal - Modal element
 */
function openModal(modal) {
  if (modal) {
    modal.setAttribute("aria-hidden", "false");
  }
}

/**
 * Closes a modal.
 * @param {HTMLElement} modal - Modal element
 */
function closeModal(modal) {
  if (modal) {
    modal.setAttribute("aria-hidden", "true");
  }
}

/**
 * Handles signup form submission.
 * @param {Event} e - Submit event
 */
async function handleSignup(e) {
  e.preventDefault();
  hideMessage(signupMsg);

  const form = e.target;
  const username = (form.signupUsername?.value || "").trim();
  const email = (form.signupEmail?.value || "").trim();
  const password = form.signupPassword?.value || "";

  // Validation
  if (!username) {
    showMessage(signupMsg, "Username is required", "error");
    return;
  }

  if (!email) {
    showMessage(signupMsg, "Email is required", "error");
    return;
  }

  if (!isValidEmail(email)) {
    showMessage(signupMsg, "Please enter a valid email address", "error");
    return;
  }

  if (password.length < 6) {
    showMessage(signupMsg, "Password must be at least 6 characters", "error");
    return;
  }

  // Hash password
  showMessage(signupMsg, "Creating account...", "info");

  try {
    const passwordHash = await sha256Hex(password);

    const payload = {
      username: username,
      email: email,
      password: passwordHash,
    };

    const { ok, body } = await postJson(SIGNUP_ENDPOINT, payload);

    if (ok && body && (body.token || body.success)) {
      const token = extractToken(body);
      showMessage(signupMsg, "Account created! Redirecting...", "success");
      setTimeout(() => handleAuthSuccess(token), 700);
    } else {
      const errorMsg = (body && (body.message || body.error)) || "Signup failed. Please try again.";
      showMessage(signupMsg, errorMsg, "error");
    }
  } catch (err) {
    showMessage(signupMsg, "Network error: " + err.message, "error");
  }
}

/**
 * Handles login form submission.
 * @param {Event} e - Submit event
 */
async function handleLogin(e) {
  e.preventDefault();
  hideMessage(loginMsg);

  const form = e.target;
  const username = (form.username?.value || "").trim();
  const password = form.password?.value || "";

  // Validation
  if (!username) {
    showMessage(loginMsg, "Username is required", "error");
    return;
  }

  if (!password) {
    showMessage(loginMsg, "Password is required", "error");
    return;
  }

  // Hash password
  showMessage(loginMsg, "Signing in...", "info");

  try {
    const passwordHash = await sha256Hex(password);

    const payload = {
      username: username,
      password: passwordHash,
    };

    const { ok, body } = await postJson(LOGIN_ENDPOINT, payload);

    if (ok && body && (body.token || body.success)) {
      const token = extractToken(body);
      showMessage(loginMsg, "Login successful! Redirecting...", "success");
      setTimeout(() => handleAuthSuccess(token), 500);
    } else {
      const errorMsg = (body && (body.message || body.error)) || "Login failed. Please check your credentials.";
      showMessage(loginMsg, errorMsg, "error");
    }
  } catch (err) {
    showMessage(loginMsg, "Network error: " + err.message, "error");
  }
}

/**
 * Initializes the auth page.
 */
function init() {
  // If already authenticated, redirect to dashboard
  if (isAuthenticated()) {
    window.location.href = REDIRECT_URL;
    return;
  }

  // Tab switching
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Form submissions
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  // Modal open buttons (for modal-based UI)
  if (openLoginBtn && loginModal) {
    openLoginBtn.addEventListener("click", () => openModal(loginModal));
  }

  if (openSignupBtn && signupModal) {
    openSignupBtn.addEventListener("click", () => openModal(signupModal));
  }

  if (heroSignupBtn && signupModal) {
    heroSignupBtn.addEventListener("click", () => openModal(signupModal));
  }

  // Modal close buttons
  document.querySelectorAll("[data-close]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const modal = e.target.closest(".modal");
      closeModal(modal);
    });
  });

  // Close modal on overlay click
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
}

// Initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
