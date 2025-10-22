/* eslint-disable no-unused-vars */
import axios from "axios"
import { jwtDecode } from "jwt-decode"

//  CONFIGURACIÓN DE API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
  headers: {
    "Content-Type": "application/json",
  },
})

//  INTERCEPTOR  PARA TOKENS
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
    })

    return config
  },
  (error) => {
    console.error("❌ Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// INTERCEPTOR PARA RESPUESTAS
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    })
    return response
  },
  (error) => {
    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    })

    if (error.response?.status === 401) {
      localStorage.removeItem("authToken")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

//  FUNCIONES DE FALLBACK
const generateFallbackData = (symbol, timeframe, count) => {
  console.log(`🔄 Generando datos de fallback para ${symbol}`)

  const basePrices = {
    EURUSD: 1.085,
    GBPUSD: 1.265,
    USDJPY: 148.5,
    AUDUSD: 0.675,
    USDCHF: 0.895,
    USDCAD: 1.345,
    EURJPY: 161.2,
    GBPJPY: 187.8,
  }

  const basePrice = basePrices[symbol] || 1.085
  const candles = []
  let currentPrice = basePrice

  for (let i = 0; i < count; i++) {
    const time = new Date(Date.now() - (count - i) * 60 * 60 * 1000)
    const volatility = symbol.includes("JPY") ? 0.3 : 0.0003
    const change = (Math.random() - 0.5) * volatility

    currentPrice += change
    currentPrice = Math.max(currentPrice, 0.0001)

    const open = currentPrice
    const high = currentPrice + Math.random() * volatility * 0.5
    const low = currentPrice - Math.random() * volatility * 0.5
    const close = currentPrice + (Math.random() - 0.5) * volatility * 0.3

    candles.push({
      time: time.toISOString(),
      open: Number.parseFloat(open.toFixed(symbol.includes("JPY") ? 2 : 5)),
      high: Number.parseFloat(high.toFixed(symbol.includes("JPY") ? 2 : 5)),
      low: Number.parseFloat(low.toFixed(symbol.includes("JPY") ? 2 : 5)),
      close: Number.parseFloat(close.toFixed(symbol.includes("JPY") ? 2 : 5)),
      volume: Math.floor(Math.random() * 2000) + 500,
    })

    currentPrice = close
  }

  const lastCandle = candles[candles.length - 1]

  return {
    symbol,
    timeframe,
    count,
    data: { candles },
    price: lastCandle.close,
    timestamp: new Date().toISOString(),
    source: "fallback_simulation",
  }
}

const generateMockSignals = (count = 10) => {
  const pairs = ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"]
  const signalTypes = ["buy", "sell"]
  const timeframes = ["M15", "M30", "H1", "H4", "D1"]
  const signals = []

  for (let i = 0; i < count; i++) {
    const symbol = pairs[Math.floor(Math.random() * pairs.length)]
    const signalType = signalTypes[Math.floor(Math.random() * signalTypes.length)]
    const basePrice = symbol === "EURUSD" ? 1.085 : symbol === "GBPUSD" ? 1.265 : 148.5

    signals.push({
      _id: `mock_signal_${i}`,
      id: `mock_signal_${i}`,
      symbol: symbol,
      signal_type: signalType,
      confluence_score: Math.random() * 0.4 + 0.6,
      entry_price: basePrice + (Math.random() - 0.5) * 0.01,
      stop_loss: signalType === "buy" ? basePrice - 0.005 : basePrice + 0.005,
      take_profit: signalType === "buy" ? basePrice + 0.01 : basePrice - 0.01,
      timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
      status: "ACTIVE",
      created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      technical_analyses: [
        {
          type: "elliott_wave",
          confidence: Math.random(),
          description: "Elliott Wave Analysis",
          data: {
            direction: signalType === "buy" ? "bullish" : "bearish",
            market_state: "completion_wave_5",
            pattern: {
              waves: [
                { price: basePrice - 0.01, type: "impulse" },
                { price: basePrice - 0.005, type: "correction" },
                { price: basePrice + 0.005, type: "impulse" },
                { price: basePrice, type: "correction" },
                { price: basePrice + 0.01, type: "impulse" },
              ],
            },
            targets: [
              {
                price: signalType === "buy" ? basePrice + 0.015 : basePrice - 0.015,
                probability: 0.7,
                type: "primary",
              },
            ],
          },
        },
      ],
    })
  }

  return signals
}

// ✅ AGREGAR MÉTODOS PERSONALIZADOS A LA INSTANCIA DE AXIOS
//  AUTENTICACIÓN

api.login = async function(email, password) {
  try {
    const response = await api.post("/api/auth/login", { email, password })
    const data = response.data

    localStorage.setItem("authToken", data.access_token)
    localStorage.setItem("refreshToken", data.refresh_token)
    localStorage.setItem("userId", data.user_id)
    localStorage.setItem("username", data.username)
    localStorage.setItem("email", data.email)

    return data
  } catch (error) {
    console.error("❌ Error en login:", error)
    throw error
  }
}

api.register = async function(userData) {
  try {
    const response = await api.post("/api/auth/register", userData)
    return response.data
  } catch (error) {
    console.error("❌ Error en registro:", error)
    throw error
  }
}

//  MT5 CONEXIÓN Y CUENTA

api.connectMT5Account = async function({ login, password, server, account_type, remember = false }) {
  try {
    const response = await api.post("/api/mt5/connect", { login, password, server, account_type, remember })
    return response.data
  } catch (error) {
    console.error("❌ Error conectando MT5:", error)
    throw error
  }
}

api.autoConnectMT5 = async function() {
  try {
    const response = await api.post("/api/mt5/autoconnect")
    return response.data
  } catch (error) {
    console.error("❌ Error autoconectando MT5:", error)
    throw error
  }
}

api.disconnectMT5Account = async function() {
  try {
    const response = await api.post("/api/mt5/disconnect")
    return response.data
  } catch (error) {
    console.error("❌ Error desconectando MT5:", error)
    throw error
  }
}

api.getMT5Status = async function() {
  try {
    const response = await api.get("/api/mt5/status")
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo estado MT5:", error)
    throw error
  }
}

api.getMT5AccountInfo = async function(userId) {
  try {
    const response = await api.get(`/api/mt5/account`, { params: { user_id: userId } })
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo info de cuenta MT5:", error)
    throw error
  }
}

//  MT5 PERFIL DE USUARIO

api.saveMT5Profile = async function({ login, server, account_type }) {
  try {
    const response = await api.post("/api/mt5/profile/save", { login, server, account_type })
    return response.data
  } catch (error) {
    console.error("❌ Error guardando perfil MT5:", error)
    throw error
  }
}

api.deleteMT5Profile = async function() {
  try {
    const response = await api.delete("/api/mt5/profile")
    return response.data
  } catch (error) {
    console.error("❌ Error eliminando perfil MT5:", error)
    throw error
  }
}

//  MT5 DATOS DE MERCADO

api.getMT5Data = async function(symbol, timeframe = "H1", count = 100) {
  try {
    console.log(`🔄 Llamando al backend: ${API_BASE_URL}/api/mt5/data`)

    const response = await api.post("/api/mt5/data", {
      symbol,
      timeframe,
      count,
    })

    if (response.data) {
      console.log(`✅ Respuesta del backend para ${symbol}:`, response.data)

      return {
        symbol: response.data.symbol || symbol,
        timeframe: response.data.timeframe || timeframe,
        count: response.data.count || count,
        data: response.data.data || response.data,
        price:
          response.data.price ||
          (response.data.data?.candles
            ? response.data.data.candles[response.data.data.candles.length - 1]?.close
            : null),
        timestamp: response.data.timestamp || new Date().toISOString(),
        source: response.data.source || "mt5_api",
      }
    }
  } catch (error) {
    console.error(`❌ Error llamando al backend para ${symbol}:`, error)
    console.log("🔄 Usando datos de fallback...")
    return generateFallbackData(symbol, timeframe, count)
  }
}

api.getCurrentPrice = async function(symbol) {
  try {
    const response = await api.get(`/api/mt5/price/${symbol}`)
    return {
      symbol,
      price: response.data.price,
      timestamp: response.data.timestamp || new Date().toISOString(),
      source: "mt5_live",
    }
  } catch (error) {
    console.error(`❌ Error obteniendo precio actual para ${symbol}:`, error)

    const data = await api.getMT5Data(symbol, "M1", 1)
    return {
      symbol,
      price: data.price,
      timestamp: data.timestamp,
      source: data.source,
    }
  }
}

api.getMultiplePairPrices = async function(symbols) {
  const promises = symbols.map((symbol) => api.getCurrentPrice(symbol))
  const results = await Promise.allSettled(promises)

  const prices = {}
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      prices[symbols[index]] = result.value
    } else {
      console.error(`Error obteniendo precio para ${symbols[index]}:`, result.reason)
    }
  })

  return prices
}

//  MT5 TRADING Y ÓRDENES

api.executeOrder = async function(orderData) {
  try {
    const response = await api.post("/api/mt5/execute", orderData)
    return {
      success: response.data.success || false,
      ticket: response.data.ticket || response.data.order_id,
      error: response.data.error,
    }
  } catch (error) {
    console.error("❌ Error ejecutando orden:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

api.getUserOrders = async function() {
  try {
    const response = await api.get("/api/mt5/orders")
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo órdenes:", error)
    return { orders: [] }
  }
}

api.getOpenPositions = async function() {
  try {
    const response = await api.get("/api/mt5/positions")
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo posiciones:", error)
    return { positions: [] }
  }
}

//  CONFIGURACIÓN DE IA

api.saveAISettings = async function(aiSettings) {
  try {
    console.log("🔄 Guardando configuración de IA específica:", aiSettings)

    const response = await api.post("/api/mt5/ai-settings/save", aiSettings)

    return {
      success: response.data.success,
      ai_settings: response.data.ai_settings,
      message: response.data.message,
      timestamp: response.data.timestamp,
    }
  } catch (error) {
    console.error("❌ Error guardando configuración de IA:", error)
    throw error
  }
}

api.loadAISettings = async function() {
  try {
    console.log("🔄 Cargando configuración de IA específica...")

    const response = await api.get("/api/mt5/ai-settings/load")

    return {
      success: response.data.success,
      ai_settings: response.data.ai_settings,
      message: response.data.message,
      timestamp: response.data.timestamp,
    }
  } catch (error) {
    console.error("❌ Error cargando configuración de IA:", error)
    throw error
  }
}

api.resetAISettings = async function() {
  try {
    console.log("🔄 Reseteando configuración de IA...")

    const response = await api.delete("/api/mt5/ai-settings/reset")

    return {
      success: response.data.success,
      ai_settings: response.data.ai_settings,
      message: response.data.message,
      timestamp: response.data.timestamp,
    }
  } catch (error) {
    console.error("❌ Error reseteando configuración de IA:", error)
    throw error
  }
}

//  SEÑALES Y ANÁLISIS

api.getAvailablePairs = async function() {
  try {
    const response = await api.get("/api/signals/signals/pairs/")
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo pares disponibles:", error)
    throw error
  }
}

api.getInitialSignals = async function(limit = 80) {
  try {
    const response = await api.get("/api/signals/signals/", {
      params: { limit },
    })
    return {
      signals: response.data.signals || response.data.data || response.data || [],
    }
  } catch (error) {
    console.error("❌ Error obteniendo señales iniciales:", error)
    return {
      signals: generateMockSignals(limit),
    }
  }
}

api.analyzePair = async function(pair, timeframe, config = null) {
  try {
    const strategyMapping = {
      algorithmic_trading: "algorithmic",
      swing_trading_advanced: "swing_trading",
      position_trading_advanced: "position_trading",
      pairs_trading_advanced: "pairs_trading",
      mean_reversion_advanced: "mean_reversion",
      social_trading_advanced: "social_trading",
      carry_trade_advanced: "carry_trade",
      hedging_advanced: "hedging",
      pyramiding_advanced: "pyramiding",
    }

    const defaultConfig = {
      timeframe: "H1",
      confluence_threshold: 0.6,
      trader_type: "swing_trader",
      trading_strategy: "algorithmic",

      enable_elliott_wave: true,
      enable_fibonacci: true,
      enable_chart_patterns: true,
      enable_support_resistance: true,

      elliott_wave_weight: 0.25,
      fibonacci_weight: 0.25,
      chart_patterns_weight: 0.3,
      support_resistance_weight: 0.2,

      total_capital: 10000.0,
      risk_percentage: 2.0,
      max_risk_amount: 200.0,
      atr_multiplier_sl: 2.0,
      risk_reward_ratio: 2.0,
    }

    const timeframeMapping = {
      "1m": "M1",
      M1: "M1",
      "5m": "M5",
      M5: "M5",
      "15m": "M15",
      M15: "M15",
      "30m": "M30",
      M30: "M30",
      "1h": "H1",
      H1: "H1",
      "60m": "H1",
      "4h": "H4",
      H4: "H4",
      "1d": "D1",
      D1: "D1",
      daily: "D1",
      "1w": "W1",
      W1: "W1",
      weekly: "W1",
    }

    const normalizedTimeframe =
      timeframeMapping[String(timeframe).toLowerCase()] || timeframeMapping[String(timeframe).toUpperCase()] || "H1"

    const finalConfig = {
      ...defaultConfig,
      ...config,
      timeframe: normalizedTimeframe,
    }

    if (finalConfig.trading_strategy && strategyMapping[finalConfig.trading_strategy]) {
      finalConfig.trading_strategy = strategyMapping[finalConfig.trading_strategy]
    }

    const validStrategies = [
      "maleta",
      "swing_trading",
      "position_trading",
      "algorithmic",
      "pairs_trading",
      "mean_reversion",
      "social_trading",
      "carry_trade",
      "hedging",
      "pyramiding",
    ]
    if (!validStrategies.includes(finalConfig.trading_strategy)) {
      console.warn(`⚠️ Estrategia inválida: ${finalConfig.trading_strategy}, usando 'algorithmic' por defecto`)
      finalConfig.trading_strategy = "algorithmic"
    }

    console.log("🔄 Enviando análisis con configuración:", {
      pair,
      timeframe: normalizedTimeframe,
      config: finalConfig,
    })

    const response = await api.post(`/api/signals/signals/analyze/${pair}`, finalConfig)

    console.log("✅ Respuesta del análisis:", {
      status: response.status,
      timeframe: response.data.timeframe,
      signals: response.data.signals?.length || 0,
    })

    return response.data
  } catch (error) {
    console.error("❌ Error en analyzePair:", {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
      pair,
      timeframe,
    })

    if (error.response?.status === 422) {
      const errorDetails = error.response.data?.detail || error.response.data
      console.error("❌ Error de validación 422:", errorDetails)

      throw new Error(`Error de validación: ${JSON.stringify(errorDetails)}`)
    }

    throw error
  }
}

api.updateSignalSettings = async function(settings) {
  try {
    const response = await api.post("/api/signals/settings/", settings)
    return response.data
  } catch (error) {
    console.error("❌ Error actualizando configuración:", error)
    throw error
  }
}

api.deleteSignal = async function(signalId) {
  try {
    const response = await api.delete(`/api/signals/${signalId}`)
    return response.data
  } catch (error) {
    console.error("❌ Error eliminando señal:", error)
    throw error
  }
}

api.getSignals = async function(pair, timeframe, limit = 50) {
  try {
    const response = await api.get(`/signals/${pair}/${timeframe}`, {
      params: { limit },
    })
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo señales:", error)
    return { signals: [] }
  }
}

//  GRÁFICOS Y VISUALIZACIÓN

api.generateChartImage = async function(signalData) {
  try {
    const response = await api.post("/api/charts/generate", signalData, {
      timeout: 60000,
    })

    return {
      chart_image_url:
        response.data.chart_image_url ||
        response.data.image_url ||
        response.data.url,
    }
  } catch (error) {
    console.error("❌ Error generando imagen:", error)

    const errorMessage =
      error.code === "ECONNABORTED"
        ? "Timeout excedido al generar gráfico"
        : error.message

    return {
      chart_image_url: null,
      error: errorMessage,
    }
  }
}

api.testChartGeneration = async function() {
  try {
    const response = await api.get("/api/charts/test")
    return response.data
  } catch (error) {
    console.error("❌ Error en test de gráficos:", error)
    return { success: false, error: error.message }
  }
}

//  GESTIÓN DE RIESGO

api.getRiskLockStatus = async function() {
  try {
    const response = await api.get("/api/auth/risk/status")
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo estado de riesgo:", error)
    throw error
  }
}

api.lockRiskConfiguration = async function({
  total_capital,
  risk_percentage,
  source = "mt5",
  mt5_snapshot = null,
  extended_risk_config,
}) {
  try {
    const response = await api.post("/api/auth/risk/lock", {
      total_capital,
      risk_percentage,
      source,
      mt5_snapshot,
      extended_risk_config: extended_risk_config
        ? {
            max_daily_loss_percent: extended_risk_config.maxDailyLossPercent,
            max_weekly_loss_percent: extended_risk_config.maxWeeklyLossPercent,
            max_daily_profit_percent: extended_risk_config.maxDailyProfitPercent,
            max_open_trades: extended_risk_config.maxOpenTrades,
            min_rrr: extended_risk_config.minRRR,
            max_losing_streak: extended_risk_config.maxLosingStreak,
            cool_down_hours: extended_risk_config.coolDownHours,
            risk_by_strategy: extended_risk_config.riskByStrategy
              ? {
                  scalping: extended_risk_config.riskByStrategy.scalping?.riskPercent || 0,
                  day_trading: extended_risk_config.riskByStrategy.day_trading?.riskPercent || 0,
                  swing_trading: extended_risk_config.riskByStrategy.swing_trading?.riskPercent || 0,
                  position_trading: extended_risk_config.riskByStrategy.position_trading?.riskPercent || 0,
                  maleta: extended_risk_config.riskByStrategy.maleta?.riskPercent || 0,
                }
              : null,
          }
        : null,
    })
    return response.data
  } catch (error) {
    console.error("❌ Error bloqueando configuración de riesgo:", error)
    throw error
  }
}

//  UTILIDADES Y SISTEMA

api.getSystemStatus = async function() {
  try {
    const response = await api.get("/api/status")
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo estado del sistema:", error)
    return { status: "unknown", mt5_connected: false }
  }
}

api.getHealthCheck = async function() {
  try {
    const response = await api.get("/health")
    return response.data
  } catch (error) {
    console.error("❌ Error en health check:", error)
    return { status: "error" }
  }
}

api.testMT5Integration = async function() {
  try {
    const response = await api.get("/api/test/mt5")
    return response.data
  } catch (error) {
    console.error("❌ Error en test MT5:", error)
    return { connected: false, error: error.message }
  }
}

api.reconnectMT5 = async function() {
  try {
    const response = await api.post("/api/admin/reconnect-mt5")
    return response.data
  } catch (error) {
    console.error("❌ Error reconectando MT5:", error)
    return { success: false, error: error.message }
  }
}

api.validateConnection = async function() {
  try {
    const response = await api.get("/health", { timeout: 5000 })
    return { connected: true, status: response.data }
  } catch (error) {
    return { connected: false, error: error.message }
  }
}

//  DATOS ADICIONALES

api.getRealTimeData = async function() {
  try {
    const response = await api.get("/market-data/realtime")
    return response
  } catch (error) {
    console.warn("Real-time data not available, using fallback")
    return { data: [], timestamp: new Date().toISOString() }
  }
}

api.getNews = async function() {
  try {
    const response = await api.get("/news")
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo noticias:", error)
    return { news: [] }
  }
}

//  UTILIDADES DE CONFIGURACIÓN

api.validateAISettings = function(aiSettings) {
  const errors = []

  if (aiSettings.confluence_threshold < 0 || aiSettings.confluence_threshold > 1) {
    errors.push("El umbral de confluencia debe estar entre 0 y 1")
  }

  if (aiSettings.risk_per_trade <= 0 || aiSettings.risk_per_trade > 10) {
    errors.push("El riesgo por operación debe estar entre 0.1% y 10%")
  }

  if (aiSettings.lot_size <= 0) {
    errors.push("El tamaño del lote debe ser mayor a 0")
  }

  const totalWeight =
    aiSettings.elliott_wave_weight +
    aiSettings.fibonacci_weight +
    aiSettings.chart_patterns_weight +
    aiSettings.support_resistance_weight

  if (Math.abs(totalWeight - 1.0) > 0.01) {
    errors.push("Los pesos de análisis deben sumar 1.0 (100%)")
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  }
}

api.getDefaultAISettings = function() {
  return {
    timeframe: "H1",
    confluence_threshold: 0.6,
    risk_per_trade: 2.0,
    lot_size: 0.1,
    atr_multiplier_sl: 2.0,
    risk_reward_ratio: 2.0,

    enable_elliott_wave: true,
    enable_fibonacci: true,
    enable_chart_patterns: true,
    enable_support_resistance: true,

    elliott_wave_weight: 0.25,
    fibonacci_weight: 0.25,
    chart_patterns_weight: 0.25,
    support_resistance_weight: 0.25,

    trader_type: null,
    trader_timeframes: ["H1"],
    trading_strategy: null,
    strategy_timeframes: ["H1"],
    execution_type: "market",
    allowed_execution_types: ["market"],
    combined_timeframes: [],
    custom_weights: {},
    risk_management_locked: false,
  }
}

api.isTokenExpired = function(token) {
  try {
    const decoded = jwtDecode(token)
    return decoded.exp < Date.now() / 1000
  } catch {
    return true
  }
}

api.generateMockSignal = function(symbol, timeframe) {
  const basePrice = symbol === "EURUSD" ? 1.085 : symbol === "GBPUSD" ? 1.265 : 148.5
  const signalType = Math.random() > 0.5 ? "buy" : "sell"

  return {
    _id: `new_signal_${Date.now()}`,
    id: `new_signal_${Date.now()}`,
    symbol: symbol,
    signal_type: signalType,
    confluence_score: Math.random() * 0.3 + 0.7,
    entry_price: basePrice + (Math.random() - 0.5) * 0.01,
    stop_loss: signalType === "buy" ? basePrice - 0.005 : basePrice + 0.005,
    take_profit: signalType === "buy" ? basePrice + 0.01 : basePrice - 0.01,
    timeframe: timeframe,
    status: "ACTIVE",
    created_at: new Date().toISOString(),
    technical_analyses: [
      {
        type: "elliott_wave",
        confidence: 0.8,
        description: "Elliott Wave Analysis",
        data: {
          pattern: { direction: signalType === "buy" ? "bullish" : "bearish" },
          market_state: "completion_wave_5",
        },
      },
    ],
  }
}

//  CURSOS Y RESPUESTAS

api.saveCourseAnswer = async function(courseId, volumeId, questionId, selectedAnswer, isCorrect, timeSpent, points) {
  try {
    console.log("[v0] Saving course answer:", {
      courseId,
      volumeId,
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpent,
      points,
    })

    const answerData = {
      course_id: courseId,
      volume_id: volumeId,
      question_id: questionId,
      answer: selectedAnswer,
      is_correct: isCorrect,
      time_spent: timeSpent,
      points_earned: points || (isCorrect ? 10 : 0),
      timestamp: new Date().toISOString(),
    }

    const response = await api.post("/api/courses/answers", answerData)

    console.log("[v0] Course answer saved successfully:", response)
    return response.data
  } catch (error) {
    console.error("[v0] Error saving course answer:", error)

    if (error.response?.status === 400) {
      throw new Error("Esta pregunta ya fue respondida anteriormente")
    } else if (error.response?.status === 404) {
      throw new Error("Curso no encontrado")
    } else if (error.response?.status === 500) {
      throw new Error("Error interno del servidor al guardar la respuesta")
    } else {
      throw new Error("Error de conexión al guardar la respuesta")
    }
  }
}

api.getCourseProgress = async function(courseId) {
  try {
    const response = await api.get(`/api/courses/${courseId}/progress`)
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo progreso del curso:", error)
    return {
      course_id: courseId,
      total_progress: 0,
      volumes_progress: {},
      completed_questions: [],
      total_questions: 0,
      correct_answers: 0,
    }
  }
}

api.getVolumeProgress = async function(courseId, volumeId) {
  try {
    const response = await api.get(`/api/courses/${courseId}/volumes/${volumeId}/progress`)
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo progreso del volumen:", error)
    
    if (error.response?.status === 404) {
      console.log("⚠️ Endpoint de volumen no encontrado, usando datos por defecto")
      return {
        volume_id: volumeId,
        progress: 0,
        completed_questions: [],
        total_questions: 10,
        correct_answers: 0,
        is_completed: false,
      }
    }
    
    throw error
  }
}

api.getUserCourses = async function() {
  try {
    const response = await api.get("/api/courses/user")
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo cursos del usuario:", error)
    return {
      courses: [],
      total_courses: 0,
      completed_courses: 0,
      in_progress_courses: 0,
    }
  }
}

api.startCourse = async function(courseId) {
  try {
    const response = await api.post(`/api/courses/${courseId}/start`)
    return response.data
  } catch (error) {
    console.error("❌ Error iniciando curso:", error)
    throw error
  }
}

api.completeCourse = async function(courseId) {
  try {
    const response = await api.post(`/api/courses/${courseId}/complete`)
    return response.data
  } catch (error) {
    console.error("❌ Error completando curso:", error)
    throw error
  }
}

api.getCourseAnswers = async function(courseId, volumeId = null) {
  try {
    const params = volumeId ? { volume_id: volumeId } : {}
    const response = await api.get(`/api/courses/${courseId}/answers`, { params })
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo respuestas del curso:", error)
    return {
      answers: [],
      total_answers: 0,
    }
  }
}

api.checkAnswerExists = async function(courseId, volumeId, questionId) {
  try {
    const response = await api.get(`/api/courses/${courseId}/answers/check`, {
      params: {
        volume_id: volumeId,
        question_id: questionId,
      },
    })
    return response.data.exists || false
  } catch (error) {
    console.error("❌ Error verificando respuesta existente:", error)
    return false
  }
}

api.getCoursesStats = async function() {
  try {
    const response = await api.get("/api/courses/stats")
    return response.data
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas de cursos:", error)
    return {
      total_courses: 0,
      completed_courses: 0,
      in_progress_courses: 0,
      total_questions_answered: 0,
      correct_answers_percentage: 0,
      average_course_completion: 0,
    }
  }
}

// ✅ EXPORTAR LA INSTANCIA DE AXIOS CON TODOS LOS MÉTODOS AGREGADOS
export default api