/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, PlayCircle, CheckCircle, Clock, Award, BookOpen, Target, Users, TrendingUp } from "lucide-react"
import "./courses.css"

import api from "../../api/index"
import { coursesData } from "./data/coursesData"

const CourseDetail = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [selectedVolume, setSelectedVolume] = useState(null)
  const [courseProgress, setCourseProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [volumeProgress, setVolumeProgress] = useState({})

  // Find the current course
  const course = coursesData.find((c) => c.id === Number.parseInt(courseId))

useEffect(() => {
  const loadProgressData = async () => {
    try {
      setLoading(true)

      const progress = await api.getCourseProgress(courseId)
      setCourseProgress(progress)

      // Load volume progress if course has volumes
      if (course?.hasVolumes && course.volumes) {
        const volumeProgressData = {}
        for (const volume of course.volumes) {
          try {
            const volProgress = await api.getCourseProgress(courseId, volume.id)
            
            // MAPEAR LA RESPUESTA DE LA API AL FORMATO ESPERADO
            volumeProgressData[volume.id] = {
              completed: volProgress.completed || 0,
              correct: volProgress.correct_answers || 0,
              totalQuestions: volProgress.total_questions || volume.questions || 10,
              status: volProgress.is_completed ? "completed" : 
                      volProgress.completed_questions?.length > 0 ? "in-progress" : "not-started",
              // Mantener también los datos originales por si los necesitas
              ...volProgress
            }
          } catch (error) {
            console.warn(`[v0] Volumen ${volume.id} no disponible:`, error)
            volumeProgressData[volume.id] = {
              completed: 0,
              correct: 0,
              totalQuestions: volume.questions || 10,
              status: "not-started",
            }
          }
        }
        setVolumeProgress(volumeProgressData)
      }
    } catch (error) {
      console.error("[v0] Error loading progress data:", error)
      // ... resto del código
    } finally {
      setLoading(false)
    }
  }

  if (course) {
    loadProgressData()
  } else {
    setLoading(false)
  }
}, [courseId, course])

  const handleVolumeClick = (volume) => {
    if (course.hasVolumes) {
      navigate(`/dashboard/cursos/${courseId}/volume/${volume.id}`)
    } else {
      navigate(`/dashboard/cursos/${courseId}/quiz`)
    }
  }

  const handleVolumeSelect = (volume) => {
    setSelectedVolume(selectedVolume?.id === volume.id ? null : volume)
  }

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        color: "text-green-400",
        text: "Completado",
        bgColor: "bg-green-400/20",
        icon: CheckCircle,
      },
      "in-progress": {
        color: "text-cyan-400",
        text: "En Progreso",
        bgColor: "bg-cyan-400/20",
        icon: PlayCircle,
      },
      "not-started": {
        color: "text-gray-400",
        text: "No Iniciado",
        bgColor: "bg-gray-400/20",
        icon: PlayCircle,
      },
    }
    return configs[status] || configs["not-started"]
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Principiante":
        return "bg-green-500/20 text-green-400"
      case "Intermedio":
        return "bg-yellow-500/20 text-yellow-400"
      case "Avanzado":
        return "bg-red-500/20 text-red-400"
      default:
        return "bg-gray-500/20 text-gray-400"
    }
  }

  const calculateProgress = (completed, total) => {
    return total > 0 ? (completed / total) * 100 : 0
  }

  const calculateAccuracy = (correct, completed) => {
    return completed > 0 ? (correct / completed) * 100 : 0
  }

  if (loading) {
    return (
      <div className="courses-container">
        <div className="courses-header">
          <button onClick={() => navigate("/dashboard/cursos")} className="back-button">
            <ArrowLeft size={20} />
            Volver a Cursos
          </button>
          <h1 className="courses-title">Cargando curso...</h1>
          <p className="courses-subtitle">Obteniendo información del progreso</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="courses-container">
        <div className="courses-header">
          <button onClick={() => navigate("/dashboard/cursos")} className="back-button">
            <ArrowLeft size={20} />
            Volver a Cursos
          </button>
          <h1 className="courses-title">Curso no encontrado</h1>
          <p className="courses-subtitle">El curso solicitado no existe o no está disponible</p>
        </div>
      </div>
    )
  }

  const totalQuestions = course.hasVolumes
    ? course.volumes?.reduce((sum, vol) => sum + (vol.questions || vol.totalQuestions || 0), 0) || course.totalQuestions
    : course.totalQuestions

  const totalCompleted = courseProgress?.completed_questions?.length || courseProgress?.completed || 0
  const totalCorrect = courseProgress?.correct_answers || courseProgress?.correct || 0

  const overallProgress = totalQuestions > 0 ? (totalCompleted / totalQuestions) * 100 : 0
  const overallAccuracy = totalCompleted > 0 ? (totalCorrect / totalCompleted) * 100 : 0

  const estimatedTime = course.hasVolumes
    ? course.volumes?.reduce((sum, vol) => sum + Number.parseInt(vol.estimatedTime || 0), 0) || course.estimatedTime
    : course.estimatedTime

  return (
    <div className="courses-container">
      <div className="courses-header">
        <button onClick={() => navigate("/dashboard/cursos")} className="back-button">
          <ArrowLeft size={20} />
          Volver a Cursos
        </button>

        <div className="course-header-content">
          <div className="course-title-section">
            <h1 className="courses-title">{course.title}</h1>
            <div className="course-badges">
              <span className={`difficulty-badge ${getDifficultyColor(course.difficulty)}`}>{course.difficulty}</span>
              <span
                className={`course-status ${getStatusConfig(courseProgress?.status).color} ${getStatusConfig(courseProgress?.status).bgColor}`}
              >
                {getStatusConfig(courseProgress?.status).text}
              </span>
            </div>
          </div>

          <p className="courses-subtitle">{course.description}</p>

          {/* Course Overview Stats */}
          <div className="course-overview">
            <div className="overview-stats">
              <div className="overview-stat">
                <BookOpen size={20} />
                <div>
                  <span className="stat-number">{totalQuestions}</span>
                  <span className="stat-label">Preguntas Total</span>
                </div>
              </div>
              <div className="overview-stat">
                <Target size={20} />
                <div>
                  <span className="stat-number">{overallProgress.toFixed(0)}%</span>
                  <span className="stat-label">Progreso</span>
                </div>
              </div>
              <div className="overview-stat">
                <Award size={20} />
                <div>
                  <span className="stat-number">{overallAccuracy.toFixed(0)}%</span>
                  <span className="stat-label">Precisión</span>
                </div>
              </div>
              <div className="overview-stat">
                <Clock size={20} />
                <div>
                  <span className="stat-number">{estimatedTime}</span>
                  <span className="stat-label">Minutos</span>
                </div>
              </div>
              {course.students && (
                <div className="overview-stat">
                  <Users size={20} />
                  <div>
                    <span className="stat-number">{course.students}</span>
                    <span className="stat-label">Estudiantes</span>
                  </div>
                </div>
              )}
              {course.rating && (
                <div className="overview-stat">
                  <TrendingUp size={20} />
                  <div>
                    <span className="stat-number">{course.rating}</span>
                    <span className="stat-label">Rating</span>
                  </div>
                </div>
              )}
            </div>

            <div className="overall-progress">
              <div className="progress-info">
                <span>Progreso general del curso</span>
                <span className="progress-percentage">{overallProgress.toFixed(1)}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${overallProgress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="course-content-section">
        {course.hasVolumes ? (
          // Course with volumes
          <>
            <div className="section-header">
              <h2 className="section-title">Volúmenes del Curso</h2>
              <p className="section-subtitle">Selecciona un volumen para comenzar tu aprendizaje</p>
            </div>

            <div className="courses-grid">
              {course.volumes.map((volume) => {
                const volProgress = volumeProgress[volume.id] || {
                  completed: 0,
                  correct: 0,
                  totalQuestions: volume.questions,
                  status: "not-started",
                }
                const statusConfig = getStatusConfig(volProgress.status)
                const StatusIcon = statusConfig.icon
                const progress =
                  volProgress.totalQuestions > 0 ? (volProgress.completed / volProgress.totalQuestions) * 100 : 0
                const accuracy = volProgress.completed > 0 ? (volProgress.correct / volProgress.completed) * 100 : 0
                const isSelected = selectedVolume?.id === volume.id

                return (
                  <div key={volume.id} className={`volume-card ${isSelected ? "selected" : ""}`}>
                    <div className="volume-image-container">
                      <img
                        src={volume.image || course.image || "/placeholder.svg"}
                        alt={volume.title}
                        className="volume-image"
                      />
                      <div className="volume-overlay">
                        <span className={`volume-status ${statusConfig.color} ${statusConfig.bgColor}`}>
                          <StatusIcon size={16} />
                          {statusConfig.text}
                        </span>
                      </div>
                      <div className="volume-difficulty">
                        <span className={`difficulty-badge ${getDifficultyColor(volume.difficulty)}`}>
                          {volume.difficulty}
                        </span>
                      </div>
                    </div>

                    <div className="volume-content">
                      <div className="volume-header">
                        <h3 className="volume-title">{volume.title}</h3>
                        <div className="volume-meta">
                          <span className="estimated-time">
                            <Clock size={14} />
                            {volume.estimatedTime}
                          </span>
                        </div>
                      </div>

                      <p className="volume-description">{volume.description}</p>

                      {/* Learning Objectives */}
                      {volume.objectives && (
                        <div className="learning-objectives">
                          <h4 className="objectives-title">Objetivos de aprendizaje:</h4>
                          <ul className="objectives-list">
                            {volume.objectives
                              .slice(0, isSelected ? volume.objectives.length : 2)
                              .map((objective, index) => (
                                <li key={index} className="objective-item">
                                  <span className="objective-bullet">•</span>
                                  {objective}
                                </li>
                              ))}
                            {!isSelected && volume.objectives.length > 2 && (
                              <li className="objective-item more-objectives">
                                <button onClick={() => handleVolumeSelect(volume)} className="show-more-btn">
                                  Ver {volume.objectives.length - 2} más...
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}

                      {/* Topics */}
                      {volume.topics && (
                        <div className="topics-preview">
                          <h4 className="topics-title">Temas incluidos:</h4>
                          <div className="topics-grid">
                            {volume.topics.map((topic, index) => (
                              <span key={index} className="topic-tag">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="volume-stats">
                        <div className="stats-grid">
                          <div className="stat-card">
                            <span className="stat-value">{volume.questions || volume.totalQuestions}</span>
                            <span className="stat-label">Preguntas</span>
                          </div>
                          <div className="stat-card">
                            <span className="stat-value">{volProgress.completed}</span>
                            <span className="stat-label">Completadas</span>
                          </div>
                          <div className="stat-card">
                            <span className="stat-value text-green-400">{volProgress.correct}</span>
                            <span className="stat-label">Correctas</span>
                          </div>
                          <div className="stat-card">
                            <span className="stat-value text-cyan-400">{accuracy.toFixed(0)}%</span>
                            <span className="stat-label">Precisión</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="volume-progress-container">
                        <div className="progress-header">
                          <span className="progress-label">Progreso del volumen</span>
                          <span className="progress-value">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="volume-progress-bar">
                          <div className="progress-fill" style={{ width: `${progress}%` }} />
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="volume-actions">
                        <button className="volume-button primary" onClick={() => handleVolumeClick(volume)}>
                          <PlayCircle size={16} />
                          {volProgress.status === "completed"
                            ? "Revisar Volumen"
                            : volProgress.status === "in-progress"
                              ? "Continuar Volumen"
                              : "Comenzar Volumen"}
                        </button>

                        <button className="volume-button outline" onClick={() => handleVolumeSelect(volume)}>
                          {isSelected ? "Menos detalles" : "Ver detalles"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          // Course without volumes - direct quiz
          <div className="direct-course-content">
            <div className="section-header">
              <h2 className="section-title">Contenido del Curso</h2>
              <p className="section-subtitle">
                Este curso contiene {totalQuestions} preguntas sobre {course.category}
              </p>
            </div>

            <div className="direct-course-card">
              <div className="course-main-content">
                <div className="course-topics">
                  <h3>Temas que aprenderás:</h3>
                  <div className="topics-grid">
                    {course.topics?.map((topic, index) => (
                      <span key={index} className="topic-tag">
                        {topic}
                      </span>
                    )) || <p className="no-topics">Temas específicos del {course.title}</p>}
                  </div>
                </div>

                <div className="course-direct-stats">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-value">{totalQuestions}</span>
                      <span className="stat-label">Preguntas</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{totalCompleted}</span>
                      <span className="stat-label">Completadas</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value text-green-400">{totalCorrect}</span>
                      <span className="stat-label">Correctas</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value text-cyan-400">{overallAccuracy.toFixed(0)}%</span>
                      <span className="stat-label">Precisión</span>
                    </div>
                  </div>
                </div>

                <div className="course-actions">
                  <button className="course-button primary large" onClick={() => handleVolumeClick({ id: "main" })}>
                    <PlayCircle size={20} />
                    {courseProgress?.status === "completed"
                      ? "Revisar Curso"
                      : courseProgress?.status === "in-progress"
                        ? "Continuar Curso"
                        : "Comenzar Curso"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetail
