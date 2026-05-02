import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './TrainerDetail.css';
import { useGymData } from '../context/GymDataContext'
import { CalendarIcon, CardIcon } from '../components/ModernIcons'

export default function TrainerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { setPendingBooking } = useGymData()
  const [trainer, setTrainer] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const trainers = {
    1: { 
      id: 1, 
      name: "John Doe", 
      specialty: "Strength Training", 
      price: 150, 
      experience: "5 years", 
      rating: 4.8,
      bio: "John is a certified personal trainer with expertise in strength training and bodybuilding. He has helped over 100 clients achieve their fitness goals, from beginners to advanced athletes.",
      certifications: ["Certified Personal Trainer (CPT)", "Nutrition Specialist", "First Aid Certified"],
      specialties: ["Strength Training", "Bodybuilding", "Powerlifting"],
      timeSlots: ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"]
    },
    2: { 
      id: 2, 
      name: "Jane Smith", 
      specialty: "Yoga & Meditation", 
      price: 130, 
      experience: "7 years", 
      rating: 4.9,
      bio: "Jane is a certified yoga instructor with 7+ years of experience. She specializes in Vinyasa, Hatha, and meditation practices to help clients find balance and peace.",
      certifications: ["200-hour Yoga Teacher Training", "Meditation Coach", "Wellness Specialist"],
      specialties: ["Vinyasa Yoga", "Hatha Yoga", "Meditation", "Breathwork"],
      timeSlots: ["8:00 AM", "9:30 AM", "11:00 AM", "4:00 PM", "5:30 PM", "7:00 PM"]
    },
    3: { 
      id: 3, 
      name: "Mike Johnson", 
      specialty: "Cardio & HIIT", 
      price: 160, 
      experience: "4 years", 
      rating: 4.7,
      bio: "Mike is an energetic trainer specializing in high-intensity interval training and cardio workouts. His sessions are challenging but fun, guaranteed to get your heart pumping!",
      certifications: ["HIIT Certified", "Cardio Specialist", "Group Fitness Instructor"],
      specialties: ["HIIT", "Cardio Kickboxing", "Bootcamp", "Circuit Training"],
      timeSlots: ["7:00 AM", "8:30 AM", "12:00 PM", "5:00 PM", "6:30 PM", "7:30 PM"]
    },
    4: { 
      id: 4, 
      name: "Sarah Williams", 
      specialty: "Nutrition & Wellness", 
      price: 140, 
      experience: "6 years", 
      rating: 4.9,
      bio: "Sarah is a registered dietitian and wellness coach. She takes a holistic approach to fitness, combining nutrition advice with sustainable lifestyle changes.",
      certifications: ["Registered Dietitian (RD)", "Wellness Coach", "Sports Nutrition Specialist"],
      specialties: ["Meal Planning", "Weight Management", "Sports Nutrition", "Mindful Eating"],
      timeSlots: ["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "6:00 PM"]
    }
  };

  useEffect(() => {
    if (trainers[id]) {
      setTrainer(trainers[id]);
    } else {
      navigate('/trainers');
    }
  }, [id, navigate]);

  const handleBookSession = () => {
    if (selectedSlot) {
      const bookingData = {
        trainer: trainer,
        timeSlot: selectedSlot,
        sessionType: 'single',
        totalPrice: trainer.price
      };
      setPendingBooking(bookingData);
      navigate('/checkout');
    } else {
      alert("Please select a time slot");
    }
  };

  if (!trainer) {
    return <div className="trainer-detail-loading">Loading...</div>;
  }

  return (
    <div className="trainer-detail-page">
      <button className="back-btn" onClick={() => navigate('/trainers')}>
        ← Back to Trainers
      </button>

      <div className="trainer-detail-card">
        <div className="trainer-header">
          <div className="trainer-avatar-large">
            {trainer.name.charAt(0)}
          </div>
          <div className="trainer-header-info">
            <h1>{trainer.name}</h1>
            <p className="trainer-specialty">{trainer.specialty}</p>
            <div className="trainer-stats">
              <span>⭐ {trainer.rating} ★</span>
              <span><CalendarIcon size={15} /> {trainer.experience}</span>
              <span><CardIcon size={15} /> AED {trainer.price}/session</span>
            </div>
          </div>
        </div>

        <div className="trainer-bio">
          <h2>About</h2>
          <p>{trainer.bio}</p>
        </div>

        <div className="trainer-specialties">
          <h2>Specialties</h2>
          <div className="specialties-list">
            {trainer.specialties.map((spec, index) => (
              <span key={index} className="specialty-tag">{spec}</span>
            ))}
          </div>
        </div>

        <div className="trainer-certifications">
          <h2>Certifications</h2>
          <ul>
            {trainer.certifications.map((cert, index) => (
              <li key={index}>✓ {cert}</li>
            ))}
          </ul>
        </div>

        <div className="trainer-time-slots">
          <h2>Available Time Slots</h2>
          <div className="time-slots-grid">
            {trainer.timeSlots.map(slot => (
              <button
                key={slot}
                className={`time-slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <button className="book-session-btn" onClick={handleBookSession}>
          Book a Session
        </button>
      </div>
    </div>
  );
}