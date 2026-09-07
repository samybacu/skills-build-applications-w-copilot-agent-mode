import express from 'express';
import { connectDatabase } from './config/database.js';
import { Activity, Leaderboard, Team, User, Workout } from './models/index.js';

const app = express();
const port = Number(process.env.PORT || 8000);
const codespaceName = process.env.CODESPACE_NAME;

export const apiBaseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';

app.use(express.json());
app.use((request, response, next) => {
  response.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  response.header('Access-Control-Allow-Headers', 'Content-Type');
  response.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }
  next();
});

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'octofit-tracker-api' });
});

app.get('/api/users', async (_request, response, next) => {
  try {
    response.json(await User.find().sort({ displayName: 1 }));
  } catch (error) {
    next(error);
  }
});

app.post('/api/users', async (request, response, next) => {
  try {
    response.status(201).json(await User.create(request.body));
  } catch (error) {
    next(error);
  }
});

app.get('/api/teams', async (_request, response, next) => {
  try {
    response.json(await Team.find().populate('memberIds', 'displayName username'));
  } catch (error) {
    next(error);
  }
});

app.post('/api/teams', async (request, response, next) => {
  try {
    response.status(201).json(await Team.create(request.body));
  } catch (error) {
    next(error);
  }
});

app.get('/api/activities', async (request, response, next) => {
  try {
    const filter = request.query.userId ? { userId: request.query.userId } : {};
    response.json(await Activity.find(filter).populate('userId', 'displayName username').sort({ completedAt: -1 }));
  } catch (error) {
    next(error);
  }
});

app.post('/api/activities', async (request, response, next) => {
  try {
    response.status(201).json(await Activity.create(request.body));
  } catch (error) {
    next(error);
  }
});

app.get('/api/leaderboard', async (_request, response, next) => {
  try {
    response.json(await Leaderboard.find().populate('userId', 'displayName username').sort({ points: -1 }));
  } catch (error) {
    next(error);
  }
});

app.get('/api/workouts', async (request, response, next) => {
  try {
    const filter = request.query.difficulty ? { difficulty: request.query.difficulty } : {};
    response.json(await Workout.find(filter).sort({ title: 1 }));
  } catch (error) {
    next(error);
  }
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Route not found' });
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  console.error(error);
  response.status(400).json({ error: 'Request could not be processed' });
});

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`OctoFit Tracker API listening on port ${port}`);
    console.log(`API base URL: ${apiBaseUrl}`);
  });
}

if (process.env.NODE_ENV !== 'test') {
  startServer().catch((error) => {
    console.error('Unable to start the API:', error);
    process.exit(1);
  });
}

export default app;