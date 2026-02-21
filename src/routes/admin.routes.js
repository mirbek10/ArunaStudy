import { Router } from 'express';
import { db, getUserById, hasUserLessonAccess, publicUser, setUserLessonAccess } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { lessonAccessUpdateSchema } from '../utils/schemas.js';

const router = Router();

function serializeUserWithAccess(user) {
  return {
    ...publicUser(user),
    hasLessonsAccess: user.role === 'admin' ? true : hasUserLessonAccess(user.id)
  };
}

router.get('/users', requireAuth, allowRoles('admin'), (_req, res) => {
  const users = db.users.map((user) => serializeUserWithAccess(user));
  res.json({ users });
});

router.patch(
  '/users/:userId/lesson-access',
  requireAuth,
  allowRoles('admin'),
  validateBody(lessonAccessUpdateSchema),
  (req, res, next) => {
    const user = getUserById(req.params.userId);
    if (!user) {
      const err = new Error('User not found');
      err.status = 404;
      return next(err);
    }

    if (user.role !== 'student') {
      const err = new Error('Lesson access can be updated only for students');
      err.status = 400;
      return next(err);
    }

    const hasLessonsAccess = setUserLessonAccess(user.id, req.body.hasLessonsAccess);
    return res.json({
      user: serializeUserWithAccess(user),
      hasLessonsAccess
    });
  }
);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Показатели админ-дашборда
 *     tags: [Admin-Dashboard]
 *     security:
 *       - bearerAuth: []
 */
router.get('/dashboard', requireAuth, allowRoles('admin'), (_req, res) => {
  const studentsCount = db.users.filter((u) => u.role === 'student').length;
  const modulesCount = db.modules.length;
  const lessonsCount = db.lessons.length;
  const pendingPractices = db.practiceSubmissions.filter((row) => row.status === 'pending').length;

  res.json({
    studentsCount,
    modulesCount,
    lessonsCount,
    pendingPractices
  });
});

export default router;
