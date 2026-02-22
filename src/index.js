import app from './app.js';
import { env } from './config/env.js';
import { initMongoStore } from './services/mongoStore.js';

let mongoConnected = false;
let mongoRetryTimer = null;

function startServer(port) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`arunastudy server running on http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/api/docs`);
    console.log(`OpenAPI JSON: http://localhost:${port}/api/docs.json`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Порт ${port} уже занят. Освободи порт или задай другой через переменную PORT.`);
      process.exit(1);
    }

    console.error(error);
    process.exit(1);
  });
}

async function connectMongoInBackground() {
  try {
    await initMongoStore();

    if (!mongoConnected) {
      mongoConnected = true;
      console.log('MongoDB подключена');
    }
  } catch (error) {
    mongoConnected = false;
    console.error('Не удалось подключиться к MongoDB. API будет недоступен до восстановления подключения.');
    console.error(error);

    clearTimeout(mongoRetryTimer);
    mongoRetryTimer = setTimeout(connectMongoInBackground, env.MONGODB_RETRY_DELAY_MS);
  }
}

function bootstrap() {
  startServer(env.PORT);
  connectMongoInBackground();
}

bootstrap();
