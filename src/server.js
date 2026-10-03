import http from 'node:http';
import { createDatabase } from './db.js';
import { createApp } from './app.js';

const port = Number(process.env.PORT || 3000);
const db = createDatabase();
const server = http.createServer(createApp(db));

server.listen(port, () => {
  console.log(`Control System rodando em http://localhost:${port}`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
