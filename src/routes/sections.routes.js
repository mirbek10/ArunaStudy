import { Router } from 'express';
import { db, getModuleById } from '../services/dataStore.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const DEFAULT_VIDEO_URL = 'https://www.youtube.com/watch?v=qz0aGYrrlhU';

router.get('/', requireAuth, (_req, res) => {
  const sections = [...db.modules]
    .sort((a, b) => a.order - b.order)
    .map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description,
      order: module.order,
      lessonsCount: db.lessons.filter((lesson) => lesson.moduleId === module.id).length
    }));

  res.json({ sections });
});

router.get('/:sectionId/lessons', requireAuth, (req, res, next) => {
  const section = getModuleById(req.params.sectionId);
  if (!section) {
    const err = new Error('Section not found');
    err.status = 404;
    return next(err);
  }

  const lessons = db.lessons
    .filter((lesson) => lesson.moduleId === section.id)
    .sort((a, b) => a.order - b.order)
    .map((lesson) => ({
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      content: lesson.content,
      videoUrl: lesson.videoUrl || DEFAULT_VIDEO_URL,
      order: lesson.order,
      passingScore: lesson.passingScore,
      test: lesson.test.map((q) => ({ id: q.id, question: q.question }))
    }));

  return res.json({
    section: {
      id: section.id,
      title: section.title,
      description: section.description,
      order: section.order
    },
    lessons
  });
});

export default router;
