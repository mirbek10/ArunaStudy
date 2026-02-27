import { Router } from 'express';
import { db, publicUser } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { practiceReviewSchema, practiceSubmitSchema } from '../utils/schemas.js';
import { createPracticeSubmission, reviewPracticeSubmission } from '../services/lmsService.js';
import { toLessonForLanguage } from '../utils/i18n.js';
import { persistMongoStore } from '../services/mongoStore.js';

const router = Router();
const REVIEW_STATUSES = new Set(['approved', 'rejected']);
const ALL_SUBMISSION_STATUSES = new Set(['pending', ...REVIEW_STATUSES]);

function normalizeReviewHistory(row) {
  if (Array.isArray(row.reviewHistory)) {
    return row.reviewHistory
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => ({
        status: REVIEW_STATUSES.has(entry.status) ? entry.status : 'rejected',
        feedback: entry.feedback || '',
        reviewerId: entry.reviewerId ?? null,
        reviewedAt: entry.reviewedAt || null
      }))
      .filter((entry) => entry.reviewedAt);
  }

  if (!row.reviewedAt) {
    return [];
  }

  return [
    {
      status: REVIEW_STATUSES.has(row.status) ? row.status : 'rejected',
      feedback: row.feedback || '',
      reviewerId: row.reviewerId ?? null,
      reviewedAt: row.reviewedAt
    }
  ];
}

function serializePracticeSubmission(row, lang) {
  const student = db.users.find((u) => u.id === row.studentId) || null;
  const reviewer = row.reviewerId ? db.users.find((u) => u.id === row.reviewerId) : null;
  const lesson = db.lessons.find((l) => l.id === row.lessonId) || null;

  return {
    ...row,
    answerUrl: row.answerUrl || '',
    answerText: row.answerText || '',
    feedback: row.feedback || '',
    reviewerId: row.reviewerId ?? null,
    reviewedAt: row.reviewedAt || null,
    reviewHistory: normalizeReviewHistory(row),
    student: student ? publicUser(student) : null,
    reviewer: reviewer ? publicUser(reviewer) : null,
    lesson: lesson ? toLessonForLanguage(lesson, lang, { includeTest: false }) : null
  };
}

function validateStatusFilter(status) {
  if (!status) {
    return;
  }

  if (!ALL_SUBMISSION_STATUSES.has(status)) {
    const err = new Error('Invalid status filter');
    err.status = 400;
    throw err;
  }
}

function parseOptionalLessonId(rawLessonId) {
  if (rawLessonId === undefined) {
    return null;
  }

  const lessonId = Number(rawLessonId);
  if (!Number.isInteger(lessonId) || lessonId <= 0) {
    const err = new Error('Invalid lessonId');
    err.status = 400;
    throw err;
  }

  return lessonId;
}

/**
 * @swagger
 * /api/practices/submissions:
 *   post:
 *     summary: Submit practical work
 *     tags: [Student-Practices]
 *     security:
 *       - bearerAuth: []
 */
router.post('/submissions', requireAuth, allowRoles('student', 'admin'), validateBody(practiceSubmitSchema), async (req, res, next) => {
  try {
    const row = createPracticeSubmission({
      studentId: req.user.id,
      lessonId: req.body.lessonId,
      answerUrl: req.body.answerUrl,
      answerText: req.body.answerText
    });

    await persistMongoStore();
    return res.status(201).json({ submission: serializePracticeSubmission(row, req.lang) });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/practices/submissions:
 *   get:
 *     summary: Get practice submissions (admin)
 *     tags: [Admin-Practices]
 *     security:
 *       - bearerAuth: []
 */
router.get('/submissions', requireAuth, allowRoles('admin'), (req, res, next) => {
  try {
    const status = req.query.status;
    validateStatusFilter(status);

    const items = db.practiceSubmissions
      .filter((row) => (status ? row.status === status : true))
      .map((row) => serializePracticeSubmission(row, req.lang))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/practices/submissions/my:
 *   get:
 *     summary: Get current student submissions
 *     tags: [Student-Practices]
 *     security:
 *       - bearerAuth: []
 */
router.get('/submissions/my', requireAuth, allowRoles('student'), (req, res, next) => {
  try {
    const status = req.query.status;
    const lessonId = parseOptionalLessonId(req.query.lessonId);
    validateStatusFilter(status);

    const items = db.practiceSubmissions
      .filter((row) => row.studentId === req.user.id)
      .filter((row) => (status ? row.status === status : true))
      .filter((row) => (lessonId ? row.lessonId === lessonId : true))
      .map((row) => serializePracticeSubmission(row, req.lang))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return res.json({ items });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/practices/submissions/{submissionId}:
 *   get:
 *     summary: Get a practice submission by id
 *     tags: [Student-Practices, Admin-Practices]
 *     security:
 *       - bearerAuth: []
 */
router.get('/submissions/:submissionId', requireAuth, allowRoles('student', 'admin'), (req, res, next) => {
  try {
    const submissionId = Number(req.params.submissionId);
    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      const err = new Error('Invalid submissionId');
      err.status = 400;
      throw err;
    }

    const row = db.practiceSubmissions.find((submission) => submission.id === submissionId);
    if (!row) {
      const err = new Error('Submission not found');
      err.status = 404;
      throw err;
    }

    if (req.user.role === 'student' && row.studentId !== req.user.id) {
      const err = new Error('No access to this submission');
      err.status = 403;
      throw err;
    }

    return res.json({ submission: serializePracticeSubmission(row, req.lang) });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/practices/submissions/{submissionId}/review:
 *   patch:
 *     summary: Review practical work (admin)
 *     tags: [Admin-Practices]
 *     security:
 *       - bearerAuth: []
 */
router.patch(
  '/submissions/:submissionId/review',
  requireAuth,
  allowRoles('admin'),
  validateBody(practiceReviewSchema),
  async (req, res, next) => {
    try {
      const row = reviewPracticeSubmission({
        submissionId: Number(req.params.submissionId),
        reviewerId: req.user.id,
        status: req.body.status,
        feedback: req.body.feedback
      });

      await persistMongoStore();
      return res.json({ submission: serializePracticeSubmission(row, req.lang) });
    } catch (err) {
      return next(err);
    }
  }
);

export default router;
