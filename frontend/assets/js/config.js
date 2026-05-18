(function () {
  const storedRoot = localStorage.getItem("portfolioApiRoot");
  const hostname = window.location.hostname || "127.0.0.1";
  const isLocalHost = ["localhost", "127.0.0.1"].includes(hostname);
  const localApiRoot = `http://${hostname}:5000`;
  const remoteFallback = "https://vijeshportfolio.onrender.com";
  const sanitizedStoredRoot =
    storedRoot && !storedRoot.includes("your-backend-url.onrender.com") ? storedRoot : "";

  const API_ROOT = sanitizedStoredRoot || (isLocalHost ? localApiRoot : remoteFallback);

  window.PORTFOLIO_CONFIG = {
    API_ROOT,
    API_BASE: `${API_ROOT}/api`,
    FRONTEND_ORIGIN: window.location.origin
  };
})();
