"use client"

import { BookOpen, Target, TrendingUp } from "lucide-react"

const AdvancedStrategies = ({ questionId }) => {
  const getMaterialForQuestion = (id) => {
    switch (id) {
      case 1:
        return {
          title: "Confluencias en Trading",
          content: [
            {
              subtitle: "¿Qué es una Confluencia?",
              text: "Una confluencia ocurre cuando múltiples elementos de análisis técnico convergen en el mismo nivel de precio, aumentando significativamente la probabilidad de una reacción del precio.",
            },
            {
              subtitle: "Elementos que crean confluencias",
              points: [
                "Soportes y resistencias horizontales",
                "Líneas de tendencia",
                "Niveles de retroceso de Fibonacci",
                "Medias móviles importantes",
                "Niveles psicológicos (números redondos)",
                "Máximos y mínimos anteriores significativos",
              ],
            },
            {
              subtitle: "¿Por qué son importantes?",
              text: "Las confluencias aumentan la probabilidad de éxito porque múltiples factores técnicos están 'de acuerdo' en que ese nivel es importante.",
            },
            {
              subtitle: "Ejemplo práctico",
              text: "Si el precio se acerca a un nivel que es: soporte horizontal + retroceso 61.8% de Fibonacci + media móvil de 200 períodos, tienes una confluencia muy fuerte.",
            },
            {
              subtitle: "Cómo usar confluencias",
              text: "Busca al menos 2-3 elementos técnicos convergiendo. Mientras más elementos, mayor la probabilidad de reacción del precio.",
            },
          ],
          icon: Target,
        }
      case 2:
        return {
          title: "Niveles de Fibonacci",
          content: [
            {
              subtitle: "¿Qué son los retrocesos de Fibonacci?",
              text: "Son niveles horizontales que indican dónde el precio podría encontrar soporte o resistencia, basados en la secuencia matemática de Fibonacci.",
            },
            {
              subtitle: "Los niveles principales",
              points: [
                "23.6% - Retroceso menor, tendencia fuerte",
                "38.2% - Retroceso moderado, nivel común",
                "50% - No es Fibonacci técnicamente, pero muy usado",
                "61.8% - El 'Golden Ratio', nivel más importante",
                "78.6% - Retroceso profundo, posible cambio de tendencia",
              ],
            },
            {
              subtitle: "¿Cómo aplicar Fibonacci?",
              text: "En tendencia alcista: desde el mínimo hasta el máximo. En tendencia bajista: desde el máximo hasta el mínimo. Los niveles actúan como soporte/resistencia.",
            },
            {
              subtitle: "El nivel 61.8% - Golden Ratio",
              text: "Es el nivel más respetado por los traders. Si el precio retrocede más del 61.8%, la tendencia original podría estar en peligro.",
            },
            {
              subtitle: "Estrategia de trading",
              text: "Busca confluencias de Fibonacci con otros elementos técnicos. No uses Fibonacci solo, siempre combínalo con otros análisis.",
            },
          ],
          icon: TrendingUp,
        }
      default:
        return null
    }
  }

  const material = getMaterialForQuestion(questionId)

  if (!material) return null

  const IconComponent = material.icon

  return (
    <div className="study-material-container">
      <div className="study-material-header">
        <div className="material-icon">
          <IconComponent size={24} className="text-purple-400" />
        </div>
        <h3 className="material-title">{material.title}</h3>
        <div className="study-badge">
          <BookOpen size={16} />
          <span>Material de Estudio</span>
        </div>
      </div>

      <div className="study-content">
        {material.content.map((section, index) => (
          <div key={index} className="content-section">
            <h4 className="section-subtitle">{section.subtitle}</h4>
            {section.text && <p className="section-text">{section.text}</p>}
            {section.points && (
              <ul className="section-points">
                {section.points.map((point, pointIndex) => (
                  <li key={pointIndex} className="point-item">
                    <span className="point-bullet">•</span>
                    {point}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <div className="study-footer">
        <div className="study-tip">
          <span className="tip-icon">⚡</span>
          <span className="tip-text">Las estrategias avanzadas requieren práctica constante</span>
        </div>
      </div>
    </div>
  )
}

export default AdvancedStrategies
