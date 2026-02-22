import { initMongoStore, mongoReady } from '../services/mongoStore.js';

let pendingInit = null;

async function ensureMongoStore() {
  if (mongoReady()) {
    return;
  }

  if (!pendingInit) {
    pendingInit = initMongoStore().finally(() => {
      pendingInit = null;
    });
  }

  await pendingInit;
}

export async function requireMongoStore(req, _res, next) {
  try {
    await ensureMongoStore();
    return next();
  } catch (_error) {
    const err = new Error('База данных MongoDB временно недоступна');
    err.status = 503;
    return next(err);
  }
}
