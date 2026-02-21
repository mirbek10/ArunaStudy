import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { buildProgressOverview, lessonAccessibleForUser, lessonUnlockedForUser } from '../services/lmsService.js';
import { getLessonById, userProgressMap } from '../services/dataStore.js';

const router = Router();

/**
 * @swagger
 * /api/progress/overview:
 *   get:
 *     summary: Получить общий прогресс
 *     tags: [Student-Progress]
 *     security:
 *       - bearerAuth: []
 */
router.get('/overview', requireAuth, (req, res) => {
  const payload = buildProgressOverview(req.user.id, req.lang);
  res.json(payload);
});

/**
 * @swagger
 * /api/progress/lessons/{lessonId}:
 *   get:
 *     summary: Получить прогресс по конкретному уроку
 *     tags: [Student-Progress]
 *     security:
 *       - bearerAuth: []
 */
router.get('/lessons/:lessonId', requireAuth, (req, res, next) => {
  const lessonId = Number(req.params.lessonId);
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    const err = new Error('Lesson not found');
    err.status = 404;
    return next(err);
  }

  if (!lessonAccessibleForUser(req.user.id, lessonId)) {
    const err = new Error('No access to this lesson');
    err.status = 403;
    return next(err);
  }

  const progress = userProgressMap(req.user.id)[String(lessonId)] || null;
  const unlocked = lessonUnlockedForUser(req.user.id, lessonId);

  return res.json({
    lessonId,
    unlocked,
    required: lesson.passingScore || 80,
    progress
  });
});

export default router;
