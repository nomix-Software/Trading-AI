"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../../api/index"

const CourseCard = ({ course }) => {
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  const handleCourseClick = () => {
    if (course.id === 1) {
      navigate("/dashboard/cursos/basicos-trading")
    } else {
      navigate(`/dashboard/cursos/${course.id}`)
    }
  }

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true)
        const progressData = await api.getCourseProgress(course.id)
        setProgress(progressData)
      } catch (error) {
        console.error("❌ Error cargando progreso del curso:", error)
        setProgress(null)
      } finally {
        setLoading(false)
      }
    }
    if (course?.id) {
      fetchProgress()
    }
  }, [course?.id])

  // Calcular métricas
  const totalQuestions = course.hasVolumes
    ? course.volumes?.reduce(
        (sum, vol) => sum + (vol.questions || vol.totalQuestions || 0),
        0
      ) || course.totalQuestions
    : course.totalQuestions

  const completed = progress?.completed_questions?.length || progress?.completed || 0
  const correct = progress?.correct_answers || progress?.correct || 0
  const progressPercent = totalQuestions > 0 ? (completed / totalQuestions) * 100 : 0
  const accuracy = completed > 0 ? (correct / completed) * 100 : 0
  const status = progress?.status || (completed > 0 ? "in-progress" : "not-started")

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "in-progress":
        return "text-cyan-400"
      case "not-started":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "in-progress":
        return "En Progreso"
      case "not-started":
        return "No Iniciado"
      default:
        return "No Iniciado"
    }
  }

  return (
    <div className="course-card" onClick={handleCourseClick}>
      <div className="course-image">
        <img src={course.image || "/placeholder.svg"} alt={course.title} />
        <div className="course-overlay">
          <span
            className={`course-status ${getStatusColor(status)}`}
          >
            {getStatusText(status)}
          </span>
        </div>
      </div>

      <div className="course-content">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-description">{course.description}</p>

        {course.hasVolumes && course.volumes && (
          <div className="volumes-preview">
            <h4 className="volumes-title">Volúmenes incluidos:</h4>
            <div className="volumes-list">
              {course.volumes.map((volume) => {
                const volumeProgress = progress?.volumes_progress?.[volume.id] || {
                  completed: 0,
                  totalQuestions: volume.questions,
                }
                return (
                  <div key={volume.id} className="volume-item">
                    <span className="volume-name">{volume.title}</span>
                    <span className="volume-progress">
                      {volumeProgress.completed}/{volume.questions} preguntas
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="course-stats">
          <div className="stat-item">
            <span className="stat-label">Preguntas:</span>
            <span className="stat-value">{totalQuestions}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Progreso:</span>
            <span className="stat-value">
              {loading ? "..." : `${completed}/${totalQuestions}`}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Correctas:</span>
            <span className="stat-value text-green-400">
              {loading ? "..." : correct}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Precisión:</span>
            <span className="stat-value text-cyan-400">
              {loading ? "..." : `${accuracy.toFixed(1)}%`}
            </span>
          </div>
        </div>

        <div className="course-progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progressPercent}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default CourseCard
