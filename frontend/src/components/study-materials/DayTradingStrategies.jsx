"use client"

import { Zap, TrendingUp, Target, Clock, Brain, Shield, Calendar } from "lucide-react"

const DayTradingStrategies = ({ questionId }) => {
  const getMaterialForQuestion = (id) => {
    switch (id) {
      case 1:
        return {
          title: "Scalping",
          content: [
            {
              subtitle: "¿Qué es el Scalping?",
              text: "Estrategia que busca obtener pequeñas ganancias en operaciones muy rápidas, desde segundos hasta pocos minutos.",
            },
            {
              subtitle: "Características del Scalping",
              points: [
                "Duración: Segundos a 5 minutos máximo",
                "Objetivo: 2-10 pips por operación",
                "Timeframes: 1m, 5m máximo",
                "Frecuencia: 50-200 operaciones por día",
              ],
            },
            {
              subtitle: "Requisitos para Scalping",
              points: [
                "Spreads muy bajos",
                "Ejecución rápida",
                "Alta concentración",
                "Disciplina estricta",
                "Capital suficiente",
              ],
            },
          ],
          icon: Zap,
        }
      case 2:
        return {
          title: "Momentum Trading",
          content: [
            {
              subtitle: "Trading de Impulso",
              text: "Estrategia que busca aprovechar movimientos fuertes del precio en la dirección de la tendencia.",
            },
            {
              subtitle: "Señales de Momentum",
              points: [
                "Breakout de Volumen: Ruptura de niveles con alto volumen",
                "Noticias Importantes: Eventos que generan movimientos fuertes",
                "Gap Opening: Apertura con gap significativo",
                "Momentum Indicators: RSI, MACD mostrando fuerza",
              ],
            },
            {
              subtitle: "Gestión de Operaciones",
              text: "En momentum trading, es crucial entrar temprano en el movimiento y salir antes de que se agote el impulso.",
            },
          ],
          icon: TrendingUp,
        }
      case 3:
        return {
          title: "Breakout Strategies",
          content: [
            {
              subtitle: "Estrategias de Ruptura",
              text: "Buscan aprovechar la ruptura de niveles importantes de soporte o resistencia.",
            },
            {
              subtitle: "Breakout Alcista",
              points: [
                "Identificar resistencia",
                "Esperar ruptura con volumen",
                "Entrar en el pullback",
                "Stop loss bajo la resistencia rota",
              ],
            },
            {
              subtitle: "Breakout Bajista",
              points: [
                "Identificar soporte",
                "Esperar ruptura con volumen",
                "Entrar en el pullback",
                "Stop loss sobre el soporte roto",
              ],
            },
          ],
          icon: Target,
        }
      case 4:
        return {
          title: "Risk Management en Day Trading",
          content: [
            {
              subtitle: "Gestión de Riesgo Intradía",
              text: "El day trading requiere una gestión de riesgo muy estricta debido a la alta frecuencia de operaciones.",
            },
            {
              subtitle: "Reglas de Riesgo",
              points: [
                "Regla del 1%: Nunca arriesgar más del 1% del capital por operación",
                "Risk-Reward Mínimo: Buscar al menos 2:1 de recompensa por riesgo",
                "Pérdida Diaria Máxima: Parar de operar si se pierde 5% del capital en un día",
              ],
            },
            {
              subtitle: "Consejo Adicional",
              text: "Usa órdenes stop-loss automáticas para proteger tu capital en operaciones rápidas.",
            },
          ],
          icon: Shield,
        }
      case 5:
        return {
          title: "Psicología del Day Trading",
          content: [
            {
              subtitle: "Aspectos Mentales Clave",
              text: "La psicología es crucial en el day trading debido a la presión y velocidad de las decisiones.",
            },
            {
              subtitle: "Habilidades Psicológicas",
              points: [
                "Control de Emociones: Mantener la calma en operaciones rápidas",
                "Disciplina: Seguir el plan sin desviaciones",
                "Decisiones Rápidas: Capacidad de actuar sin dudar",
                "Adaptabilidad: Ajustarse a condiciones cambiantes",
              ],
            },
            {
              subtitle: "Preparación Mental",
              text: "Practica meditación o técnicas de respiración para mejorar tu enfoque durante las sesiones de trading.",
            },
          ],
          icon: Brain,
        }
      case 6:
        return {
          title: "Horarios Óptimos",
          content: [
            {
              subtitle: "Mejores Momentos para Day Trading",
              text: "Ciertos horarios ofrecen mejor volatilidad y volumen para el day trading.",
            },
            {
              subtitle: "Sesiones Recomendadas",
              points: [
                "Apertura de Londres (8:00-10:00 GMT): Alta volatilidad en EUR/USD, GBP/USD",
                "Apertura de Nueva York (13:00-15:00 GMT): Máxima liquidez y volatilidad",
                "Apertura de Tokyo (00:00-02:00 GMT): Buena para pares con JPY",
              ],
            },
            {
              subtitle: "Horarios a Evitar",
              text: "Evita las horas muertas (22:00-00:00 GMT) cuando hay baja liquidez y spreads más amplios.",
            },
          ],
          icon: Clock,
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
          <Zap size={16} />
          <span>Day Trading</span>
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
          <span className="tip-text">Siempre ten un plan de trading antes de abrir el mercado</span>
        </div>
      </div>
    </div>
  )
}

export default DayTradingStrategies