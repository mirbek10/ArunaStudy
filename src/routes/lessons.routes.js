import { Router } from 'express';
import { db, getLessonById, getModuleById } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { lessonCreateSchema, lessonRequiredUpdateSchema, lessonUpdateSchema, testSubmitSchema } from '../utils/schemas.js';
import { nextId } from '../utils/id.js';
import { lessonAccessibleForUser, lessonUnlockedForUser, submitLessonTest } from '../services/lmsService.js';
import { toLocalizedLesson, toLocalizedQuestion } from '../utils/i18n.js';
import { persistMongoStore } from '../services/mongoStore.js';

const router = Router();
const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=qz0aGYrrlhU';

function ensureLessonAccess(req, lessonId, next) {
  if (lessonAccessibleForUser(req.user.id, lessonId)) {
    return true;
  }

  const err = new Error('Нет доступа к этому уроку');
  err.status = 403;
  next(err);
  return false;
}

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
    const err = new Error('Урок не найден');
    err.status = 404;
    return next(err);
  }

  if (!ensureLessonAccess(req, lesson.id, next)) {
    return;
  }

  const unlocked = lessonUnlockedForUser(req.user.id, lesson.id);
  return res.json({
    lessonId: lesson.id,
    unlocked,
    passingScore: lesson.passingScore || 80,
    isRequired: typeof lesson.isRequired === 'boolean' ? lesson.isRequired : true,
    questions: lesson.test.map((q) => {
      const localizedQuestion = toLocalizedQuestion(q, { includeCorrectOptionIndex: false });
      return {
        id: localizedQuestion.id,
        question: localizedQuestion.question,
        options: localizedQuestion.options
      };
    })
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
    const err = new Error('Урок не найден');
    err.status = 404;
    return next(err);
  }

  if (!ensureLessonAccess(req, lesson.id, next)) {
    return;
  }

  const unlocked = lessonUnlockedForUser(req.user.id, lesson.id);
  const includeCorrectOptionIndex = req.user.role === 'admin';
  const localizedLesson = toLocalizedLesson(lesson, { includeTest: true, includeCorrectOptionIndex });

  return res.json({
    lesson: {
      ...localizedLesson,
      videoUrl: localizedLesson.videoUrl || DEFAULT_VIDEO_URL,
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
router.post('/', requireAuth, allowRoles('admin'), validateBody(lessonCreateSchema), async (req, res, next) => {
  try {
    const moduleRow = getModuleById(req.body.moduleId);
    if (!moduleRow) {
      const err = new Error('Модуль не найден');
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
      isRequired: req.body.isRequired,
      test: req.body.test.map((q) => ({ ...q, id: nextId() }))
    };

    db.lessons.push(lesson);
    await persistMongoStore();

    return res.status(201).json({
      lesson: toLocalizedLesson(lesson, { includeTest: true, includeCorrectOptionIndex: true })
    });
  } catch (err) {
    return next(err);
  }
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
router.patch('/:lessonId', requireAuth, allowRoles('admin'), validateBody(lessonUpdateSchema), async (req, res, next) => {
  try {
    const lesson = getLessonById(req.params.lessonId);
    if (!lesson) {
      const err = new Error('Урок не найден');
      err.status = 404;
      return next(err);
    }

    if (req.body.moduleId && !getModuleById(req.body.moduleId)) {
      const err = new Error('Модуль не найден');
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
    await persistMongoStore();

    return res.json({
      lesson: toLocalizedLesson(lesson, { includeTest: true, includeCorrectOptionIndex: true })
    });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/lessons/{lessonId}/required:
 *   patch:
 *     summary: Обновить обязательность урока (admin)
 *     tags: [Admin-Lessons]
 *     security:
 *       - bearerAuth: []
 */
router.patch('/:lessonId/required', requireAuth, allowRoles('admin'), validateBody(lessonRequiredUpdateSchema), async (req, res, next) => {
  try {
    const lesson = getLessonById(req.params.lessonId);
    if (!lesson) {
      const err = new Error('Урок не найден');
      err.status = 404;
      return next(err);
    }

    lesson.isRequired = req.body.isRequired;
    await persistMongoStore();

    return res.json({
      lesson: toLessonForLanguage(lesson, req.lang, { includeTest: true, includeCorrectOptionIndex: true })
    });
  } catch (err) {
    return next(err);
  }
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
router.delete('/:lessonId', requireAuth, allowRoles('admin'), async (req, res, next) => {
  try {
    const id = Number(req.params.lessonId);
    const index = db.lessons.findIndex((l) => l.id === id);
    if (index === -1) {
      const err = new Error('Урок не найден');
      err.status = 404;
      return next(err);
    }

    db.lessons.splice(index, 1);
    await persistMongoStore();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
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
router.post('/:lessonId/test/submit', requireAuth, allowRoles('student', 'admin'), validateBody(testSubmitSchema), async (req, res, next) => {
  try {
    const result = submitLessonTest({
      userId: req.user.id,
      lessonId: Number(req.params.lessonId),
      answers: req.body.answers
    });

    await persistMongoStore();
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

export default router;

