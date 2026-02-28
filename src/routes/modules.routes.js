import { Router } from 'express';
import { db, getModuleById } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';
import { allowRoles } from '../middleware/roles.js';
import { validateBody } from '../middleware/validate.js';
import { moduleCreateSchema, moduleUpdateSchema } from '../utils/schemas.js';
import { nextId } from '../utils/id.js';
import { lessonAccessibleForUser } from '../services/lmsService.js';
import { toLocalizedLesson, toLocalizedModule } from '../utils/i18n.js';
import { persistMongoStore } from '../services/mongoStore.js';

const router = Router();
const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=qz0aGYrrlhU';

function visibleLessonsForUser(user, lessons) {
  if (user.role === 'admin') {
    return lessons;
  }

  return lessons.filter((lesson) => lessonAccessibleForUser(user.id, lesson.id));
}

function serializeLesson(lesson, { includeTest = false, includeCorrectOptionIndex = false } = {}) {
  const normalized = toLocalizedLesson(lesson, { includeTest, includeCorrectOptionIndex });
  return {
    ...normalized,
    videoUrl: normalized.videoUrl || DEFAULT_VIDEO_URL
  };
}

/**
 * @swagger
 * /api/modules:
 *   get:
 *     summary: Получить список модулей
 *     tags: [Student-Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: withLessons
 *         schema:
 *           type: string
 *           enum: ['1']
 *     responses:
 *       200:
 *         description: Modules list
 */
router.get('/', requireAuth, (req, res) => {
  const withLessons = req.query.withLessons === '1';
  const modules = [...db.modules]
    .sort((a, b) => a.order - b.order)
    .map((module) => {
      const localizedModule = toLocalizedModule(module);
      if (!withLessons) return localizedModule;

      const lessons = db.lessons
        .filter((lesson) => lesson.moduleId === module.id)
        .sort((a, b) => a.order - b.order);

      return {
        ...localizedModule,
        lessons: visibleLessonsForUser(req.user, lessons).map((lesson) => serializeLesson(lesson))
      };
    });

  res.json({ modules });
});

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Создать модуль (admin)
 *     tags: [Admin-Modules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, order]
 *             additionalProperties: false
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Module created
 */
router.post('/', requireAuth, allowRoles('admin'), validateBody(moduleCreateSchema), async (req, res, next) => {
  try {
    const moduleRow = { id: nextId(), ...req.body };
    db.modules.push(moduleRow);
    await persistMongoStore();
    res.status(201).json({ module: toLocalizedModule(moduleRow) });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/modules/{moduleId}:
 *   patch:
 *     summary: Обновить модуль (admin)
 *     tags: [Admin-Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Module updated
 *       404:
 *         description: Модуль не найден
 */
router.patch('/:moduleId', requireAuth, allowRoles('admin'), validateBody(moduleUpdateSchema), async (req, res, next) => {
  try {
    const moduleRow = getModuleById(req.params.moduleId);
    if (!moduleRow) {
      const err = new Error('Модуль не найден');
      err.status = 404;
      return next(err);
    }

    Object.assign(moduleRow, req.body);
    await persistMongoStore();
    return res.json({ module: toLocalizedModule(moduleRow) });
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/modules/{moduleId}:
 *   delete:
 *     summary: Удалить модуль (admin)
 *     tags: [Admin-Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       204:
 *         description: Module deleted
 */
router.delete('/:moduleId', requireAuth, allowRoles('admin'), async (req, res, next) => {
  try {
    const moduleId = Number(req.params.moduleId);
    const index = db.modules.findIndex((m) => m.id === moduleId);
    if (index === -1) {
      const err = new Error('Модуль не найден');
      err.status = 404;
      return next(err);
    }

    db.modules.splice(index, 1);
    db.lessons = db.lessons.filter((lesson) => lesson.moduleId !== moduleId);
    await persistMongoStore();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

/**
 * @swagger
 * /api/modules/{moduleId}/lessons:
 *   get:
 *     summary: Получить уроки модуля
 *     tags: [Student-Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Lessons list
 */
router.get('/:moduleId/lessons', requireAuth, (req, res, next) => {
  const moduleRow = getModuleById(req.params.moduleId);
  if (!moduleRow) {
    const err = new Error('Модуль не найден');
    err.status = 404;
    return next(err);
  }

  const lessons = db.lessons
    .filter((lesson) => lesson.moduleId === moduleRow.id)
    .sort((a, b) => a.order - b.order);

  return res.json({
    lessons: visibleLessonsForUser(req.user, lessons).map((lesson) =>
      serializeLesson(lesson, { includeTest: true, includeCorrectOptionIndex: req.user.role === 'admin' })
    )
  });
});

export default router;

