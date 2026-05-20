import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { initSchema } from './db.js';
import { runMigrations } from './migrate.js';
import { authRouter } from './routes/auth.js';
import { employeesRouter } from './routes/employees.js';
import { createRequestsRouter } from './routes/requests.js';
import { statsRouter } from './routes/stats.js';

const PORT = Number(process.env.PORT ?? 3001);

initSchema();
runMigrations();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json({ limit: '12mb' }));

function broadcast(payload: unknown) {
  io.emit('sync', payload);
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'field-service-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/requests', createRequestsRouter(broadcast));
app.use('/api/employees', employeesRouter);
app.use('/api/stats', statsRouter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, '../../dispatcher/dist')));

io.on('connection', (socket) => {
  socket.emit('sync', { type: 'connected' });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`API: http://localhost:${PORT}/api/health`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
  console.log('Для телефона укажите IP ПК в EXPO_PUBLIC_API_URL');
});
