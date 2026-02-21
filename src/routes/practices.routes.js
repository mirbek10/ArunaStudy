import { Router } from 'express';
import { db, publicUser } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { practiceReviewSchema, practiceSubmitSchema } from '../utils/schemas.js';
import { createPracticeSubmission, reviewPracticeSubmission } from '../services/lmsService.js';

const router = Router();

/**
 * @swagger
 * /api/practices/submissions:
 *   post:
 *     summary: Отправить практическую работу
 *     tags: [Student-Practices]
 *     security:
 *       - bearerAuth: []
 */
router.post('/submissions', requireAuth, allowRoles('student', 'admin'), validateBody(practiceSubmitSchema), (req, res, next) => {
  try {
    const row = createPracticeSubmission({
      studentId: req.user.id,
      lessonId: req.body.lessonId,
      answerUrl: req.body.answerUrl,
      answerText: req.body.answerText
    });

    return res.status(201).json({ submission: row });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/practices/submissions:
 *   get:
 *     summary: Получить отправленные практики (admin)
 *     tags: [Admin-Practices]
 *     security:
 *       - bearerAuth: []
 */
router.get('/submissions', requireAuth, allowRoles('admin'), (req, res) => {
  const status = req.query.status;
  const items = db.practiceSubmissions
    .filter((row) => (status ? row.status === status : true))
    .map((row) => {
      const student = db.users.find((u) => u.id === row.studentId);
      return {
        ...row,
        student: student ? publicUser(student) : null,
        lesson: db.lessons.find((l) => l.id === row.lessonId) || null
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ items });
});

/**
 * @swagger
 * /api/practices/submissions/{submissionId}/review:
 *   patch:
 *     summary: Проверить практику (admin)
 *     tags: [Admin-Practices]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/submissions/:submissionId/review',
  requireAuth,
  allowRoles('admin'),
  validateBody(practiceReviewSchema),
  (req, res, next) => {
    try {
      const row = reviewPracticeSubmission({
        submissionId: Number(req.params.submissionId),
        reviewerId: req.user.id,
        status: req.body.status,
        feedback: req.body.feedback
      });

      return res.json({ submission: row });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;

