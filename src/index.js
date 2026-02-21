import app from './app.js';
import { env } from './config/env.js';

function startServer(port, maxAttempts = 10) {
  const server = app.listen(port, () => {
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

startServer(env.PORT);
