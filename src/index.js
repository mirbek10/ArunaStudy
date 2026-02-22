import app from './app.js';
import { env } from './config/env.js';
import { initMongoStore } from './services/mongoStore.js';

let mongoConnected = false;
let mongoRetryTimer = null;

function startServer(port, maxAttempts = 10) {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`arunastudy server running on http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/api/docs`);
    console.log(`OpenAPI JSON: http://localhost:${port}/api/docs.json`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE' && maxAttempts > 0) {
      const nextPort = port + 1;
      console.warn(`Port ${port} is busy, trying ${nextPort}...`);
      startServer(nextPort, maxAttempts - 1);
      return;
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
    console.error('Не удалось подключиться к MongoDB. Сервер продолжит работу в памяти.');
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
