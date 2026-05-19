/**
 * Wraps an async Express route handler to automatically forward errors
 * to the next() error middleware, eliminating repetitive try/catch blocks.
 *
 * @param {Function} fn - Async Express handler (req, res, next)
 * @returns {Function} Wrapped handler with error forwarding
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
