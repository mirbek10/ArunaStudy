import { ensureIdAtLeast, nextId } from '../utils/id.js';
import { hashPassword } from '../utils/password.js';

function makeQuestion(question, correctAnswer) {
  return {
    id: nextId(),
    question,
    options: [correctAnswer, 'Option 2', 'Option 3', 'Option 4'],
    correctOptionIndex: 0
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export const db = {
  users: [
    {
      id: 1,
      name: 'Admin',
      email: 'admin@arunastudy.com',
      passwordHash: hashPassword('Admin123!'),
      role: 'admin'
    },
    {
      id: 2,
      name: 'Student',
      email: 'student@arunastudy.com',
      passwordHash: hashPassword('Student123!'),
      role: 'student'
    }
  ],
  modules: [
    { id: 11, title: 'HTML/CSS', description: 'Semantic HTML, CSS layouts, responsive basics.', order: 1 },
    { id: 12, title: 'JS Basics', description: 'Variables, functions, arrays, objects, DOM.', order: 2 },
    { id: 13, title: 'Advanced JS & Git', description: 'Async code, modules, Git workflows.', order: 3 },
    { id: 14, title: 'React', description: 'Components, state, props, routing, hooks.', order: 4 },
    { id: 15, title: 'Advanced React & RTK', description: 'State architecture, RTK Query, patterns.', order: 5 },
    { id: 16, title: 'TypeScript', description: 'TS concepts as curriculum module only.', order: 6 },
    { id: 17, title: 'Final Project', description: 'Production-ready final project and defense.', order: 7 }
  ],
  lessons: [
    {
      id: 101,
      moduleId: 11,
      title: 'HTML Structure',
      content: 'Build semantic page structure with accessibility in mind.',
      videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU',
      order: 1,
      passingScore: 80,
      test: [makeQuestion('Main HTML heading tag?', 'h1'), makeQuestion('Alt attribute is required for?', 'img')]
    },
    {
      id: 102,
      moduleId: 11,
      title: 'Flexbox and Grid',
      content: 'Layout systems for adaptive interfaces.',
      videoUrl: 'https://www.youtube.com/watch?v=JJSoEo8JSnc',
      order: 2,
      passingScore: 80,
      test: [makeQuestion('Property to enable flex context?', 'display:flex'), makeQuestion('One-dimensional layout tool?', 'flexbox')]
    },
    {
      id: 103,
      moduleId: 12,
      title: 'Variables and Data Types',
      content: 'Primitive types and declarations with let/const.',
      videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
      order: 1,
      passingScore: 80,
      test: [makeQuestion('Immutable declaration keyword?', 'const'), makeQuestion('Type of true?', 'boolean')]
    },
    {
      id: 104,
      moduleId: 12,
      title: 'DOM Events',
      content: 'Handle click, submit, and input events.',
      videoUrl: 'https://www.youtube.com/watch?v=XF1_MlZ5l6M',
      order: 2,
      passingScore: 80,
      test: [makeQuestion('Event for form send?', 'submit'), makeQuestion('Method to find element by id?', 'getelementbyid')]
    },
    {
      id: 105,
      moduleId: 13,
      title: 'Async JavaScript',
      content: 'Promises and async/await patterns.',
      videoUrl: 'https://www.youtube.com/watch?v=PoRJizFvM7s',
      order: 1,
      passingScore: 80,
      test: [makeQuestion('Keyword to pause in async fn?', 'await'), makeQuestion('Promise settled states count?', '3')]
    },
    {
      id: 106,
      moduleId: 13,
      title: 'Git Branching',
      content: 'Branch strategy, merge, rebase basics.',
      videoUrl: 'https://www.youtube.com/watch?v=SWYqp7iY_Tc',
      order: 2,
      passingScore: 80,
      test: [makeQuestion('Create and switch branch command?', 'git checkout -b'), makeQuestion('Command to show commit history?', 'git log')]
    },
    {
      id: 107,
      moduleId: 14,
      title: 'React Fundamentals',
      content: 'JSX, props, state and rendering lifecycle.',
      videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
      order: 1,
      passingScore: 80,
      test: [makeQuestion('Hook for local state?', 'usestate'), makeQuestion('Syntax extension for UI?', 'jsx')]
    },
    {
      id: 108,
      moduleId: 14,
      title: 'React Router',
      content: 'Route configuration and nested navigation.',
      videoUrl: 'https://www.youtube.com/watch?v=Ul3y1LXxzdU',
      order: 2,
      passingScore: 80,
      test: [makeQuestion('Component for links?', 'link'), makeQuestion('Hook for navigation?', 'usenavigate')]
    },
    {
      id: 109,
      moduleId: 15,
      title: 'Redux Toolkit',
      content: 'Slices, store setup, reducers and actions.',
      videoUrl: 'https://www.youtube.com/watch?v=NqzdVN2tyvQ',
      order: 1,
      passingScore: 80,
      test: [makeQuestion('Function to create slice?', 'createslice'), makeQuestion('Common async helper in RTK?', 'createasyncthunk')]
    },
    {
      id: 110,
      moduleId: 15,
      title: 'RTK Query',
      content: 'API layer and cache invalidation patterns.',
      videoUrl: 'https://www.youtube.com/watch?v=HyZzCHgG3AY',
      order: 2,
      passingScore: 80,
      test: [makeQuestion('Base API creator?', 'createapi'), makeQuestion('Hook naming usually starts with?', 'use')]
    },
    {
      id: 111,
      moduleId: 16,
      title: 'TS Types',
      content: 'Type aliases, interfaces, union and generics concepts.',
      videoUrl: 'https://www.youtube.com/watch?v=ahCwqrYpIuM',
      order: 1,
      passingScore: 80,
      test: [makeQuestion('Keyword for custom shape?', 'interface'), makeQuestion('Type for multiple possible values?', 'union')]
    },
    {
      id: 112,
      moduleId: 16,
      title: 'TS in React',
      content: 'Typing props, hooks and API responses.',
      videoUrl: 'https://www.youtube.com/watch?v=jrKcJxF0lAU',
      order: 2,
      passingScore: 80,
      test: [makeQuestion('Generic for array of strings?', 'string[]'), makeQuestion('React.FC type is for?', 'component')]
    },
    {
      id: 113,
      moduleId: 17,
      title: 'Project Planning',
      content: 'Requirements, backlog and architecture decisions.',
      videoUrl: 'https://www.youtube.com/watch?v=b_h0cBAXk4I',
      order: 1,
      passingScore: 80,
      test: [makeQuestion('Document for project requirements?', 'spec'), makeQuestion('Work unit in backlog?', 'task')]
    },
    {
      id: 114,
      moduleId: 17,
      title: 'Project Defense',
      content: 'Presentation, metrics and technical Q&A.',
      videoUrl: 'https://www.youtube.com/watch?v=JfVOs4VSpmA',
      order: 2,
      passingScore: 80,
      test: [makeQuestion('Main goal of demo?', 'show value'), makeQuestion('Performance score tool?', 'lighthouse')]
    }
  ],
  lessonAccessByUserId: {},
  progressByUserId: {},
  practiceSubmissions: []
};

export function createStateSnapshot() {
  return {
    users: clone(db.users),
    modules: clone(db.modules),
    lessons: clone(db.lessons),
    lessonAccessByUserId: clone(db.lessonAccessByUserId),
    progressByUserId: clone(db.progressByUserId),
    practiceSubmissions: clone(db.practiceSubmissions)
  };
}

function normalizeLessonAccessMap() {
  for (const user of db.users) {
    if (user.role !== 'student') {
      continue;
    }

    const key = String(user.id);
    const value = db.lessonAccessByUserId[key];

    if (typeof value === 'boolean') {
      continue;
    }

    if (Array.isArray(value)) {
      db.lessonAccessByUserId[key] = value.length > 0;
      continue;
    }

    db.lessonAccessByUserId[key] = false;
  }
}

export function syncIdCounterWithState() {
  const candidates = [1000];

  for (const user of db.users) {
    candidates.push(user.id);
  }

  for (const moduleRow of db.modules) {
    candidates.push(moduleRow.id);
  }

  for (const lesson of db.lessons) {
    candidates.push(lesson.id);

    for (const question of lesson.test || []) {
      candidates.push(question.id);
    }
  }

  for (const row of db.practiceSubmissions) {
    candidates.push(row.id);
  }

  const maxId = Math.max(...candidates.map((value) => Number(value) || 0));
  ensureIdAtLeast(maxId);
}

export function applyStateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') {
    return;
  }

  if (Array.isArray(snapshot.users)) {
    db.users = clone(snapshot.users);
  }

  if (Array.isArray(snapshot.modules)) {
    db.modules = clone(snapshot.modules);
  }

  if (Array.isArray(snapshot.lessons)) {
    db.lessons = clone(snapshot.lessons);
  }

  if (snapshot.lessonAccessByUserId && typeof snapshot.lessonAccessByUserId === 'object') {
    db.lessonAccessByUserId = clone(snapshot.lessonAccessByUserId);
  }

  if (snapshot.progressByUserId && typeof snapshot.progressByUserId === 'object') {
    db.progressByUserId = clone(snapshot.progressByUserId);
  }

  if (Array.isArray(snapshot.practiceSubmissions)) {
    db.practiceSubmissions = clone(snapshot.practiceSubmissions);
  }

  normalizeLessonAccessMap();
  syncIdCounterWithState();
}

normalizeLessonAccessMap();
syncIdCounterWithState();

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

export function findUserByEmail(email) {
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(userId) {
  return db.users.find((u) => u.id === Number(userId));
}

export function hasUserLessonAccess(userId) {
  const key = String(userId);
  if (typeof db.lessonAccessByUserId[key] !== 'boolean') {
    if (Array.isArray(db.lessonAccessByUserId[key])) {
      db.lessonAccessByUserId[key] = db.lessonAccessByUserId[key].length > 0;
    } else {
      db.lessonAccessByUserId[key] = false;
    }
  }
  return db.lessonAccessByUserId[key];
}

export function setUserLessonAccess(userId, hasAccess) {
  db.lessonAccessByUserId[String(userId)] = Boolean(hasAccess);
  return db.lessonAccessByUserId[String(userId)];
}

export function addUser({ name, email, passwordHash, role }) {
  const user = {
    id: nextId(),
    name,
    email,
    passwordHash,
    role
  };
  db.users.push(user);
  if (user.role === 'student') {
    db.lessonAccessByUserId[String(user.id)] = false;
  }
  return user;
}

export function getModuleById(moduleId) {
  return db.modules.find((m) => m.id === Number(moduleId));
}

export function getLessonById(lessonId) {
  return db.lessons.find((l) => l.id === Number(lessonId));
}

export function userProgressMap(userId) {
  const key = String(userId);
  if (!db.progressByUserId[key]) {
    db.progressByUserId[key] = {};
  }
  return db.progressByUserId[key];
}

export function getOrderedLessons() {
  const sortedModules = [...db.modules].sort((a, b) => a.order - b.order);
  const ordered = [];

  for (const module of sortedModules) {
    const lessons = db.lessons
      .filter((lesson) => lesson.moduleId === module.id)
      .sort((a, b) => a.order - b.order);

    for (const lesson of lessons) {
      ordered.push(lesson);
    }
  }

  return ordered;
}
