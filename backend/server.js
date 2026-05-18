require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { connectDB, isDatabaseConnected } = require("./config/db");
const seedDefaultData = require("./utils/seed");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const experienceRoutes = require("./routes/experienceRoutes");
const educationRoutes = require("./routes/educationRoutes");
const projectRoutes = require("./routes/projectRoutes");
const certificationRoutes = require("./routes/certificationRoutes");
const skillRoutes = require("./routes/skillRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const buildAllowedOrigins = () => {
  const configuredOrigins = (process.env.CLIENT_URL || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const defaults = ["http://127.0.0.1:5500", "http://localhost:5500"];
  return [...new Set([...configuredOrigins, ...defaults])];
};

const bootstrapDatabase = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.warn("Starting server without database connection");
    return;
  }

  try {
    await seedDefaultData();
  } catch (error) {
    console.error("Database seed failed:", error.message);
  }
};

bootstrapDatabase();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = buildAllowedOrigins();

      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.get("/", (req, res) => {
  res.json({
    message: "Portfolio backend is running",
    health: "/api/health"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    message: "Portfolio API running",
    databaseConnected: isDatabaseConnected()
  });
});

app.use("/api/auth", authRoutes);

app.use("/api", (req, res, next) => {
  if (isDatabaseConnected()) {
    return next();
  }

  return res.status(503).json({
    message:
      "Database is not connected. Check MongoDB Atlas network access / IP whitelist and credentials."
  });
});

app.use("/api/profile", profileRoutes);
app.use("/api/experiences", experienceRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/certifications", certificationRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/messages", messageRoutes);

app.use((error, req, res, next) => {
  const status = error.status || 500;
  res.status(status).json({
    message: error.message || "Server error"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
