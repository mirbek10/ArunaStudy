import { db, getLessonById, getModuleById, getOrderedLessons, getUserById, hasUserLessonAccess, userProgressMap } from './dataStore.js';
import { nextId } from '../utils/id.js';
import { toLocalizedQuestion, toLocalizedText } from '../utils/i18n.js';

function lessonPassingScore(lesson) {
  return Number(lesson?.passingScore || 80);
}

function lessonIsRequired(lesson) {
  return typeof lesson?.isRequired === 'boolean' ? lesson.isRequired : true;
}

function lessonCompletedByProgress(lesson, progressRow) {
  if (!progressRow || typeof progressRow !== 'object') {
    return false;
  }

  if (typeof progressRow.completed === 'boolean') {
    return progressRow.completed || Number(progressRow.testScore || 0) >= lessonPassingScore(lesson);
  }

  return Number(progressRow.testScore || 0) >= lessonPassingScore(lesson);
}

function completionPercent(completed, total, fallbackTotal = 0) {
  if (total > 0) {
    return Math.round((completed / total) * 100);
  }

  return fallbackTotal > 0 ? 100 : 0;
}

const PRACTICE_REVIEW_STATUSES = new Set(['approved', 'rejected']);

function normalizePracticeReviewHistory(row) {
  if (Array.isArray(row.reviewHistory)) {
    return row.reviewHistory.filter((entry) => entry && typeof entry === 'object');
  }

  if (!row.reviewedAt) {
    return [];
  }

  return [
    {
      status: PRACTICE_REVIEW_STATUSES.has(row.status) ? row.status : 'rejected',
      feedback: row.feedback || '',
      reviewerId: row.reviewerId ?? null,
      reviewedAt: row.reviewedAt
    }
  ];
}

export function lessonAccessibleForUser(userId, _lessonId) {
  const user = getUserById(userId);
  if (!user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  return hasUserLessonAccess(user.id);
}

export function lessonUnlockedForUser(userId, lessonId) {
  if (!lessonAccessibleForUser(userId, lessonId)) {
    return false;
  }

  const orderedLessons = getOrderedLessons();
  const idx = orderedLessons.findIndex((l) => l.id === Number(lessonId));
  if (idx === -1) return false;
  if (idx <= 0) return true;

  const previousLesson = orderedLessons[idx - 1];
  if (!lessonIsRequired(previousLesson)) {
    return true;
  }

  const progress = userProgressMap(userId);
  const previousResult = progress[String(previousLesson.id)];
  return lessonCompletedByProgress(previousLesson, previousResult);
}

export function submitLessonTest({ userId, lessonId, answers }) {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    const error = new Error('Урок не найден');
    error.status = 404;
    throw error;
  }

  if (!lessonAccessibleForUser(userId, lesson.id)) {
    const error = new Error('Нет доступа к этому уроку');
    error.status = 403;
    throw error;
  }

  if (!lessonUnlockedForUser(userId, lesson.id)) {
    const error = new Error('Урок заблокирован. Сначала завершите предыдущий обязательный урок.');
    error.status = 423;
    throw error;
  }

  const map = new Map((answers || []).map((a) => [Number(a.questionId), Number(a.selectedOptionIndex)]));
  const total = lesson.test.length;
  const correct = lesson.test.reduce((sum, question) => {
    const normalizedQuestion = toLocalizedQuestion(question, { includeCorrectOptionIndex: true });
    const submittedOptionIndex = map.get(question.id);
    return sum + (submittedOptionIndex === Number(normalizedQuestion.correctOptionIndex) ? 1 : 0);
  }, 0);

  const score = total ? Math.round((correct / total) * 100) : 0;
  const required = lessonPassingScore(lesson);

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
  const user = getUserById(userId);
  const hasAccess = user?.role === 'admin' ? true : hasUserLessonAccess(userId);
  const lessons = hasAccess ? getOrderedLessons() : [];
  const requiredLessons = lessons.filter((lesson) => lessonIsRequired(lesson));
  const optionalLessons = lessons.filter((lesson) => !lessonIsRequired(lesson));

  const completedRequiredLessons = requiredLessons.filter((lesson) => {
    const row = progress[String(lesson.id)];
    return lessonCompletedByProgress(lesson, row);
  }).length;

  const completedOptionalLessons = optionalLessons.filter((lesson) => {
    const row = progress[String(lesson.id)];
    return lessonCompletedByProgress(lesson, row);
  }).length;

  const totalRequiredLessons = requiredLessons.length;
  const totalOptionalLessons = optionalLessons.length;
  const overallPercent = completionPercent(completedRequiredLessons, totalRequiredLessons, lessons.length);

  const moduleProgress = [...db.modules]
    .sort((a, b) => a.order - b.order)
    .map((module) => {
      const moduleLessons = hasAccess ? db.lessons.filter((l) => l.moduleId === module.id) : [];
      const moduleRequiredLessons = moduleLessons.filter((lesson) => lessonIsRequired(lesson));
      const moduleOptionalLessons = moduleLessons.filter((lesson) => !lessonIsRequired(lesson));

      const completedModuleRequiredLessons = moduleRequiredLessons.filter((lesson) => {
        const row = progress[String(lesson.id)];
        return lessonCompletedByProgress(lesson, row);
      }).length;

      const completedModuleOptionalLessons = moduleOptionalLessons.filter((lesson) => {
        const row = progress[String(lesson.id)];
        return lessonCompletedByProgress(lesson, row);
      }).length;

      const totalModuleRequiredLessons = moduleRequiredLessons.length;
      const percent = completionPercent(completedModuleRequiredLessons, totalModuleRequiredLessons, moduleLessons.length);

      return {
        moduleId: module.id,
        title: toLocalizedText(module.title),
        completedLessons: completedModuleRequiredLessons,
        totalLessons: totalModuleRequiredLessons,
        percent,
        completed: totalModuleRequiredLessons === 0 || completedModuleRequiredLessons === totalModuleRequiredLessons,
        completedRequiredLessons: completedModuleRequiredLessons,
        totalRequiredLessons: totalModuleRequiredLessons,
        completedOptionalLessons: completedModuleOptionalLessons,
        totalOptionalLessons: moduleOptionalLessons.length
      };
    });

  return {
    overallPercent,
    completedLessons: completedRequiredLessons,
    totalLessons: totalRequiredLessons,
    completedRequiredLessons,
    totalRequiredLessons,
    completedOptionalLessons,
    totalOptionalLessons,
    lessonProgress: progress,
    moduleProgress
  };
}

export function createPracticeSubmission({ studentId, lessonId, answerUrl, answerText }) {
  const lesson = getLessonById(lessonId);
  if (!lesson) {
    const error = new Error('Урок не найден');
    error.status = 404;
    throw error;
  }

  if (!lessonAccessibleForUser(studentId, lesson.id)) {
    const error = new Error('Нет доступа к этому уроку');
    error.status = 403;
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
    reviewHistory: [],
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
    const error = new Error('Отправка не найдена');
    error.status = 404;
    throw error;
  }

  const reviewedAt = new Date().toISOString();
  const review = {
    status,
    feedback,
    reviewerId,
    reviewedAt
  };
  row.reviewHistory = [...normalizePracticeReviewHistory(row), review];
  row.status = status;
  row.feedback = feedback;
  row.reviewerId = reviewerId;
  row.reviewedAt = reviewedAt;

  return row;
}

export function lessonsByModule(moduleId) {
  if (!getModuleById(moduleId)) {
    const error = new Error('Модуль не найден');
    error.status = 404;
    throw error;
  }

  return db.lessons
    .filter((lesson) => lesson.moduleId === Number(moduleId))
    .sort((a, b) => a.order - b.order);
}

