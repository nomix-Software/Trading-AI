/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./courses.css"

import api from "../../api/index"
import { coursesData, courseCategories, difficultyLevels } from "./data/coursesData"

const Courses = ({ onCourseSelect }) => {
  const navigate = useNavigate()
  const [filteredCourses, setFilteredCourses] = useState(coursesData)
  const [loading, setLoading] = useState(true)
  const [userProgress, setUserProgress] = useState({})
  const [globalStats, setGlobalStats] = useState(null) // inicia en null
  const [filters, setFilters] = useState({
    category: "Todos",
    difficulty: "Todos",
    status: "Todos",
    search: "",
  })

  useEffect(() => {
  const loadUserProgress = async () => {
    setLoading(true)
    try {
      const progressData = {}

      for (const course of coursesData) {
        const courseId = Number(course.id) // asegurar que sea numérico
        try {
          const courseProgress = await api.getCourseProgress(courseId)
          
          const status =
            courseProgress.is_completed
              ? "completed"
              : courseProgress.questions_answered > 0
              ? "in-progress"
              : "not-started"

          // Volumes
          const volumesProgress = {}
          if (courseProgress.volumes_progress) {
            for (const [volId, volData] of Object.entries(courseProgress.volumes_progress)) {
            volumesProgress[volId] = {
              completed: volData.completed, 
                totalQuestions: volData.total_questions,
              }
            }
          }

          progressData[courseId] = {
            completed: courseProgress.questions_answered,
            correct: courseProgress.questions_correct,
            totalQuestions: courseProgress.total_questions,
            status,
            volumes: volumesProgress,
          }
        } catch (err) {
          console.warn(`No progress found for course ${courseId}`, err)
          progressData[courseId] = {
            completed: 0,
            correct: 0,
            totalQuestions: course.totalQuestions,
            status: "not-started",
            volumes: {},
          }
        }
      }

      setUserProgress(progressData)

      // Estadísticas globales
      const completedCourses = Object.values(progressData).filter(p => p.status === "completed").length
      const inProgressCourses = Object.values(progressData).filter(p => p.status === "in-progress").length

      setGlobalStats({
        totalCourses: coursesData.length,
        completedCourses,
        inProgressCourses,
        totalStudents: coursesData.reduce((sum, c) => sum + (c.students || 0), 0),
      })
    } catch (err) {
      console.error("Error loading courses progress:", err)
    } finally {
      setLoading(false)
    }
  }

  loadUserProgress()
}, [])

  const handleCourseClick = (course) => {
    navigate(`/dashboard/cursos/${course.id}`)
    if (onCourseSelect) {
      onCourseSelect(course)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: "Todos",
      difficulty: "Todos",
      status: "Todos",
      search: "",
    })
  }

  const getStatusConfig = (status) => {
    const configs = {
      completed: {
        color: "text-green-400",
        text: "Completado",
        bgColor: "bg-green-400/20",
      },
      "in-progress": {
        color: "text-cyan-400",
        text: "En Progreso",
        bgColor: "bg-cyan-400/20",
      },
      "not-started": {
        color: "text-gray-400",
        text: "No Iniciado",
        bgColor: "bg-gray-400/20",
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

  // Aplicar filtros
  useEffect(() => {
    let filtered = coursesData.filter((course) => {
      if (
        filters.category !== "Todos" &&
        course.category !== filters.category
      ) {
        return false
      }
      if (
        filters.difficulty !== "Todos" &&
        course.difficulty !== filters.difficulty
      ) {
        return false
      }
      if (filters.status !== "Todos") {
        const courseProgress =
          userProgress[course.id] || { status: "not-started" }
        if (courseProgress.status !== filters.status) {
          return false
        }
      }
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        return (
          course.title.toLowerCase().includes(searchTerm) ||
          course.description.toLowerCase().includes(searchTerm) ||
          course.category.toLowerCase().includes(searchTerm)
        )
      }
      return true
    })

    setFilteredCourses(filtered)
  }, [filters, userProgress])

  return (
    <div className="courses-container">
      <div className="courses-header">
        <h1 className="courses-title">Cursos de Trading</h1>
        <p className="courses-subtitle">
          Desarrolla tus habilidades de trading con nuestros cursos
          especializados
        </p>

        <div className="courses-stats">
          <div className="global-stat">
            <span className="stat-number">
              {globalStats ? globalStats.totalCourses : "..."}
            </span>
            <span className="stat-label">Cursos Disponibles</span>
          </div>
          <div className="global-stat">
            <span className="stat-number">
              {globalStats ? globalStats.completedCourses : "..."}
            </span>
            <span className="stat-label">Completados</span>
          </div>
          <div className="global-stat">
            <span className="stat-number">
              {globalStats ? globalStats.inProgressCourses : "..."}
            </span>
            <span className="stat-label">En Progreso</span>
          </div>
          <div className="global-stat">
            <span className="stat-number">
              {globalStats
                ? globalStats.totalStudents.toLocaleString()
                : "..."}
            </span>
            <span className="stat-label">Estudiantes</span>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-container">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Buscar cursos..."
              value={filters.search}
              onChange={(e) =>
                handleFilterChange("search", e.target.value)
              }
              className="search-input"
            />
          </div>

          <div className="select-filters">
            <select
              value={filters.category}
              onChange={(e) =>
                handleFilterChange("category", e.target.value)
              }
              className="filter-select"
            >
              {courseCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <select
              value={filters.difficulty}
              onChange={(e) =>
                handleFilterChange("difficulty", e.target.value)
              }
              className="filter-select"
            >
              {difficultyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                handleFilterChange("status", e.target.value)
              }
              className="filter-select"
            >
              <option value="Todos">Todos los Estados</option>
              <option value="not-started">No Iniciado</option>
              <option value="in-progress">En Progreso</option>
              <option value="completed">Completado</option>
            </select>
          </div>

          {(filters.category !== "Todos" ||
            filters.difficulty !== "Todos" ||
            filters.status !== "Todos" ||
            filters.search) && (
            <button
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Limpiar Filtros
            </button>
          )}
        </div>

        <div className="results-info">
          <span className="results-count">
            {filteredCourses.length} de {coursesData.length} cursos
          </span>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
        {filteredCourses.map((course) => {
          const courseProgress = userProgress[course.id] || {
            completed: 0,
            correct: 0,
            totalQuestions: course.totalQuestions,
            status: "not-started",
            volumes: {},
          }

          const progressPercent =
            courseProgress.totalQuestions > 0
              ? (courseProgress.completed /
                  courseProgress.totalQuestions) *
                100
              : 0

          const accuracy =
            courseProgress.completed > 0
              ? (courseProgress.correct / courseProgress.completed) *
                100
              : 0

          const statusConfig = getStatusConfig(courseProgress.status)

          return (
            <div
              key={course.id}
              className={`course-card ${
                courseProgress.status === "completed"
                  ? "completed"
                  : ""
              }`}
              onClick={() => handleCourseClick(course)}
            >
              <div className="course-image">
                <img
                  src={course.image || "/placeholder.svg"}
                  alt={course.title}
                />
                <div className="course-overlay">
                  <span
                    className={`course-status ${statusConfig.color} ${statusConfig.bgColor}`}
                  >
                    {statusConfig.text}
                  </span>
                </div>
                {course.rating && (
                  <div className="rating-badge">
                    ⭐ {course.rating}
                  </div>
                )}
              </div>

              <div className="course-content">
                <div className="course-header">
                  <h3 className="course-title">{course.title}</h3>
                  <div className="course-badges">
                    <div
                      className={`difficulty-badge ${getDifficultyColor(
                        course.difficulty
                      )}`}
                    >
                      {course.difficulty}
                    </div>
                  </div>
                </div>

                <p className="course-description">
                  {course.description}
                </p>

                {/* Course Meta Info */}
                <div className="course-meta-info">
                  <div className="meta-item">
                    <span className="meta-label">Categoría:</span>
                    <span className="meta-value">
                      {course.category}
                    </span>
                  </div>
                  {course.instructor && (
                    <div className="meta-item">
                      <span className="meta-label">
                        Instructor:
                      </span>
                      <span className="meta-value">
                        {course.instructor}
                      </span>
                    </div>
                  )}
                  <div className="meta-item">
                    <span className="meta-label">Duración:</span>
                    <span className="meta-value">
                      {course.estimatedTime} min
                    </span>
                  </div>
                  {course.students && (
                    <div className="meta-item">
                      <span className="meta-label">
                        Estudiantes:
                      </span>
                      <span className="meta-value">
                        {course.students.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Volume Preview */}
                {course.hasVolumes && course.volumes && (
                  <div className="volumes-preview">
                    <h4 className="volumes-title">
                      {course.volumes.length} volúmenes incluidos:
                    </h4>
                    <div className="volumes-list">
                      {course.volumes.slice(0, 3).map((volume) => {
                        const volumeProgress =
                          courseProgress.volumes?.[volume.id] || {
                            completed: 0,
                            totalQuestions: volume.questions,
                          }
                        const volumeProgressPercent =
                          volumeProgress.totalQuestions > 0
                            ? (volumeProgress.completed /
                                volumeProgress.totalQuestions) *
                              100
                            : 0

                        return (
                          <div
                            key={volume.id}
                            className="volume-item"
                          >
                            <div className="volume-info">
                              <span className="volume-name">
                                {volume.title}
                              </span>
                              <span className="volume-progress">
                                {volumeProgress.completed}/
                                {volume.questions} preguntas
                              </span>
                            </div>
                            <div className="volume-progress-bar">
                              <div
                                className="volume-progress-fill"
                                style={{
                                  width: `${volumeProgressPercent}%`,
                                }}
                              />
                            </div>
                          </div>
                        )
                      })}
                      {course.volumes.length > 3 && (
                        <div className="more-volumes">
                          +{course.volumes.length - 3} volúmenes más
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Course Statistics */}
                <div className="course-stats">
                  <div className="stats-row">
                    <div className="stat-item">
                      <span className="stat-value">
                        {course.totalQuestions}
                      </span>
                      <span className="stat-label">Preguntas</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">
                        {courseProgress.completed}/
                        {course.totalQuestions}
                      </span>
                      <span className="stat-label">Progreso</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value text-green-400">
                        {courseProgress.correct}
                      </span>
                      <span className="stat-label">Correctas</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value text-cyan-400">
                        {accuracy.toFixed(1)}%
                      </span>
                      <span className="stat-label">Precisión</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="course-progress-container">
                  <div className="progress-info">
                    <span className="progress-text">
                      Progreso del curso
                    </span>
                    <span className="progress-percentage">
                      {progressPercent.toFixed(0)}%
                    </span>
                  </div>
                  <div className="course-progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="course-actions">
                  <button className="course-button primary">
                    {courseProgress.status === "completed"
                      ? "Revisar Curso"
                      : courseProgress.status === "in-progress"
                      ? "Continuar Curso"
                      : "Comenzar Curso"}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* No results */}
      {filteredCourses.length === 0 && (
        <div className="no-results">
          <h3>No se encontraron cursos</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
          <button
            onClick={clearFilters}
            className="course-button primary"
          >
            Mostrar Todos los Cursos
          </button>
        </div>
      )}
    </div>
  )
}

export default Courses
