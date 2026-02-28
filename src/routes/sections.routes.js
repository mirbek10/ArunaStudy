import { Router } from 'express';
import { db, getModuleById } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';
import { lessonAccessibleForUser } from '../services/lmsService.js';
import { toLocalizedLesson, toLocalizedModule } from '../utils/i18n.js';

const router = Router();
const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=qz0aGYrrlhU';

function visibleLessonsForUser(user, lessons) {
  if (user.role === 'admin') {
    return lessons;
  }

  return lessons.filter((lesson) => lessonAccessibleForUser(user.id, lesson.id));
}

router.get('/', requireAuth, (req, res) => {
  const sections = [...db.modules]
    .sort((a, b) => a.order - b.order)
    .map((module) => {
      const localized = toLocalizedModule(module);
      return {
        id: localized.id,
        title: localized.title,
        description: localized.description,
        order: localized.order,
        lessonsCount: db.lessons.filter((lesson) => lesson.moduleId === module.id).length
      };
    });

  res.json({ sections });
});

router.get('/:sectionId/lessons', requireAuth, (req, res, next) => {
  const section = getModuleById(req.params.sectionId);
  if (!section) {
    const err = new Error('Раздел не найден');
    err.status = 404;
    return next(err);
  }

  const lessons = db.lessons
    .filter((lesson) => lesson.moduleId === section.id)
    .sort((a, b) => a.order - b.order);

  const localizedSection = toLocalizedModule(section);

  return res.json({
    section: {
      id: localizedSection.id,
      title: localizedSection.title,
      description: localizedSection.description,
      order: localizedSection.order
    },
    lessons: visibleLessonsForUser(req.user, lessons).map((lesson) => {
      const localizedLesson = toLocalizedLesson(lesson, { includeTest: true, includeCorrectOptionIndex: false });
      return {
        ...localizedLesson,
        videoUrl: localizedLesson.videoUrl || DEFAULT_VIDEO_URL
      };
    })
  });
});

export default router;

