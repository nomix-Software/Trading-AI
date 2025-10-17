"use client"

import { BookOpen, TrendingUp, BarChart3, Target } from "lucide-react"

const AdvancedTechnicalAnalysis = ({ questionId }) => {
  const getMaterialForQuestion = (id) => {
    switch (id) {
      case 1:
        return {
          title: "Divergencias en Trading",
          content: [
            {
              subtitle: "¿Qué son las Divergencias?",
              text: "Las divergencias ocurren cuando el precio se mueve en una dirección mientras que un indicador técnico se mueve en la dirección opuesta. Son señales poderosas de posibles reversiones.",
            },
            {
              subtitle: "Tipos de Divergencias",
              points: [
                "Divergencia Alcista: Precio hace mínimos más bajos, indicador hace mínimos más altos",
                "Divergencia Bajista: Precio hace máximos más altos, indicador hace máximos más bajos",
                "Divergencia Oculta: Confirma la continuación de la tendencia actual",
                "Divergencia Regular: Señala posible reversión de tendencia",
              ],
            },
            {
              subtitle: "Indicadores más efectivos",
              text: "RSI, MACD, Stochastic y Williams %R son los indicadores más confiables para detectar divergencias. Funcionan mejor en timeframes de 1H o superiores.",
            },
          ],
          icon: TrendingUp,
        }
      case 2:
        return {
          title: "RSI Avanzado",
          content: [
            {
              subtitle: "Interpretación del RSI",
              text: "El Relative Strength Index mide la velocidad y magnitud de los cambios de precio. Va de 0 a 100 y es uno de los osciladores más confiables.",
            },
            {
              subtitle: "Niveles clave del RSI",
              points: [
                "70+ - Zona de Sobrecompra: Posible corrección bajista",
                "30- - Zona de Sobreventa: Posible rebote alcista",
                "50 - Línea media: Cambio de momentum",
                "80/20 - Niveles extremos para mercados muy volátiles",
              ],
            },
            {
              subtitle: "Estrategias avanzadas",
              text: "Usa el RSI con divergencias para mayor precisión. En tendencias fuertes, los niveles de sobrecompra/sobreventa pueden mantenerse por períodos prolongados.",
            },
          ],
          icon: BarChart3,
        }
      case 3:
        return {
          title: "Patrones Armónicos",
          content: [
            {
              subtitle: "¿Qué son los Patrones Armónicos?",
              text: "Los patrones armónicos utilizan relaciones de Fibonacci para identificar puntos de reversión potenciales con alta precisión matemática.",
            },
            {
              subtitle: "Patrones principales",
              points: [
                "Patrón Gartley: Retroceso 61.8% del movimiento XA",
                "Patrón Butterfly: Extensión 127% del movimiento XA",
                "Patrón Bat: Retroceso 88.6% del movimiento XA",
                "Patrón Crab: Extensión 161.8% del movimiento XA",
              ],
            },
            {
              subtitle: "Cómo usarlos",
              text: "Identifica los puntos XABC, calcula las proyecciones de Fibonacci y espera la confirmación en el punto D antes de entrar al mercado.",
            },
          ],
          icon: Target,
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
          <IconComponent size={24} className="text-cyan-400" />
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
          <span className="tip-icon">💡</span>
          <span className="tip-text">Lee cuidadosamente este material antes de responder la pregunta</span>
        </div>
      </div>
    </div>
  )
}

export default AdvancedTechnicalAnalysis
