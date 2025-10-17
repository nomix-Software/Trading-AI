/* eslint-disable react-hooks/exhaustive-deps */
 
/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, Play } from "lucide-react"
import "./courses.css"
import "./study-materials.css"

import api from "../../api/index"
import { getCourseById, getQuestionsForCourseVolume } from "./data/coursesData"
import ForexBasics from "../../components/study-materials/ForexBasics"
import TechnicalAnalysis from "../../components/study-materials/TechnicalAnalysis"
import AdvancedStrategies from "../../components/study-materials/AdvancedStrategies"
import AdvancedTechnicalAnalysis from "../../components/study-materials/AdvancedTechnicalAnalysis"
import CryptocurrencyBasics from "../../components/study-materials/CryptocurrencyBasics"
import DayTradingStrategies from "../../components/study-materials/DayTradingStrategies"
import RiskManagement from "../../components/study-materials/RiskManagement"
import AlgorithmicTradingBasics from "../../components/study-materials/AlgorithmicTradingBasics"
import AlgorithmicTradingStrategies from "../../components/study-materials/AlgorithmicTradingStrategies"
import AlgorithmicTradingDeployment from "../../components/study-materials/AlgorithmicTradingDeployment"

const DynamicQuiz = () => {
  const { courseId, volumeId } = useParams()
  const navigate = useNavigate()

  // Quiz state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [timeSpent, setTimeSpent] = useState(0)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [loading, setLoading] = useState(true)
  const [existingAnswers, setExistingAnswers] = useState({})
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set())
  const [showPartialSummary, setShowPartialSummary] = useState(false)
  const [showStudyMaterial, setShowStudyMaterial] = useState(true)
  const [studyMaterialRead, setStudyMaterialRead] = useState(false)

  // Get course and questions data
  const course = getCourseById(courseId)
const actualVolumeId = volumeId || "1"; 
  const questions = getQuestionsForCourseVolume(courseId, actualVolumeId)

useEffect(() => {
  const loadExistingData = async () => {
    try {
      setLoading(true)

      const courseIdStr = String(courseId)
      const volumeIdStr = String(volumeId || "1")

      // Traer respuestas y progreso en paralelo (si alguno falla, seguimos con el otro)
      const [answersRes, progressRes] = await Promise.allSettled([
        api.getCourseAnswers(courseIdStr, volumeIdStr),
        api.getCourseProgress(courseIdStr),
      ])

      // Normalizar la forma en que recibimos la lista de respuestas
      const rawAnswers =
        answersRes.status === "fulfilled"
          ? (answersRes.value?.answers ?? answersRes.value?.data?.answers ?? answersRes.value)
          : []
      const answersArray = Array.isArray(rawAnswers) ? rawAnswers : []

      // También intentar obtener last_answered de cualquiera de las dos respuestas
      const lastFromAnswers = answersRes.status === "fulfilled"
        ? (answersRes.value?.last_answered_question ?? answersRes.value?.data?.last_answered_question)
        : null
      const lastFromProgress = progressRes.status === "fulfilled"
        ? (progressRes.value?.last_answered_question ?? progressRes.value?.data?.last_answered_question)
        : null

      const lastAnsweredQuestion = lastFromAnswers ?? lastFromProgress ?? null

      // Construir mapas/sets normalizando IDs como strings (para evitar mismatch number/string)
      const answersMap = {}
      const answeredSet = new Set()
      let totalCorrect = 0
      let totalTime = 0

      for (const a of answersArray) {
        const qid = String(a.question_id ?? a.questionId ?? a.question) // tolerancia a distintos nombres
        answersMap[qid] = a
        answeredSet.add(qid)
        if (a.is_correct) totalCorrect++
        totalTime += a.time_spent || a.timeSpent || 0
      }

      // Guardar estados normalizados
      setExistingAnswers(answersMap)
      setAnsweredQuestions(answeredSet)
      setScore(totalCorrect)
      setTimeSpent(totalTime)

      // Lógica de estado del quiz
      if (answeredSet.size === questions.length && questions.length > 0) {
        // Quiz completamente terminado
        setQuizCompleted(true)
        setShowSummary(true)

        // Reconstruir respuestas para el resumen (usar keys string)
        const reconstructedAnswers = questions.map((q) => {
          const qid = String(q.id)
          const existing = answersMap[qid]
          return {
            questionId: q.id,
            question: q.question,
            selectedOption: existing ? q.options[existing.selected_answer] : "",
            correctOption: q.options[q.correct],
            isCorrect: existing ? existing.is_correct : false,
            timeSpent: existing ? existing.time_spent : 0,
            explanation: q.explanation,
            points: existing && existing.is_correct ? q.points || 10 : 0,
            difficulty: q.difficulty,
            category: q.category,
          }
        })
        setAnswers(reconstructedAnswers)
      } else if (answeredSet.size > 0) {
        // Parcialmente completado: reanudar desde la siguiente pregunta no respondida
        // Priorizar last_answered_question si lo tenemos
        let startIndex = -1

        if (lastAnsweredQuestion !== null && lastAnsweredQuestion !== undefined) {
          const lastIdx = questions.findIndex((q) => String(q.id) === String(lastAnsweredQuestion))
          if (lastIdx !== -1) {
            // buscar la primera no respondida después de la última contestada
            for (let i = lastIdx + 1; i < questions.length; i++) {
              if (!answeredSet.has(String(questions[i].id))) {
                startIndex = i
                break
              }
            }
            // si no encontramos después, buscar desde el principio hasta lastIdx
            if (startIndex === -1) {
              for (let i = 0; i < lastIdx; i++) {
                if (!answeredSet.has(String(questions[i].id))) {
                  startIndex = i
                  break
                }
              }
            }
          }
        }

        // Si no hay last_answered o no encontramos, buscar la primera no respondida de forma simple
        if (startIndex === -1) {
          startIndex = questions.findIndex((q) => !answeredSet.has(String(q.id)))
        }

        // Fallback final
        if (startIndex === -1) startIndex = 0

        setCurrentQuestion(startIndex)
        setSelectedAnswer(null)
        setShowResult(false)
        setShowStudyMaterial(true)
        setQuestionStartTime(Date.now())
      } else {
        // No iniciado
        setCurrentQuestion(0)
      }
    } catch (error) {
      console.error("[v0] Error loading existing data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (questions.length > 0) {
    loadExistingData()
  }
}, [courseId, actualVolumeId, questions.length])



  const getStudyMaterialComponent = () => {
    const currentQ = questions[currentQuestion]
    if (!currentQ) return null

    // Determine which study material component to use based on course and volume
    if (courseId === "1") {
      // Básicos de Trading
      if (volumeId === "1") {
        return <ForexBasics questionId={currentQ.id} />
      } else if (volumeId === "2") {
        return <TechnicalAnalysis questionId={currentQ.id} />
      } else if (volumeId === "3") {
        return <AdvancedStrategies questionId={currentQ.id} />
      }
    } else if (courseId === "2") {
      // Análisis Técnico Avanzado
      return <AdvancedTechnicalAnalysis questionId={currentQ.id} />
    } else if (courseId === "3") {
      // Fundamentos de Criptomonedas
      return <CryptocurrencyBasics questionId={currentQ.id} />
    } else if (courseId === "4") {
      // Estrategias de Day Trading
      return <DayTradingStrategies questionId={currentQ.id} />
    } else if (courseId === "5") {
      // Gestión de Riesgo Profesional
      return <RiskManagement questionId={currentQ.id} />
    } else if (courseId === "6") {
      // Trading Algorítmico
      if (volumeId === "1") {
        return <AlgorithmicTradingBasics questionId={currentQ.id} />
      } else if (volumeId === "2") {
        return <AlgorithmicTradingStrategies questionId={currentQ.id} />
      } else if (volumeId === "3") {
        return <AlgorithmicTradingDeployment questionId={currentQ.id} />
      }
    }

    // Si no hay material específico, mostrar un mensaje genérico
    return (
      <div className="study-material-container">
        <div className="study-header">
          <div className="study-icon">📚</div>
          <h2>Material de Estudio</h2>
          <p className="study-subtitle">Prepárate para responder la siguiente pregunta</p>
        </div>
        <div className="study-content">
          <div className="study-section">
            <h3>📖 Información General</h3>
            <div className="concept-box">
              <p>Revisa los conceptos relacionados con esta pregunta antes de continuar.</p>
              <p>Tómate el tiempo necesario para entender el tema completamente.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleStudyComplete = () => {
    setStudyMaterialRead(true)
    setShowStudyMaterial(false)
  }

  const handleAnswerSelect = (answerIndex) => {
    const currentQ = questions[currentQuestion]
    if (!showResult && !answeredQuestions.has(currentQ.id)) {
      setSelectedAnswer(answerIndex)
    }
  }

  const handleShowResult = () => {
    setShowResult(true)
  }

const handleNextQuestion = async () => {
  const currentQ = questions[currentQuestion]
  if (!currentQ) return

  const qidStr = String(currentQ.id)

  // Si ya fue respondida, saltar a la siguiente no respondida
  if (answeredQuestions.has(qidStr)) {
    console.log("[v0] Question already answered (local state), skipping save")
    skipToNextUnanswered()
    return
  }

  const isCorrect = selectedAnswer === currentQ.correct
  const questionTime = Math.floor((Date.now() - questionStartTime) / 1000)

  const answerData = {
    courseId: Number.parseInt(courseId),
    volumeId: actualVolumeId,
    questionId: currentQ.id,
    selectedAnswer,
    isCorrect,
    timeSpent: questionTime,
    points: isCorrect ? currentQ.points || 10 : 0,
  }

  try {
    await api.saveCourseAnswer(
      Number.parseInt(courseId),
      actualVolumeId,
      currentQ.id,
      selectedAnswer,
      isCorrect,
      questionTime,
      answerData.points,
    )

    // Actualizar estado local
    setAnsweredQuestions((prev) => new Set([...prev, qidStr]))
    setExistingAnswers((prev) => ({
      ...prev,
      [qidStr]: {
        question_id: currentQ.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        time_spent: questionTime,
      },
    }))

    // Resto de la lógica (score, answers, siguiente pregunta)
    const newAnswers = [...answers, {
      questionId: currentQ.id,
      question: currentQ.question,
      selectedOption: currentQ.options[selectedAnswer],
      correctOption: currentQ.options[currentQ.correct],
      isCorrect,
      timeSpent: questionTime,
      explanation: currentQ.explanation,
      points: answerData.points,
      difficulty: currentQ.difficulty,
      category: currentQ.category,
    }]
    setAnswers(newAnswers)
    if (isCorrect) setScore((s) => s + 1)

    // Buscar siguiente no respondida
    const nextUnansweredIndex = questions.findIndex(
      (q, idx) => idx > currentQuestion && !answeredQuestions.has(String(q.id))
    )
    if (nextUnansweredIndex !== -1) {
      setCurrentQuestion(nextUnansweredIndex)
      setSelectedAnswer(null)
      setShowResult(false)
      setShowStudyMaterial(true)
      setQuestionStartTime(Date.now())
      return
    }

    // Si no hay siguiente, completar quiz
    completeQuiz(newAnswers, isCorrect ? score + 1 : score)
  } catch (error) {
    console.error("[v0] Error saving answer:", error)

    // Si el backend responde que la pregunta ya existe (400), refrescar respuestas y saltar
    const status = error?.response?.status
    const detail = error?.response?.data?.detail ?? error?.response?.data?.message

    if (status === 400 && /already/i.test(String(detail || "") )) {
      console.warn("[v0] Backend says question already answered — refreshing answers and skipping")
      try {
        const refreshed = await api.getCourseAnswers(String(courseId), String(actualVolumeId))
        const refreshedAnswers = refreshed?.answers ?? refreshed?.data?.answers ?? []
        const newMap = {}
        const newSet = new Set()
        refreshedAnswers.forEach((a) => {
          const idStr = String(a.question_id ?? a.questionId)
          newMap[idStr] = a
          newSet.add(idStr)
        })
        setExistingAnswers(newMap)
        setAnsweredQuestions(newSet)
      } catch (e2) {
        console.error("[v0] Error refreshing answers after duplicate:", e2)
      }
      skipToNextUnanswered()
    } else {
      // comportamiento por defecto: avanzar localmente (ya crea entry local aunque no guardó)
      setAnsweredQuestions((prev) => new Set([...prev, qidStr]))
      setExistingAnswers((prev) => ({
        ...prev,
        [qidStr]: {
          question_id: currentQ.id,
          selected_answer: selectedAnswer,
          is_correct: isCorrect,
          time_spent: questionTime,
        },
      }))
      const newAnswers = [...answers, {
        questionId: currentQ.id,
        question: currentQ.question,
        selectedOption: currentQ.options[selectedAnswer],
        correctOption: currentQ.options[currentQ.correct],
        isCorrect,
        timeSpent: questionTime,
        explanation: currentQ.explanation,
        points: answerData.points,
        difficulty: currentQ.difficulty,
        category: currentQ.category,
      }]
      setAnswers(newAnswers)
      if (isCorrect) setScore((s) => s + 1)
      skipToNextUnanswered()
    }
  }
}

  const completeQuiz = (finalAnswers, finalScore) => {
    setQuizCompleted(true)
    const totalPoints = finalAnswers.reduce((sum, answer) => sum + answer.points, 0)
    const maxPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0)
    const accuracy = (finalScore / questions.length) * 100

    console.log("[v0] Quiz completed with score:", finalScore, "out of", questions.length)
    setShowSummary(true)
  }

  const handleFinishQuiz = () => {
    if (course?.hasVolumes && volumeId) {
      navigate(`/dashboard/cursos/${courseId}`)
    } else {
      navigate("/dashboard/cursos")
    }
  }

  const skipToNextUnanswered = () => {
    const nextUnansweredIndex = questions.findIndex(
      (q, index) => index > currentQuestion && !answeredQuestions.has(q.id),
    )

    if (nextUnansweredIndex !== -1) {
      setCurrentQuestion(nextUnansweredIndex)
      setSelectedAnswer(null)
      setShowResult(false)
      setShowStudyMaterial(true)
      setQuestionStartTime(Date.now())
    }
  }

  if (loading) {
    return (
      <div className="courses-container">
        <div className="courses-header">
          <h1 className="courses-title">Cargando...</h1>
          <p className="courses-subtitle">Verificando progreso del quiz</p>
        </div>
      </div>
    )
  }

  if (!course || questions.length === 0) {
    return (
      <div className="courses-container">
        <div className="courses-header">
          <button
            onClick={() => navigate(course?.hasVolumes ? `/dashboard/cursos/${courseId}` : "/dashboard/cursos")}
            className="back-button"
          >
            <ArrowLeft size={20} />
            Volver
          </button>
          <h1 className="courses-title">Quiz no disponible</h1>
          <p className="courses-subtitle">Este quiz no tiene preguntas disponibles</p>
        </div>
      </div>
    )
  }

  // Quiz Summary Component
  if (showSummary) {
    const accuracy = (score / questions.length) * 100
    const totalPoints = answers.reduce((sum, answer) => sum + answer.points, 0)
    const performance = getPerformanceMessage(accuracy)
    const PerformanceIcon = performance.icon

    return (
      <div className="courses-container">
        <div className="courses-header">
          <button onClick={handleFinishQuiz} className="back-button">
            <ArrowLeft size={20} />
            {course.hasVolumes ? "Volver al Curso" : "Volver a Cursos"}
          </button>
          <h1 className="courses-title">¡Quiz Completado!</h1>
          <p className="courses-subtitle">
            {course.title} {volumeId ? `- Volumen ${volumeId}` : ""}
          </p>
        </div>

        <div className="quiz-summary-container">
          <div className="summary-card">
            <div className="summary-header">
              <div className="performance-badge">
                <PerformanceIcon size={24} className={performance.color} />
                <span className={`performance-text ${performance.color}`}>{performance.message}</span>
              </div>
              <div className="final-score">
                <span className="score-value">{accuracy.toFixed(1)}%</span>
                <span className="score-label">Precisión Final</span>
              </div>
            </div>

            <div className="summary-stats">
              <div className="stat-grid">
                <div className="summary-stat">
                  <CheckCircle size={20} className="text-green-400" />
                  <div>
                    <span className="stat-number text-green-400">{score}</span>
                    <span className="stat-text">Correctas</span>
                  </div>
                </div>
                <div className="summary-stat">
                  <XCircle size={20} className="text-red-400" />
                  <div>
                    <span className="stat-number text-red-400">{questions.length - score}</span>
                    <span className="stat-text">Incorrectas</span>
                  </div>
                </div>
                <div className="summary-stat">
                  <Clock size={20} className="text-cyan-400" />
                  <div>
                    <span className="stat-number text-cyan-400">{formatTime(timeSpent)}</span>
                    <span className="stat-text">Tiempo Total</span>
                  </div>
                </div>
                <div className="summary-stat">
                  <Award size={20} className="text-yellow-400" />
                  <div>
                    <span className="stat-number text-yellow-400">{totalPoints}</span>
                    <span className="stat-text">Puntos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detailed-results">
              <h3>Resumen Detallado</h3>
              <div className="results-list">
                {answers.map((answer, index) => (
                  <div key={index} className={`result-item ${answer.isCorrect ? "correct" : "incorrect"}`}>
                    <div className="result-header">
                      <div className="question-info">
                        <span className="question-number">Pregunta {index + 1}</span>
                        <span className={`difficulty-mini ${getDifficultyColor(answer.difficulty)}`}>
                          {answer.difficulty}
                        </span>
                      </div>
                      <div className="result-indicator">
                        {answer.isCorrect ? (
                          <CheckCircle size={16} className="text-green-400" />
                        ) : (
                          <XCircle size={16} className="text-red-400" />
                        )}
                        <span className="points-earned">+{answer.points} pts</span>
                      </div>
                    </div>
                    <div className="result-content">
                      <p className="question-text">{answer.question}</p>
                      <div className="answer-comparison">
                        <div className="answer-row">
                          <span className="answer-label">Tu respuesta:</span>
                          <span className={`answer-value ${answer.isCorrect ? "text-green-400" : "text-red-400"}`}>
                            {answer.selectedOption}
                          </span>
                        </div>
                        {!answer.isCorrect && (
                          <div className="answer-row">
                            <span className="answer-label">Respuesta correcta:</span>
                            <span className="answer-value text-green-400">{answer.correctOption}</span>
                          </div>
                        )}
                      </div>
                      <div className="explanation-mini">
                        <p>{answer.explanation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-actions">
              <button className="quiz-button secondary" onClick={() => setShowStudyMaterial(true)}>
                <Play size={16} />
                Revisar Material de Estudio
              </button>
              <button className="quiz-button primary" onClick={handleFinishQuiz}>
                {course.hasVolumes ? "Continuar con el Curso" : "Finalizar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progressPercent = (answeredQuestions.size / questions.length) * 100
  const isCurrentQuestionAnswered = answeredQuestions.has(currentQ.id)

  // Get volume info for header
  const volumeInfo =
    course.hasVolumes && volumeId ? course.volumes?.find((v) => v.id === Number.parseInt(volumeId)) : null

  const quizTitle = volumeInfo ? volumeInfo.title : course.title

  return (
    <div className="courses-container">
      <div className="courses-header">
        <button
          onClick={() => navigate(course.hasVolumes ? `/dashboard/cursos/${courseId}` : "/dashboard/cursos")}
          className="back-button"
        >
          <ArrowLeft size={20} />
          {course.hasVolumes ? "Volver al Curso" : "Volver a Cursos"}
        </button>
        <div className="quiz-header-info">
          <h1 className="courses-title">{quizTitle}</h1>
          <div className="quiz-meta">
            <div className="quiz-progress-info">
              <span className="question-counter">
                Pregunta {currentQuestion + 1} de {questions.length}
              </span>
              <div className="quiz-stats">
                <div className="stat-item">
                  <Clock size={16} />
                  <span>{formatTime(timeSpent)}</span>
                </div>
                <div className="stat-item">
                  <Award size={16} />
                  <span>
                    {score}/{questions.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="quiz-container">
        <div className="quiz-progress">
          <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }} />
          <span className="progress-text">{progressPercent.toFixed(0)}% Completado</span>
        </div>

        {isCurrentQuestionAnswered && (
          <div className="answered-question-notice">
            <div className="notice-content">
              <CheckCircle size={20} className="text-green-400" />
              <span>Esta pregunta ya fue respondida permanentemente</span>
              <button onClick={skipToNextUnanswered} className="skip-button">
                Ir a siguiente pregunta sin responder
              </button>
            </div>
          </div>
        )}

        {showStudyMaterial && (
          <div className="study-material-section">
            {getStudyMaterialComponent()}
            <div className="study-actions">
              <button className="quiz-button primary" onClick={handleStudyComplete}>
                <Play size={16} />
                He terminado de estudiar, continuar con la pregunta
              </button>
            </div>
          </div>
        )}

        {!showStudyMaterial && (
          <div className="question-card">
            <div className="question-header">
              <div className="question-meta">
                <span className={`difficulty-badge ${getDifficultyColor(currentQ.difficulty)}`}>
                  {currentQ.difficulty}
                </span>
                <span className="category-badge">{currentQ.category}</span>
                <span className="points-badge">{currentQ.points || 10} pts</span>
              </div>
            </div>

            <h2 className="question-title">{currentQ.question}</h2>

            <div className="options-container">
              {currentQ.options.map((option, index) => {
                let optionClass = "option-button"

                if (isCurrentQuestionAnswered) {
                  const existingAnswer = existingAnswers[currentQ.id]
                  if (existingAnswer) {
                    if (index === existingAnswer.selected_answer) {
                      optionClass += existingAnswer.is_correct ? " correct" : " incorrect"
                    }
                    if (index === currentQ.correct && !existingAnswer.is_correct) {
                      optionClass += " correct"
                    }
                  }
                } else {
                  if (selectedAnswer === index) {
                    optionClass += " selected"
                  }

                  if (showResult) {
                    if (index === currentQ.correct) {
                      optionClass += " correct"
                    } else if (selectedAnswer === index && index !== currentQ.correct) {
                      optionClass += " incorrect"
                    }
                  }
                }

                return (
                  <button
                    key={index}
                    className={optionClass}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult || isCurrentQuestionAnswered}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                    {(showResult || isCurrentQuestionAnswered) && index === currentQ.correct && (
                      <CheckCircle size={20} className="option-icon" />
                    )}
                    {(showResult || isCurrentQuestionAnswered) &&
                      ((selectedAnswer === index && index !== currentQ.correct) ||
                        (isCurrentQuestionAnswered &&
                          existingAnswers[currentQ.id]?.selected_answer === index &&
                          !existingAnswers[currentQ.id]?.is_correct)) && <XCircle size={20} className="option-icon" />}
                  </button>
                )
              })}
            </div>

            {(showResult || isCurrentQuestionAnswered) && (
              <div className="explanation-container">
                <div className="explanation-header">
                  <h3>Explicación</h3>
                  <div className="result-badge">
                    {(
                      isCurrentQuestionAnswered
                        ? existingAnswers[currentQ.id]?.is_correct
                        : selectedAnswer === currentQ.correct
                    ) ? (
                      <span className="correct-badge">
                        <CheckCircle size={16} />
                        Correcto (+{currentQ.points || 10} pts)
                      </span>
                    ) : (
                      <span className="incorrect-badge">
                        <XCircle size={16} />
                        Incorrecto (0 pts)
                      </span>
                    )}
                  </div>
                </div>
                <p className="explanation-text">{currentQ.explanation}</p>
              </div>
            )}

            <div className="quiz-actions">
              {!showResult && !isCurrentQuestionAnswered ? (
                <button className="quiz-button primary" onClick={handleShowResult} disabled={selectedAnswer === null}>
                  Verificar Respuesta
                </button>
              ) : (
                <div className="action-buttons">
                  {isCurrentQuestionAnswered ? (
                    <button className="quiz-button primary" onClick={skipToNextUnanswered}>
                      Ir a siguiente pregunta sin responder
                    </button>
                  ) : (
                    <button className="quiz-button primary" onClick={handleNextQuestion}>
                      {questions.findIndex((q, index) => index > currentQuestion && !answeredQuestions.has(q.id)) !== -1
                        ? "Siguiente Pregunta"
                        : "Finalizar Quiz"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions (need to be defined)
const getPerformanceMessage = (accuracy) => {
  if (accuracy >= 90) return { message: "Excelente", color: "text-green-400", icon: Award }
  if (accuracy >= 80) return { message: "Muy Bien", color: "text-cyan-400", icon: CheckCircle }
  if (accuracy >= 70) return { message: "Bien", color: "text-yellow-400", icon: CheckCircle }
  return { message: "Necesita Mejorar", color: "text-red-400", icon: XCircle }
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

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export default DynamicQuiz
