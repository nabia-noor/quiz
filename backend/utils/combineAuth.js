import {
  teacherAuthMiddleware,
  adminAuthMiddleware,
} from "../middleware/authMiddleware.js";

// Middleware to allow either teacher or admin authentication
export async function combineAuth(req, res, next) {
  // Try teacher auth first
  await teacherAuthMiddleware(req, res, async function (err) {
    if (!err && req.teacherId) {
      return next();
    }
    // If not teacher, try admin
    await adminAuthMiddleware(req, res, function (err2) {
      if (!err2 && req.adminId) {
        return next();
      }
      // If neither, return unauthorized
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Teacher or Admin access required.",
      });
    });
  });
}
