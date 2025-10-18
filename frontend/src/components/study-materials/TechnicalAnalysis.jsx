"use client"

import { BookOpen, TrendingUp, BarChart3, Target } from "lucide-react"

const TechnicalAnalysis = ({ questionId }) => {
  const getMaterialForQuestion = (id) => {
    switch (id) {
      case 1:
        return {
          title: "Soportes en Análisis Técnico",
          content: [
            {
              subtitle: "¿Qué es un Soporte?",
              text: "Un soporte es un nivel de precio donde la demanda (compradores) es lo suficientemente fuerte como para detener o revertir una tendencia bajista.",
            },
            {
              subtitle: "¿Cómo se forma un soporte?",
              text: "Se forma cuando el precio baja hasta un nivel específico y los compradores consideran que es un buen precio para comprar, creando presión de compra que detiene la caída.",
            },
            {
              subtitle: "Tipos de soporte",
              points: [
                "Soporte horizontal: Nivel de precio específico tocado múltiples veces",
                "Soporte dinámico: Líneas de tendencia o medias móviles",
                "Soporte psicológico: Números redondos (1.1000, 1.2000, etc.)",
                "Soporte de retroceso: Niveles de Fibonacci",
              ],
            },
            {
              subtitle: "¿Cómo identificar soportes?",
              text: "Busca niveles donde el precio ha rebotado al alza anteriormente. Mientras más veces haya rebotado, más fuerte es el soporte.",
            },
            {
              subtitle: "Estrategia de trading",
              text: "Los traders suelen comprar cerca de niveles de soporte con stop loss por debajo del soporte y take profit en resistencias.",
            },
          ],
          icon: Target,
        }
      case 2:
        return {
          title: "Resistencias en Análisis Técnico",
          content: [
            {
              subtitle: "¿Qué es una Resistencia?",
              text: "Una resistencia es un nivel de precio donde la oferta (vendedores) supera a la demanda, causando que el precio se detenga o revierta al alza.",
            },
            {
              subtitle: "¿Cómo funciona?",
              text: "Cuando el precio sube hasta cierto nivel, los vendedores consideran que es un buen precio para vender, creando presión vendedora que detiene el alza.",
            },
            {
              subtitle: "Tipos de resistencia",
              points: [
                "Resistencia horizontal: Máximos anteriores del precio",
                "Resistencia dinámica: Líneas de tendencia bajistas",
                "Resistencia psicológica: Números redondos importantes",
                "Resistencia de extensión: Proyecciones de Fibonacci",
              ],
            },
            {
              subtitle: "Concepto clave: Soporte convertido en Resistencia",
              text: "Cuando un soporte se rompe, a menudo se convierte en resistencia. Este es un concepto fundamental en análisis técnico.",
            },
            {
              subtitle: "Estrategia de trading",
              text: "Los traders pueden vender cerca de resistencias o esperar a que se rompan para comprar en la continuación alcista.",
            },
          ],
          icon: BarChart3,
        }
      case 3:
        return {
          title: "Velas Japonesas: Patrón Doji",
          content: [
            {
              subtitle: "¿Qué es una vela Doji?",
              text: "Una vela Doji se forma cuando los precios de apertura y cierre son virtualmente iguales, creando una vela con cuerpo muy pequeño o inexistente.",
            },
            {
              subtitle: "¿Qué indica?",
              text: "La vela Doji representa indecisión en el mercado. Ni compradores ni vendedores pudieron tomar control, resultando en un empate.",
            },
            {
              subtitle: "Tipos de Doji",
              points: [
                "Doji estándar: Apertura = Cierre, sombras equilibradas",
                "Dragonfly Doji: Apertura = Cierre = Máximo, sombra inferior larga",
                "Gravestone Doji: Apertura = Cierre = Mínimo, sombra superior larga",
                "Four Price Doji: Apertura = Cierre = Máximo = Mínimo (muy raro)",
              ],
            },
            {
              subtitle: "Interpretación según contexto",
              text: "En tendencia alcista: Posible agotamiento de compradores. En tendencia bajista: Posible agotamiento de vendedores. En rango: Continuación de la indecisión.",
            },
            {
              subtitle: "Cómo usar en trading",
              text: "El Doji por sí solo no es señal de entrada. Debe confirmarse con la siguiente vela o combinarse con otros indicadores técnicos.",
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
          <IconComponent size={24} className="text-yellow-400" />
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
          <span className="tip-icon">📊</span>
          <span className="tip-text">Aplica estos conceptos al analizar gráficos reales</span>
        </div>
      </div>
    </div>
  )
}

export default TechnicalAnalysis
