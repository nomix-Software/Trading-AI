"use client"

import { Cpu, BarChart3, Settings, TrendingUp, Play } from "lucide-react"

const AlgorithmicTradingStrategies = ({ questionId }) => {
  const getMaterialForQuestion = (id) => {
    switch (id) {
      case 1:
        return {
          title: "Diseño de Algoritmos",
          content: [
            {
              subtitle: "Arquitectura de una Estrategia",
              text: "Un algoritmo de trading bien diseñado debe tener una estructura clara y modular.",
            },
            {
              subtitle: "Componentes Principales",
              points: [
                "Data Handler: Gestiona la obtención y limpieza de datos",
                "Strategy Logic: Contiene las reglas de entrada y salida",
                "Risk Manager: Controla el tamaño de posiciones y riesgo",
                "Portfolio Manager: Gestiona múltiples posiciones y capital",
                "Execution Engine: Ejecuta las órdenes en el mercado",
              ],
            },
            {
              subtitle: "Estructura Base",
              text: "Un algoritmo típico incluye inicialización, generación de señales, ejecución de operaciones y cálculo de rendimiento.",
            },
          ],
          icon: Cpu,
        }
      case 2:
        return {
          title: "Backtesting",
          content: [
            {
              subtitle: "¿Qué es el Backtesting?",
              text: "El backtesting consiste en probar una estrategia utilizando datos históricos para evaluar su rendimiento antes de implementarla en tiempo real.",
            },
            {
              subtitle: "Proceso de Backtesting",
              points: [
                "Preparación de Datos: Limpiar y formatear datos históricos",
                "Implementación de Estrategia: Codificar las reglas de trading",
                "Simulación: Ejecutar la estrategia en datos históricos",
                "Análisis de Resultados: Evaluar métricas de rendimiento",
              ],
            },
            {
              subtitle: "Errores Comunes en Backtesting",
              points: [
                "Look-ahead bias: Usar información futura",
                "Survivorship bias: Solo considerar activos exitosos",
                "Overfitting: Optimizar demasiado para datos históricos",
                "Ignorar costos: No incluir spreads y comisiones",
                "Slippage: No considerar diferencias de ejecución",
              ],
            },
          ],
          icon: BarChart3,
        }
      case 3:
        return {
          title: "Optimización de Parámetros",
          content: [
            {
              subtitle: "Encontrar los Mejores Parámetros",
              text: "La optimización busca los valores de parámetros que maximizan el rendimiento de la estrategia.",
            },
            {
              subtitle: "Métodos de Optimización",
              points: [
                "Grid Search: Prueba todas las combinaciones posibles de parámetros (exhaustivo pero costoso)",
                "Random Search: Prueba combinaciones aleatorias de parámetros (más eficiente)",
                "Genetic Algorithm: Evoluciona parámetros usando algoritmos genéticos (encuentra óptimos globales)",
              ],
            },
            {
              subtitle: "Precaución Importante",
              text: "Evita el overfitting: una estrategia demasiado optimizada para datos históricos puede funcionar mal en datos nuevos.",
            },
          ],
          icon: Settings,
        }
      case 4:
        return {
          title: "Métricas de Evaluación",
          content: [
            {
              subtitle: "KPIs para Algoritmos",
              text: "Métricas clave para evaluar el rendimiento de estrategias algorítmicas.",
            },
            {
              subtitle: "Métricas de Retorno",
              points: [
                "Total Return: Retorno total del período",
                "Annualized Return: Retorno anualizado",
                "CAGR: Tasa de crecimiento anual compuesta",
              ],
            },
            {
              subtitle: "Métricas de Riesgo",
              points: [
                "Volatility: Desviación estándar de retornos",
                "Max Drawdown: Mayor pérdida desde un pico",
                "VaR: Value at Risk al 95%",
              ],
            },
            {
              subtitle: "Métricas Ajustadas por Riesgo",
              points: [
                "Sharpe Ratio: Retorno por unidad de riesgo",
                "Sortino Ratio: Sharpe usando solo downside risk",
                "Calmar Ratio: CAGR / Max Drawdown",
              ],
            },
          ],
          icon: TrendingUp,
        }
      case 5:
        return {
          title: "Trading en Vivo",
          content: [
            {
              subtitle: "De Backtest a Producción",
              text: "Implementar un algoritmo en trading real requiere consideraciones adicionales.",
            },
            {
              subtitle: "Consideraciones Clave",
              points: [
                "Latencia: Velocidad de ejecución crítica en estrategias de alta frecuencia",
                "Costos de Transacción: Spreads, comisiones y slippage afectan la rentabilidad",
                "Gestión de Órdenes: Manejo de órdenes parcialmente ejecutadas y rechazadas",
                "Monitoreo: Supervisión continua del rendimiento y errores",
              ],
            },
            {
              subtitle: "Pasos para Implementación",
              points: [
                "Paper Trading: Probar con dinero virtual",
                "Small Capital: Comenzar con capital pequeño",
                "Monitoring: Supervisar de cerca el rendimiento",
                "Gradual Scaling: Aumentar capital gradualmente",
              ],
            },
          ],
          icon: Play,
        }
      case 6:
        return {
          title: "Herramientas y Frameworks",
          content: [
            {
              subtitle: "Librerías para Backtesting",
              text: "Frameworks especializados que facilitan el desarrollo y testing de estrategias.",
            },
            {
              subtitle: "Frameworks Populares",
              points: [
                "Backtrader: Framework completo para backtesting y trading en vivo (fácil de usar, múltiples brokers)",
                "Zipline: Framework de Quantopian para backtesting (profesional, pipeline de datos)",
                "PyAlgoTrade: Librería simple para backtesting (ligero, bien documentado)",
              ],
            },
            {
              subtitle: "Elección de Herramientas",
              text: "Selecciona el framework según tu nivel de experiencia, complejidad de estrategia y necesidades específicas.",
            },
          ],
          
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
          <Cpu size={16} />
          <span>Algoritmos</span>
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
          <span className="tip-text">Siempre usa datos out-of-sample para validación final</span>
        </div>
      </div>
    </div>
  )
}

export default AlgorithmicTradingStrategies