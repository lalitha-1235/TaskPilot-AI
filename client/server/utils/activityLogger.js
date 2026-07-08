const ActivityLog = require("../models/ActivityLog");

/**
 * Logs an activity in the database.
 * Never crashes the application if logging fails.
 * 
 * @param {string} user - ObjectId of the user performing the action
 * @param {string} action - Action identifier or title
 * @param {string} entityType - Entity type (Task, Team, etc.)
 * @param {string} [entityId] - ObjectId of the target entity
 * @param {string} [description] - Detailed action description
 * @param {string} [ipAddress] - IP address of the client
 * @param {string} [userAgent] - User agent string of the client
 */
const logActivity = async (
  user,
  action,
  entityType,
  entityId,
  description,
  ipAddress,
  userAgent
) => {
  try {
    await ActivityLog.create({
      user,
      action,
      entityType,
      entityId: entityId || null,
      description: description || "",
      ipAddress: ipAddress || "",
      userAgent: userAgent || "",
    });
  } catch (error) {
    console.error("Activity Logging Failed:", error.message);
  }
};

module.exports = { logActivity };
