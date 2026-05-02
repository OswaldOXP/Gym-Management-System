import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import { ChatBubbleIcon, DumbbellIcon } from './ModernIcons'

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I'm your Gym Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getBotResponse = (userMessage) => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('membership') || msg.includes('plan') || msg.includes('price')) {
      return "We offer 3 membership plans:\n• Basic (AED 149/mo) - Gym access & basic equipment\n• Pro (AED 299/mo) - Includes 2 trainer sessions + nutrition guide\n• Elite (AED 499/mo) - Unlimited trainer sessions + body analysis\nWhich plan interests you?";
    } 
    else if (msg.includes('basic')) {
      return "Basic plan is AED 149/month. Includes: Gym access, Locker room, and Basic equipment. Want to upgrade to Pro?";
    }
    else if (msg.includes('pro')) {
      return "Pro plan is AED 299/month. Includes all Basic perks + 2 trainer sessions/month, Nutrition guide, and Group classes! Great choice!";
    }
    else if (msg.includes('elite')) {
      return "Elite plan is AED 499/month. Our premium plan! Includes unlimited trainer sessions, body composition analysis, and priority booking. Best value!";
    }
    else if (msg.includes('trainer')) {
      return "We have certified trainers in Strength Training, Yoga, Cardio, and Nutrition. Pro and Elite plans include trainer sessions. Want to book one?";
    }
    else if (msg.includes('workout')) {
      return "Check out our Workout Plans page for strength, cardio, and flexibility programs! Each workout includes detailed exercises and instructions.";
    }
    else if (msg.includes('hour') || msg.includes('timing') || msg.includes('open')) {
      return "We're open Monday-Friday: 5 AM - 11 PM, Saturday: 7 AM - 9 PM, Sunday: 8 AM - 8 PM. We're open 365 days a year!";
    }
    else if (msg.includes('book') || msg.includes('session')) {
      return "To book a session, go to Trainer Scheduling page, select a trainer, pick a time slot, and confirm. Pro and Elite members get free sessions!";
    }
    else if (msg.includes('payment') || msg.includes('pay')) {
      return "We accept credit cards, debit cards, and digital wallets. All payments are secure and instant receipts are sent to your email.";
    }
    else if (msg.includes('contact') || msg.includes('help') || msg.includes('support')) {
      return "You can reach us at support@ironcoregym.com or call (555) 123-4567. Visit our Contact page for location and hours!";
    }
    else if (msg.includes('about')) {
      return "IronCore Gym was founded in 2020. We're dedicated to helping you achieve your fitness goals with expert trainers and top-notch facilities!";
    }
    else {
      return "I can help you with:\nMembership plans and pricing\nWorkout programs\nTrainer bookings\nGym hours\nContact information\nWhat would you like to know?";
    }
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    
    const botReply = getBotResponse(input);
    setTimeout(() => {
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
    }, 500);
    
    setInput('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <>
      {!isOpen && (
        <button className="chatbot-toggle-btn" onClick={() => setIsOpen(true)}>
          <ChatBubbleIcon size={22} />
        </button>
      )}
      
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <span className="chatbot-icon"><DumbbellIcon size={20} /></span>
              <div>
                <h4>IronCore Assistant</h4>
                <p>Online | Ready to help</p>
              </div>
            </div>
            <button className="chatbot-close" onClick={() => setIsOpen(false)}>✕</button>
          </div>
          
          <div className="chatbot-messages-area">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.sender}`}>
                {msg.sender === 'bot' && <span className="bot-avatar">AI</span>}
                <div className="message-bubble">
                  {msg.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
                {msg.sender === 'user' && <span className="user-avatar">ME</span>}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="chatbot-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about memberships, trainers, workouts..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}