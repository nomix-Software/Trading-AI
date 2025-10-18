"use client"

import { BookOpen, TrendingUp, Globe, DollarSign } from "lucide-react"

const ForexBasics = ({ questionId }) => {
  const getMaterialForQuestion = (id) => {
    switch (id) {
      case 1:
        return {
          title: "¿Qué es el Mercado Forex?",
          content: [
            {
              subtitle: "Definición",
              text: "Forex (Foreign Exchange) es el mercado global descentralizado donde se negocian divisas. Es el mercado financiero más grande y líquido del mundo, con un volumen diario de más de $6 billones.",
            },
            {
              subtitle: "Características principales",
              points: [
                "Mercado descentralizado (no tiene ubicación física)",
                "Opera 24 horas, 5 días a la semana",
                "Alta liquidez y volatilidad",
                "Participantes: bancos, instituciones, traders individuales",
              ],
            },
            {
              subtitle: "¿Cómo funciona?",
              text: "En Forex siempre se intercambia una divisa por otra. Por ejemplo, si compras EUR/USD, estás comprando euros y vendiendo dólares simultáneamente.",
            },
          ],
          icon: Globe,
        }
      case 2:
        return {
          title: "Pares de Divisas Principales",
          content: [
            {
              subtitle: "Los 'Majors' - Pares Principales",
              points: [
                "EUR/USD - Euro vs Dólar (el más negociado)",
                "GBP/USD - Libra vs Dólar",
                "USD/JPY - Dólar vs Yen",
                "USD/CHF - Dólar vs Franco Suizo",
              ],
            },
            {
              subtitle: "¿Por qué EUR/USD es el más popular?",
              text: "Representa las dos economías más grandes del mundo, tiene spreads bajos, alta liquidez y movimientos predecibles durante ciertas sesiones.",
            },
            {
              subtitle: "Volumen de Trading",
              text: "EUR/USD representa aproximadamente el 24% del volumen total de Forex, seguido por USD/JPY (13%) y GBP/USD (9%).",
            },
          ],
          icon: TrendingUp,
        }
      case 3:
        return {
          title: "El Spread en Trading",
          content: [
            {
              subtitle: "¿Qué es el Spread?",
              text: "El spread es la diferencia entre el precio de compra (Ask) y el precio de venta (Bid). Es el costo principal de hacer trading.",
            },
            {
              subtitle: "Ejemplo práctico",
              text: "Si EUR/USD muestra Bid: 1.1000 y Ask: 1.1002, el spread es 2 pips. Esto significa que pagas 2 pips por abrir la posición.",
            },
            {
              subtitle: "Factores que afectan el spread",
              points: [
                "Liquidez del par (más liquidez = menor spread)",
                "Volatilidad del mercado",
                "Horario de trading (spreads más altos fuera de horas principales)",
                "Eventos económicos importantes",
              ],
            },
            {
              subtitle: "Tip importante",
              text: "Siempre considera el spread en tu estrategia. Un spread alto puede eliminar pequeñas ganancias.",
            },
          ],
          icon: DollarSign,
        }
      case 4:
        return {
          title: "¿Qué es un PIP?",
          content: [
            {
              subtitle: "Definición de PIP",
              text: "PIP significa 'Percentage In Point' o 'Price Interest Point'. Es la unidad más pequeña de medida para el cambio de precio en un par de divisas.",
            },
            {
              subtitle: "Valor del PIP",
              points: [
                "Para la mayoría de pares: 1 pip = 0.0001",
                "Para pares con JPY: 1 pip = 0.01",
                "Ejemplo: EUR/USD de 1.1000 a 1.1001 = 1 pip de movimiento",
              ],
            },
            {
              subtitle: "¿Por qué es importante?",
              text: "Los pips te ayudan a medir ganancias/pérdidas y calcular el riesgo. También se usan para establecer stop loss y take profit.",
            },
            {
              subtitle: "Cálculo de valor monetario",
              text: "El valor monetario de un pip depende del tamaño de tu posición. Con 1 lote estándar (100,000 unidades), 1 pip en EUR/USD vale $10.",
            },
          ],
          icon: BookOpen,
        }
      case 5:
        return {
          title: "Sesiones de Trading Forex",
          content: [
            {
              subtitle: "Las 3 Sesiones Principales",
              points: [
                "Sesión de Tokyo (Asia): 00:00 - 09:00 GMT",
                "Sesión de Londres (Europa): 08:00 - 17:00 GMT",
                "Sesión de Nueva York (América): 13:00 - 22:00 GMT",
              ],
            },
            {
              subtitle: "Características de cada sesión",
              text: "Tokyo: Movimientos más suaves, ideal para estrategias de rango. Londres: Mayor volatilidad, muchas noticias económicas. Nueva York: Solapamiento con Londres crea alta actividad.",
            },
            {
              subtitle: "Mejores horarios para trading",
              text: "Los solapamientos entre sesiones (Londres-Nueva York: 13:00-17:00 GMT) ofrecen la mayor liquidez y volatilidad.",
            },
            {
              subtitle: "Tip de horarios",
              text: "Evita trading durante cambios de sesión y fines de semana cuando la liquidez es baja y los spreads aumentan.",
            },
          ],
          icon: Globe,
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

export default ForexBasics
