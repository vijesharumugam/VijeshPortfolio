const { API_BASE, API_ROOT } = window.PORTFOLIO_CONFIG;

const loginForm = document.getElementById("loginForm");
const toastContainer = document.getElementById("toastContainer");
const apiRootLabel = document.getElementById("apiRootLabel");
const themeToggle = document.getElementById("adminThemeToggle");

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  if (apiRootLabel) {
    apiRootLabel.textContent = API_ROOT;
  }
  verifyExistingSession();
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json().catch(() => ({ message: "Login failed" }));
    if (!response.ok) throw new Error(result.message || "Login failed");

    localStorage.setItem("portfolioAdminToken", result.token);
    window.location.href = "dashboard/";
  } catch (error) {
    showToast(error.message || "Unable to login", "error");
  }
});

async function verifyExistingSession() {
  const token = localStorage.getItem("portfolioAdminToken");
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (response.ok) {
      window.location.href = "dashboard/";
      return;
    }

    localStorage.removeItem("portfolioAdminToken");
  } catch (error) {
    localStorage.removeItem("portfolioAdminToken");
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type} visible`;
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function setupTheme() {
  const storedTheme = localStorage.getItem("portfolioAdminTheme") || "dark";
  document.body.dataset.theme = storedTheme;
  syncThemeToggleLabel(storedTheme);

  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = nextTheme;
    localStorage.setItem("portfolioAdminTheme", nextTheme);
    syncThemeToggleLabel(nextTheme);
  });
}

function syncThemeToggleLabel(theme) {
  if (!themeToggle) return;
  themeToggle.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
}
