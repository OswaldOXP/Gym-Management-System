# Gym Management System - IronCore

A full-stack gym management system with role-based access (Admin, Trainer, Member). Built with React, Node.js/Express, MongoDB, and JWT authentication.

## 👥 Group Members

| Student ID | Name | Role |
|------------|------|------|
| 20240005935 | Oswald Pereira | Frontend & Backend Dev|
| 20220001382 | Abir Hossain | Frontend & Backend Dev|

## 🚀 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | [https://gym-management-system-pearl.vercel.app](https://gym-management-system-pearl.vercel.app) |
| **Backend API (Render)** | [https://gym-management-system-7fft.onrender.com](https://gym-management-system-7fft.onrender.com) |
| **GitHub Repository** | [https://github.com/OswaldOXP/Gym-Management-System](https://github.com/OswaldOXP/Gym-Management-System) |

## 📋 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@ironcore.com` | `admin123` |
| **Trainer** | `trainer@ironcore.com` | `train123` |
| **Member** | `member@ironcore.com` | `member123` |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router DOM |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT, bcryptjs |
| Styling | CSS3 |
| Deployment | Vercel (frontend), Render (backend) |

## 📦 Features

- **Landing Page** with hero section and features
- **Authentication** - Login/Register with JWT
- **Role-Based Access** - Admin, Trainer, Member views
- **Dashboard** - Role-specific dashboards
- **Workout Plans** - View, create, edit, delete workouts (admin)
- **Bookings** - Book training sessions with trainers
- **Members Management** - Add, edit, delete members (admin)
- **Chatbot** - Integrated gym assistant
- **Responsive Design** - Mobile-friendly layout

## 🔧 Local Development Setup

### Prerequisites

- Node.js (v18.x or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/OswaldOXP/Gym-Management-System.git
cd Gym-Management-System
```

2. **Install dependencies**
```bash
npm install
```
4. **Install backend dependencies**

```bash
cd server
npm install
cd ..
```
4. **Configure environment variables**

Create server/.env file:

env
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here

5. **Seed the database**

```bash
npm run seed
```
6. **Start the development servers**

Terminal 1 (Backend):

```bash
cd server
node index.js
```
Terminal 2 (Frontend):

```bash
npm run dev
Open your browser
```
Frontend: http://localhost:3000

Backend API: http://localhost:5001
