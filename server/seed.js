import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gym_management';

// Define User Schema (matching your User model)
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

// Sample users
const users = [
  {
    name: 'Admin User',
    email: 'admin@ironcore.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    createdAt: new Date()
  },
  {
    name: 'John Trainer',
    email: 'trainer@ironcore.com',
    password: bcrypt.hashSync('train123', 10),
    role: 'trainer',
    createdAt: new Date()
  },
  {
    name: 'Sara Member',
    email: 'member@ironcore.com',
    password: bcrypt.hashSync('member123', 10),
    role: 'member',
    createdAt: new Date()
  },
  {
    name: 'Oswald',
    email: 'oswald@ironcore.com',
    password: bcrypt.hashSync('oswald123', 10),
    role: 'admin',
    createdAt: new Date()
  }
];

// Sample workouts
const workoutSchema = new mongoose.Schema({
  name: String,
  difficulty: String,
  duration: String,
  calories: Number,
  category: String,
  exercises: Array,
  createdAt: Date
});

const Workout = mongoose.model('Workout', workoutSchema);

const workouts = [
  {
    name: 'Full Body Strength',
    difficulty: 'Intermediate',
    duration: '45 min',
    calories: 300,
    category: 'strength',
    exercises: [
      { name: 'Squats', sets: 3, reps: 12 },
      { name: 'Push-ups', sets: 3, reps: 15 },
      { name: 'Pull-ups', sets: 3, reps: 8 }
    ],
    createdAt: new Date()
  },
  {
    name: 'Cardio Blast',
    difficulty: 'Beginner',
    duration: '30 min',
    calories: 250,
    category: 'cardio',
    exercises: [
      { name: 'Jumping Jacks', sets: 3, reps: 30 },
      { name: 'High Knees', sets: 3, reps: 30 },
      { name: 'Burpees', sets: 3, reps: 10 }
    ],
    createdAt: new Date()
  },
  {
    name: 'Yoga Flow',
    difficulty: 'Beginner',
    duration: '60 min',
    calories: 180,
    category: 'flexibility',
    exercises: [
      { name: 'Downward Dog', duration: '60 sec' },
      { name: 'Warrior I', duration: '60 sec' },
      { name: 'Tree Pose', duration: '60 sec' }
    ],
    createdAt: new Date()
  },
  {
    name: 'HIIT Extreme',
    difficulty: 'Advanced',
    duration: '30 min',
    calories: 400,
    category: 'cardio',
    exercises: [
      { name: 'Mountain Climbers', sets: 4, reps: 20 },
      { name: 'Box Jumps', sets: 4, reps: 15 },
      { name: 'Burpees', sets: 4, reps: 12 }
    ],
    createdAt: new Date()
  }
];

// Sample bookings
const bookingSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  workoutId: mongoose.Schema.Types.ObjectId,
  date: Date,
  timeSlot: String,
  status: String,
  createdAt: Date
});

const Booking = mongoose.model('Booking', bookingSchema);

async function run() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Workout.deleteMany({});
    await Booking.deleteMany({});
    console.log('✅ Cleared existing data');

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Insert workouts
    const createdWorkouts = await Workout.insertMany(workouts);
    console.log(`✅ Created ${createdWorkouts.length} workouts`);

    // Create sample bookings
    const bookings = [
      {
        userId: createdUsers[2]._id, // Sara Member
        workoutId: createdWorkouts[0]._id,
        date: new Date(),
        timeSlot: '10:00 AM',
        status: 'confirmed',
        createdAt: new Date()
      },
      {
        userId: createdUsers[2]._id,
        workoutId: createdWorkouts[1]._id,
        date: new Date(),
        timeSlot: '2:00 PM',
        status: 'pending',
        createdAt: new Date()
      }
    ];

    await Booking.insertMany(bookings);
    console.log(`✅ Created ${bookings.length} bookings`);

    console.log('\n🎉 SEED COMPLETE!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Admin:   admin@ironcore.com / admin123');
    console.log('🔑 Trainer: trainer@ironcore.com / train123');
    console.log('🔑 Member:  member@ironcore.com / member123');
    console.log('🔑 Oswald:  oswald@ironcore.com / oswald123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

run();