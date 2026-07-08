/**
 * Middleware to restrict access to admin users only.
 * Assumes the user is already authenticated by the JWT protect middleware.
 */
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Access is restricted to administrator accounts only",
    });
  }
  next();
};

module.exports = adminOnly;
