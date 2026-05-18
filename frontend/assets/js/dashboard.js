const { API_BASE, API_ROOT, FRONTEND_ORIGIN } = window.PORTFOLIO_CONFIG;

const state = {
  profile: null,
  experiences: [],
  education: [],
  projects: [],
  certifications: [],
  skills: [],
  messages: [],
  projectExistingImages: [],
  projectNewFiles: []
};

const forms = {};
const authToken = localStorage.getItem("portfolioAdminToken");
const themeToggle = document.getElementById("adminThemeToggle");
const ADMIN_LOGIN_PATH = "/edit/";

document.addEventListener("DOMContentLoaded", async () => {
  setupTheme();
  if (!(await verifySession())) return;
  cacheForms();
  bindConnectionLabels();
  setupNavigation();
  setupResetButtons();
  setupForms();
  renderProjectMediaManager();
  await loadDashboardData();
});

function cacheForms() {
  Object.assign(forms, {
    home: document.getElementById("homeForm"),
    about: document.getElementById("aboutForm"),
    experience: document.getElementById("experienceForm"),
    education: document.getElementById("educationForm"),
    project: document.getElementById("projectForm"),
    certification: document.getElementById("certificationForm"),
    skill: document.getElementById("skillForm"),
    contact: document.getElementById("contactForm")
  });
}

function bindConnectionLabels() {
  document.getElementById("frontendOriginLabel").textContent = FRONTEND_ORIGIN;
  document.getElementById("backendOriginLabel").textContent = API_ROOT;
}

async function verifySession() {
  if (!authToken) {
    window.location.href = ADMIN_LOGIN_PATH;
    return false;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/session`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (!response.ok) {
      localStorage.removeItem("portfolioAdminToken");
      window.location.href = ADMIN_LOGIN_PATH;
      return false;
    }

    return true;
  } catch (error) {
    localStorage.removeItem("portfolioAdminToken");
    window.location.href = ADMIN_LOGIN_PATH;
    return false;
  }
}

function setupNavigation() {
  const sidebar = document.getElementById("sidebarNav");
  const buttons = Array.from(sidebar.querySelectorAll("button[data-target]"));
  const sectionButtons = buttons.filter((button) => button.dataset.target !== "logout");
  const sections = sectionButtons
    .map((button) => document.getElementById(button.dataset.target))
    .filter(Boolean);

  sidebar.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-target]");
    if (!button) return;

    if (button.dataset.target === "logout") {
      localStorage.removeItem("portfolioAdminToken");
      window.location.href = ADMIN_LOGIN_PATH;
      return;
    }

    const target = document.getElementById(button.dataset.target);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;
      const activeId = visibleEntry.target.id;

      sectionButtons.forEach((button) => {
        button.classList.toggle("active", button.dataset.target === activeId);
      });
    },
    {
      rootMargin: "-20% 0px -60% 0px",
      threshold: [0.15, 0.35, 0.6]
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupResetButtons() {
  document.querySelectorAll("[data-reset]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = document.getElementById(button.dataset.reset);
      form.reset();
      const hiddenId = form.querySelector('input[name="id"]');
      if (hiddenId) hiddenId.value = "";
      const existingImages = form.querySelector('input[name="existingImages"]');
      if (existingImages) existingImages.value = "";
      if (button.dataset.reset === "projectForm") {
        resetProjectMediaManager();
      }
    });
  });
}

function setupForms() {
  forms.home.addEventListener("submit", saveProfileSection);
  forms.about.addEventListener("submit", saveProfileSection);
  forms.contact.addEventListener("submit", saveProfileSection);
  forms.experience.addEventListener("submit", (event) => saveCollectionItem(event, "experiences", forms.experience));
  forms.education.addEventListener("submit", (event) => saveCollectionItem(event, "education", forms.education));
  forms.project.addEventListener("submit", saveProject);
  forms.certification.addEventListener("submit", (event) =>
    saveCollectionItem(event, "certifications", forms.certification)
  );
  forms.skill.addEventListener("submit", saveSkillCategory);
  forms.project.elements.images.addEventListener("change", handleProjectImageSelection);
}

async function loadDashboardData() {
  try {
    const [summary, profile, experiences, education, projects, certifications, skills, messages] =
      await Promise.all([
        apiRequest("/messages/dashboard/summary"),
        apiRequest("/profile"),
        apiRequest("/experiences"),
        apiRequest("/education"),
        apiRequest("/projects"),
        apiRequest("/certifications"),
        apiRequest("/skills"),
        apiRequest("/messages")
      ]);

    state.profile = profile;
    state.experiences = experiences;
    state.education = education;
    state.projects = projects;
    state.certifications = certifications;
    state.skills = skills;
    state.messages = messages;

    populateProfileForms();
    renderSummary(summary);
    renderCollections();
    renderCountChips();
  } catch (error) {
    showToast(error.message || "Unable to load dashboard data", "error");
  }
}

function populateProfileForms() {
  const profile = state.profile;
  if (!profile) return;

  setFormValues(forms.home, {
    brandName: profile.brandName,
    fullName: profile.fullName,
    role: profile.role,
    typingRoles: (profile.typingRoles || []).join(", "),
    intro: profile.intro,
    heroDescription: profile.heroDescription,
    homeEmail: profile.email || "",
    homeSocialEmail: profile.socialLinks?.email || "",
    homeGithub: profile.socialLinks?.github || "",
    homeLinkedin: profile.socialLinks?.linkedin || "",
    homeLeetcode: profile.socialLinks?.leetcode || ""
  });

  setFormValues(forms.about, {
    aboutDescription: profile.aboutDescription,
    careerObjective: profile.careerObjective,
    passions: (profile.passions || []).join(", "),
    strengths: (profile.strengths || []).join(", "),
    focusAreas: JSON.stringify(profile.focusAreas || [], null, 2),
    stats: JSON.stringify(profile.stats || [], null, 2)
  });

  setFormValues(forms.contact, {
    email: profile.email,
    phone: profile.phone,
    location: profile.location,
    github: profile.socialLinks?.github || "",
    linkedin: profile.socialLinks?.linkedin || "",
    leetcode: profile.socialLinks?.leetcode || "",
    socialEmail: profile.socialLinks?.email || "",
    contactDescription: profile.contactDescription
  });
}

function renderSummary(summary) {
  const summaryGrid = document.getElementById("summaryGrid");
  const recentMessages = document.getElementById("recentMessages");

  summaryGrid.innerHTML = summary.cards
    .map(
      (card) => `
        <article class="summary-card glass-panel">
          <p>${escapeHtml(card.label)}</p>
          <strong>${escapeHtml(String(card.value))}</strong>
        </article>
      `
    )
    .join("");

  recentMessages.innerHTML = summary.recentMessages.length
    ? summary.recentMessages
        .map(
          (message) => `
            <article class="record-card compact">
              <div class="record-copy">
                <h3>${escapeHtml(message.subject)}</h3>
                <p>${escapeHtml(message.name)} | ${escapeHtml(message.email)}</p>
              </div>
              <span>${formatDate(message.createdAt)}</span>
            </article>
          `
        )
        .join("")
    : `<p class="empty-state">No messages yet.</p>`;
}

function renderCollections() {
  renderRecordList("experienceList", state.experiences, {
    title: (item) => item.companyName,
    subtitle: (item) => `${item.role} | ${item.duration}`,
    meta: (item) => item.location || "",
    onEdit: editExperience,
    onDelete: (id) => deleteItem("experiences", id, loadDashboardData)
  });

  renderRecordList("educationList", state.education, {
    title: (item) => item.institutionName,
    subtitle: (item) => `${item.degree} | ${item.duration}`,
    meta: (item) => item.grade || "",
    onEdit: editEducation,
    onDelete: (id) => deleteItem("education", id, loadDashboardData)
  });

  renderRecordList("projectList", state.projects, {
    title: (item) => item.title,
    subtitle: (item) => `${item.status} | ${item.technologies.join(", ")}`,
    meta: (item) => item.liveUrl || item.githubUrl || "",
    onEdit: editProject,
    onDelete: (id) => deleteItem("projects", id, loadDashboardData)
  });

  renderRecordList("certificationList", state.certifications, {
    title: (item) => item.title,
    subtitle: (item) => `${item.issuer} | ${item.completionDate}`,
    meta: (item) => item.certificateFileUrl || "",
    onEdit: editCertification,
    onDelete: (id) => deleteItem("certifications", id, loadDashboardData)
  });

  renderRecordList("skillList", state.skills, {
    title: (item) => item.category,
    subtitle: (item) => `${item.skills.length} skills`,
    meta: () => "",
    onEdit: editSkillCategory,
    onDelete: (id) => deleteItem("skills", id, loadDashboardData)
  });

  renderMessages();
}

function renderCountChips() {
  setText("experienceCountChip", `${state.experiences.length} records`);
  setText("educationCountChip", `${state.education.length} records`);
  setText("projectCountChip", `${state.projects.length} records`);
  setText("certificationCountChip", `${state.certifications.length} records`);
  setText("skillCountChip", `${state.skills.length} groups`);
  setText("messageCountChip", `${state.messages.length} messages`);
}

function renderRecordList(containerId, items, config) {
  const container = document.getElementById(containerId);
  container.innerHTML = items.length
    ? items
        .map(
          (item) => `
            <article class="record-card">
              <div class="record-copy">
                <h3>${escapeHtml(config.title(item))}</h3>
                <p>${escapeHtml(config.subtitle(item))}</p>
                <span>${escapeHtml(config.meta(item))}</span>
              </div>
              <div class="record-actions">
                <button class="btn btn-ghost btn-small" data-edit="${escapeHtml(item._id)}">Edit</button>
                <button class="btn btn-danger btn-small" data-delete="${escapeHtml(item._id)}">Delete</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="empty-state">No records available.</p>`;

  container.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => {
      const item = items.find((entry) => entry._id === button.dataset.edit);
      if (item) config.onEdit(item);
    });
  });

  container.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      config.onDelete(button.dataset.delete);
    });
  });
}

function renderMessages() {
  const container = document.getElementById("messageList");
  container.innerHTML = state.messages.length
    ? state.messages
        .map(
          (message) => `
            <article class="record-card ${message.isRead ? "read" : ""}">
              <div class="record-copy">
                <h3>${escapeHtml(message.subject)}</h3>
                <p>${escapeHtml(message.name)} | ${escapeHtml(message.email)}</p>
                <span>${escapeHtml(message.message)}</span>
              </div>
              <div class="record-actions">
                <button class="btn btn-ghost btn-small" data-read="${escapeHtml(message._id)}">Mark Read</button>
                <button class="btn btn-danger btn-small" data-remove="${escapeHtml(message._id)}">Delete</button>
              </div>
            </article>
          `
        )
        .join("")
    : `<p class="empty-state">Inbox is empty.</p>`;

  container.querySelectorAll("[data-read]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await apiRequest(`/messages/${button.dataset.read}/read`, { method: "PUT" });
        await loadDashboardData();
        showToast("Message marked as read", "success");
      } catch (error) {
        showToast(error.message || "Unable to update message", "error");
      }
    });
  });

  container.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", async () => {
      await deleteItem("messages", button.dataset.remove, loadDashboardData);
    });
  });
}

async function saveProfileSection(event) {
  event.preventDefault();

  if (!isValidJson(forms.about.elements.focusAreas.value) || !isValidJson(forms.about.elements.stats.value)) {
    showToast("Focus areas and stats must be valid JSON arrays", "error");
    return;
  }

  const formData = new FormData();
  const homeEmail = forms.home.elements.homeEmail.value.trim();
  const homeSocialEmail = forms.home.elements.homeSocialEmail.value.trim();
  const homeGithub = forms.home.elements.homeGithub.value.trim();
  const homeLinkedin = forms.home.elements.homeLinkedin.value.trim();
  const homeLeetcode = forms.home.elements.homeLeetcode.value.trim();
  const payload = {
    brandName: forms.home.elements.brandName.value,
    fullName: forms.home.elements.fullName.value,
    role: forms.home.elements.role.value,
    typingRoles: forms.home.elements.typingRoles.value,
    intro: forms.home.elements.intro.value,
    heroDescription: forms.home.elements.heroDescription.value,
    aboutDescription: forms.about.elements.aboutDescription.value,
    careerObjective: forms.about.elements.careerObjective.value,
    passions: forms.about.elements.passions.value,
    strengths: forms.about.elements.strengths.value,
    focusAreas: forms.about.elements.focusAreas.value,
    stats: forms.about.elements.stats.value,
    email: homeEmail || forms.contact.elements.email.value,
    phone: forms.contact.elements.phone.value,
    location: forms.contact.elements.location.value,
    contactDescription: forms.contact.elements.contactDescription.value,
    github: homeGithub || forms.contact.elements.github.value,
    linkedin: homeLinkedin || forms.contact.elements.linkedin.value,
    leetcode: homeLeetcode || forms.contact.elements.leetcode.value,
    socialEmail: homeSocialEmail || forms.contact.elements.socialEmail.value
  };

  Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

  const profileImage = forms.home.elements.profileImage.files[0];
  const resume = forms.home.elements.resume.files[0];
  const aboutImage = forms.about.elements.aboutImage.files[0];

  if (profileImage) formData.append("profileImage", profileImage);
  if (resume) formData.append("resume", resume);
  if (aboutImage) formData.append("aboutImage", aboutImage);

  try {
    await apiRequest("/profile", { method: "PUT", body: formData, isFormData: true });
    showToast("Profile section updated", "success");
    forms.home.reset();
    forms.about.reset();
    forms.contact.reset();
    await loadDashboardData();
  } catch (error) {
    showToast(error.message || "Unable to update profile", "error");
  }
}

async function saveCollectionItem(event, resource, form) {
  event.preventDefault();
  const formData = new FormData(form);
  const id = form.elements.id.value;

  try {
    await apiRequest(`/${resource}${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: formData,
      isFormData: true
    });
    showToast("Record saved", "success");
    form.reset();
    if (form.elements.id) form.elements.id.value = "";
    if (form.elements.existingImages) form.elements.existingImages.value = "";
    await loadDashboardData();
  } catch (error) {
    showToast(error.message || "Unable to save record", "error");
  }
}

async function saveProject(event) {
  event.preventDefault();
  const form = forms.project;
  const id = form.elements.id.value;
  const formData = new FormData();

  [
    "id",
    "title",
    "status",
    "order",
    "description",
    "technologies",
    "features",
    "githubUrl",
    "liveUrl"
  ].forEach((fieldName) => {
    if (fieldName !== "id") {
      formData.append(fieldName, form.elements[fieldName].value);
    }
  });

  formData.append("existingImages", state.projectExistingImages.join(", "));
  state.projectNewFiles.forEach((file) => {
    formData.append("images", file);
  });

  try {
    await apiRequest(`/projects${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: formData,
      isFormData: true
    });
    showToast("Project saved", "success");
    form.reset();
    form.elements.id.value = "";
    form.elements.existingImages.value = "";
    resetProjectMediaManager();
    await loadDashboardData();
  } catch (error) {
    showToast(error.message || "Unable to save project", "error");
  }
}

async function saveSkillCategory(event) {
  event.preventDefault();
  const form = forms.skill;
  const id = form.elements.id.value;

  if (!isValidJson(form.elements.skills.value)) {
    showToast("Skills must be a valid JSON array", "error");
    return;
  }

  const payload = {
    category: form.elements.category.value,
    order: form.elements.order.value,
    skills: form.elements.skills.value
  };

  try {
    await apiRequest(`/skills${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    showToast("Skill category saved", "success");
    form.reset();
    form.elements.id.value = "";
    await loadDashboardData();
  } catch (error) {
    showToast(error.message || "Unable to save skill category", "error");
  }
}

function editExperience(item) {
  setFormValues(forms.experience, {
    id: item._id,
    companyName: item.companyName,
    role: item.role,
    duration: item.duration,
    location: item.location,
    description: item.description,
    skillsGained: item.skillsGained.join(", "),
    order: item.order
  });
  scrollToSection("section-experience");
}

function editEducation(item) {
  setFormValues(forms.education, {
    id: item._id,
    institutionName: item.institutionName,
    degree: item.degree,
    duration: item.duration,
    grade: item.grade,
    description: item.description,
    skillsGained: item.skillsGained.join(", "),
    order: item.order
  });
  scrollToSection("section-education");
}

function editProject(item) {
  state.projectExistingImages = [...(item.images || [])];
  state.projectNewFiles = [];
  setFormValues(forms.project, {
    id: item._id,
    title: item.title,
    status: item.status,
    description: item.description,
    technologies: item.technologies.join(", "),
    features: item.features.join(", "),
    githubUrl: item.githubUrl,
    liveUrl: item.liveUrl,
    existingImages: state.projectExistingImages.join(", "),
    order: item.order
  });
  syncProjectFileInput();
  renderProjectMediaManager();
  scrollToSection("section-projects");
}

function editCertification(item) {
  setFormValues(forms.certification, {
    id: item._id,
    title: item.title,
    issuer: item.issuer,
    completionDate: item.completionDate,
    skillsGained: item.skillsGained.join(", ")
  });
  scrollToSection("section-certifications");
}

function editSkillCategory(item) {
  setFormValues(forms.skill, {
    id: item._id,
    category: item.category,
    order: item.order,
    skills: JSON.stringify(item.skills, null, 2)
  });
  scrollToSection("section-skills");
}

async function deleteItem(resource, id, callback) {
  try {
    await apiRequest(`/${resource}/${id}`, { method: "DELETE" });
    showToast("Record deleted", "success");
    await callback();
  } catch (error) {
    showToast(error.message || "Unable to delete record", "error");
  }
}

async function apiRequest(endpoint, options = {}) {
  const headers = { Authorization: `Bearer ${authToken}` };
  if (!options.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body
  });

  const result = await response.json().catch(() => ({ message: "Unexpected server response" }));
  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}

function setFormValues(form, values) {
  Object.entries(values).forEach(([key, value]) => {
    if (form.elements[key]) {
      form.elements[key].value = value ?? "";
    }
  });
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

function scrollToSection(id) {
  const target = document.getElementById(id);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function handleProjectImageSelection(event) {
  const selectedFiles = Array.from(event.target.files || []);
  if (!selectedFiles.length) {
    syncProjectFileInput();
    renderProjectMediaManager();
    return;
  }

  state.projectNewFiles = [...state.projectNewFiles, ...selectedFiles];
  syncProjectFileInput();
  renderProjectMediaManager();
}

function renderProjectMediaManager() {
  const existingContainer = document.getElementById("projectExistingMedia");
  const newContainer = document.getElementById("projectNewMedia");

  existingContainer.classList.toggle("empty-media", state.projectExistingImages.length === 0);
  newContainer.classList.toggle("empty-media", state.projectNewFiles.length === 0);

  existingContainer.innerHTML = state.projectExistingImages.length
    ? state.projectExistingImages
        .map(
          (imagePath, index) => `
            <article class="media-card">
              <img src="${escapeHtml(toAbsoluteMediaUrl(imagePath))}" alt="Existing project image ${index + 1}" />
              <button type="button" class="btn btn-danger btn-small media-delete" data-remove-existing-image="${index}">
                Delete
              </button>
            </article>
          `
        )
        .join("")
    : `<p class="empty-state">No existing images for this project.</p>`;

  newContainer.innerHTML = state.projectNewFiles.length
    ? state.projectNewFiles
        .map(
          (file, index) => `
            <article class="media-card">
              <img src="${escapeHtml(URL.createObjectURL(file))}" alt="New project image ${index + 1}" />
              <button type="button" class="btn btn-danger btn-small media-delete" data-remove-new-image="${index}">
                Remove
              </button>
            </article>
          `
        )
        .join("")
    : `<p class="empty-state">No new images selected yet.</p>`;

  existingContainer.querySelectorAll("[data-remove-existing-image]").forEach((button) => {
    button.addEventListener("click", () => {
      removeExistingProjectImage(Number(button.dataset.removeExistingImage));
    });
  });

  newContainer.querySelectorAll("[data-remove-new-image]").forEach((button) => {
    button.addEventListener("click", () => {
      removeNewProjectImage(Number(button.dataset.removeNewImage));
    });
  });

  forms.project.elements.existingImages.value = state.projectExistingImages.join(", ");
}

function removeExistingProjectImage(index) {
  state.projectExistingImages.splice(index, 1);
  renderProjectMediaManager();
}

function removeNewProjectImage(index) {
  state.projectNewFiles.splice(index, 1);
  syncProjectFileInput();
  renderProjectMediaManager();
}

function resetProjectMediaManager() {
  state.projectExistingImages = [];
  state.projectNewFiles = [];
  syncProjectFileInput();
  renderProjectMediaManager();
}

function syncProjectFileInput() {
  const transfer = new DataTransfer();
  state.projectNewFiles.forEach((file) => transfer.items.add(file));
  forms.project.elements.images.files = transfer.files;
}

function toAbsoluteMediaUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_ROOT}${path}`;
}

function isValidJson(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed);
  } catch (error) {
    return false;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type} visible`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
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
