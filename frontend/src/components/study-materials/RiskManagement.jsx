"use client"

import { Shield, TrendingUp, PieChart, AlertTriangle, Target, DollarSign, BarChart3 } from "lucide-react"

const RiskManagement = ({ questionId }) => {
  const getMaterialForQuestion = (id) => {
    switch (id) {
      case 1:
        return {
          title: "Position Sizing",
          content: [
            {
              subtitle: "¿Qué es Position Sizing?",
              text: "Position sizing es la cantidad de capital que asignas a cada operación, siendo fundamental para una gestión de riesgo efectiva.",
            },
            {
              subtitle: "Métodos de Position Sizing",
              points: [
                "💰 Método del Porcentaje Fijo: Arriesgar un porcentaje fijo del capital en cada operación",
                "📊 Método de Kelly: Optimiza el tamaño basado en probabilidades históricas",
                "🎯 Método de Volatilidad: Ajusta el tamaño según la volatilidad del activo",
              ],
            },
            {
              subtitle: "Fórmula del Porcentaje Fijo",
              text: "Tamaño = (Capital × % Riesgo) ÷ Stop Loss en $",
            },
          ],
          icon: PieChart,
        }
      case 2:
        return {
          title: "Portfolio Management",
          content: [
            {
              subtitle: "Gestión de Cartera",
              text: "Administrar múltiples posiciones y activos para optimizar el rendimiento y minimizar el riesgo.",
            },
            {
              subtitle: "Principios Clave",
              points: [
                "Diversificación: No poner todos los huevos en la misma canasta",
                "Correlación: Evitar posiciones altamente correlacionadas",
                "Distribución de activos: Asignar capital según el perfil de riesgo",
              ],
            },
            {
              subtitle: "Ejemplos de Correlación",
              points: [
                "EUR/USD y GBP/USD (correlación positiva)",
                "USD/CHF y EUR/USD (correlación negativa)",
                "Commodities y sus divisas relacionadas",
              ],
            },
          ],
          icon: BarChart3,
        }
      case 3:
        return {
          title: "Drawdown Control",
          content: [
            {
              subtitle: "Control de Pérdidas",
              text: "El drawdown es la disminución del capital desde un pico hasta un valle. Controlarlo es crucial para la supervivencia a largo plazo.",
            },
            {
              subtitle: "Niveles de Drawdown",
              points: [
                "0-10%: Zona Segura - Operación normal, sin restricciones",
                "10-20%: Zona de Precaución - Reducir tamaño de posiciones, revisar estrategia",
                "20%+: Zona de Peligro - Parar trading, revisar completamente el sistema",
              ],
            },
            {
              subtitle: "Tiempo de Recuperación",
              text: "Una pérdida del 50% requiere una ganancia del 100% para recuperar el capital inicial.",
            },
          ],
          icon: AlertTriangle,
        }
      case 4:
        return {
          title: "Risk-Reward Ratios",
          content: [
            {
              subtitle: "Relación Riesgo-Recompensa",
              text: "La relación entre lo que puedes ganar versus lo que puedes perder en una operación.",
            },
            {
              subtitle: "Ratios Comunes",
              points: [
                "3:1 - Excelente: Win rate necesario: 25%",
                "2:1 - Bueno: Win rate necesario: 33.3%",
                "1:1 - Aceptable: Win rate necesario: 50%",
                "1:2 - Malo: Win rate necesario: 66.7%",
              ],
            },
            {
              subtitle: "Consejo Práctico",
              text: "Siempre busca ratios de al menos 1:1.5 para tener un margen de seguridad en tu estrategia.",
            },
          ],
          icon: Target,
        }
      case 5:
        return {
          title: "Money Management",
          content: [
            {
              subtitle: "Gestión del Dinero",
              text: "Reglas y sistemas para administrar el capital de trading de manera efectiva.",
            },
            {
              subtitle: "Reglas Básicas",
              points: [
                "Nunca arriesgar más del 1-2% por operación",
                "Máximo 5% de riesgo total en el mercado",
                "Mantener al menos 6 meses de gastos como reserva",
                "Solo usar dinero que puedes permitirte perder",
              ],
            },
            {
              subtitle: "Escalado de Posiciones",
              points: [
                "Aumentar tamaño solo después de períodos ganadores",
                "Reducir tamaño después de pérdidas consecutivas",
                "Usar trailing stops para proteger ganancias",
                "Retirar ganancias periódicamente",
              ],
            },
          ],
          icon: DollarSign,
        }
      case 6:
        return {
          title: "Métricas de Rendimiento",
          content: [
            {
              subtitle: "KPIs de Trading",
              text: "Métricas clave para evaluar el rendimiento de tu sistema de trading.",
            },
            {
              subtitle: "Métricas Importantes",
              points: [
                "Profit Factor: Ganancia bruta ÷ Pérdida bruta (Objetivo: > 1.5)",
                "Sharpe Ratio: Retorno ajustado por riesgo (Objetivo: > 1.0)",
                "Calmar Ratio: Retorno anual ÷ Max Drawdown (Objetivo: > 0.5)",
                "Expectancy: (Win% × Avg Win) - (Loss% × Avg Loss) (Objetivo: > 0)",
              ],
            },
            {
              subtitle: "Seguimiento Continuo",
              text: "Registra y analiza tus métricas regularmente para mejorar tu sistema de trading.",
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
          <IconComponent size={24} className="text-cyan-400" />
        </div>
        <h3 className="material-title">{material.title}</h3>
        <div className="study-badge">
          <Shield size={16} />
          <span>Gestión de Riesgo</span>
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
          <span className="tip-text">La preservación del capital es más importante que las ganancias</span>
        </div>
      </div>
    </div>
  )
}

export default RiskManagement