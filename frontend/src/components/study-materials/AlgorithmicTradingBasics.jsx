"use client"

import { Brain, Code, Database, TrendingUp, Cpu, Settings, Rocket } from "lucide-react"
import "../../pages/courses/study-materials.css"

const AlgorithmicTradingBasics = () => {
  const getMaterial = () => {
    return {
      title: "Trading Algorítmico - Fundamentos",
      subtitle: "Introducción a Python y programación para trading",
      content: [
        {
          subtitle: "🐍 Python Básico para Trading",
          sections: [
            {
              heading: "¿Por qué Python?",
              text: "Python es el lenguaje más popular para trading algorítmico debido a su simplicidad y potentes librerías financieras.",
              points: [],
              customContent: (
                <div className="python-advantages">
                  <div className="advantage-item">
                    <span className="adv-icon">📚</span>
                    <div>
                      <h5>Librerías Especializadas</h5>
                      <p>Pandas, NumPy, TA-Lib, Backtrader</p>
                    </div>
                  </div>
                  <div className="advantage-item">
                    <span className="adv-icon">🔗</span>
                    <div>
                      <h5>APIs de Brokers</h5>
                      <p>Fácil integración con MT4, MT5, Interactive Brokers</p>
                    </div>
                  </div>
                  <div className="advantage-item">
                    <span className="adv-icon">📊</span>
                    <div>
                      <h5>Análisis de Datos</h5>
                      <p>Potentes herramientas de visualización y análisis</p>
                    </div>
                  </div>
                </div>
              ),
              codeExample: `import pandas as pd
import numpy as np

# Cargar datos de precios
df = pd.read_csv('EURUSD.csv')
df['SMA_20'] = df['Close'].rolling(20).mean()
df['Signal'] = np.where(df['Close'] > df['SMA_20'], 1, -1)`
            }
          ]
        },
        {
          subtitle: "📊 Estructuras de Datos",
          sections: [
            {
              heading: "Pandas DataFrames",
              text: "Los DataFrames son la estructura principal para manejar datos financieros en Python.",
              points: [],
              customContent: (
                <div className="dataframe-operations">
                  <div className="operation-item">
                    <h5>📥 Cargar Datos</h5>
                    <pre>
                      <code>{`# Desde CSV
df = pd.read_csv('data.csv', index_col='Date', parse_dates=True)

# Desde API
import yfinance as yf
df = yf.download('EURUSD=X', start='2023-01-01')`}</code>
                    </pre>
                  </div>
                  <div className="operation-item">
                    <h5>🔄 Manipular Datos</h5>
                    <pre>
                      <code>{`# Calcular retornos
df['Returns'] = df['Close'].pct_change()

# Filtrar datos
recent_data = df.last('30D')

# Resamplear
daily_data = df.resample('D').last()`}</code>
                    </pre>
                  </div>
                </div>
              )
            }
          ]
        },
        {
          subtitle: "📈 Librerías Financieras",
          sections: [
            {
              heading: "Herramientas Esenciales",
              text: "Librerías especializadas que facilitan el desarrollo de estrategias de trading.",
              points: [],
              customContent: (
                <div className="libraries-grid">
                  <div className="lib-item">
                    <h5>📊 Pandas</h5>
                    <p>Manipulación y análisis de datos</p>
                    <div className="lib-usage">
                      <strong>Uso:</strong> DataFrames, Series, análisis temporal
                    </div>
                  </div>
                  <div className="lib-item">
                    <h5>🔢 NumPy</h5>
                    <p>Computación numérica eficiente</p>
                    <div className="lib-usage">
                      <strong>Uso:</strong> Arrays, cálculos matemáticos, estadísticas
                    </div>
                  </div>
                  <div className="lib-item">
                    <h5>📈 TA-Lib</h5>
                    <p>Indicadores técnicos</p>
                    <div className="lib-usage">
                      <strong>Uso:</strong> RSI, MACD, Bollinger Bands, etc.
                    </div>
                  </div>
                  <div className="lib-item">
                    <h5>📊 Matplotlib/Plotly</h5>
                    <p>Visualización de datos</p>
                    <div className="lib-usage">
                      <strong>Uso:</strong> Gráficos de precios, indicadores
                    </div>
                  </div>
                </div>
              ),
              codeExample: `import talib

# Calcular indicadores
df['RSI'] = talib.RSI(df['Close'].values, timeperiod=14)
df['MACD'], df['MACD_signal'], df['MACD_hist'] = talib.MACD(df['Close'].values)
df['BB_upper'], df['BB_middle'], df['BB_lower'] = talib.BBANDS(df['Close'].values)`
            }
          ]
        },
        {
          subtitle: "🔌 Conexiones API",
          sections: [
            {
              heading: "Conectar con Brokers",
              text: "Las APIs permiten obtener datos en tiempo real y ejecutar operaciones automáticamente.",
              points: [],
              customContent: (
                <div className="api-types">
                  <div className="api-type">
                    <h5>🏦 APIs de Brokers</h5>
                    <ul>
                      <li>
                        <strong>MetaTrader:</strong> MT4/MT5 Python integration
                      </li>
                      <li>
                        <strong>Interactive Brokers:</strong> IB API
                      </li>
                      <li>
                        <strong>Alpaca:</strong> Commission-free API
                      </li>
                      <li>
                        <strong>OANDA:</strong> REST API para Forex
                      </li>
                    </ul>
                  </div>
                  <div className="api-type">
                    <h5>📊 APIs de Datos</h5>
                    <ul>
                      <li>
                        <strong>Yahoo Finance:</strong> yfinance library
                      </li>
                      <li>
                        <strong>Alpha Vantage:</strong> Datos históricos y en tiempo real
                      </li>
                      <li>
                        <strong>Quandl:</strong> Datos financieros y económicos
                      </li>
                      <li>
                        <strong>IEX Cloud:</strong> Datos de mercado
                      </li>
                    </ul>
                  </div>
                </div>
              ),
              codeExample: `import oandapyV20
import oandapyV20.endpoints.instruments as instruments

# Configurar cliente
client = oandapyV20.API(access_token="your_token")

# Obtener datos
params = {"count": 100, "granularity": "H1"}
request = instruments.InstrumentsCandles(instrument="EUR_USD", params=params)
response = client.request(request)`
            }
          ]
        },
        {
          subtitle: "🛠️ Entorno de Desarrollo",
          sections: [
            {
              heading: "Configuración del Workspace",
              text: "Un entorno bien configurado es esencial para el desarrollo eficiente de algoritmos.",
              points: [],
              customContent: (
                <div className="dev-tools">
                  <div className="tool-category">
                    <h5>💻 IDEs Recomendados</h5>
                    <ul>
                      <li>
                        <strong>Jupyter Notebook:</strong> Ideal para análisis y prototipado
                      </li>
                      <li>
                        <strong>PyCharm:</strong> IDE completo para desarrollo profesional
                      </li>
                      <li>
                        <strong>VS Code:</strong> Ligero y versátil
                      </li>
                      <li>
                        <strong>Spyder:</strong> Orientado a análisis científico
                      </li>
                    </ul>
                  </div>
                  <div className="tool-category">
                    <h5>📦 Gestión de Paquetes</h5>
                    <ul>
                      <li>
                        <strong>pip:</strong> Instalador de paquetes estándar
                      </li>
                      <li>
                        <strong>conda:</strong> Gestión de entornos y paquetes
                      </li>
                      <li>
                        <strong>virtualenv:</strong> Entornos virtuales aislados
                      </li>
                      <li>
                        <strong>requirements.txt:</strong> Lista de dependencias
                      </li>
                    </ul>
                  </div>
                </div>
              )
            }
          ]
        },
        {
          subtitle: "🎯 Primer Script de Trading",
          sections: [
            {
              heading: "Estrategia Simple: Cruce de Medias",
              text: "Implementemos una estrategia básica para entender los conceptos fundamentales.",
              points: [],
              customContent: (
                <div className="code-example full-example">
                  <pre>
                    <code>{`import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

class SimpleMovingAverageCrossover:
    def __init__(self, short_window=10, long_window=30):
        self.short_window = short_window
        self.long_window = long_window
        
    def generate_signals(self, data):
        # Calcular medias móviles
        data['SMA_short'] = data['Close'].rolling(self.short_window).mean()
        data['SMA_long'] = data['Close'].rolling(self.long_window).mean()
        
        # Generar señales
        data['Signal'] = 0
        data['Signal'][self.short_window:] = np.where(
            data['SMA_short'][self.short_window:] > data['SMA_long'][self.short_window:], 1, 0
        )
        
        # Detectar cambios de señal
        data['Position'] = data['Signal'].diff()
        
        return data
    
    def calculate_returns(self, data):
        # Calcular retornos de la estrategia
        data['Strategy_Returns'] = data['Signal'].shift(1) * data['Close'].pct_change()
        data['Cumulative_Returns'] = (1 + data['Strategy_Returns']).cumprod()
        
        return data

# Uso de la estrategia
strategy = SimpleMovingAverageCrossover(10, 30)
signals = strategy.generate_signals(df)
results = strategy.calculate_returns(signals)`}</code>
                  </pre>
                </div>
              )
            }
          ]
        },
        {
          subtitle: "💡 Tips para Principiantes",
          sections: [
            {
              heading: "",
              text: "",
              points: [],
              customContent: (
                <div className="tips-grid">
                  <div className="tip-item">
                    <span className="tip-icon">📚</span>
                    <p>Comienza con estrategias simples antes de avanzar a algoritmos complejos</p>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">🧪</span>
                    <p>Siempre prueba tus algoritmos con datos históricos primero</p>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">📊</span>
                    <p>Visualiza tus datos y señales para entender mejor el comportamiento</p>
                  </div>
                  <div className="tip-item">
                    <span className="tip-icon">🔄</span>
                    <p>Usa control de versiones (Git) para mantener tu código organizado</p>
                  </div>
                </div>
              )
            }
          ]
        }
      ]
    }
  }

  const material = getMaterial()

  return (
    <div className="study-material-container">
      <div className="study-material-header">
        <div className="material-icon">
          <Brain size={24} className="text-cyan-400" />
        </div>
        <h3 className="material-title">{material.title}</h3>
        <p className="study-subtitle">{material.subtitle}</p>
      </div>

      <div className="study-content">
        {material.content.map((section, index) => (
          <div key={index} className="content-section">
            <h4 className="section-subtitle">{section.subtitle}</h4>
            
            {section.sections.map((subSection, subIndex) => (
              <div key={subIndex} className="concept-box">
                {subSection.heading && <h4>{subSection.heading}</h4>}
                {subSection.text && <p className="section-text">{subSection.text}</p>}
                
                {subSection.customContent}
                
                {subSection.codeExample && (
                  <div className="code-example">
                    <h5>Ejemplo:</h5>
                    <pre>
                      <code>{subSection.codeExample}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="study-footer">
        <div className="study-tip">
          <span className="tip-icon">💡</span>
          <span className="tip-text">Practica estos conceptos con ejemplos reales para mejorar tu comprensión</span>
        </div>
      </div>
    </div>
  )
}

export default AlgorithmicTradingBasics