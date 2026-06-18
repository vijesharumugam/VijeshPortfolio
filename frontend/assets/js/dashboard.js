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
const maintenanceToggle = document.getElementById("maintenanceToggle");
const saveLoadingOverlay = document.getElementById("saveLoadingOverlay");
const loadingTitle = document.getElementById("loadingTitle");
const loadingText = document.getElementById("loadingText");
const ADMIN_LOGIN_PATH = "/edit/";
const skillBuilder = document.getElementById("skillBuilder");
const addSkillRowButton = document.getElementById("addSkillRowButton");
const SKILL_LEVEL_OPTIONS = [
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Professional", value: "professional" }
];

document.addEventListener("DOMContentLoaded", async () => {
  setupTheme();
  if (!(await verifySession())) return;
  cacheForms();
  bindConnectionLabels();
  setupNavigation();
  setupResetButtons();
  setupForms();
  setupSkillBuilder();
  setupMaintenanceToggle();
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
      } else if (button.dataset.reset === "skillForm") {
        resetSkillBuilder();
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

function setupMaintenanceToggle() {
  maintenanceToggle?.addEventListener("click", async () => {
    if (!state.profile) return;
    const isCurrentlyOn = state.profile.maintenanceMode;
    const newStatus = !isCurrentlyOn;
    
    maintenanceToggle.disabled = true;
    maintenanceToggle.textContent = "Updating...";
    
    try {
      const updatedProfile = await apiRequest("/profile/maintenance", {
        method: "PUT",
        body: JSON.stringify({ maintenanceMode: newStatus })
      });
      state.profile.maintenanceMode = updatedProfile.maintenanceMode;
      updateMaintenanceToggleUI();
      showToast(`Maintenance mode turned ${state.profile.maintenanceMode ? 'ON' : 'OFF'}`, "success");
    } catch (error) {
      showToast(error.message || "Failed to toggle maintenance mode", "error");
      updateMaintenanceToggleUI(); // Revert back
    } finally {
      maintenanceToggle.disabled = false;
    }
  });
}

function updateMaintenanceToggleUI() {
  if (!maintenanceToggle || !state.profile) return;
  maintenanceToggle.textContent = state.profile.maintenanceMode ? "Maintenance: On" : "Maintenance: Off";
  maintenanceToggle.style.background = state.profile.maintenanceMode ? "var(--accent-warm)" : "var(--surface-strong)";
  maintenanceToggle.style.color = state.profile.maintenanceMode ? "#000" : "var(--text)";
  maintenanceToggle.style.borderColor = state.profile.maintenanceMode ? "transparent" : "var(--border)";
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
    updateMaintenanceToggleUI();
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
    homeLeetcode: profile.socialLinks?.leetcode || "",
    resumeUrl: profile.resumeUrl || ""
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
  
  const unreadCount = state.messages.filter(m => !m.isRead).length;
  setText("messageCountChip", `${unreadCount} unread / ${state.messages.length} total`);
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
  const form = event.currentTarget;

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
  const resumeUrl = forms.home.elements.resumeUrl.value.trim();
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
    socialEmail: homeSocialEmail || forms.contact.elements.socialEmail.value,
    resumeUrl
  };

  Object.entries(payload).forEach(([key, value]) => formData.append(key, value));

  const profileImage = forms.home.elements.profileImage.files[0];
  const aboutImage = forms.about.elements.aboutImage.files[0];

  if (profileImage) formData.append("profileImage", profileImage);
  if (aboutImage) formData.append("aboutImage", aboutImage);

  setSavingState(true, "Saving profile and uploading media...", form);
  try {
    await apiRequest("/profile", { method: "PUT", body: formData, isFormData: true });
    showToast("Profile section updated", "success");
    await loadDashboardData();
  } catch (error) {
    showToast(error.message || "Unable to update profile", "error");
  } finally {
    setSavingState(false, "", form);
  }
}

async function saveCollectionItem(event, resource, form) {
  event.preventDefault();
  const formData = new FormData(form);
  const id = form.elements.id.value;

  setSavingState(true, "Saving content...", form);
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
  } finally {
    setSavingState(false, "", form);
  }
}

async function saveProject(event) {
  event.preventDefault();
  const form = forms.project;
  const id = form.elements.id.value;
  const formData = new FormData();
  const hasNewFiles = state.projectNewFiles.length > 0;

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

  setSavingState(true, hasNewFiles ? "Uploading project images..." : "Saving project...", form);
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
  } finally {
    setSavingState(false, "", form);
  }
}

function setupSkillBuilder() {
  if (!skillBuilder || !addSkillRowButton || !forms.skill) return;

  addSkillRowButton.addEventListener("click", () => {
    addSkillRow();
    syncSkillJsonPreview();
  });

  skillBuilder.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-skill-row]");
    if (!removeButton) return;

    const row = removeButton.closest("[data-skill-row]");
    row?.remove();
    ensureAtLeastOneSkillRow();
    syncSkillJsonPreview();
  });

  skillBuilder.addEventListener("input", syncSkillJsonPreview);
  skillBuilder.addEventListener("change", syncSkillJsonPreview);
  resetSkillBuilder();
}

function createSkillRow(skill = {}) {
  const row = document.createElement("div");
  row.className = "skill-row";
  row.dataset.skillRow = "true";

  const options = SKILL_LEVEL_OPTIONS.map(
    (option) => `<option value="${option.value}">${option.label}</option>`
  ).join("");

  row.innerHTML = `
    <label>
      <span>Skill Name</span>
      <input type="text" name="skillName" placeholder="Python" value="${escapeHtml(skill.name || "")}" required />
    </label>
    <label>
      <span>Level</span>
      <select name="skillLevel" required>
        ${options}
      </select>
    </label>
    <div class="skill-row-actions">
      <button type="button" class="btn btn-ghost btn-small" data-remove-skill-row>Remove</button>
    </div>
  `;

  const select = row.querySelector('select[name="skillLevel"]');
  select.value = normalizeSkillLevelOptionValue(skill.level);
  return row;
}

function addSkillRow(skill = {}) {
  if (!skillBuilder) return;
  skillBuilder.appendChild(createSkillRow(skill));
}

function populateSkillBuilder(skills = []) {
  if (!skillBuilder || !forms.skill) return;

  skillBuilder.innerHTML = "";
  if (skills.length) {
    skills.forEach((skill) => addSkillRow(skill));
  } else {
    addSkillRow();
  }
  syncSkillJsonPreview();
}

function resetSkillBuilder() {
  populateSkillBuilder([]);
  if (forms.skill?.elements.skills) {
    forms.skill.elements.skills.value = "[]";
  }
}

function ensureAtLeastOneSkillRow() {
  if (!skillBuilder || skillBuilder.querySelector("[data-skill-row]")) return;
  addSkillRow();
}

function collectSkillRows() {
  if (!skillBuilder) return [];

  const rows = Array.from(skillBuilder.querySelectorAll("[data-skill-row]"));
  const skills = [];

  for (const row of rows) {
    const name = row.querySelector('input[name="skillName"]')?.value.trim();
    const levelValue = row.querySelector('select[name="skillLevel"]')?.value;

    if (!name) {
      continue;
    }

    if (!levelValue) {
      throw new Error("Fill each skill row or remove the empty one");
    }

    skills.push({
      name,
      level: levelValue
    });
  }

  return skills;
}

function syncSkillJsonPreview() {
  if (!forms.skill?.elements.skills) return;

  try {
    forms.skill.elements.skills.value = JSON.stringify(collectSkillRows(), null, 2);
  } catch (error) {
    forms.skill.elements.skills.value = "";
  }
}

function normalizeSkillLevelOptionValue(level) {
  const raw = String(level ?? "").trim().toLowerCase();
  const match = SKILL_LEVEL_OPTIONS.find(
    (option) => String(option.value) === raw || option.label.toLowerCase() === raw
  );

  if (match) return String(match.value);

  const numeric = Number(level);
  if (!Number.isNaN(numeric)) {
    if (numeric < 45) return String(SKILL_LEVEL_OPTIONS[0].value);
    if (numeric < 80) return String(SKILL_LEVEL_OPTIONS[1].value);
    return String(SKILL_LEVEL_OPTIONS[2].value);
  }

  return String(SKILL_LEVEL_OPTIONS[1].value);
}

async function saveSkillCategory(event) {
  event.preventDefault();
  const form = forms.skill;
  const id = form.elements.id.value;

  let skills = [];
  try {
    skills = collectSkillRows();
  } catch (error) {
    showToast(error.message || "Fill each skill row or remove the empty one", "error");
    return;
  }

  if (!skills.length) {
    showToast("Add at least one skill", "error");
    return;
  }

  form.elements.skills.value = JSON.stringify(skills, null, 2);

  const payload = {
    category: form.elements.category.value,
    order: form.elements.order.value,
    skills: form.elements.skills.value
  };

  setSavingState(true, "Saving skill category...", form);
  try {
    await apiRequest(`/skills${id ? `/${id}` : ""}`, {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(payload)
    });
    showToast("Skill category saved", "success");
    form.reset();
    form.elements.id.value = "";
    resetSkillBuilder();
    await loadDashboardData();
  } catch (error) {
    showToast(error.message || "Unable to save skill category", "error");
  } finally {
    setSavingState(false, "", form);
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
    skillsGained: item.skillsGained.join(", "),
    order: item.order ?? 0
  });
  scrollToSection("section-certifications");
}

function editSkillCategory(item) {
  setFormValues(forms.skill, {
    id: item._id,
    category: item.category,
    order: item.order,
  });
  populateSkillBuilder(item.skills || []);
  scrollToSection("section-skills");
}

async function deleteItem(resource, id, callback) {
  if (!confirm("Are you sure you want to delete this record? This action cannot be undone.")) return;
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

function setSavingState(isSaving, message, form) {
  if (saveLoadingOverlay) {
    saveLoadingOverlay.classList.toggle("open", isSaving);
    saveLoadingOverlay.setAttribute("aria-hidden", String(!isSaving));
  }

  if (loadingTitle) {
    loadingTitle.textContent = isSaving ? "Saving changes" : "Saving complete";
  }

  if (loadingText && message) {
    loadingText.textContent = message;
  } else if (loadingText && !isSaving) {
    loadingText.textContent = "Please wait while the updates are processed.";
  }

  if (!form) return;

  form.querySelectorAll("input, textarea, select, button").forEach((element) => {
    if (element === themeToggle) return;
    if (isSaving) {
      element.dataset.prevDisabled = element.disabled ? "true" : "false";
      element.disabled = true;
      return;
    }

    if (element.dataset.prevDisabled === "false") {
      element.disabled = false;
    }
    delete element.dataset.prevDisabled;
  });
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
