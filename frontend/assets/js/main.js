const { API_BASE, API_ROOT } = window.PORTFOLIO_CONFIG;

const state = {
  profile: null,
  experiences: [],
  education: [],
  projects: [],
  certifications: [],
  skills: [],
  activeProject: null,
  activeProjectImageIndex: 0,
  projectCardIntervals: []
};

const dom = {};

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  setupTheme();
  setupNavigation();
  setupModal();
  setupCertModal();
  setupRevealAnimations();
  setupContactForm();
  loadPortfolio();
});

function cacheDom() {
  Object.assign(dom, {
    pageLoader: document.getElementById("pageLoader"),
    brandName: document.getElementById("brandName"),
    heroName: document.getElementById("heroName"),
    heroRole: document.getElementById("heroRole"),
    heroIntro: document.getElementById("heroIntro"),
    heroDescription: document.getElementById("heroDescription"),
    profileImage: document.getElementById("profileImage"),
    aboutImage: document.getElementById("aboutImage"),
    typingText: document.getElementById("typingText"),
    resumeButton: document.getElementById("resumeButton"),
    socialLinks: document.getElementById("socialLinks"),
    heroStats: document.getElementById("heroStats"),
    aboutDescription: document.getElementById("aboutDescription"),
    careerObjective: document.getElementById("careerObjective"),
    passionsList: document.getElementById("passionsList"),
    strengthsList: document.getElementById("strengthsList"),
    focusGrid: document.getElementById("focusGrid"),
    experienceTimeline: document.getElementById("experienceTimeline"),
    educationTimeline: document.getElementById("educationTimeline"),
    projectsGrid: document.getElementById("projectsGrid"),
    certificationGrid: document.getElementById("certificationGrid"),
    skillsGrid: document.getElementById("skillsGrid"),
    contactDescription: document.getElementById("contactDescription"),
    contactEmail: document.getElementById("contactEmail"),
    contactPhone: document.getElementById("contactPhone"),
    contactLocation: document.getElementById("contactLocation"),
    footerName: document.getElementById("footerName"),
    navMenu: document.getElementById("navMenu"),
    menuToggle: document.getElementById("menuToggle"),
    themeToggle: document.getElementById("themeToggle"),
    contactForm: document.getElementById("contactForm"),
    toastContainer: document.getElementById("toastContainer"),
    certModal: document.getElementById("certModal"),
    certModalClose: document.getElementById("certModalClose"),
    certViewer: document.getElementById("certViewer"),
    certViewerMeta: document.getElementById("certViewerMeta"),
    certViewerLink: document.getElementById("certViewerLink"),
    projectModal: document.getElementById("projectModal"),
    modalClose: document.getElementById("modalClose"),
    modalImage: document.getElementById("modalImage"),
    modalTitle: document.getElementById("modalTitle"),
    modalStatus: document.getElementById("modalStatus"),
    modalDescription: document.getElementById("modalDescription"),
    modalTech: document.getElementById("modalTech"),
    modalFeatures: document.getElementById("modalFeatures"),
    modalGithub: document.getElementById("modalGithub"),
    modalLive: document.getElementById("modalLive"),
    carouselPrev: document.getElementById("carouselPrev"),
    carouselNext: document.getElementById("carouselNext")
  });
}

async function loadPortfolio() {
  try {
    const fetchWithFallback = async (endpoint, fallback) => {
      try { return await fetchJson(endpoint); } catch (e) { console.error(`Failed to fetch ${endpoint}`, e); return fallback; }
    };

    const [profile, experiences, education, projects, certifications, skills] = await Promise.all([
      fetchWithFallback("/profile", null),
      fetchWithFallback("/experiences", []),
      fetchWithFallback("/education", []),
      fetchWithFallback("/projects", []),
      fetchWithFallback("/certifications", []),
      fetchWithFallback("/skills", [])
    ]);

    state.profile = profile;
    state.experiences = experiences || [];
    state.education = education || [];
    state.projects = projects || [];
    state.certifications = certifications || [];
    state.skills = skills || [];

    renderPortfolio();
    hideLoader();
  } catch (error) {
    hideLoader();
    showToast(error.message || "Unable to load portfolio data", "error");
  }
}

async function fetchJson(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  return response.json();
}

function renderPortfolio() {
  renderProfile();
  renderAbout();
  renderFocusAreas();
  renderTimeline(dom.experienceTimeline, state.experiences, "company");
  renderTimeline(dom.educationTimeline, state.education, "education");
  renderProjects();
  renderCertifications();
  renderSkills();
  startTypingEffect();
  animateStats();
}

function renderProfile() {
  const profile = state.profile;
  if (!profile) return;

  dom.brandName.textContent = profile.brandName;
  dom.footerName.textContent = profile.fullName;
  dom.heroName.textContent = profile.fullName;
  dom.heroRole.textContent = profile.role;
  dom.heroIntro.textContent = profile.intro;
  dom.heroDescription.textContent = profile.heroDescription;
  dom.profileImage.src = toAbsoluteUrl(profile.profileImageUrl);
  dom.profileImage.alt = `${profile.fullName} profile photo`;
  dom.aboutImage.src = toAbsoluteUrl(profile.aboutImageUrl || profile.profileImageUrl);
  dom.aboutImage.alt = `${profile.fullName} about photo`;
  if (profile.resumeUrl && profile.resumeUrl.includes("res.cloudinary.com")) {
    // Cloudinary raw PDF — inject fl_attachment to force browser download
    dom.resumeButton.href = buildResumeDownloadUrl(profile.resumeUrl, profile.fullName);
    dom.resumeButton.setAttribute("download", buildResumeFileName(profile.fullName));
    dom.resumeButton.removeAttribute("target");
  } else if (profile.resumeUrl) {
    // Local / backend-hosted file — cross-origin download attribute is ignored,
    // so open in new tab to let the browser render/download natively
    dom.resumeButton.href = toAbsoluteUrl(profile.resumeUrl);
    dom.resumeButton.setAttribute("target", "_blank");
    dom.resumeButton.setAttribute("rel", "noopener");
    dom.resumeButton.removeAttribute("download");
  } else {
    dom.resumeButton.href = "#contact";
    dom.resumeButton.removeAttribute("download");
    dom.resumeButton.removeAttribute("target");
  }
  dom.contactDescription.textContent = profile.contactDescription;
  dom.contactEmail.textContent = profile.email;
  dom.contactEmail.href = `mailto:${profile.email}`;
  dom.contactPhone.textContent = profile.phone || "";
  dom.contactPhone.href = `tel:${(profile.phone || "").replace(/\s+/g, "")}`;
  dom.contactLocation.textContent = profile.location || "";

  const socials = [
    { label: "GitHub", url: profile.socialLinks?.github, symbol: "GH" },
    { label: "LinkedIn", url: profile.socialLinks?.linkedin, symbol: "IN" },
    { label: "Email", url: profile.socialLinks?.email || `mailto:${profile.email}`, symbol: "@" },
    { label: "LeetCode", url: profile.socialLinks?.leetcode, symbol: "</>" }
  ].filter((item) => item.url);

  dom.socialLinks.innerHTML = socials
    .map(
      (item) => `
        <a class="social-pill" href="${escapeHtml(item.url)}" target="_blank" rel="noopener">
          <span>${item.symbol}</span>${item.label}
        </a>
      `
    )
    .join("");

  dom.heroStats.innerHTML = (profile.stats || [])
    .map(
      (stat) => `
        <article class="stat-card glass">
          <strong data-counter="${escapeHtml(String(stat.value))}">0</strong>
          <span>${escapeHtml(stat.suffix || "")}</span>
          <p>${escapeHtml(stat.label)}</p>
        </article>
      `
    )
    .join("");
}

function renderAbout() {
  const profile = state.profile;
  if (!profile) return;

  dom.aboutDescription.textContent = profile.aboutDescription;
  dom.careerObjective.textContent = profile.careerObjective;
  dom.passionsList.innerHTML = renderChips(profile.passions || []);
  dom.strengthsList.innerHTML = renderChips(profile.strengths || []);
}

function renderFocusAreas() {
  dom.focusGrid.innerHTML = (state.profile.focusAreas || [])
    .map(
      (item) => `
        <article class="focus-card glass" data-reveal>
          <div class="focus-icon">${escapeHtml(iconSymbol(item.icon))}</div>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
        </article>
      `
    )
    .join("");
}

function renderTimeline(container, items, type) {
  container.innerHTML = items
    .map((item, index) => {
      const title = type === "company" ? item.companyName : item.institutionName;
      const image = type === "company" ? item.companyLogoUrl : item.institutionLogoUrl;
      const subtitle = type === "company" ? item.role : item.degree;
      const meta = type === "company" ? item.location : item.grade;

      return `
        <article class="timeline-card glass" data-reveal>
          <span class="timeline-index">0${index + 1}</span>
          <div class="timeline-logo">
            <img src="${escapeHtml(toAbsoluteUrl(image))}" alt="${escapeHtml(title)} logo" />
          </div>
          <div class="timeline-content">
            <div class="timeline-head">
              <div>
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(subtitle)}</p>
              </div>
              <span class="timeline-duration">${escapeHtml(item.duration)}</span>
            </div>
            <p class="timeline-meta">${escapeHtml(meta || "")}</p>
            <p>${escapeHtml(item.description)}</p>
            <div class="chip-list">${renderChips(item.skillsGained || [])}</div>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderProjects() {
  clearProjectSlideshows();

  dom.projectsGrid.innerHTML = state.projects
    .map((project) => {
      const images = project.images?.length ? project.images : ["/uploads/defaults/project-1.svg"];
      const hasMultipleImages = images.length > 1;

      return `
        <article class="project-card glass" data-reveal>
          <div class="project-media" data-project-slider="${escapeHtml(project._id)}">
            <div class="project-slides">
              ${images
                .map(
                  (image, index) => `
                    <img
                      class="project-slide ${index === 0 ? "active" : ""}"
                      src="${escapeHtml(toAbsoluteUrl(image))}"
                      alt="${escapeHtml(project.title)} preview ${index + 1}"
                    />
                  `
                )
                .join("")}
            </div>
            <span class="status-badge">${escapeHtml(project.status)}</span>
            ${
              hasMultipleImages
                ? `
                  <button class="project-slide-nav prev" type="button" data-project-slide-prev="${escapeHtml(project._id)}"><</button>
                  <button class="project-slide-nav next" type="button" data-project-slide-next="${escapeHtml(project._id)}">></button>
                  <div class="project-slide-dots">
                    ${images
                      .map(
                        (_, index) => `
                          <button
                            type="button"
                            class="project-slide-dot ${index === 0 ? "active" : ""}"
                            data-project-slide-dot="${escapeHtml(project._id)}"
                            data-slide-index="${index}"
                            aria-label="Show project image ${index + 1}"
                          ></button>
                        `
                      )
                      .join("")}
                  </div>
                `
                : ""
            }
          </div>
          <div class="project-body">
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description)}</p>
            <div class="chip-list">${renderChips(project.technologies || [])}</div>
            <div class="project-actions">
              <button class="btn btn-secondary" data-project-view="${escapeHtml(project._id)}">View Details</button>
              <a class="btn btn-ghost" href="${escapeHtml(project.githubUrl || "#")}" target="_blank" rel="noopener">GitHub</a>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  dom.projectsGrid.querySelectorAll("[data-project-view]").forEach((button) => {
    button.addEventListener("click", () => openProjectModal(button.dataset.projectView));
  });

  dom.projectsGrid.querySelectorAll("[data-project-slide-prev]").forEach((button) => {
    button.addEventListener("click", () => shiftProjectCardSlide(button.dataset.projectSlidePrev, -1));
  });

  dom.projectsGrid.querySelectorAll("[data-project-slide-next]").forEach((button) => {
    button.addEventListener("click", () => shiftProjectCardSlide(button.dataset.projectSlideNext, 1));
  });

  dom.projectsGrid.querySelectorAll("[data-project-slide-dot]").forEach((button) => {
    button.addEventListener("click", () => {
      setProjectCardSlide(button.dataset.projectSlideDot, Number(button.dataset.slideIndex));
    });
  });

  startProjectSlideshows();
}

// Inline SVG used as cert placeholder — no cross-origin backend request needed
const CERT_PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 560'%3E%3Crect width='800' height='560' rx='32' fill='%23101522'/%3E%3Crect x='34' y='34' width='732' height='492' rx='24' fill='%23ffffff' opacity='.06'/%3E%3Ctext x='400' y='200' text-anchor='middle' fill='%2373e0a9' font-size='38' font-family='Arial'%3ECertificate%3C/text%3E%3Ctext x='400' y='310' text-anchor='middle' fill='%23c8d1e4' font-size='18' font-family='Arial'%3EUpload via admin dashboard%3C/text%3E%3Cline x1='180' y1='390' x2='620' y2='390' stroke='%23ffc46b' stroke-width='3'/%3E%3C/svg%3E`;
window.CERT_PLACEHOLDER_SVG = CERT_PLACEHOLDER_SVG;

function renderCertifications() {
  dom.certificationGrid.innerHTML = state.certifications
    .map((certification) => {
      const fileUrl = toAbsoluteUrl(certification.certificateFileUrl);
      const isPdf = certification.certificateFileUrl
        ? (certification.certificateFileUrl.endsWith(".pdf") ||
           fileUrl.includes("/raw/upload/"))
        : false;
      const hasFile = Boolean(certification.certificateFileUrl);

      let previewSrc = CERT_PLACEHOLDER_SVG;
      if (hasFile) {
        if (!isPdf) {
          previewSrc = fileUrl;
        } else if (fileUrl.includes("res.cloudinary.com") && fileUrl.includes("/upload/")) {
          // Force Cloudinary to extract the 1st page of the PDF as a JPG thumbnail
          previewSrc = fileUrl
            .replace("/raw/upload/", "/image/upload/")
            .replace("/upload/", "/upload/pg_1/")
            .replace(/\.pdf$/i, ".jpg");
        }
      }

      return `
        <article class="cert-card glass" data-reveal>
          <div class="cert-preview cert-preview-clickable" ${hasFile ? `data-cert-view="${escapeHtml(certification._id)}"` : ""}>
            ${isPdf && hasFile ? `<span class="cert-pdf-badge">PDF</span>` : ""}
            <img
              src="${escapeHtml(previewSrc)}"
              alt="${escapeHtml(certification.title)} certificate"
              onerror="this.src=window.CERT_PLACEHOLDER_SVG"
            />
          </div>
          <div class="cert-body">
            <p class="cert-issuer">${escapeHtml(certification.issuer)}</p>
            <h3>${escapeHtml(certification.title)}</h3>
            <p>${formatDate(certification.completionDate)}</p>
            <div class="chip-list">${renderChips(certification.skillsGained || [])}</div>
            ${hasFile
              ? `<button class="btn btn-secondary" data-cert-view="${escapeHtml(certification._id)}">View Certificate</button>`
              : `<span class="btn btn-ghost" style="cursor:default;opacity:.5">No File Uploaded</span>`
            }
          </div>
        </article>
      `;
    })
    .join("");

  dom.certificationGrid.querySelectorAll("[data-cert-view]").forEach((el) => {
    el.addEventListener("click", () => {
      const cert = state.certifications.find((c) => c._id === el.dataset.certView);
      if (cert) openCertModal(cert);
    });
  });
}

function renderSkills() {
  dom.skillsGrid.innerHTML = state.skills
    .map(
      (category) => `
        <article class="skill-card glass" data-reveal>
          <div class="skill-head">
            <h3>${escapeHtml(category.category)}</h3>
          </div>
          <div class="skill-items">
            ${(category.skills || [])
              .map(
                (skill) => `
                  <div class="skill-item">
                    <div class="skill-label">
                      <span>${escapeHtml(skill.name)}</span>
                      <strong>${escapeHtml(String(skill.level))}%</strong>
                    </div>
                    <div class="skill-bar"><span style="width:${escapeHtml(String(skill.level))}%"></span></div>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function setupContactForm() {
  dom.contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(dom.contactForm);
    const payload = Object.fromEntries(formData.entries());

    try {
      await fetchJson("/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      dom.contactForm.reset();
      showToast("Message sent successfully", "success");
    } catch (error) {
      showToast(error.message || "Unable to send message", "error");
    }
  });
}

function setupTheme() {
  const storedTheme = localStorage.getItem("portfolioTheme") || "dark";
  document.body.dataset.theme = storedTheme;

  dom.themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.dataset.theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = nextTheme;
    localStorage.setItem("portfolioTheme", nextTheme);
  });
}

function setupNavigation() {
  dom.menuToggle.addEventListener("click", () => {
    dom.navMenu.classList.toggle("open");
    dom.menuToggle.classList.toggle("open");
  });

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      dom.navMenu.classList.remove("open");
      dom.menuToggle.classList.remove("open");
    });
  });
}

function setupRevealAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll("[data-reveal]").forEach((item) => observer.observe(item));

  const mutationObserver = new MutationObserver(() => {
    document.querySelectorAll("[data-reveal]").forEach((item) => {
      if (!item.dataset.observed) {
        item.dataset.observed = "true";
        observer.observe(item);
      }
    });
  });

  mutationObserver.observe(document.body, { childList: true, subtree: true });
}

function startTypingEffect() {
  const roles = state.profile.typingRoles?.length ? state.profile.typingRoles : [state.profile.role];
  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const tick = () => {
    const currentRole = roles[roleIndex];
    dom.typingText.textContent = currentRole.slice(0, charIndex);

    if (!isDeleting && charIndex < currentRole.length) {
      charIndex += 1;
    } else if (isDeleting && charIndex > 0) {
      charIndex -= 1;
    } else if (!isDeleting && charIndex === currentRole.length) {
      isDeleting = true;
      setTimeout(tick, 1200);
      return;
    } else {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
    }

    setTimeout(tick, isDeleting ? 42 : 85);
  };

  tick();
}

function animateStats() {
  const counters = document.querySelectorAll("[data-counter]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.counter || 0);
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 30));

        const interval = setInterval(() => {
          current += step;
          if (current >= target) {
            element.textContent = target;
            clearInterval(interval);
          } else {
            element.textContent = current;
          }
        }, 35);

        observer.unobserve(element);
      });
    },
    { threshold: 0.7 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

function setupModal() {
  dom.modalClose.addEventListener("click", closeProjectModal);
  dom.projectModal.addEventListener("click", (event) => {
    if (event.target === dom.projectModal) closeProjectModal();
  });
  dom.carouselPrev.addEventListener("click", () => changeProjectImage(-1));
  dom.carouselNext.addEventListener("click", () => changeProjectImage(1));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeProjectModal();
      closeCertModal();
    }
  });
}

function setupCertModal() {
  dom.certModalClose.addEventListener("click", closeCertModal);
  dom.certModal.addEventListener("click", (event) => {
    if (event.target === dom.certModal) closeCertModal();
  });
}

function openCertModal(cert) {
  const fileUrl = toAbsoluteUrl(cert.certificateFileUrl);
  const isPdf = fileUrl.endsWith(".pdf") || fileUrl.includes("/raw/upload/");

  if (isPdf) {
    const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    dom.certViewer.innerHTML = `
      <iframe 
        src="${escapeHtml(googleViewerUrl)}" 
        class="cert-full-image" 
        style="width: 100%; height: 65vh; border: none; border-radius: 1.25rem; background: white;"
      ></iframe>
    `;
  } else {
    dom.certViewer.innerHTML = `
      <img
        src="${escapeHtml(fileUrl)}"
        alt="${escapeHtml(cert.title)} certificate"
        class="cert-full-image"
        onerror="this.src=window.CERT_PLACEHOLDER_SVG"
      />
    `;
  }

  dom.certViewerMeta.innerHTML = `
    <p class="cert-issuer">${escapeHtml(cert.issuer)}</p>
    <h3>${escapeHtml(cert.title)}</h3>
    <p>${formatDate(cert.completionDate)}</p>
  `;

  // "Open Full View" — for Cloudinary images open in new tab, same for others
  dom.certViewerLink.href = fileUrl;
  dom.certViewerLink.target = "_blank";
  dom.certViewerLink.rel = "noopener";
  dom.certModal.classList.add("open");
  document.body.classList.add("modal-open");
}

function closeCertModal() {
  dom.certModal.classList.remove("open");
  document.body.classList.remove("modal-open");
  dom.certViewer.innerHTML = "";
}

function openProjectModal(projectId) {
  const project = state.projects.find((item) => item._id === projectId);
  if (!project) return;

  state.activeProject = project;
  state.activeProjectImageIndex = 0;

  dom.modalTitle.textContent = project.title;
  dom.modalStatus.textContent = project.status;
  dom.modalDescription.textContent = project.description;
  dom.modalTech.innerHTML = renderChips(project.technologies || []);
  dom.modalFeatures.innerHTML = (project.features || [])
    .map((feature) => `<li>${escapeHtml(feature)}</li>`)
    .join("");
  dom.modalGithub.href = project.githubUrl || "#";
  dom.modalLive.href = project.liveUrl || "#";
  updateProjectModalImage();
  dom.projectModal.classList.add("open");
  document.body.classList.add("modal-open");
}

function changeProjectImage(direction) {
  if (!state.activeProject?.images?.length) return;
  const total = state.activeProject.images.length;
  state.activeProjectImageIndex = (state.activeProjectImageIndex + direction + total) % total;
  updateProjectModalImage();
}

function updateProjectModalImage() {
  const image = state.activeProject?.images?.[state.activeProjectImageIndex];
  dom.modalImage.src = toAbsoluteUrl(image);
}

function closeProjectModal() {
  dom.projectModal.classList.remove("open");
  document.body.classList.remove("modal-open");
}

function startProjectSlideshows() {
  state.projects.forEach((project) => {
    const imageCount = project.images?.length || 0;
    if (imageCount <= 1) return;

    const intervalId = window.setInterval(() => {
      shiftProjectCardSlide(project._id, 1);
    }, 3200);

    state.projectCardIntervals.push(intervalId);
  });
}

function clearProjectSlideshows() {
  state.projectCardIntervals.forEach((intervalId) => window.clearInterval(intervalId));
  state.projectCardIntervals = [];
}

function shiftProjectCardSlide(projectId, direction) {
  const slider = dom.projectsGrid.querySelector(`[data-project-slider="${projectId}"]`);
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".project-slide"));
  const activeIndex = slides.findIndex((slide) => slide.classList.contains("active"));
  const nextIndex = (activeIndex + direction + slides.length) % slides.length;
  setProjectCardSlide(projectId, nextIndex);
}

function setProjectCardSlide(projectId, nextIndex) {
  const slider = dom.projectsGrid.querySelector(`[data-project-slider="${projectId}"]`);
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".project-slide"));
  const dots = Array.from(slider.querySelectorAll(".project-slide-dot"));

  slides.forEach((slide, index) => {
    slide.classList.toggle("active", index === nextIndex);
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === nextIndex);
  });
}

function hideLoader() {
  window.setTimeout(() => {
    dom.pageLoader.classList.add("hidden");
  }, 450);
}

function renderChips(items) {
  return items
    .map((item) => `<span class="chip">${escapeHtml(String(item))}</span>`)
    .join("");
}

function iconSymbol(iconName) {
  const map = {
    spark: "✦",
    team: "◫",
    code: "</>",
    chart: "▣",
    grid: "⌘"
  };
  return map[iconName] || "✦";
}

function filePreview(filePath) {
  if (!filePath) return CERT_PLACEHOLDER_SVG;
  const url = toAbsoluteUrl(filePath);
  if (filePath.endsWith(".pdf") || filePath.includes("/raw/upload/")) {
    return CERT_PLACEHOLDER_SVG;
  }
  return url;
}

function buildResumeDownloadUrl(path, fullName) {
  const absoluteUrl = toAbsoluteUrl(path);
  const filename = buildResumeFileName(fullName);

  if (absoluteUrl.includes("/raw/upload/")) {
    return absoluteUrl.replace("/raw/upload/", `/raw/upload/fl_attachment:${filename}/`);
  }

  return absoluteUrl;
}

function buildResumeFileName(fullName) {
  const safeName = String(fullName || "Resume")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");

  return `${safeName || "Resume"}-Resume.pdf`;
}

function toAbsoluteUrl(path) {
  if (!path) return `${API_ROOT}/uploads/defaults/profile-avatar.svg`;
  return path.startsWith("http") ? path : `${API_ROOT}${path}`;
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  dom.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("visible");
  }, 40);

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 240);
  }, 2800);
}

function setupContactForm() {
  if (!dom.contactForm) return;

  dom.contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = dom.contactForm.querySelector("button[type='submit']");
    const originalText = button.textContent;
    button.textContent = "Sending...";
    button.disabled = true;

    try {
      const formData = new FormData(dom.contactForm);
      const payload = Object.fromEntries(formData.entries());

      const response = await fetch(`${API_BASE}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({ message: "Failed to send message" }));

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      showToast("Message sent successfully!", "success");
      dom.contactForm.reset();
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      button.textContent = originalText;
      button.disabled = false;
    }
  });
}
