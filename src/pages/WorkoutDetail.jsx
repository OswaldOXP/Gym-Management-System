import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './WorkoutDetail.css';
import { ChartIcon, CalendarIcon, FireIcon, DumbbellIcon } from '../components/ModernIcons'

export default function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);

  const workouts = {
    1: { 
      id: 1, 
      name: "Full Body Strength", 
      difficulty: "Intermediate", 
      duration: "45 min", 
      calories: 300, 
      category: "strength",
      exercises: [
        { name: "Squats", sets: 3, reps: 12, rest: "60 sec" },
        { name: "Push-ups", sets: 3, reps: 15, rest: "45 sec" },
        { name: "Pull-ups", sets: 3, reps: 8, rest: "60 sec" },
        { name: "Lunges", sets: 3, reps: 12, rest: "45 sec" },
        { name: "Plank", sets: 3, duration: "60 sec", rest: "30 sec" }
      ],
      benefits: ["Builds overall strength", "Improves muscle endurance", "Burns calories effectively"] 
    },
    2: { 
      id: 2, 
      name: "Cardio Blast", 
      difficulty: "Beginner", 
      duration: "30 min", 
      calories: 250, 
      category: "cardio",
      exercises: [
        { name: "Jumping Jacks", sets: 3, reps: 30, rest: "30 sec" },
        { name: "High Knees", sets: 3, reps: 30, rest: "30 sec" },
        { name: "Burpees", sets: 3, reps: 10, rest: "45 sec" },
        { name: "Mountain Climbers", sets: 3, reps: 20, rest: "30 sec" }
      ],
      benefits: ["Improves heart health", "Increases stamina", "Great for weight loss"] 
    },
    3: { 
      id: 3, 
      name: "Yoga Flow", 
      difficulty: "Beginner", 
      duration: "60 min", 
      calories: 180, 
      category: "flexibility",
      exercises: [
        { name: "Downward Dog", duration: "60 sec", rest: "15 sec" },
        { name: "Warrior I", duration: "60 sec", rest: "15 sec" },
        { name: "Tree Pose", duration: "60 sec", rest: "15 sec" },
        { name: "Cobra Pose", duration: "60 sec", rest: "15 sec" },
        { name: "Child's Pose", duration: "120 sec", rest: "0 sec" }
      ],
      benefits: ["Improves flexibility", "Reduces stress", "Better posture"] 
    }
  };

  useEffect(() => {
    if (workouts[id]) {
      setWorkout(workouts[id]);
    } else {
      navigate('/workouts');
    }
  }, [id, navigate]);

  if (!workout) {
    return <div className="detail-loading">Loading...</div>;
  }

  return (
    <div className="workout-detail-page">
      <button className="back-btn" onClick={() => navigate('/workouts')}>
        ← Back to Workouts
      </button>

      <div className="workout-detail-card">
        <h1>{workout.name}</h1>
        
        <div className="workout-meta">
          <span className="meta-badge"><ChartIcon size={15} /> {workout.difficulty}</span>
          <span className="meta-badge"><CalendarIcon size={15} /> {workout.duration}</span>
          <span className="meta-badge"><FireIcon size={15} /> {workout.calories} cal</span>
        </div>

        <div className="exercises-section">
          <h2>Exercises</h2>
          <div className="exercises-list">
            {workout.exercises.map((ex, index) => (
              <div key={index} className="exercise-item">
                <div className="exercise-name">{ex.name}</div>
                <div className="exercise-details">
                  {ex.sets && <span><DumbbellIcon size={14} /> {ex.sets} sets x {ex.reps} reps</span>}
                  {ex.duration && <span><CalendarIcon size={14} /> {ex.duration}</span>}
                  <span><CalendarIcon size={14} /> Rest: {ex.rest}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="benefits-section">
          <h2>Benefits</h2>
          <ul>
            {workout.benefits.map((benefit, index) => (
              <li key={index}>{benefit}</li>
            ))}
          </ul>
        </div>

        <button className="book-workout-btn" onClick={() => navigate('/booking')}>
          Book This Workout
        </button>
      </div>
    </div>
  );
}