import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true },
  duration: { type: String, required: true },
  calories: { type: Number, required: true },
  category: { type: String, enum: ['strength', 'cardio', 'flexibility'] },
  exercises: [{ name: String, sets: Number, reps: Number }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Workout', workoutSchema);