import { Suspense, lazy } from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { GymDataProvider } from './context/GymDataContext'

// Pages
const LandingPage = lazy(() => import('./pages/LandingPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Members = lazy(() => import('./pages/Members'))
const TrainerScheduling = lazy(() => import('./pages/TrainerScheduling'))
const SubscriptionPlans = lazy(() => import('./pages/SubscriptionPlans'))
const AttendanceTracking = lazy(() => import('./pages/AttendanceTracking'))
const PaymentModule = lazy(() => import('./pages/PaymentModule'))
const WorkoutPlans = lazy(() => import('./pages/WorkoutPlans'))
const Reports = lazy(() => import('./pages/Reports'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BookingPage = lazy(() => import('./pages/BookingPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const WorkoutDetail = lazy(() => import('./pages/WorkoutDetail'))
const TrainerDetail = lazy(() => import('./pages/TrainerDetail'))

// Layout
import DashboardLayout from './components/DashboardLayout'
import Chatbot from './components/Chatbot'

function PageLoader() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', color: '#888', fontSize: '1rem' }}>
      Loading...
    </div>
  )
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#888' }}>Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return children
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <GymDataProvider>
          <Chatbot />

          <Suspense fallback={<PageLoader />}>
            <Routes>
            {/* ========== PUBLIC ROUTES ========== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/workouts" element={<WorkoutPlans />} />
            <Route path="/workout/:id" element={<WorkoutDetail />} />
            <Route path="/trainer/:id" element={<TrainerDetail />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><SignupPage /></GuestRoute>} />

            {/* ========== PROTECTED ROUTES (with DashboardLayout) ========== */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
            </Route>
            
            {/* Admin/Trainer routes - also protected but OUTSIDE the layout wrapper */}
            <Route path="/members" element={<ProtectedRoute roles={['admin','trainer']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Members />} />
            </Route>
            
            <Route path="/trainers" element={<ProtectedRoute roles={['admin','trainer']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<TrainerScheduling />} />
            </Route>
            
            <Route path="/attendance" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<AttendanceTracking />} />
            </Route>

            <Route path="/booking" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<BookingPage />} />
            </Route>

            <Route path="/plans" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<SubscriptionPlans />} />
            </Route>
            
            <Route path="/payments" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<PaymentModule />} />
            </Route>
            
            <Route path="/reports" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Reports />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </GymDataProvider>
      </AuthProvider>
    </HashRouter>
  )
}