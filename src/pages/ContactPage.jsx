import React, { useState } from 'react';
import './ContactPage.css';
import { useGymData } from '../context/GymDataContext'
import { MapPinIcon, CalendarIcon, CardIcon, MobileIcon } from '../components/ModernIcons'

export default function ContactPage() {
  const { saveContactMessage } = useGymData()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      await saveContactMessage(formData)
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 3000);
    } else {
      setErrors(validationErrors);
    }
  };

  const contactInfo = [
    { icon: <MapPinIcon />, title: "Location", details: "123 Fitness Street, Dubai, UAE" },
    { icon: <MobileIcon />, title: "Phone", details: "+971 4 123 4567" },
    { icon: <CardIcon />, title: "Email", details: "support@ironcoregym.com" },
    { icon: <CalendarIcon />, title: "Hours", details: "Mon-Fri: 5AM-11PM | Sat: 7AM-9PM | Sun: 8AM-8PM" }
  ];

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>Have questions? We'd love to hear from you!</p>
      </div>

      <div className="contact-content">
        <div className="contact-grid">
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <div className="info-items">
              {contactInfo.map((item, index) => (
                <div key={index} className="info-item">
                  <div className="info-icon">{item.icon}</div>
                  <div className="info-details">
                    <h4>{item.title}</h4>
                    <p>{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <h2>Send us a Message</h2>
            
            {submitted && (
              <div className="success-message">
                ✓ Message sent successfully! We'll get back to you soon.
              </div>
            )}
            
            <div className="form-group">
              <label>Your Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
              />
              {errors.name && <span className="error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
              {errors.email && <span className="error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this about?"
              />
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                placeholder="Write your message here..."
              ></textarea>
              {errors.message && <span className="error">{errors.message}</span>}
            </div>

            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>

        <div className="map-container">
          <div className="map-placeholder">
            <p><MapPinIcon size={16} /> Google Maps Location - 123 Fitness Street, Dubai, UAE</p>
            <p className="map-note">(Interactive map would be integrated here)</p>
          </div>
        </div>
      </div>
    </div>
  );
}