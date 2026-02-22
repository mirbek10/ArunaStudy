import { MongoClient } from 'mongodb';
import { env } from '../config/env.js';
import { applyStateSnapshot, createStateSnapshot } from './dataStore.js';

const STATE_DOC_ID = 'lms-state';

let client = null;
let collections = null;
let initPromise = null;
let writeQueue = Promise.resolve();

async function resetMongoConnection() {
  collections = null;
  initPromise = null;

  if (client) {
    try {
      await client.close();
    } catch {
      // no-op
    }
    client = null;
  }
}

function getCollections() {
  if (!collections) {
    throw new Error('Хранилище MongoDB не инициализировано');
  }

  return collections;
}

function sanitizeId(value) {
  const id = Number(value);
  if (!Number.isFinite(id)) {
    return null;
  }
  return id;
}

function replaceCollection(collection, docs) {
  return collection
    .deleteMany({})
    .then(() => {
      if (!docs.length) {
        return;
      }

      return collection.insertMany(docs, { ordered: false });
    })
    .then(() => undefined);
}

function toSnapshotUsers(rows) {
  return rows
    .map((row) => {
      const id = sanitizeId(row.id ?? row._id);
      if (id === null) return null;
      return {
        id,
        name: row.name,
        email: row.email,
        passwordHash: row.passwordHash,
        role: row.role
      };
    })
    .filter(Boolean);
}

function toSnapshotModules(rows) {
  return rows
    .map((row) => {
      const id = sanitizeId(row.id ?? row._id);
      if (id === null) return null;
      return {
        id,
        title: row.title,
        description: row.description,
        order: row.order
      };
    })
    .filter(Boolean);
}

function toSnapshotLessons(rows) {
  return rows
    .map((row) => {
      const id = sanitizeId(row.id ?? row._id);
      if (id === null) return null;
      return {
        id,
        moduleId: row.moduleId,
        title: row.title,
        content: row.content,
        videoUrl: row.videoUrl,
        order: row.order,
        passingScore: row.passingScore,
        test: Array.isArray(row.test) ? row.test : []
      };
    })
    .filter(Boolean);
}

function toSnapshotAccess(rows) {
  const result = {};
  for (const row of rows) {
    const userId = String(row.userId ?? row._id ?? '');
    if (!userId) continue;
    result[userId] = Boolean(row.hasAccess);
  }
  return result;
}

function toSnapshotProgress(rows) {
  const result = {};
  for (const row of rows) {
    const userId = String(row.userId ?? row._id ?? '');
    if (!userId) continue;
    result[userId] = row.progress && typeof row.progress === 'object' ? row.progress : {};
  }
  return result;
}

function toSnapshotPractices(rows) {
  return rows
    .map((row) => {
      const id = sanitizeId(row.id ?? row._id);
      if (id === null) return null;
      return {
        id,
        studentId: row.studentId,
        lessonId: row.lessonId,
        answerUrl: row.answerUrl,
        answerText: row.answerText,
        status: row.status,
        feedback: row.feedback,
        reviewerId: row.reviewerId,
        createdAt: row.createdAt,
        reviewedAt: row.reviewedAt
      };
    })
    .filter(Boolean);
}

async function readStructuredState() {
  const c = getCollections();
  const [usersRows, modulesRows, lessonsRows, accessRows, progressRows, practicesRows] = await Promise.all([
    c.users.find({}).toArray(),
    c.modules.find({}).toArray(),
    c.lessons.find({}).toArray(),
    c.lessonAccess.find({}).toArray(),
    c.progress.find({}).toArray(),
    c.practiceSubmissions.find({}).toArray()
  ]);

  return {
    users: toSnapshotUsers(usersRows),
    modules: toSnapshotModules(modulesRows),
    lessons: toSnapshotLessons(lessonsRows),
    lessonAccessByUserId: toSnapshotAccess(accessRows),
    progressByUserId: toSnapshotProgress(progressRows),
    practiceSubmissions: toSnapshotPractices(practicesRows)
  };
}

async function readLegacyState() {
  const c = getCollections();
  const row = await c.legacy.findOne({ _id: STATE_DOC_ID });
  if (row?.state) {
    return row.state;
  }

  if (row?.users && row?.modules && row?.lessons) {
    return row;
  }

  return null;
}

async function hasStructuredData() {
  const c = getCollections();
  const [usersCount, modulesCount, lessonsCount] = await Promise.all([
    c.users.countDocuments({}, { limit: 1 }),
    c.modules.countDocuments({}, { limit: 1 }),
    c.lessons.countDocuments({}, { limit: 1 })
  ]);

  return usersCount > 0 || modulesCount > 0 || lessonsCount > 0;
}

function buildStructuredDocs(state) {
  const usersDocs = (state.users || []).map((row) => ({ _id: row.id, ...row }));
  const modulesDocs = (state.modules || []).map((row) => ({ _id: row.id, ...row }));
  const lessonsDocs = (state.lessons || []).map((row) => ({ _id: row.id, ...row }));
  const lessonAccessDocs = Object.entries(state.lessonAccessByUserId || {}).map(([userId, hasAccess]) => ({
    _id: String(userId),
    userId: String(userId),
    hasAccess: Boolean(hasAccess)
  }));
  const progressDocs = Object.entries(state.progressByUserId || {}).map(([userId, progress]) => ({
    _id: String(userId),
    userId: String(userId),
    progress: progress && typeof progress === 'object' ? progress : {}
  }));
  const practiceDocs = (state.practiceSubmissions || []).map((row) => ({ _id: row.id, ...row }));

  return {
    usersDocs,
    modulesDocs,
    lessonsDocs,
    lessonAccessDocs,
    progressDocs,
    practiceDocs
  };
}

function buildSiteSummary(state) {
  const users = state.users || [];
  const modules = state.modules || [];
  const lessons = state.lessons || [];
  const practices = state.practiceSubmissions || [];
  const lessonAccessEntries = Object.entries(state.lessonAccessByUserId || {});
  const progressUsersCount = Object.keys(state.progressByUserId || {}).length;
  const totalQuestionsCount = lessons.reduce((sum, lesson) => sum + (lesson.test?.length || 0), 0);

  return {
    _id: STATE_DOC_ID,
    kind: 'site_summary',
    usersCount: users.length,
    studentsCount: users.filter((user) => user.role === 'student').length,
    adminsCount: users.filter((user) => user.role === 'admin').length,
    modulesCount: modules.length,
    lessonsCount: lessons.length,
    questionsCount: totalQuestionsCount,
    lessonAccessEntriesCount: lessonAccessEntries.length,
    studentsWithLessonsAccessCount: lessonAccessEntries.filter(([, hasAccess]) => Boolean(hasAccess)).length,
    progressUsersCount,
    practiceSubmissionsCount: practices.length,
    pendingPracticesCount: practices.filter((row) => row.status === 'pending').length,
    approvedPracticesCount: practices.filter((row) => row.status === 'approved').length,
    rejectedPracticesCount: practices.filter((row) => row.status === 'rejected').length,
    updatedAt: new Date().toISOString()
  };
}

async function writeStructuredState(state) {
  const c = getCollections();
  const { usersDocs, modulesDocs, lessonsDocs, lessonAccessDocs, progressDocs, practiceDocs } = buildStructuredDocs(state);
  const siteSummary = buildSiteSummary(state);

  await Promise.all([
    replaceCollection(c.users, usersDocs),
    replaceCollection(c.modules, modulesDocs),
    replaceCollection(c.lessons, lessonsDocs),
    replaceCollection(c.lessonAccess, lessonAccessDocs),
    replaceCollection(c.progress, progressDocs),
    replaceCollection(c.practiceSubmissions, practiceDocs),
    c.meta.updateOne(
      { _id: STATE_DOC_ID },
      {
        $set: {
          updatedAt: new Date().toISOString()
        }
      },
      { upsert: true }
    ),
    c.legacy.replaceOne({ _id: STATE_DOC_ID }, siteSummary, { upsert: true })
  ]);
}

export function mongoReady() {
  return Boolean(collections);
}

export async function initMongoStore() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    client = new MongoClient(env.MONGODB_URI, {
      serverSelectionTimeoutMS: env.MONGODB_SERVER_SELECTION_TIMEOUT_MS
    });
    await client.connect();

    const db = client.db(env.MONGODB_DB_NAME);
    const structuredCollectionNames = ['users', 'modules', 'lessons', 'lesson_access', 'progress', 'practice_submissions', 'meta'];

    await Promise.all(
      structuredCollectionNames.map((name) =>
        db.createCollection(name).catch((error) => {
          if (error?.codeName === 'NamespaceExists') {
            return;
          }

          throw error;
        })
      )
    );

    collections = {
      users: db.collection('users'),
      modules: db.collection('modules'),
      lessons: db.collection('lessons'),
      lessonAccess: db.collection('lesson_access'),
      progress: db.collection('progress'),
      practiceSubmissions: db.collection('practice_submissions'),
      meta: db.collection('meta'),
      legacy: db.collection(env.MONGODB_COLLECTION)
    };

    if (await hasStructuredData()) {
      const state = await readStructuredState();
      applyStateSnapshot(state);
      return;
    }

    const legacyState = await readLegacyState();
    if (legacyState) {
      applyStateSnapshot(legacyState);
    }

    await persistMongoStore();
  })().catch(async (error) => {
    await resetMongoConnection();
    throw error;
  });

  return initPromise;
}

export async function persistMongoStore() {
  if (!mongoReady()) {
    return;
  }

  const state = createStateSnapshot();
  writeQueue = writeQueue
    .catch(() => {})
    .then(() => writeStructuredState(state));

  try {
    await writeQueue;
  } catch (error) {
    await resetMongoConnection();
    throw error;
  }
}

