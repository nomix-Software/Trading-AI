import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import Home from '../pages/Home'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Dashboard from '../pages/Dashboard'
import News from '../pages/News'
import Charts from '../pages/trading/Charts-main'
import CoursesPage from "../pages/courses/courses"
import ProtectedRoute from '../components/ProtectedRoute'
import DynamicQuiz from "../pages/courses/volume-quiz"
import CourseDetail from "../pages/courses/CourseDetail"

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/news', 
        element: (
          <ProtectedRoute>
            <News />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/charts',  
        element: (
          <ProtectedRoute>
            <Charts />
          </ProtectedRoute>
        )
      },
      {
        path: 'dashboard/cursos',  
        element: (
          <ProtectedRoute>
            <CoursesPage />
          </ProtectedRoute>
        )
      },
      // ✅ RUTA PARA DETALLE DEL CURSO
      {
        path: "dashboard/cursos/:courseId",
        element: (
          <ProtectedRoute>
            <CourseDetail />
          </ProtectedRoute>
        ),
      },
      // ✅ RUTA PARA QUIZ DE VOLÚMENES (IMPORTANTE: sin espacio después de "volumen-")
      {
        path: "dashboard/cursos/:courseId/volume/:volumeId",
        element: (
          <ProtectedRoute>
            <DynamicQuiz />
          </ProtectedRoute>
        ),
      },
      // ✅ RUTA PARA QUIZ DIRECTOS (cursos sin volúmenes)
      {
        path: "dashboard/cursos/:courseId/quiz",
        element: (
          <ProtectedRoute>
            <DynamicQuiz />
          </ProtectedRoute>
        ),
      },
    ]
  }
])