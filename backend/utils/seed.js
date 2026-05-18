const Profile = require("../models/Profile");
const Experience = require("../models/Experience");
const Education = require("../models/Education");
const Project = require("../models/Project");
const Certification = require("../models/Certification");
const SkillCategory = require("../models/SkillCategory");

const seedProfile = {
  singletonKey: "default",
  brandName: "Vijesh",
  fullName: "Vijesh Kumar",
  role: "Aspiring Data Scientist | AI Enthusiast | Developer",
  typingRoles: [
    "Data Science Learner",
    "AI & ML Explorer",
    "Full Stack Problem Solver"
  ],
  intro: "Building meaningful digital products with a strong foundation in data, automation, and user-focused development.",
  heroDescription:
    "I am a fresher who enjoys turning ideas into practical solutions across AI, analytics, and modern web development. I focus on building clean products, learning quickly, and creating work that is both thoughtful and deployable.",
  profileImageUrl: "/uploads/defaults/profile-avatar.svg",
  aboutImageUrl: "/uploads/defaults/about-avatar.svg",
  resumeUrl: "/uploads/defaults/Vijesh-Resume.pdf",
  aboutDescription:
    "I am a motivated fresher with a growing background in machine learning, data analytics, and software engineering. I enjoy combining analytical thinking with product design to build tools that solve real problems.",
  careerObjective:
    "To begin my career in a role where I can apply data-driven thinking, software fundamentals, and curiosity toward building impactful products in AI, analytics, or full stack development.",
  passions: [
    "Applied machine learning",
    "Data storytelling",
    "Clean UI development",
    "Automation and productivity tools"
  ],
  strengths: [
    "Python and SQL fundamentals",
    "Analytical problem solving",
    "Adaptability and fast learning",
    "Collaborative execution"
  ],
  focusAreas: [
    {
      title: "Problem Solving",
      description: "Breaking down business and technical problems into structured, testable solutions.",
      icon: "grid"
    },
    {
      title: "Team Work",
      description: "Contributing with clear communication, ownership, and dependable follow-through.",
      icon: "team"
    },
    {
      title: "AI/ML Interest",
      description: "Exploring prediction, NLP, and model-driven applications with practical use cases.",
      icon: "spark"
    },
    {
      title: "Web Development",
      description: "Building responsive interfaces and API-backed workflows with modern JavaScript.",
      icon: "code"
    },
    {
      title: "Data Analytics",
      description: "Using dashboards and exploratory analysis to convert raw data into clear insights.",
      icon: "chart"
    }
  ],
  stats: [
    { label: "Projects Built", value: 8, suffix: "+" },
    { label: "Certifications", value: 6, suffix: "+" },
    { label: "Core Skills", value: 20, suffix: "+" }
  ],
  email: "vijesh@example.com",
  phone: "+91 98765 43210",
  location: "Chennai, Tamil Nadu, India",
  contactDescription:
    "I am open to entry-level roles, internships, freelance collaborations, and meaningful conversations around AI, software, and data-driven product building.",
  socialLinks: {
    github: "https://github.com/vijesh",
    linkedin: "https://www.linkedin.com/in/vijesh",
    email: "mailto:vijesh@example.com",
    leetcode: "https://leetcode.com/u/vijesh"
  }
};

const seedExperiences = [
  {
    companyName: "AI Innovation Lab",
    companyLogoUrl: "/uploads/defaults/company-logo.svg",
    role: "Data Science Intern",
    duration: "Jan 2026 - Apr 2026",
    location: "Remote",
    description:
      "Worked on exploratory data analysis, feature engineering, and dashboard storytelling for business datasets. Assisted in model experimentation and delivered concise insight summaries for mentors.",
    skillsGained: ["Python", "Pandas", "EDA", "Visualization", "Communication"],
    order: 1
  },
  {
    companyName: "Freelance Academic Projects",
    companyLogoUrl: "/uploads/defaults/company-logo.svg",
    role: "Project Developer",
    duration: "2025 - Present",
    location: "Hybrid",
    description:
      "Built student-focused prototypes ranging from portfolio sites to small analytics projects with attention to UI clarity, API integration, and maintainable code structure.",
    skillsGained: ["HTML", "CSS", "JavaScript", "Node.js", "MongoDB"],
    order: 2
  }
];

const seedEducation = [
  {
    institutionName: "XYZ Institute of Technology",
    institutionLogoUrl: "/uploads/defaults/institution-logo.svg",
    degree: "B.Tech in Computer Science and Engineering",
    duration: "2022 - 2026",
    grade: "CGPA: 8.7/10",
    description:
      "Focused on data structures, database systems, machine learning fundamentals, and software engineering principles while actively building hands-on academic and personal projects.",
    skillsGained: ["DSA", "DBMS", "Machine Learning", "Software Design"],
    order: 1
  },
  {
    institutionName: "ABC Higher Secondary School",
    institutionLogoUrl: "/uploads/defaults/institution-logo.svg",
    degree: "Higher Secondary Education",
    duration: "2020 - 2022",
    grade: "Percentage: 91%",
    description:
      "Built a strong foundation in mathematics, computer science, and analytical reasoning through academic projects and competitions.",
    skillsGained: ["Mathematics", "Logic", "Discipline", "Presentation"],
    order: 2
  }
];

const seedProjects = [
  {
    title: "Smart Career Recommendation System",
    description:
      "A machine learning project that analyzes student interests and skills to recommend suitable career domains with interpretable suggestions.",
    technologies: ["Python", "Scikit-learn", "Pandas", "Flask"],
    features: [
      "Career prediction based on input traits",
      "Clean report of suggested domains",
      "Simple visualization of confidence trends"
    ],
    githubUrl: "https://github.com/vijesh/career-recommendation",
    liveUrl: "https://career-recommendation-demo.netlify.app",
    status: "Completed",
    images: [
      "/uploads/defaults/project-1.svg",
      "/uploads/defaults/project-2.svg"
    ],
    order: 1
  },
  {
    title: "AI Portfolio Assistant Dashboard",
    description:
      "An admin-enabled portfolio system with dynamic content editing, authentication, and file uploads designed for personal branding and professional presentation.",
    technologies: ["HTML", "CSS", "JavaScript", "Node.js", "MongoDB"],
    features: [
      "JWT protected admin login",
      "Editable content sections",
      "Project galleries and certification uploads"
    ],
    githubUrl: "https://github.com/vijesh/portfolio-assistant",
    liveUrl: "https://portfolio-assistant-demo.netlify.app",
    status: "Ongoing",
    images: [
      "/uploads/defaults/project-3.svg",
      "/uploads/defaults/project-4.svg"
    ],
    order: 2
  }
];

const seedCertifications = [
  {
    title: "Machine Learning Foundations",
    issuer: "Coursera",
    certificateFileUrl: "/uploads/defaults/certificate-sample.svg",
    skillsGained: ["Machine Learning", "Model Evaluation", "Feature Engineering"],
    completionDate: "2025-11-14"
  },
  {
    title: "Python for Data Analysis",
    issuer: "Infosys Springboard",
    certificateFileUrl: "/uploads/defaults/certificate-sample.svg",
    skillsGained: ["Python", "NumPy", "Pandas"],
    completionDate: "2025-08-02"
  }
];

const seedSkills = [
  {
    category: "Programming Languages",
    skills: [
      { name: "Python", level: 90 },
      { name: "Java", level: 74 },
      { name: "C++", level: 72 },
      { name: "SQL", level: 84 }
    ],
    order: 1
  },
  {
    category: "Frontend",
    skills: [
      { name: "HTML", level: 92 },
      { name: "CSS", level: 88 },
      { name: "JavaScript", level: 86 }
    ],
    order: 2
  },
  {
    category: "Backend",
    skills: [
      { name: "Node.js", level: 80 },
      { name: "Express.js", level: 78 }
    ],
    order: 3
  },
  {
    category: "Database",
    skills: [
      { name: "MongoDB", level: 82 },
      { name: "MySQL", level: 78 }
    ],
    order: 4
  },
  {
    category: "AI/ML",
    skills: [
      { name: "Machine Learning", level: 84 },
      { name: "Deep Learning", level: 70 },
      { name: "NLP", level: 68 }
    ],
    order: 5
  },
  {
    category: "Data Analytics",
    skills: [
      { name: "Power BI", level: 76 },
      { name: "Excel", level: 82 },
      { name: "Data Visualization", level: 80 }
    ],
    order: 6
  },
  {
    category: "Tools & Platforms",
    skills: [
      { name: "Git/GitHub", level: 84 },
      { name: "Postman", level: 74 },
      { name: "VS Code", level: 90 }
    ],
    order: 7
  }
];

const seedDefaultData = async () => {
  const profileCount = await Profile.countDocuments();
  if (!profileCount) {
    await Profile.create(seedProfile);
  }

  if (!(await Experience.countDocuments())) {
    await Experience.insertMany(seedExperiences);
  }

  if (!(await Education.countDocuments())) {
    await Education.insertMany(seedEducation);
  }

  if (!(await Project.countDocuments())) {
    await Project.insertMany(seedProjects);
  }

  if (!(await Certification.countDocuments())) {
    await Certification.insertMany(seedCertifications);
  }

  if (!(await SkillCategory.countDocuments())) {
    await SkillCategory.insertMany(seedSkills);
  }
};

module.exports = seedDefaultData;
