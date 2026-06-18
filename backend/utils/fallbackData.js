const seedData = require("./seed");

const clone = (value) => JSON.parse(JSON.stringify(value));

const getFallbackProfile = () => clone(seedData.seedProfile);
const getFallbackExperiences = () => clone(seedData.seedExperiences);
const getFallbackEducation = () => clone(seedData.seedEducation);
const getFallbackProjects = () => clone(seedData.seedProjects);
const getFallbackCertifications = () => clone(seedData.seedCertifications);
const getFallbackSkills = () => clone(seedData.seedSkills);

module.exports = {
  getFallbackProfile,
  getFallbackExperiences,
  getFallbackEducation,
  getFallbackProjects,
  getFallbackCertifications,
  getFallbackSkills
};
