import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { AdminLayout } from '@/layouts/AdminLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { CardSkeleton } from '@/components/common/LoadingSkeleton'

const Loading = () => (
  <div className="p-6 space-y-4">
    <CardSkeleton /><CardSkeleton />
  </div>
)

// Public pages
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'))
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'))
const OAuthCallbackPage = lazy(() => import('@/pages/auth/OAuthCallbackPage'))

// Protected pages
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const FoodLogPage = lazy(() => import('@/pages/FoodLogPage'))
const SearchFoodPage = lazy(() => import('@/pages/SearchFoodPage'))
const FoodDetailPage = lazy(() => import('@/pages/FoodDetailPage'))
const MyFoodsPage = lazy(() => import('@/pages/MyFoodsPage'))
const CreateFoodPage = lazy(() => import('@/pages/CreateFoodPage'))
const WorkoutPage = lazy(() => import('@/pages/WorkoutPage'))
const BodyMetricsPage = lazy(() => import('@/pages/BodyMetricsPage'))
const ReportsPage = lazy(() => import('@/pages/ReportsPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const ChatbotPage = lazy(() => import('@/pages/ChatbotPage'))
const AiScanPage = lazy(() => import('@/pages/AiScanPage'))
const BlogPage = lazy(() => import('@/pages/BlogPage'))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage'))

// Admin pages
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const UserManagementPage = lazy(() => import('@/pages/admin/UserManagementPage'))
const FoodManagementPage = lazy(() => import('@/pages/admin/FoodManagementPage'))
const ExerciseManagementPage = lazy(() => import('@/pages/admin/ExerciseManagementPage'))
const BlogManagementPage = lazy(() => import('@/pages/admin/BlogManagementPage'))
const SportTipManagementPage = lazy(() => import('@/pages/admin/SportTipManagementPage'))

export function AppRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/oauth-callback" element={<OAuthCallbackPage />} />
        </Route>

        {/* Onboarding (auth required, no sidebar) */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Suspense fallback={<Loading />}>
                <OnboardingPage />
              </Suspense>
            </ProtectedRoute>
          }
        />

        {/* Protected app routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/food-log" element={<FoodLogPage />} />
          <Route path="/search-food" element={<SearchFoodPage />} />
          <Route path="/food/:id" element={<FoodDetailPage />} />
          <Route path="/my-foods" element={<MyFoodsPage />} />
          <Route path="/create-food" element={<CreateFoodPage />} />
          <Route path="/workout" element={<WorkoutPage />} />
          <Route path="/body-metrics" element={<BodyMetricsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route path="/ai-scan" element={<AiScanPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="foods" element={<FoodManagementPage />} />
          <Route path="exercises" element={<ExerciseManagementPage />} />
          <Route path="blogs" element={<BlogManagementPage />} />
          <Route path="sport-tips" element={<SportTipManagementPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
