import { db, getLessonById, getModuleById, getOrderedLessons, userProgressMap } from './dataStore.js';
import { nextId } from '../utils/id.js';

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export function lessonUnlockedForUser(userId, lessonId) {
  const orderedLessons = getOrderedLessons();
  const idx = orderedLessons.findIndex((l) => l.id === Number(lessonId));
  if (idx <= 0) return true;

  const previousLesson = orderedLessons[idx - 1];
  const progress = userProgressMap(userId);
  const previousResult = progress[String(previousLesson.id)];
  const required = previousLesson.passingScore || 80;
  return Number(previousResult?.testScore || 0) >= required;
}

export function submitLessonTest({ userId, lessonId, answers }) {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    const error = new Error('Lesson not found');
    error.status = 404;
    throw error;
  }

  if (!lessonUnlockedForUser(userId, lesson.id)) {
    const error = new Error('Lesson is locked. Complete previous lesson with at least 80%.');
    error.status = 423;
    throw error;
  }

  const map = new Map((answers || []).map((a) => [Number(a.questionId), normalize(a.answer)]));
  const total = lesson.test.length;
  const correct = lesson.test.reduce((sum, question) => {
    return sum + (map.get(question.id) === normalize(question.correctAnswer) ? 1 : 0);
  }, 0);

  const score = total ? Math.round((correct / total) * 100) : 0;
  const required = lesson.passingScore || 80;

  const progress = userProgressMap(userId);
  const previous = progress[String(lesson.id)] || { attempts: 0, testScore: 0, completed: false };
  const bestScore = Math.max(previous.testScore || 0, score);

  progress[String(lesson.id)] = {
    lessonId: lesson.id,
    testScore: bestScore,
    lastScore: score,
    attempts: Number(previous.attempts || 0) + 1,
    completed: bestScore >= required,
    updatedAt: new Date().toISOString()
  };

  return {
    lessonId: lesson.id,
    score,
    bestScore,
    required,
    passed: score >= required,
    passedByBest: bestScore >= required
  };
}

export function buildProgressOverview(userId) {
  const progress = userProgressMap(userId);
  const lessons = getOrderedLessons();

  const completedLessons = lessons.filter((lesson) => {
    const row = progress[String(lesson.id)];
    return Number(row?.testScore || 0) >= (lesson.passingScore || 80);
  }).length;

  const totalLessons = lessons.length;
  const overallPercent = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const moduleProgress = db.modules
    .sort((a, b) => a.order - b.order)
    .map((module) => {
      const moduleLessons = db.lessons.filter((l) => l.moduleId === module.id);
      const done = moduleLessons.filter((lesson) => {
        const row = progress[String(lesson.id)];
        return Number(row?.testScore || 0) >= (lesson.passingScore || 80);
      }).length;

      return {
        moduleId: module.id,
        title: module.title,
        completedLessons: done,
        totalLessons: moduleLessons.length,
        percent: moduleLessons.length ? Math.round((done / moduleLessons.length) * 100) : 0
      };
    });

  return {
    overallPercent,
    completedLessons,
    totalLessons,
    lessonProgress: progress,
    moduleProgress
  };
}

export function createPracticeSubmission({ studentId, lessonId, answerUrl, answerText }) {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    const error = new Error('Lesson not found');
    error.status = 404;
    throw error;
  }

  const submission = {
    id: nextId(),
    studentId,
    lessonId: lesson.id,
    answerUrl: answerUrl || '',
    answerText: answerText || '',
    status: 'pending',
    feedback: '',
    reviewerId: null,
    createdAt: new Date().toISOString(),
    reviewedAt: null
  };

  db.practiceSubmissions.push(submission);
  return submission;
}

export function reviewPracticeSubmission({ submissionId, reviewerId, status, feedback }) {
  const row = db.practiceSubmissions.find((s) => s.id === Number(submissionId));
  if (!row) {
    const error = new Error('Submission not found');
    error.status = 404;
    throw error;
  }

  row.status = status;
  row.feedback = feedback;
  row.reviewerId = reviewerId;
  row.reviewedAt = new Date().toISOString();

  return row;
}

export function lessonsByModule(moduleId) {
  if (!getModuleById(moduleId)) {
    const error = new Error('Module not found');
    error.status = 404;
    throw error;
  }

  return db.lessons
    .filter((lesson) => lesson.moduleId === Number(moduleId))
    .sort((a, b) => a.order - b.order);
}
