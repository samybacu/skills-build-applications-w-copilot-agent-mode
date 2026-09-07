import mongoose from 'mongoose';
import { Activity, Leaderboard, Team, User, Workout } from '../models/index.js';

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/octofit_db';

/**
 * Seed the octofit_db database with test data
 */
async function seedDatabase() {
  try {
    await mongoose.connect(connectionString);

    console.log('Connected to octofit_db');

    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Activity.deleteMany({}),
      Leaderboard.deleteMany({}),
      Workout.deleteMany({}),
    ]);

    const users = await User.create([
      {
        username: 'alex.runner',
        displayName: 'Alex Runner',
        email: 'alex.runner@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
      },
      {
        username: 'jamie.walker',
        displayName: 'Jamie Walker',
        email: 'jamie.walker@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=32',
      },
      {
        username: 'taylor.strong',
        displayName: 'Taylor Strong',
        email: 'taylor.strong@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=47',
      },
    ]);

    await Team.create([
      {
        name: 'Morning Movers',
        description: 'Start the day with a little momentum.',
        memberIds: [users[0]._id, users[1]._id],
      },
      {
        name: 'Strength Squad',
        description: 'Build consistency one session at a time.',
        memberIds: [users[2]._id],
      },
    ]);

    await Activity.create([
      {
        userId: users[0]._id,
        type: 'running',
        durationMinutes: 32,
        distanceKilometers: 5.2,
        notes: 'Easy pace around the neighborhood',
        completedAt: new Date('2026-09-05T07:30:00Z'),
      },
      {
        userId: users[1]._id,
        type: 'walking',
        durationMinutes: 45,
        distanceKilometers: 3.4,
        notes: 'Lunch break walk',
        completedAt: new Date('2026-09-05T12:15:00Z'),
      },
      {
        userId: users[2]._id,
        type: 'strength',
        durationMinutes: 40,
        notes: 'Full-body circuit',
        completedAt: new Date('2026-09-04T16:00:00Z'),
      },
    ]);

    await Leaderboard.create([
      { userId: users[0]._id, points: 420, rank: 1 },
      { userId: users[2]._id, points: 365, rank: 2 },
      { userId: users[1]._id, points: 280, rank: 3 },
    ]);

    await Workout.create([
      {
        title: 'Foundation Run',
        description: 'A steady run that builds aerobic endurance.',
        activityType: 'running',
        difficulty: 'beginner',
        durationMinutes: 25,
      },
      {
        title: 'Active Recovery Walk',
        description: 'A relaxed walk to keep your body moving between workouts.',
        activityType: 'walking',
        difficulty: 'beginner',
        durationMinutes: 30,
      },
      {
        title: 'Circuit Builder',
        description: 'A balanced circuit for strength and conditioning.',
        activityType: 'strength',
        difficulty: 'intermediate',
        durationMinutes: 35,
      },
    ]);

    console.log('Database seeding complete');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
