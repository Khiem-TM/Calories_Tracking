import { createBrowserRouter, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { OnboardingGuard } from './OnboardingGuard'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { AdminProtectedRoute } from './AdminProtectedRoute'
import { AdminPublicRoute } from './AdminPublicRoute'

// Lazy imports for code splitting
import { lazy, Suspense } from 'react'
import { Spinner } from '@/components/ui/Spinner'

// Admin pages
const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage'))
const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'))
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'))
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage'))
const AdminUserDetailPage = lazy(() => import('@/pages/admin/AdminUserDetailPage'))
const AdminFoodsPage = lazy(() => import('@/pages/admin/AdminFoodsPage'))
const AdminBlogsPage = lazy(() => import('@/pages/admin/AdminBlogsPage'))
const AdminExercisesPage = lazy(() => import('@/pages/admin/AdminExercisesPage'))

const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const LandingPage = lazy(() => import('@/pages/LandingPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'))
const AppLayout = lazy(() => import('@/components/layout/AppLayout'))
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const NutritionPage = lazy(() => import('@/pages/NutritionPage'))
const TrainingPage = lazy(() => import('@/pages/TrainingPage'))
const ActivityPage = lazy(() => import('@/pages/ActivityPage'))
const ProgressPage = lazy(() => import('@/pages/ProgressPage'))
const MetricUpdatePage = lazy(() => import('@/pages/MetricUpdatePage'))
const HealthTrendPage = lazy(() => import('@/pages/HealthTrendPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-surface">
          <Spinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    path: '/',
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <LandingPage />
          </SuspenseWrapper>
        ),
      },
      // Auth pages — only accessible when NOT authenticated
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            path: 'login',
            element: (
              <SuspenseWrapper>
                <LoginPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'register',
            element: (
              <SuspenseWrapper>
                <RegisterPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'forgot-password',
            element: (
              <SuspenseWrapper>
                <ForgotPasswordPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'reset-password',
            element: (
              <SuspenseWrapper>
                <ResetPasswordPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'onboarding',
            element: (
              <SuspenseWrapper>
                <OnboardingPage />
              </SuspenseWrapper>
            ),
          },
          {
            element: <OnboardingGuard />,
            children: [
              {
                element: (
                  <SuspenseWrapper>
                    <AppLayout />
                  </SuspenseWrapper>
                ),
                children: [
                  { index: true, element: <Navigate to="/dashboard" replace /> },
                  {
                    path: 'dashboard',
                    element: (
                      <SuspenseWrapper>
                        <DashboardPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'nutrition',
                    element: (
                      <SuspenseWrapper>
                        <NutritionPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'training',
                    element: (
                      <SuspenseWrapper>
                        <TrainingPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'activity',
                    element: (
                      <SuspenseWrapper>
                        <ActivityPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'progress',
                    element: (
                      <SuspenseWrapper>
                        <ProgressPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'metrics',
                    element: (
                      <SuspenseWrapper>
                        <MetricUpdatePage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'health-trends',
                    element: (
                      <SuspenseWrapper>
                        <HealthTrendPage />
                      </SuspenseWrapper>
                    ),
                  },
                  {
                    path: 'profile',
                    element: (
                      <SuspenseWrapper>
                        <ProfilePage />
                      </SuspenseWrapper>
                    ),
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  // ─── Admin routes (fully isolated) ──────────────────────────────────────────
  {
    path: 'admin',
    children: [
      {
        element: <AdminPublicRoute />,
        children: [
          {
            path: 'login',
            element: (
              <SuspenseWrapper>
                <AdminLoginPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        element: <AdminProtectedRoute />,
        children: [
          {
            element: (
              <SuspenseWrapper>
                <AdminLayout />
              </SuspenseWrapper>
            ),
            children: [
              { index: true, element: <Navigate to="/admin/dashboard" replace /> },
              {
                path: 'dashboard',
                element: (
                  <SuspenseWrapper>
                    <AdminDashboardPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'users',
                element: (
                  <SuspenseWrapper>
                    <AdminUsersPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'users/:id',
                element: (
                  <SuspenseWrapper>
                    <AdminUserDetailPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'foods',
                element: (
                  <SuspenseWrapper>
                    <AdminFoodsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'blogs',
                element: (
                  <SuspenseWrapper>
                    <AdminBlogsPage />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'exercises',
                element: (
                  <SuspenseWrapper>
                    <AdminExercisesPage />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
