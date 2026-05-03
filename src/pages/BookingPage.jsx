import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './BookingPage.css';
import { useGymData } from '../context/GymDataContext'
import { CalendarIcon, CardIcon, CheckIcon, DumbbellIcon, UsersIcon } from '../components/ModernIcons'

export default function BookingPage() {
  const navigate = useNavigate();
  const { trainers, setPendingBooking } = useGymData()
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sessionType, setSessionType] = useState('single');
  const [tab, setTab] = useState('builder');

  const bookingTrainers = trainers.map(trainer => ({
    ...trainer,
    price: trainer.id === 2 ? 130 : trainer.id === 3 ? 160 : trainer.id === 4 ? 140 : 150,
    experience: trainer.id === 1 ? '5 years' : trainer.id === 2 ? '7 years' : trainer.id === 3 ? '4 years' : '6 years',
  }));

  const timeSlots = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

  const handleBooking = () => {
    if (selectedTrainer && selectedSlot) {
      const bookingData = {
        trainer: selectedTrainer,
        timeSlot: selectedSlot,
        sessionType: sessionType,
        totalPrice: sessionType === 'single' ? selectedTrainer.price : selectedTrainer.price * 4
      };
      setPendingBooking(bookingData);
      navigate('/checkout');
    } else {
      alert("Please select a trainer and time slot");
    }
  };

  return (
    <div className="booking-page">
      <div className="page-header booking-header">
        <h2>Book a Training Session</h2>
        <p>Choose your trainer and preferred time slot</p>
      </div>

      <div className="tabs booking-tabs">
        <button className={`tab ${tab === 'builder' ? 'active' : ''}`} onClick={() => setTab('builder')}>
          Session Builder
        </button>
        <button className={`tab ${tab === 'types' ? 'active' : ''}`} onClick={() => setTab('types')}>
          Session Types
        </button>
      </div>

      {tab === 'types' && (
        <div className="booking-types-grid">
          <div className={`card booking-type-card ${sessionType === 'single' ? 'active' : ''}`} onClick={() => setSessionType('single')}>
            <h3>Single Session</h3>
            <p>Perfect for flexible scheduling with your preferred trainer.</p>
            <div className="booking-type-price">AED {selectedTrainer?.price || 130}</div>
            <span className="badge badge-success">Pay Per Session</span>
          </div>
          <div className={`card booking-type-card ${sessionType === 'package' ? 'active' : ''}`} onClick={() => setSessionType('package')}>
            <h3>4-Session Package</h3>
            <p>Train consistently and save on every session block.</p>
            <div className="booking-type-price">AED {(selectedTrainer?.price || 130) * 4}</div>
            <span className="badge badge-accent">Save 10%</span>
          </div>
        </div>
      )}

      <div className="stats-grid booking-stats">
        <div className="stat-card">
          <div className="stat-icon"><UsersIcon size={18} /></div>
          <div className="stat-label">Trainers</div>
          <div className="stat-value">{bookingTrainers.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CalendarIcon size={18} /></div>
          <div className="stat-label">Time Slots</div>
          <div className="stat-value">{timeSlots.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CardIcon size={18} /></div>
          <div className="stat-label">Starting Price</div>
          <div className="stat-value">AED 130</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><CheckIcon size={18} /></div>
          <div className="stat-label">Session Type</div>
          <div className="stat-value">{sessionType === 'single' ? 'Single' : 'Package'}</div>
        </div>
      </div>

      <div className="booking-grid">
        <div className="card trainers-section">
          <h3>Select Trainer</h3>
          <div className="trainers-list">
            {bookingTrainers.map(trainer => (
              <div 
                key={trainer.id}
                className={`trainer-card ${selectedTrainer?.id === trainer.id ? 'selected' : ''}`}
                onClick={() => setSelectedTrainer(trainer)}
              >
                <div className="trainer-avatar">
                  <DumbbellIcon size={18} />
                </div>
                <div className="trainer-details">
                  <h4>{trainer.name}</h4>
                  <p>{trainer.specialty}</p>
                  <div className="trainer-meta">
                    <span>Rating {trainer.rating}</span>
                    <span><CalendarIcon size={15} /> {trainer.experience}</span>
                  </div>
                  <p className="trainer-price">AED {trainer.price}/session</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card booking-summary">
          <h3>Booking Summary</h3>
          
          {selectedTrainer ? (
            <>
              <div className="selected-trainer">
                <p><strong>Trainer:</strong> {selectedTrainer.name}</p>
                <p><strong>Specialty:</strong> {selectedTrainer.specialty}</p>
                <p><strong>Price:</strong> AED {selectedTrainer.price}/session</p>
              </div>

              <div className="session-type">
                <label className="section-label">Session Type</label>
                <div className="type-options">
                  <button 
                    className={`type-btn ${sessionType === 'single' ? 'active' : ''}`}
                    onClick={() => setSessionType('single')}
                  >
                    Single Session
                  </button>
                  <button 
                    className={`type-btn ${sessionType === 'package' ? 'active' : ''}`}
                    onClick={() => setSessionType('package')}
                  >
                    4-Session Package (Save 10%)
                  </button>
                </div>
              </div>
              
              <div className="time-slots">
                <label className="section-label">Select Time</label>
                <div className="slots-grid">
                  {timeSlots.map(slot => (
                    <button 
                      key={slot}
                      className={`slot-btn ${selectedSlot === slot ? 'selected' : ''}`}
                      onClick={() => setSelectedSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="price-breakdown">
                <div className="price-row">
                  <span>Subtotal:</span>
                  <span>AED {sessionType === 'single' ? selectedTrainer.price : selectedTrainer.price * 4}</span>
                </div>
                <div className="price-row">
                  <span>Tax (5%):</span>
                  <span>AED {Math.round((sessionType === 'single' ? selectedTrainer.price : selectedTrainer.price * 4) * 0.05)}</span>
                </div>
                <div className="price-row total">
                  <span>Total:</span>
                  <span>AED {Math.round((sessionType === 'single' ? selectedTrainer.price : selectedTrainer.price * 4) * 1.05)}</span>
                </div>
              </div>
              
              <button className="btn btn-primary book-btn" onClick={handleBooking}>
                Proceed to Checkout
              </button>
            </>
          ) : (
            <div className="select-prompt">
              <h4>Booking Summary</h4>
              <p>Select a trainer to continue</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}