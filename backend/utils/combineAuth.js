import {
  teacherAuthMiddleware,
  adminAuthMiddleware,
} from "../middleware/authMiddleware.js";

// Middleware to allow either teacher or admin authentication
export async function combineAuth(req, res, next) {
  try {
    await teacherAuthMiddleware(req, res, () => {});
    if (req.teacherId) {
      return next();
    }
  } catch (e) {
    // Ignore teacher error, try admin
  }
  try {
    await adminAuthMiddleware(req, res, () => {});
    if (req.adminId) {
      return next();
    }
  } catch (e) {
    // Ignore admin error
  }
  return res.status(401).json({
    success: false,
    message: "Unauthorized. Teacher or Admin access required.",
  });
}
