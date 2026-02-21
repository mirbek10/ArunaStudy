import { Router } from 'express';
import { db, getLessonById, getModuleById } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { lessonCreateSchema, lessonUpdateSchema, testSubmitSchema } from '../utils/schemas.js';
import { nextId } from '../utils/id.js';
import { lessonUnlockedForUser, submitLessonTest } from '../services/lmsService.js';

const router = Router();
const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=qz0aGYrrlhU';

/**
 * @swagger
 * /api/lessons/{lessonId}/test:
 *   get:
 *     summary: Получить вопросы теста по уроку
 *     tags: [Student-Lessons]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:lessonId/test', requireAuth, (req, res, next) => {
  const lesson = getLessonById(req.params.lessonId);
  if (!lesson) {
    const err = new Error('Lesson not found');
    err.status = 404;
    return next(err);
  }

  const unlocked = lessonUnlockedForUser(req.user.id, lesson.id);
  return res.json({
    lessonId: lesson.id,
    unlocked,
    passingScore: lesson.passingScore || 80,
    questions: lesson.test.map((q) => ({
      id: q.id,
      question: q.question
    }))
  });
});

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   get:
 *     summary: Получить урок по ID
 *     tags: [Student-Lessons]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:lessonId', requireAuth, (req, res, next) => {
  const lesson = getLessonById(req.params.lessonId);
  if (!lesson) {
    const err = new Error('Lesson not found');
    err.status = 404;
    return next(err);
  }

  const unlocked = lessonUnlockedForUser(req.user.id, lesson.id);
  return res.json({
    lesson: {
      ...lesson,
      videoUrl: lesson.videoUrl || DEFAULT_VIDEO_URL,
      unlocked
    }
  });
});

/**
 * @swagger
 * /api/lessons:
 *   post:
 *     summary: Создать урок (admin)
 *     tags: [Admin-Lessons]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', requireAuth, allowRoles('admin'), validateBody(lessonCreateSchema), (req, res, next) => {
  const moduleRow = getModuleById(req.body.moduleId);
  if (!moduleRow) {
    const err = new Error('Module not found');
    err.status = 404;
    return next(err);
  }

  const lesson = {
    id: nextId(),
    moduleId: req.body.moduleId,
    title: req.body.title,
    content: req.body.content,
    videoUrl: req.body.videoUrl || DEFAULT_VIDEO_URL,
    order: req.body.order,
    passingScore: req.body.passingScore,
    test: req.body.test.map((q) => ({ id: nextId(), ...q }))
  };

  db.lessons.push(lesson);
  return res.status(201).json({ lesson });
});

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   patch:
 *     summary: Обновить урок (admin)
 *     tags: [Admin-Lessons]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:lessonId', requireAuth, allowRoles('admin'), validateBody(lessonUpdateSchema), (req, res, next) => {
  const lesson = getLessonById(req.params.lessonId);
  if (!lesson) {
    const err = new Error('Lesson not found');
    err.status = 404;
    return next(err);
  }

  if (req.body.moduleId && !getModuleById(req.body.moduleId)) {
    const err = new Error('Module not found');
    err.status = 404;
    return next(err);
  }

  const patch = { ...req.body };
  if (patch.videoUrl === '') {
    patch.videoUrl = DEFAULT_VIDEO_URL;
  }
  if (patch.test) {
    patch.test = patch.test.map((q) => ({ id: q.id || nextId(), ...q }));
  }

  Object.assign(lesson, patch);
  return res.json({ lesson });
});

/**
 * @swagger
 * /api/lessons/{lessonId}:
 *   delete:
 *     summary: Удалить урок (admin)
 *     tags: [Admin-Lessons]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:lessonId', requireAuth, allowRoles('admin'), (req, res, next) => {
  const id = Number(req.params.lessonId);
  const index = db.lessons.findIndex((l) => l.id === id);
  if (index === -1) {
    const err = new Error('Lesson not found');
    err.status = 404;
    return next(err);
  }

  db.lessons.splice(index, 1);
  return res.status(204).send();
});

/**
 * @swagger
 * /api/lessons/{lessonId}/test/submit:
 *   post:
 *     summary: Отправить ответы теста урока
 *     tags: [Student-Lessons]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:lessonId/test/submit', requireAuth, allowRoles('student', 'admin'), validateBody(testSubmitSchema), (req, res, next) => {
  try {
    const result = submitLessonTest({
      userId: req.user.id,
      lessonId: Number(req.params.lessonId),
      answers: req.body.answers
    });

    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

export default router;

