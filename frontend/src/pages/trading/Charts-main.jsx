"use client"

/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  LinearProgress,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  CircularProgress,
  Fab,
} from "@mui/material"
import { ShowChart, Refresh, Settings, SmartToy, Psychology, Star, Warning, Assessment } from "@mui/icons-material"
import api from "../../api/index"
import "./charts.css"
import SettingsDialog from "../settings/settings-dialog"
import SignalDetailsDialog from "../../components/signalDetail/SignalDetailsDialog"

// ✅ ErrorBoundary simple integrado
class ChartErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Chart Error Boundary:", error, errorInfo)
    this.setState({ errorInfo })
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    // Forzar recarga del gráfico
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            height: 600,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
          }}
        >
          <Warning sx={{ fontSize: 64, color: "#ffaa00" }} />
          <Typography variant="h6" sx={{ color: "#ffffff" }}>
            Error en el gráfico
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {this.state.error?.message || "Error desconocido"}
          </Typography>
          <Button
            variant="outlined"
            onClick={this.resetErrorBoundary}
            sx={{
              borderColor: "#00ffff",
              color: "#00ffff",
              "&:hover": { backgroundColor: "rgba(0,255,255,0.1)" },
            }}
          >
            Reintentar
          </Button>
        </Box>
      )
    }

    return this.props.children
  }
}

const Charts = () => {
  const user = useSelector((state) => state.auth.user)

  // ✅ Referencias mejoradas
  const wsRef = useRef(null)
  const mountedRef = useRef(true)
  const priceUpdateIntervalRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  const chartInstanceRef = useRef(null)
  const chartContainerRef = useRef(null)
  const candlestickSeriesRef = useRef(null)
  const loadingRef = useRef(false)
  const initialLoadDoneRef = useRef(false)
  const changeTimeoutRef = useRef(null)
  const isDestroyingRef = useRef(false)
  const isCreatingRef = useRef(false)
  const indicatorChangeTimeoutRef = useRef(null)

  // Add ref for drawing series
  const drawingSeriesRef = useRef([])

  const indicatorSeriesRef = useRef({
    sma20: null,
    sma50: null,
    ema20: null,
    rsi: null,
    macd: null,
    macdSignal: null,
    macdHistogram: null,
    bollingerUpper: null,
    bollingerMiddle: null,
    bollingerLower: null,
  })

  // Estados principales
  const [selectedPair, setSelectedPair] = useState("EURUSD")
  // ✅ MODIFICADO: timeframe solo para visualización del gráfico
  const [timeframe, setTimeframe] = useState("H1")
  const [chartType, setChartType] = useState("candlestick")
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [chartKey, setChartKey] = useState(0)
  const [isChartReady, setIsChartReady] = useState(false)
  const [chartRawData, setChartRawData] = useState(null)
  const [signals, setSignals] = useState([])
  const [chartAnnotations, setChartAnnotations] = useState([])
  const [availablePairs, setAvailablePairs] = useState([
    "EURUSD",
    "GBPUSD",
    "USDJPY",
    "AUDUSD",
    "USDCHF",
    "USDCAD",
    "EURJPY",
    "GBPJPY",
  ])

  // ✅ NUEVOS Estados para tiempo real mejorado
  const [realTimePrice, setRealTimePrice] = useState(null)
  const [lastPriceUpdate, setLastPriceUpdate] = useState(null)
  const [priceLatency, setPriceLatency] = useState(0)
  const [dataFreshness, setDataFreshness] = useState("stale") // 'fresh', 'recent', 'stale'
  const [tickCount, setTickCount] = useState(0)
  const [priceHistory, setPriceHistory] = useState([])
  const [connectionQuality, setConnectionQuality] = useState("good") // 'excellent', 'good', 'poor', 'disconnected'
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [realtimeEnabled, setRealtimeEnabled] = useState(true) // Estado para habilitar/deshabilitar tiempo real
  const [connectionStatus, setConnectionStatus] = useState("disconnected") // Estado de la conexión websocket

  // Estados existentes
  const [mt5Data, setMt5Data] = useState(null)
  const [chartImageUrl, setChartImageUrl] = useState(null)
  const [chartImageLoading, setChartImageLoading] = useState(false)
  const [chartImageError, setChartImageError] = useState(false)
  const [multiPairPrices, setMultiPairPrices] = useState({})
  const [selectedSignalDetails, setSelectedSignalDetails] = useState(null)
  const [signalDetailsOpen, setSignalDetailsOpen] = useState(false)
  const [imageGenerationAttempted, setImageGenerationAttempted] = useState(false)
  const [currentSignalId, setCurrentSignalId] = useState(null)
  const [mt5Session, setMt5Session] = useState(null)
  const [riskLocked, setRiskLocked] = useState(false)
  // Estados de UI
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" })
  const [watchlist, setWatchlist] = useState(["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"])

  // Add drawing tools state
  const [drawingMode, setDrawingMode] = useState(null) // 'line', 'horizontal', 'vertical', 'rectangle', 'fibonacci'
  const [drawings, setDrawings] = useState([])
  const [currentDrawing, setCurrentDrawing] = useState(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const drawingStartPoint = useRef(null)

  // Configuración de indicadores
  const [indicators, setIndicators] = useState({
    sma20: true,
    sma50: false,
    ema20: false,
    rsi: false,
    macd: false,
    bollinger: false,
    fibonacci: false,
    support_resistance: true,
  })

  // ✅ NUEVA Configuración de tiempo real
  const [realtimeSettings, setRealtimeSettings] = useState({
    updateInterval: 1000, // 1 segundo por defecto
    maxRetries: 5,
    reconnectDelay: 2000,
    dataValidationTimeout: 5000,
    enableTickByTick: true,
    priceHistoryLimit: 100,
  })

  // ✅ NUEVO: Estado para gestión de riesgo
  const [riskManagement, setRiskManagement] = useState({
    totalCapital: 10000,
    riskPercentage: 2,
    isLocked: false,
    calculatedLotSize: 0.1,
    maxRiskAmount: 200,
  })

  // ✅ MODIFICADO: Estado para configuración de IA con temporalidad incluida
  const [aiSettings, setAiSettings] = useState({
    // ✅ NUEVO: Temporalidad para análisis (independiente del gráfico)
    analysisTimeframe: "H1",
    confluenceThreshold: 0.6,
    enabledAnalyses: ["elliott_wave", "fibonacci", "support_resistance"],
    elliottWaveWeight: 0.25,
    fibonacciWeight: 0.25,
    chartPatternsWeight: 0.25,
    supportResistanceWeight: 0.25,
  })

  // ✅ NUEVO: Estado para configuraciones de riesgo extendido
  const [extendedRiskManagement, setExtendedRiskManagement] = useState({
    maxDailyLossPercent: 5,
    maxWeeklyLossPercent: 15,
    maxDailyProfitPercent: 10,
    maxOpenTrades: 5,
    minRRR: 2,
    maxLosingStreak: 3,
    coolDownHours: 4,
    riskByStrategy: {
      scalping: { riskPercent: 1, maxTrades: 5 },
      day_trading: { riskPercent: 2, maxTrades: 3 },
      swing_trading: { riskPercent: 2, maxTrades: 2 },
      position_trading: { riskPercent: 3, maxTrades: 1 },
      maleta: { riskPercent: 2, maxTrades: 2 },
    },
  })

  const timeframes = [
    { value: "M1", label: "1 Minuto" },
    { value: "M5", label: "5 Minutos" },
    { value: "M15", label: "15 Minutos" },
    { value: "M30", label: "30 Minutos" },
    { value: "H1", label: "1 Hora" },
    { value: "H4", label: "4 Horas" },
    { value: "D1", label: "1 Día" },
    { value: "W1", label: "1 Semana" },
  ]

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity })
  }
  const showSnackbarRef = useRef(showSnackbar)
  useEffect(() => {
    showSnackbarRef.current = showSnackbar
  }, [])

  const validateDataFreshness = useCallback((timestamp) => {
    if (!timestamp) return "stale"
    const now = Date.now()
    const dataAge = now - new Date(timestamp).getTime()
    if (dataAge < 2000) return "fresh"
    if (dataAge < 10000) return "recent"
    return "stale"
  }, [])

  const calculateLatency = useCallback((requestTime, responseTime) => {
    if (!requestTime || !responseTime) return 0
    return responseTime - requestTime
  }, [])

  const calculateLotSize = useCallback((signal, riskConfig) => {
    if (!signal || !signal.entry_price || !signal.stop_loss || !riskConfig) {
      return 0.1
    }
    try {
      const entryPrice = signal.entry_price
      const stopLoss = signal.stop_loss
      const priceDifference = Math.abs(entryPrice - stopLoss)
      const isJPY = signal.symbol.includes("JPY")
      const pipValue = isJPY ? 0.01 : 0.0001
      const pipsDistance = priceDifference / pipValue
      const maxRiskAmount = (riskConfig.totalCapital * riskConfig.riskPercentage) / 100
      let pipValueUSD = 1
      if (isJPY) {
        pipValueUSD = 0.91
      } else if (signal.symbol.startsWith("GBP")) {
        pipValueUSD = 1.25
      }
      const calculatedLot = maxRiskAmount / (pipsDistance * pipValueUSD)
      const finalLot = Math.max(0.01, Math.min(calculatedLot, 10))
      return Number.parseFloat(finalLot.toFixed(2))
    } catch (error) {
      console.error("Error calculando tamaño del lote:", error)
      return 0.1
    }
  }, [])

  const evaluateConnectionQuality = useCallback((latency, successRate) => {
    if (successRate < 0.5) return "disconnected"
    if (latency > 2000 || successRate < 0.8) return "poor"
    if (latency > 1000 || successRate < 0.95) return "good"
    return "excellent"
  }, [])

  const calculateSMA = useCallback((data, period) => {
    const result = []
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        continue
      }
      let sum = 0
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close
      }
      result.push({
        time: data[i].time,
        value: sum / period,
      })
    }
    return result
  }, [])

  const calculateEMA = useCallback((data, period) => {
    const result = []
    const multiplier = 2 / (period + 1)

    // Calculate initial SMA for first EMA value
    let sum = 0
    for (let i = 0; i < period; i++) {
      sum += data[i].close
    }
    let ema = sum / period
    result.push({ time: data[period - 1].time, value: ema })

    // Calculate EMA for remaining values
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema
      result.push({ time: data[i].time, value: ema })
    }

    return result
  }, [])

  const calculateRSI = useCallback((data, period = 14) => {
    const result = []
    const changes = []

    for (let i = 1; i < data.length; i++) {
      changes.push(data[i].close - data[i - 1].close)
    }

    for (let i = period; i < changes.length; i++) {
      let gains = 0
      let losses = 0

      for (let j = i - period; j < i; j++) {
        if (changes[j] > 0) gains += changes[j]
        else losses -= changes[j]
      }

      const avgGain = gains / period
      const avgLoss = losses / period
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      const rsi = 100 - 100 / (1 + rs)

      result.push({
        time: data[i + 1].time,
        value: rsi,
      })
    }

    return result
  }, [])

  const calculateMACD = useCallback(
    (data) => {
      const ema12 = calculateEMA(data, 12)
      const ema26 = calculateEMA(data, 26)

      const macdLine = []
      const minLength = Math.min(ema12.length, ema26.length)

      for (let i = 0; i < minLength; i++) {
        macdLine.push({
          time: ema12[i].time,
          value: ema12[i].value - ema26[i].value,
        })
      }

      // Calculate signal line (9-period EMA of MACD)
      const signalLine = calculateEMA(
        macdLine.map((item) => ({ close: item.value, time: item.time })),
        9,
      )

      // Calculate histogram
      const histogram = []
      for (let i = 0; i < signalLine.length; i++) {
        const macdValue = macdLine.find((m) => m.time === signalLine[i].time)
        if (macdValue) {
          histogram.push({
            time: signalLine[i].time,
            value: macdValue.value - signalLine[i].value,
          })
        }
      }

      return { macdLine, signalLine, histogram }
    },
    [calculateEMA],
  )

  const calculateBollingerBands = useCallback((data, period = 20, stdDev = 2) => {
    const upper = []
    const middle = []
    const lower = []

    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1)
      const mean = slice.reduce((sum, candle) => sum + candle.close, 0) / period
      const variance = slice.reduce((sum, candle) => sum + Math.pow(candle.close - mean, 2), 0) / period
      const std = Math.sqrt(variance)

      middle.push({ time: data[i].time, value: mean })
      upper.push({ time: data[i].time, value: mean + stdDev * std })
      lower.push({ time: data[i].time, value: mean - stdDev * std })
    }

    return { upper, middle, lower }
  }, [])

  const handleChartClick = useCallback(
    (param) => {
      if (!drawingMode || !param.point || !param.time) return

      const price = param.point.y
      const time = param.time

      if (!isDrawing) {
        // Start drawing
        console.log("[v0] 🎨 Iniciando dibujo:", drawingMode)
        setIsDrawing(true)
        drawingStartPoint.current = { time, price }
        setCurrentDrawing({
          type: drawingMode,
          startTime: time,
          startPrice: price,
          endTime: time,
          endPrice: price,
        })
      } else {
        // Finish drawing
        console.log("[v0] ✅ Finalizando dibujo:", drawingMode)
        setIsDrawing(false)
        const newDrawing = {
          id: Date.now(),
          type: drawingMode,
          startTime: drawingStartPoint.current.time,
          startPrice: drawingStartPoint.current.price,
          endTime: time,
          endPrice: price,
        }
        setDrawings((prev) => [...prev, newDrawing])
        setCurrentDrawing(null)
        drawingStartPoint.current = null
        setDrawingMode(null) // Auto-deselect tool after drawing
      }
    },
    [drawingMode, isDrawing],
  )

  const handleChartMouseMove = useCallback(
    (param) => {
      if (!isDrawing || !currentDrawing || !param.point || !param.time) return

      const price = param.point.y
      const time = param.time

      setCurrentDrawing((prev) => ({
        ...prev,
        endTime: time,
        endPrice: price,
      }))
    },
    [isDrawing, currentDrawing],
  )

  const renderDrawings = useCallback(() => {
    // TradingView has built-in drawing tools, no need for manual rendering
    console.log("[v0] 🎨 TradingView maneja los dibujos internamente")
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawings, currentDrawing])

  const deleteLastDrawing = useCallback(() => {
    setDrawings((prev) => prev.slice(0, -1))
  }, [])

  const clearAllDrawings = useCallback(() => {
    setDrawings([])
    setCurrentDrawing(null)
    setIsDrawing(false)
    setDrawingMode(null)
    drawingStartPoint.current = null
  }, [])

  const renderIndicators = useCallback(() => {
    if (!chartInstanceRef.current || !chartRawData || chartRawData.length === 0) {
      console.log("[v0] ⏳ No se puede renderizar indicadores: gráfico o datos no disponibles")
      return
    }

    console.log("[v0] 📊 TradingView maneja los indicadores internamente")

    // TradingView indicators are added through the widget configuration
    // We'll apply them when the chart is created
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartRawData, indicators, isDrawing])

  const destroyChart = useCallback(() => {
    if (chartInstanceRef.current && !isDestroyingRef.current) {
      isDestroyingRef.current = true
      try {
        console.log("🔄 Destruyendo instancia del gráfico TradingView...")

        if (typeof chartInstanceRef.current.remove === "function") {
          chartInstanceRef.current.remove()
        }

        chartInstanceRef.current = null
        candlestickSeriesRef.current = null
        Object.keys(indicatorSeriesRef.current).forEach((key) => {
          indicatorSeriesRef.current[key] = null
        })

        setIsChartReady(false)
      } catch (error) {
        console.warn("⚠️ Error durante destrucción del gráfico:", error)
        chartInstanceRef.current = null
        candlestickSeriesRef.current = null
      } finally {
        setTimeout(() => {
          isDestroyingRef.current = false
        }, 100)
      }
    }
  }, [])

  const cleanupAllCharts = useCallback(() => {
    try {
      destroyChart()
    } catch (error) {
      console.warn("Error durante limpieza de charts:", error)
    }
  }, [destroyChart])

  const resetChart = useCallback(() => {
    if (!mountedRef.current) return

    console.log("🔄 Reseteando gráfico...")

    // ✅ ORDEN MÁS SEGURO Y ESTADOS MÁS CLAROS
    setIsChartReady(false)
    setChartRawData(null)
    setRealTimePrice(null)

    // ✅ DESTRUIR SOLO SI EXISTE Y ESTÁ LISTO
    if (chartInstanceRef.current) {
      try {
        destroyChart()
      } catch (error) {
        console.warn("Error en reset del gráfico:", error)
      }
    }

    // ✅ INCREMENTAR KEY PARA FORZAR RE-RENDER DEL CONTENEDOR
    setChartKey((prev) => prev + 1)
  }, [destroyChart])

  const updateChartWithRealPrice = useCallback(
    (priceData) => {
      if (!priceData || !priceData.price || !mountedRef.current) return

      setRealTimePrice(priceData.price)
      setLastPriceUpdate(new Date())
      setTickCount((prev) => prev + 1)

      if (priceData.timestamp) {
        setDataFreshness(validateDataFreshness(priceData.timestamp))
      } else {
        setDataFreshness("simulated")
      }

      console.log("[v0] 📊 Precio actualizado:", priceData.price)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedPair, validateDataFreshness],
  )

  const createChartAnnotations = useCallback(
    (signal) => {
      if (!signal || !candlestickSeriesRef.current) return

      const annotations = []

      // Añadir línea de entrada si existe
      if (signal.entry_price) {
        annotations.push({
          type: "entry",
          price: signal.entry_price,
          color: signal.signal_type.toLowerCase() === "buy" ? "#00ff88" : "#ff4444",
          label: `Entrada: ${signal.entry_price.toFixed(selectedPair.includes("JPY") ? 2 : 5)}`,
        })
      }

      // Añadir línea de Stop Loss si existe
      if (signal.stop_loss) {
        annotations.push({
          type: "stop_loss",
          price: signal.stop_loss,
          color: "#ff4444",
          label: `SL: ${signal.stop_loss.toFixed(selectedPair.includes("JPY") ? 2 : 5)}`,
        })
      }

      // Añadir línea de Take Profit si existe
      if (signal.take_profit) {
        annotations.push({
          type: "take_profit",
          price: signal.take_profit,
          color: "#00ff88",
          label: `TP: ${signal.take_profit.toFixed(selectedPair.includes("JPY") ? 2 : 5)}`,
        })
      }

      setChartAnnotations(annotations)
    },
    [selectedPair],
  )

  const getMT5DataForPair = useCallback(
    async (pair, forceUpdate = false) => {
      const now = Date.now()
      const requestTime = now
      const lastUpdate = multiPairPrices[pair]?.lastUpdate || 0

      if (!forceUpdate && now - lastUpdate < realtimeSettings.updateInterval) {
        console.log(`Precio de ${pair} actualizado recientemente, saltando...`)
        return multiPairPrices[pair]?.price
      }

      try {
        console.log(`🔄 Obteniendo precio actual para ${pair} desde backend...`)

        // ✅ USAR EL MÉTODO getCurrentPrice QUE YA EXISTE
        const response = await api.getCurrentPrice(pair)
        const responseTime = Date.now()

        if (response && response.price) {
          const latency = calculateLatency(requestTime, responseTime)
          const freshness = validateDataFreshness(response.timestamp || new Date().toISOString())

          setMultiPairPrices((prev) => ({
            ...prev,
            [pair]: {
              ...prev[pair],
              price: response.price,
              timestamp: response.timestamp || new Date().toISOString(),
              lastUpdate: now,
              isRealTime: response.source === "mt5_live",
              simulated: response.source === "fallback_simulation",
              latency: latency,
              quality: evaluateConnectionQuality(latency, 1.0),
              source: response.source || "mt5",
            },
          }))

          if (pair === selectedPair) {
            setRealTimePrice(response.price)
            setLastPriceUpdate(new Date())
            setPriceLatency(latency)
            setDataFreshness(freshness)
            setConnectionQuality(evaluateConnectionQuality(latency, 1.0))
            setTickCount((prev) => prev + 1)
          }

          console.log(`✅ Precio actualizado para ${pair}:`, response.price)
          return response.price
        }
      } catch (error) {
        console.error(`❌ Error obteniendo precio de ${pair}:`, error)

        if (multiPairPrices[pair]?.price) {
          const volatility = pair.includes("JPY") ? 0.1 : 0.0005
          const change = (Math.random() - 0.5) * volatility
          const simulatedPrice = Number.parseFloat(
            (multiPairPrices[pair].price + change).toFixed(pair.includes("JPY") ? 2 : 5),
          )

          setMultiPairPrices((prev) => ({
            ...prev,
            [pair]: {
              ...prev[pair],
              price: simulatedPrice,
              timestamp: new Date().toISOString(),
              lastUpdate: now,
              simulated: true,
              quality: "poor",
            },
          }))

          if (pair === selectedPair) {
            setRealTimePrice(simulatedPrice)
            setDataFreshness("simulated")
            setConnectionQuality("poor")
          }

          return simulatedPrice
        }
        return null
      }
    },
    [
      multiPairPrices,
      realtimeSettings.updateInterval,
      selectedPair,
      calculateLatency,
      validateDataFreshness,
      evaluateConnectionQuality,
    ],
  )

  const updateMultiplePairPrices = useCallback(async () => {
    const uniquePairs = [
      ...new Set([
        selectedPair,
        ...signals
          .slice(0, 5)
          .map((signal) => signal.symbol)
          .filter(Boolean),
      ]),
    ]

    const updatePromises = uniquePairs.map(async (pair) => {
      try {
        await getMT5DataForPair(pair)
        await new Promise((resolve) => setTimeout(resolve, 50))
      } catch (error) {
        console.error(`Error actualizando precio para ${pair}:`, error)
      }
    })

    await Promise.allSettled(updatePromises)
  }, [selectedPair, signals, getMT5DataForPair])

  const simulatePriceUpdate = useCallback(() => {
    if (!chartRawData || !realtimeEnabled) return

    const lastKnownPrice = chartRawData[chartRawData.length - 1]?.close
    if (!lastKnownPrice) return

    const volatility = selectedPair.includes("JPY") ? 0.1 : 0.0001
    const change = (Math.random() - 0.5) * volatility
    const newPrice = Math.max(lastKnownPrice + change, 0.0001)
    const formattedPrice = Number.parseFloat(newPrice.toFixed(selectedPair.includes("JPY") ? 2 : 5))

    setRealTimePrice(formattedPrice)
    setLastPriceUpdate(new Date())
    setDataFreshness("simulated")
    setConnectionQuality("poor")

    updateChartWithRealPrice({
      price: formattedPrice,
      timestamp: new Date(),
      isRealTime: false,
    })
  }, [chartRawData, realtimeEnabled, selectedPair, updateChartWithRealPrice])

  const stopRealTimePriceUpdates = useCallback(() => {
    if (priceUpdateIntervalRef.current) {
      clearInterval(priceUpdateIntervalRef.current)
      priceUpdateIntervalRef.current = null
      console.log("⏸️ Actualizaciones de precio detenidas")
    }
  }, [])

  const startRealTimePriceUpdates = useCallback(() => {
    if (priceUpdateIntervalRef.current) {
      clearInterval(priceUpdateIntervalRef.current)
    }

    console.log("🚀 Iniciando actualizaciones de precio en tiempo real...")

    priceUpdateIntervalRef.current = setInterval(async () => {
      if (!mountedRef.current || !realtimeEnabled) return

      try {
        await getMT5DataForPair(selectedPair)
        setTickCount((prev) => prev + 1)
      } catch (error) {
        console.error("Error en actualización de precio:", error)
      }
    }, realtimeSettings.updateInterval)

    getMT5DataForPair(selectedPair)
  }, [selectedPair, realtimeEnabled, realtimeSettings.updateInterval, getMT5DataForPair])

  const disconnectWebSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
      setConnectionStatus("disconnected")
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    stopRealTimePriceUpdates()
  }, [stopRealTimePriceUpdates])

  const handleWebSocketMessage = useCallback(
    (data) => {
      if (!mountedRef.current) return

      switch (data.type) {
        case "new_signals":
        case "new_realtime_signals": {
          const newSignals = data.signals || []
          setSignals((prev) => [...newSignals, ...prev].slice(0, 50))

          if (newSignals.length > 0) {
            const latestSignal = newSignals[0]
            setSelectedSignalDetails(latestSignal)
            setSignalDetailsOpen(true)
            // If the new signal's symbol matches the current pair, create annotations
            if (latestSignal.symbol === selectedPair) {
              createChartAnnotations(latestSignal)
            }
            showSnackbarRef.current(`📊 Nueva señal ${latestSignal.signal_type.toUpperCase()} detectada`, "success")
          }
          break
        }
        case "signals_update":
          setSignals(data.signals || [])
          break
        case "price_update":
          if (data.symbol === selectedPair && data.price) {
            setRealTimePrice(data.price)
            setLastPriceUpdate(new Date())
            setTickCount((prev) => prev + 1)
            setDataFreshness(validateDataFreshness(data.timestamp))
            updateChartWithRealPrice(data)
          } else if (data.symbol && data.price) {
            setMultiPairPrices((prev) => ({
              ...prev,
              [data.symbol]: {
                ...prev[data.symbol],
                price: data.price,
                timestamp: data.timestamp || new Date().toISOString(),
                lastUpdate: new Date(),
                isRealTime: true,
                source: "websocket",
              },
            }))
          }
          break
        default:
          console.log("Mensaje WebSocket no manejado:", data.type)
      }
    },
    [selectedPair, validateDataFreshness, updateChartWithRealPrice, createChartAnnotations],
  )

  const connectWebSocket = useCallback(() => {
    if (!user?.id || !mountedRef.current) return

    const wsUrl = `ws://127.0.0.1:8000/api/signals/ws/${user.id}`
    wsRef.current = new WebSocket(wsUrl)

    wsRef.current.onopen = () => {
      if (mountedRef.current) {
        setConnectionStatus("connected")
        setReconnectAttempts(0)
        showSnackbarRef.current("🟢 Conectado a análisis en tiempo real", "success")
        startRealTimePriceUpdates()
      }
    }

    wsRef.current.onmessage = (event) => {
      if (!mountedRef.current) return
      try {
        const data = JSON.parse(event.data)
        handleWebSocketMessage(data)
      } catch (error) {
        console.error("Error procesando mensaje WebSocket:", error)
      }
    }

    wsRef.current.onclose = () => {
      if (mountedRef.current) {
        setConnectionStatus("disconnected")
        stopRealTimePriceUpdates()

        if (realtimeEnabled && reconnectAttempts < realtimeSettings.maxRetries) {
          setReconnectAttempts((prev) => prev + 1)
          showSnackbarRef.current(
            `🔄 Reconectando... (Intento ${reconnectAttempts + 1}/${realtimeSettings.maxRetries})`,
            "warning",
          )

          reconnectTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current && realtimeEnabled) {
              connectWebSocket()
            }
          }, realtimeSettings.reconnectDelay)
        } else if (reconnectAttempts >= realtimeSettings.maxRetries) {
          showSnackbarRef.current("❌ Máximo de intentos de reconexión alcanzado", "error")
          setRealtimeEnabled(false)
        }
      }
    }

    wsRef.current.onerror = (error) => {
      console.error("Error WebSocket:", error)
      if (mountedRef.current) {
        setConnectionStatus("error")
        stopRealTimePriceUpdates()
      }
    }
  }, [
    user?.id,
    realtimeEnabled,
    reconnectAttempts,
    realtimeSettings.maxRetries,
    realtimeSettings.reconnectDelay,
    startRealTimePriceUpdates,
    stopRealTimePriceUpdates,
    handleWebSocketMessage,
  ])

  const loadAvailablePairs = useCallback(async () => {
    try {
      // ✅ USAR EL MÉTODO QUE YA EXISTE EN TU API
      const response = await api.getAvailablePairs()
      if (mountedRef.current && response.pairs) {
        const pairs = Array.isArray(response.pairs)
          ? response.pairs.map((pair) => (typeof pair === "string" ? pair : pair.symbol || pair.name || pair))
          : ["EURUSD", "GBPUSD", "USDJPY", "AUDUSD"]

        setAvailablePairs(pairs.filter((pair) => typeof pair === "string"))
      }
    } catch (error) {
      console.error("Error cargando pares:", error)
      if (mountedRef.current) {
        setAvailablePairs(["EURUSD", "GBPUSD", "USDJPY", "AUDUSD", "USDCHF", "USDCAD", "EURJPY", "GBPJPY"])
        showSnackbarRef.current("Usando pares por defecto (error al cargar)", "warning")
      }
    }
  }, [showSnackbarRef])

  const loadInitialSignals = useCallback(async () => {
    try {
      // ✅ USAR EL MÉTODO QUE YA EXISTE EN TU API
      const response = await api.getInitialSignals(80)
      if (mountedRef.current && response.signals) {
        setSignals(response.signals)
      }
    } catch (error) {
      console.error("Error cargando señales iniciales:", error)
      if (mountedRef.current) {
        showSnackbarRef.current("Error al cargar señales", "error")
      }
    }
  }, [showSnackbarRef])

  // ✅ NUEVO: Función para calcular velas óptimas según temporalidad
  const getOptimalCandleCount = useCallback((tf) => {
    const candleConfig = {
      M1: 500, // 1 minuto: ~8 horas
      M5: 500, // 5 minutos: ~41 horas
      M15: 400, // 15 minutos: ~4 días
      M30: 350, // 30 minutos: ~7 días
      H1: 300, // 1 hora: ~12 días
      H4: 250, // 4 horas: ~41 días
      D1: 200, // 1 día: ~6.5 meses
      W1: 150, // 1 semana: ~3 años
    }
    return candleConfig[tf] || 300
  }, [])

  const loadRealChartData = useCallback(async () => {
    if (!selectedPair || !timeframe) {
      console.log("[v0] ⚠️ No hay par o timeframe seleccionado")
      return
    }

    if (loadingRef.current) {
      console.log("[v0] ⏸️ Ya hay una carga en progreso, saltando...")
      return
    }

    loadingRef.current = true
    setLoading(true)

    // ✅ Calcular cantidad óptima de velas según temporalidad
    const optimalCandles = getOptimalCandleCount(timeframe)
    console.log(`[v0] 🚀 INICIANDO loadRealChartData para ${selectedPair} ${timeframe} (${optimalCandles} velas)`)

    try {
      console.log(`📊 Cargando ${optimalCandles} velas para ${selectedPair} en ${timeframe}...`)

      const response = await api.getMT5Data(selectedPair, timeframe, optimalCandles)
      console.log("[v0] 📦 Respuesta recibida:", {
        hasResponse: !!response,
        hasData: !!response?.data,
        hasCandles: !!response?.data?.candles,
        candlesLength: response?.data?.candles?.length,
        requestedCandles: optimalCandles,
      })

      if (response && response.data && response.data.candles && response.data.candles.length > 0) {
        const rawData = response.data.candles
        console.log("[v0] ✅ Datos válidos recibidos:", rawData.length, "velas")

        setChartRawData(rawData)
        showSnackbarRef.current(`Datos cargados: ${rawData.length} velas (${timeframe})`, "success")
      } else {
        console.log("[v0] ⚠️ No se recibieron datos válidos")
        showSnackbarRef.current("No se encontraron datos para este par", "warning")
        setChartRawData(null)
      }
    } catch (error) {
      console.error("[v0] ❌ Error en loadRealChartData:", error)
      showSnackbarRef.current(`Error al cargar datos: ${error.message}`, "error")
      setChartRawData(null)
    } finally {
      loadingRef.current = false
      setLoading(false)
      console.log("[v0] 🏁 Finalizando loadRealChartData")
    }
  }, [selectedPair, timeframe, getOptimalCandleCount])

  const getTimeframeSpecificConfig = useCallback(
    (timeframe) => {
      const baseConfig = {
        confluence_threshold: aiSettings.confluenceThreshold,
        enable_elliott_wave: aiSettings.enabledAnalyses.includes("elliott_wave"),
        enable_fibonacci: aiSettings.enabledAnalyses.includes("fibonacci"),
        enable_chart_patterns: aiSettings.enabledAnalyses.includes("chart_patterns"),
        enable_support_resistance: aiSettings.enabledAnalyses.includes("support_resistance"),
        elliott_wave_weight: aiSettings.elliottWaveWeight,
        fibonacci_weight: aiSettings.fibonacciWeight,
        chart_patterns_weight: aiSettings.chartPatternsWeight,
        support_resistance_weight: aiSettings.supportResistanceWeight,
      }

      switch (timeframe) {
        case "M1":
        case "M5":
          return {
            ...baseConfig,
            confluence_threshold: aiSettings.confluenceThreshold,
            support_resistance_weight: 0.4,
            chart_patterns_weight: 0.3,
            fibonacci_weight: 0.2,
            elliott_wave_weight: 0.1,
            atr_multiplier_sl: 1.5,
            risk_reward_ratio: 1.5,
          }
        case "M15":
        case "M30":
          return {
            ...baseConfig,
            confluence_threshold: aiSettings.confluenceThreshold,
            atr_multiplier_sl: 2.0,
            risk_reward_ratio: 2.0,
          }
        case "H1":
          return {
            ...baseConfig,
            elliott_wave_weight: 0.3,
            fibonacci_weight: 0.3,
            chart_patterns_weight: 0.25,
            support_resistance_weight: 0.15,
            atr_multiplier_sl: 2.5,
            risk_reward_ratio: 2.5,
          }
        case "H4":
          return {
            ...baseConfig,
            elliott_wave_weight: 0.4,
            fibonacci_weight: 0.3,
            chart_patterns_weight: 0.2,
            support_resistance_weight: 0.1,
            confluence_threshold: Math.max(aiSettings.confluenceThreshold - 0.1, 0.5),
            atr_multiplier_sl: 3.0,
            risk_reward_ratio: 3.0,
          }
        case "D1":
        case "W1":
          return {
            ...baseConfig,
            elliott_wave_weight: 0.5,
            fibonacci_weight: 0.25,
            chart_patterns_weight: 0.15,
            support_resistance_weight: 0.1,
            confluence_threshold: Math.max(baseConfig.confluence_threshold - 0.15, 0.45),
            atr_multiplier_sl: 4.0,
            risk_reward_ratio: 4.0,
          }
        default:
          return {
            ...baseConfig,
            atr_multiplier_sl: 2.0,
            risk_reward_ratio: 2.0,
          }
      }
    },
    [aiSettings],
  )

  const handleRiskLocked = (locked) => {
    setRiskManagement((prev) => ({
      ...prev,
      isLocked: locked,
    }))
  }

  const generateLocalChartImage = useCallback((signal) => {
    console.log("Generando imagen local del gráfico...")
    // Implementación simplificada de generación local
    // En una implementación real, esto podría intentar exportar el canvas del gráfico
    setChartImageError(true)
  }, [])

const generateChartImage = useCallback(
  async (signal) => {
    if (!signal || chartImageLoading) return

    const signalId = `${signal._id || signal.id || "unknown"}-${signal.symbol}-${signal.timeframe || signal.analysis_timeframe}-${signal.created_at}`

    if (currentSignalId === signalId && chartImageUrl) {
      console.log("✅ Imagen ya generada para esta señal:", signalId)
      return
    }

    setChartImageLoading(true)
    setChartImageError(false)
    setChartImageUrl(null)
    setCurrentSignalId(signalId)

    try {
      console.log("🎨 Generando imagen del gráfico para:", {
        symbol: signal.symbol,
        signalId,
        entry_price: signal.entry_price,
        stop_loss: signal.stop_loss,
        take_profit: signal.take_profit,
        signal_type: signal.signal_type
      })

      // ✅ Usar el método del API en lugar de api.post directamente
      const response = await api.generateChartImage(signal)

      console.log("📥 Respuesta recibida:", response)

      if (response.chart_image_url && mountedRef.current) {
        setChartImageUrl(response.chart_image_url)
        setChartImageError(false)
        console.log("✅ Imagen generada exitosamente")
        
        // ✅ Log para debug de niveles de trading
        if (response.trading_levels) {
          console.log("🎯 Niveles de trading aplicados:", response.trading_levels)
        }
      } else {
        console.warn("⚠️ No se recibió URL de imagen en la respuesta")
        generateLocalChartImage(signal)
      }
    } catch (error) {
      console.error("❌ Error generando imagen del gráfico:", error)
      console.error("❌ Detalles:", {
        message: error.message,
        response: error.response?.data,
        signal: {
          symbol: signal.symbol,
          entry_price: signal.entry_price,
          stop_loss: signal.stop_loss,
          take_profit: signal.take_profit
        }
      })
      setChartImageError(true)
      generateLocalChartImage(signal)
    } finally {
      if (mountedRef.current) {
        setChartImageLoading(false)
      }
    }
  },
  [chartImageLoading, currentSignalId, chartImageUrl, generateLocalChartImage],
)
  const handleChartRef = useCallback((chartElement) => {
    if (chartElement && mountedRef.current) {
      try {
        chartInstanceRef.current = chartElement
      } catch (error) {
        console.error("Error setting chart reference:", error)
      }
    }
  }, [])

  const getMT5Data = useCallback(async () => {
    try {
      const requestTime = Date.now()
      const response = await api.get(`/api/mt5/price/${selectedPair}`)
      const responseTime = Date.now()

      if (response.data && response.data.price) {
        const newPrice = response.data.price
        const latency = calculateLatency(requestTime, responseTime)
        const freshness = validateDataFreshness(response.data.timestamp || new Date().toISOString())

        setRealTimePrice(newPrice)
        setLastPriceUpdate(new Date())
        setPriceLatency(latency)
        setDataFreshness(freshness)
        setConnectionQuality(evaluateConnectionQuality(latency, 1.0))
        setTickCount((prev) => prev + 1)

        if (realtimeSettings.priceHistoryLimit > 0) {
          setPriceHistory((prev) => [
            ...prev.slice(-(realtimeSettings.priceHistoryLimit - 1)),
            {
              price: newPrice,
              timestamp: new Date(),
              latency,
              isRealTime: freshness === "fresh",
            },
          ])
        }

        updateChartWithRealPrice({
          price: newPrice,
          timestamp: new Date(),
          isRealTime: freshness === "fresh",
        })
      }
    } catch (error) {
      console.error("❌ Error obteniendo precio actual:", error)
      simulatePriceUpdate()
    }
  }, [
    selectedPair,
    calculateLatency,
    validateDataFreshness,
    evaluateConnectionQuality,
    realtimeSettings.priceHistoryLimit,
    updateChartWithRealPrice,
    simulatePriceUpdate,
  ])

  // Cleanup al desmontar el componente
  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      console.log("🧹 Cleanup del componente Charts")

      // ✅ DESTRUIR EL GRÁFICO PERO NO TOCAR EL DOM
      if (chartInstanceRef.current) {
        try {
          chartInstanceRef.current.remove()
        } catch (error) {
          console.warn("Error en cleanup:", error)
        }
      }

      disconnectWebSocket()
      stopRealTimePriceUpdates()
    }
  }, [disconnectWebSocket, stopRealTimePriceUpdates])

  useEffect(() => {
    if (mountedRef.current && !initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true

      // Cargar pares y señales en paralelo
      Promise.all([loadAvailablePairs(), loadInitialSignals()]).then(() => {
        // Pequeño delay para asegurar que todo esté listo
        setTimeout(() => {
          if (mountedRef.current) {
            loadRealChartData()
          }
        }, 200)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRealChartData])

  // Configurar WebSocket con reconexión automática
  useEffect(() => {
    if (realtimeEnabled && user?.id && mountedRef.current) {
      console.log("Conectando WebSocket...")
      connectWebSocket()
      startRealTimePriceUpdates()
    } else if (!realtimeEnabled && connectionStatus !== "disconnected") {
      console.log("Desconectando WebSocket...")
      disconnectWebSocket()
      stopRealTimePriceUpdates()
    }

    return () => {
      disconnectWebSocket()
      stopRealTimePriceUpdates()
    }
  }, [
    realtimeEnabled,
    user?.id,
    connectionStatus,
    connectWebSocket,
    disconnectWebSocket,
    startRealTimePriceUpdates,
    stopRealTimePriceUpdates,
  ])

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://s3.tradingview.com/tv.js"
    script.async = true
    script.onload = () => {
      console.log("[v0] ✅ TradingView script loaded")
    }
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  useEffect(() => {
    if (!chartRawData || !mountedRef.current) {
      console.log("[v0] ⏳ Esperando condiciones para crear gráfico:", {
        hasData: !!chartRawData,
        isMounted: mountedRef.current,
      })
      return
    }

    const timeoutId = setTimeout(() => {
      const container = document.getElementById("tradingview-chart-container")

      if (!container) {
        console.log("[v0] ⏳ Contenedor no encontrado en el DOM")
        return
      }

      if (!document.body.contains(container)) {
        console.log("[v0] ⏳ Contenedor no está en el DOM todavía")
        return
      }

      if (isCreatingRef.current || isDestroyingRef.current) {
        console.log("[v0] ⏳ Operación en progreso, esperando...")
        return
      }

      console.log("[v0] 🎨 Condiciones cumplidas, creando gráfico TradingView...")

      const createChartInstance = async () => {
        if (isCreatingRef.current || isDestroyingRef.current) {
          console.log("[v0] ⏳ Operación en progreso, abortando creación")
          return
        }

        isCreatingRef.current = true

        try {
          // Destroy previous instance if exists
          if (chartInstanceRef.current) {
            console.log("[v0] 🗑️ Destruyendo instancia anterior del gráfico")
            isDestroyingRef.current = true
            try {
              chartInstanceRef.current.remove()
            } catch (err) {
              console.warn("[v0] Error al remover gráfico:", err)
            }
            chartInstanceRef.current = null
            candlestickSeriesRef.current = null

            await new Promise((resolve) => setTimeout(resolve, 150))
            isDestroyingRef.current = false
          }

          const container = document.getElementById("tradingview-chart-container")

          if (!container || !mountedRef.current) {
            console.log("[v0] ❌ Contenedor no disponible")
            isCreatingRef.current = false
            return
          }

          if (!document.body.contains(container)) {
            console.log("[v0] ❌ Contenedor no está en el DOM")
            isCreatingRef.current = false
            return
          }

          if (typeof window.TradingView === "undefined") {
            console.log("[v0] ⏳ Esperando que TradingView se cargue...")
            isCreatingRef.current = false
            setTimeout(createChartInstance, 100)
            return
          }

          console.log("[v0] 🎨 Creando widget de TradingView")

          // Convert timeframe to TradingView format
          const tvTimeframe = timeframe.replace("M", "").replace("H", "60").replace("D", "D").replace("W", "W")

          const studies = []
          if (indicators.sma20) studies.push("MASimple@tv-basicstudies")
          if (indicators.sma50) studies.push("MASimple@tv-basicstudies")
          if (indicators.ema20) studies.push("MAExp@tv-basicstudies")
          if (indicators.rsi) studies.push("RSI@tv-basicstudies")
          if (indicators.macd) studies.push("MACD@tv-basicstudies")
          if (indicators.bollinger) studies.push("BB@tv-basicstudies")

const widget = new window.TradingView.widget({
            container_id: "tradingview-chart-container",
            width: container.clientWidth || 1000,
            height: 600,
            symbol: selectedPair,
            interval: tvTimeframe,
            timezone: "Etc/UTC",
            theme: "dark",
            style: "1", // Candlestick
            locale: "es",
            toolbar_bg: "#0a0a0a",
            enable_publishing: false,
            hide_side_toolbar: false,
            allow_symbol_change: false,
            save_image: false,
            studies: studies,
            overrides: {
              "mainSeriesProperties.candleStyle.upColor": "#00ff88",
              "mainSeriesProperties.candleStyle.downColor": "#ff4444",
              "mainSeriesProperties.candleStyle.borderUpColor": "#00ff88",
              "mainSeriesProperties.candleStyle.borderDownColor": "#ff4444",
              "mainSeriesProperties.candleStyle.wickUpColor": "#00ff88",
              "mainSeriesProperties.candleStyle.wickDownColor": "#ff4444",
              "paneProperties.background": "rgba(0, 0, 0, 0)",
              "paneProperties.backgroundType": "solid",
              "paneProperties.vertGridProperties.color": "rgba(0, 255, 255, 0.1)",
              "paneProperties.horzGridProperties.color": "rgba(0, 255, 255, 0.1)",
              "scalesProperties.textColor": "#ffffff",
              "scalesProperties.lineColor": "rgba(0, 255, 255, 0.3)",
            },
            disabled_features: [
              "volume_force_overlay",
              "header_symbol_search",
              "symbol_search_hot_key",
              "header_indicators"
            ],
            enabled_features: [
              "side_toolbar_in_fullscreen_mode",
              "study_templates",
              "trading_account_manager",
              "order_panel",
              "show_trading_notifications_history",
              "create_volume_indicator_by_default_once"
            ],
            loading_screen: {
              backgroundColor: "#0a0a0a",
              foregroundColor: "#00ffff",
            },
            datafeed: {
              onReady: (callback) => {
                console.log("[v0] 📡 TradingView datafeed ready")
                setTimeout(
                  () =>
                    callback({
                      supported_resolutions: ["1", "5", "15", "30", "60", "240", "D", "W"],
                      supports_marks: false,
                      supports_timescale_marks: false,
                      supports_time: true,
                    }),
                  0,
                )
              },
              searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
                console.log("[v0] 🔍 Búsqueda de símbolos:", userInput)
                onResultReadyCallback([])
              },
              resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
                console.log("[v0] 🔍 Resolviendo símbolo:", symbolName)
                const symbolInfo = {
                  name: symbolName,
                  description: symbolName,
                  type: "forex",
                  session: "24x7",
                  timezone: "Etc/UTC",
                  ticker: symbolName,
                  exchange: "FOREX",
                  minmov: 1,
                  pricescale: symbolName.includes("JPY") ? 100 : 100000,
                  has_intraday: true,
                  has_no_volume: true,
                  supported_resolutions: ["1", "5", "15", "30", "60", "240", "D", "W"],
                  volume_precision: 0,
                  data_status: "streaming",
                }
                setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0)
              },
              getBars: (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
                console.log("[v0] 📊 Obteniendo barras:", symbolInfo.name, resolution)

                if (!chartRawData || chartRawData.length === 0) {
                  onHistoryCallback([], { noData: true })
                  return
                }

                const bars = chartRawData.map((candle) => ({
                  time: new Date(candle.time).getTime(),
                  open: Number.parseFloat(candle.open),
                  high: Number.parseFloat(candle.high),
                  low: Number.parseFloat(candle.low),
                  close: Number.parseFloat(candle.close),
                  volume: 0,
                }))

                console.log("[v0] ✅ Enviando", bars.length, "barras a TradingView")
                onHistoryCallback(bars, { noData: false })
              },
              subscribeBars: (
                symbolInfo,
                resolution,
                onRealtimeCallback,
                subscriberUID,
                onResetCacheNeededCallback,
              ) => {
                console.log("[v0] 📡 Suscrito a actualizaciones en tiempo real")
                // Real-time updates would be handled here
              },
              unsubscribeBars: (subscriberUID) => {
                console.log("[v0] 📡 Desuscrito de actualizaciones")
              },
            },
          })

          console.log("[v0] ✅ Widget de TradingView creado")
          chartInstanceRef.current = widget
          candlestickSeriesRef.current = widget // Keep reference for compatibility

          setIsChartReady(true)
          console.log("[v0] ✅ Gráfico TradingView completamente renderizado y listo")
        } catch (error) {
          console.error("[v0] ❌ Error creando gráfico TradingView:", error)
          showSnackbarRef.current("Error al crear el gráfico TradingView", "error")
        } finally {
          isCreatingRef.current = false
        }
      }

      createChartInstance()
    }, 300) // Increased debounce time

    return () => clearTimeout(timeoutId)
  }, [chartRawData, chartKey, showSnackbarRef, selectedPair, timeframe, indicators])

  useEffect(() => {
    if (isChartReady && chartInstanceRef.current) {
      renderDrawings()
    }
  }, [isChartReady, drawings, currentDrawing, renderDrawings])

  useEffect(() => {
    if (!isChartReady || !chartInstanceRef.current) {
      return
    }

    if (indicatorChangeTimeoutRef.current) {
      clearTimeout(indicatorChangeTimeoutRef.current)
    }

    indicatorChangeTimeoutRef.current = setTimeout(() => {
      console.log("[v0] 🔄 Indicadores cambiaron, recreando gráfico...")
      // Force chart recreation by incrementing key
      setChartKey((prev) => prev + 1)
    }, 500) // Wait 500ms after last indicator change

    return () => {
      if (indicatorChangeTimeoutRef.current) {
        clearTimeout(indicatorChangeTimeoutRef.current)
      }
    }
  }, [indicators, isChartReady])

  // Simplified the useEffect for handling pair/timeframe changes.
  useEffect(() => {
    if (!selectedPair || !timeframe || !mountedRef.current) {
      console.log("[v0] ⏳ Saltando useEffect de cambio: condiciones no cumplidas")
      return
    }

    console.log("[v0] 🔄 Cambio detectado:", selectedPair, "-", timeframe)

    const timeoutId = setTimeout(() => {
      if (!mountedRef.current) {
        console.log("[v0] ❌ Componente desmontado durante el debounce")
        return
      }

      if (loadingRef.current) {
        console.log("[v0] ⏭️ Carga ya en progreso después del debounce, saltando...")
        return
      }

      console.log("[v0] 📊 Ejecutando carga para", selectedPair, "-", timeframe)

      loadRealChartData()
    }, 300)

    return () => {
      console.log("[v0] 🧹 Cleanup: timeout limpiado para cambio de par/timeframe")
      clearTimeout(timeoutId)
    }
  }, [selectedPair, timeframe, loadRealChartData])

  // Monitorear calidad de conexión
  useEffect(() => {
    if (realtimeEnabled && priceHistory.length > 10) {
      const recentPrices = priceHistory.slice(-10)
      const avgLatency = recentPrices.reduce((sum, p) => sum + (p.latency || 0), 0) / recentPrices.length
      const realTimeCount = recentPrices.filter((p) => p.isRealTime).length
      const successRate = recentPrices.length > 0 ? realTimeCount / recentPrices.length : 1.0

      const quality = evaluateConnectionQuality(avgLatency, successRate)
      setConnectionQuality(quality)

      if (quality === "disconnected" && connectionStatus !== "disconnected") {
        setConnectionStatus("disconnected")
        showSnackbarRef.current("Conexión de datos inestable o perdida", "error")
      } else if (quality !== "disconnected" && connectionStatus === "disconnected") {
        setConnectionStatus("connected")
        showSnackbarRef.current("Conexión de datos restablecida", "success")
      }
    }
  }, [priceHistory, realtimeEnabled, connectionStatus, evaluateConnectionQuality])

  // Efecto para redimensionar el gráfico
  useEffect(() => {
    const handleResize = () => {
      if (chartInstanceRef.current && chartContainerRef.current) {
        try {
          console.log("[v0] 📐 TradingView maneja el redimensionamiento automáticamente")
        } catch (error) {
          console.warn("Error redimensionando gráfico:", error)
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  //  Función para crear anotaciones en el gráfico
  //  Eliminando la declaración duplicada de createChartAnnotations que estaba más abajo
  // const createChartAnnotations = useCallback(...) - YA MOVIDA ARRIBA

  const generateNaturalLanguageExplanation = useCallback(
    (signal) => {
      if (!signal || !signal.technical_analyses) return "No hay análisis disponible."

      let explanation = `Esta señal de ${signal.signal_type.toUpperCase()} para ${signal.symbol} tiene una confluencia del ${(signal.confluence_score * 100).toFixed(0)}%, lo que indica `

      if (signal.confluence_score >= 0.8) {
        explanation += "una oportunidad muy sólida con múltiples confirmaciones técnicas. "
      } else if (signal.confluence_score >= 0.6) {
        explanation += "una oportunidad moderada con buenas confirmaciones técnicas. "
      } else {
        explanation += "una oportunidad con confirmaciones técnicas limitadas. "
      }

      if (signal.analysis_timeframe) {
        explanation += `\n\nEste análisis se realizó en temporalidad ${signal.analysis_timeframe}, `

        switch (signal.analysis_timeframe) {
          case "M1":
          case "M5":
            explanation +=
              "optimizada para scalping con mayor peso en soportes/resistencias y patrones de corto plazo. "
            break
          case "M15":
          case "M30":
            explanation += "balanceada para trading intraday con análisis equilibrado. "
            break
          case "H1":
            explanation += "enfocada en swing trading corto con énfasis en Elliott Wave y Fibonacci. "
            break
          case "H4":
            explanation += "orientada a swing trading medio con dominio de análisis Elliott Wave. "
            break
          case "D1":
          case "W1":
            explanation += "diseñada para swing trading de largo plazo con análisis estructural profundo. "
            break
        }
      }

      const elliottAnalysis = signal.technical_analyses.find((a) => a.type === "elliott_wave")
      if (elliottAnalysis && elliottAnalysis.data) {
        explanation += `\n\nAnálisis de Ondas Elliott: El mercado muestra un patrón ${elliottAnalysis.data.pattern?.direction || "indefinido"} `
        explanation += `en estado de ${elliottAnalysis.data.market_state || "análisis"}. `

        if (elliottAnalysis.data.pattern?.waves && elliottAnalysis.data.pattern.waves.length >= 5) {
          explanation += `Se han identificado las 5 ondas principales del patrón, con la onda 5 completándose cerca de ${elliottAnalysis.data.pattern.waves[4]?.price}. `
        }

        if (elliottAnalysis.data.targets && elliottAnalysis.data.targets.length > 0) {
          const mainTarget = elliottAnalysis.data.targets[0]
          explanation += `El objetivo principal se encuentra en ${mainTarget.price.toFixed(selectedPair.includes("JPY") ? 2 : 5)} con una probabilidad del ${(mainTarget.probability * 100).toFixed(0)}%. `
        }
      }

      const fibAnalysis = signal.technical_analyses.find((a) => a.type === "fibonacci")
      if (fibAnalysis && fibAnalysis.data) {
        explanation += `\n\nNiveles Fibonacci: El precio se encuentra operando entre los niveles de ${fibAnalysis.data.swing_low?.toFixed(selectedPair.includes("JPY") ? 2 : 5)} y ${fibAnalysis.data.swing_high?.toFixed(selectedPair.includes("JPY") ? 2 : 5)}. `

        if (fibAnalysis.data.levels && fibAnalysis.data.levels.length > 0) {
          const strongestLevel = fibAnalysis.data.levels.reduce((prev, current) =>
            current.strength > prev.strength ? current : prev,
          )
          explanation += `El nivel más fuerte se encuentra en ${strongestLevel.price.toFixed(selectedPair.includes("JPY") ? 2 : 5)} (${(strongestLevel.ratio * 100).toFixed(1)}% Fibonacci) con una fuerza del ${(strongestLevel.strength * 100).toFixed(0)}%. `
        }
      }

      const srAnalysis = signal.technical_analyses.find((a) => a.type === "support_resistance")
      if (srAnalysis && srAnalysis.data && srAnalysis.data.levels) {
        const resistances = srAnalysis.data.levels.filter((l) => l.type === "resistance").length
        const supports = srAnalysis.data.levels.filter((l) => l.type === "support").length

        explanation += `\n\nSoportes y Resistencias: Se han identificado ${supports} niveles de soporte y ${resistances} niveles de resistencia. `

        const strongestLevel = srAnalysis.data.levels.reduce((prev, current) =>
          current.touches > prev.touches ? current : prev,
        )

        if (strongestLevel) {
          explanation += `El nivel más significativo es una ${strongestLevel.type} en ${strongestLevel.price.toFixed(selectedPair.includes("JPY") ? 2 : 5)}, que ha sido tocada ${strongestLevel.touches} veces, indicando su importancia. `
        }
      }

      explanation += `\n\nRecomendación de Trading: `
      if (signal.signal_type.toLowerCase() === "buy") {
        explanation += `Se recomienda una posición de COMPRA con entrada en ${signal.entry_price?.toFixed(selectedPair.includes("JPY") ? 2 : 5)}, `
      } else {
        explanation += `Se recomienda una posición de VENTA con entrada en ${signal.entry_price?.toFixed(selectedPair.includes("JPY") ? 2 : 5)}, `
      }

      explanation += `stop loss en ${signal.stop_loss?.toFixed(selectedPair.includes("JPY") ? 2 : 5)} `
      explanation += `y take profit en ${signal.take_profit?.toFixed(selectedPair.includes("JPY") ? 2 : 5)}. `

      if (signal.entry_price && signal.stop_loss && signal.take_profit) {
        const risk = Math.abs(signal.entry_price - signal.stop_loss)
        const reward = Math.abs(signal.take_profit - signal.entry_price)
        const rrRatio = reward / risk

        explanation += `Esta configuración ofrece una relación riesgo/beneficio de 1:${rrRatio.toFixed(2)}, `

        if (rrRatio >= 2) {
          explanation += `lo cual es excelente para la gestión de riesgo.`
        } else if (rrRatio >= 1.5) {
          explanation += `lo cual es aceptable para esta oportunidad.`
        } else {
          explanation += `por lo que se recomienda evaluar cuidadosamente el riesgo.`
        }
      }

      return explanation
    },
    [selectedPair],
  )

  const analyzeWithAI = useCallback(async () => {
    if (!selectedPair || !chartRawData || analyzing) {
      if (!chartRawData) {
        showSnackbarRef.current("Por favor, carga los datos del gráfico primero.", "warning")
      }
      return
    }

    setAnalyzing(true)
    try {
      const analysisTimeframe = aiSettings.analysisTimeframe
      const timeframeConfig = getTimeframeSpecificConfig(analysisTimeframe)

      const flags = {
        enable_elliott_wave: aiSettings.enabledAnalyses.includes("elliott_wave"),
        enable_fibonacci: aiSettings.enabledAnalyses.includes("fibonacci"),
        enable_chart_patterns: aiSettings.enabledAnalyses.includes("chart_patterns"),
        enable_support_resistance: aiSettings.enabledAnalyses.includes("support_resistance"),
      }

      const config = {
        ...timeframeConfig,
        ...flags,
        total_capital: riskManagement.totalCapital,
        risk_percentage: riskManagement.riskPercentage,
        max_risk_amount: (riskManagement.totalCapital * riskManagement.riskPercentage) / 100,
        trader_type: aiSettings?.selectedStrategy || "swing_trading",
        trading_strategy: aiSettings?.selectedTradingStrategy || "swing_trading",
        max_daily_loss_percent: extendedRiskManagement?.maxDailyLossPercent || 5,
        max_weekly_loss_percent: extendedRiskManagement?.maxWeeklyLossPercent || 15,
        max_daily_profit_percent: extendedRiskManagement?.maxDailyProfitPercent || 10,
        max_open_trades: extendedRiskManagement?.maxOpenTrades || 5,
        min_rrr: extendedRiskManagement?.minRRR || 2,
        max_losing_streak: extendedRiskManagement?.maxLosingStreak || 3,
        cool_down_hours: extendedRiskManagement?.coolDownHours || 4,
        risk_by_strategy: extendedRiskManagement?.riskByStrategy || {
          scalping: { riskPercent: 1, maxTrades: 5 },
          day_trading: { riskPercent: 2, maxTrades: 3 },
          swing_trading: { riskPercent: 2, maxTrades: 2 },
          position_trading: { riskPercent: 3, maxTrades: 1 },
          maleta: { riskPercent: 2, maxTrades: 2 },
        },
        risk_management_locked: riskManagement.isLocked,
      }

      // ✅ USAR EL MÉTODO analyzePair QUE YA EXISTE
      const response = await api.analyzePair(selectedPair, analysisTimeframe, config)

      const newSignals = response.signals || []
      if (mountedRef.current) {
        const signalsWithLots = newSignals.map((signal) => {
          const calculatedLot = calculateLotSize(signal, riskManagement)
          return {
            ...signal,
            calculated_lot_size: calculatedLot,
            max_risk_amount: (riskManagement.totalCapital * riskManagement.riskPercentage) / 100,
            risk_percentage: riskManagement.riskPercentage,
            analysis_timeframe: analysisTimeframe,
          }
        })

        setSignals((prev) => [...signalsWithLots, ...prev].slice(0, 50))

        if (signalsWithLots.length > 0) {
          const latestSignal = signalsWithLots[0]
          setSelectedSignalDetails(latestSignal)
          setSignalDetailsOpen(true)
          if (latestSignal.symbol === selectedPair) {
            createChartAnnotations(latestSignal)
          }
          showSnackbarRef.current(
            `📊 Nueva señal ${latestSignal.signal_type.toUpperCase()} para ${latestSignal.symbol} (${analysisTimeframe}) - Lote: ${latestSignal.calculated_lot_size}, Riesgo: $${latestSignal.max_risk_amount}`,
            "success",
          )
        } else {
          showSnackbarRef.current(
            `No se detectaron confluencias suficientes en ${analysisTimeframe} (Umbral: ${(config.confluence_threshold * 100).toFixed(0)}%)`,
            "info",
          )
        }
      }
    } catch (error) {
      console.error("Error en análisis IA:", error)
      if (mountedRef.current) {
        showSnackbarRef.current(`Error en análisis IA: ${error.message || "Error desconocido"}`, "error")
      }
    } finally {
      if (mountedRef.current) {
        setAnalyzing(false)
      }
    }
  }, [
    selectedPair,
    chartRawData,
    analyzing,
    aiSettings,
    getTimeframeSpecificConfig,
    riskManagement,
    extendedRiskManagement,
    calculateLotSize,
    createChartAnnotations,
    showSnackbarRef,
  ])

  //  Función para ejecutar señal
  const executeSignal = useCallback(
  async (signal) => {
    try {
      console.log("Ejecutando señal:", signal)
      showSnackbarRef.current(`Ejecutando señal ${signal.signal_type.toUpperCase()} para ${signal.symbol}...`, "info")

      // ✅ CORREGIDO: Usar el endpoint correcto y parámetros esperados
      const tradeData = {
        symbol: signal.symbol,
        signal_type: signal.signal_type.toLowerCase(), // ✅ Cambiado de 'action' a 'signal_type'
        volume: signal.calculated_lot_size || 0.1,
        stop_loss: signal.stop_loss,
        take_profit: signal.take_profit,
        comment: `AI Signal - Confluence: ${(signal.confluence_score * 100).toFixed(0)}%`,
        user_id: user?.id,
      }

      console.log("📤 Enviando datos de trade corregidos:", tradeData)

      // ✅ CORREGIDO: Usar el endpoint correcto /api/mt5/execute
      const response = await api.post("/api/mt5/execute", tradeData)

      if (response.data && response.data.success) {
        showSnackbarRef.current(`✅ Señal ejecutada exitosamente. Ticket: ${response.data.ticket}`, "success")
        console.log("✅ Trade ejecutado:", response.data)
      } else {
        showSnackbarRef.current(`❌ Error ejecutando señal: ${response.data?.message || "Respuesta inesperada"}`, "error")
      }
    } catch (error) {
      console.error("❌ Error ejecutando señal:", error)
      
      // Manejo específico de errores
      if (error.response?.status === 400) {
        const errorDetails = error.response.data
        console.error("❌ Detalles del error 400:", errorDetails)
        showSnackbarRef.current(
          `❌ Error en parámetros: ${errorDetails.detail || errorDetails.message || "Parámetros inválidos"}`,
          "error"
        )
      } else if (error.response?.status === 405) {
        showSnackbarRef.current(
          `❌ Endpoint no disponible (405). Verifica la configuración del backend.`,
          "error"
        )
      } else {
        showSnackbarRef.current(
          `❌ Error ejecutando señal: ${error.message || "Error de conexión"}`,
          "error"
        )
      }
    }
  },
  [showSnackbarRef, user?.id],
)
  const getSignalTypeColor = useCallback((type) => {
    if (!type) return "#ffffff"
    return type.toLowerCase() === "buy" ? "#00ff88" : "#ff4444"
  }, [])

  const getConfluenceColor = useCallback((score) => {
    if (score >= 0.8) return "#00ff88"
    if (score >= 0.6) return "#ffaa00"
    return "#ff4444"
  }, [])

  const getConnectionQualityColor = useCallback((quality) => {
    switch (quality) {
      case "excellent":
        return "#00ff88"
      case "good":
        return "#00ffff"
      case "poor":
        return "#ffaa00"
      case "disconnected":
        return "#ff4444"
      default:
        return "#ffffff"
    }
  }, [])

  const getDataFreshnessColor = useCallback((freshness) => {
    switch (freshness) {
      case "fresh":
        return "#00ff88"
      case "recent":
        return "#ffaa00"
      case "stale":
        return "#ff4444"
      case "simulated":
        return "#9c27b0"
      default:
        return "#ffffff"
    }
  }, [])

  //  Componente de estado de tiempo real

  // Moviendo el handleRiskLocked aquí, ya que no necesita ser useCallback si no se pasa como prop
  const handleRiskLockedUI = (locked) => {
    setRiskManagement((prev) => ({
      ...prev,
      isLocked: locked,
    }))
  }

  return (
    <ChartErrorBoundary onReset={resetChart}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)",
          color: "#ffffff",
          p: 2,
        }}
      >
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography variant="h3" sx={{ color: "#00ffff", fontWeight: "bold", mb: 1 }}>
                📊 Análisis de Gráficos IA - Tiempo Real
              </Typography>
              <Typography variant="h6" sx={{ color: "rgba(255,255,255,0.7)" }}>
                Trading inteligente con confluencias técnicas y datos en vivo
                {realTimePrice && (
                  <Chip
                    label={`${selectedPair}: ${realTimePrice.toFixed(selectedPair.includes("JPY") ? 2 : 5)}`}
                    sx={{
                      ml: 2,
                      backgroundColor: getDataFreshnessColor(dataFreshness) + "20",
                      color: getDataFreshnessColor(dataFreshness),
                      border: `1px solid ${getDataFreshnessColor(dataFreshness)}40`,
                    }}
                  />
                )}
                <Chip
                  label={`Análisis: ${aiSettings.analysisTimeframe}`}
                  sx={{
                    ml: 2,
                    backgroundColor: "#9c27b0",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <IconButton onClick={() => setSettingsOpen(true)} sx={{ color: "#00ffff" }}>
                <Settings />
              </IconButton>
            </Box>
          </Box>

          {/* Controles principales sin selector de timeframe */}
          <Card
            sx={{
              mb: 3,
              backgroundColor: "rgba(255,255,255,0.05)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(0,255,255,0.2)",
            }}
          >
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: "#00ffff" }}>Par de Divisas</InputLabel>
                    <Select
                      value={availablePairs.includes(selectedPair) ? selectedPair : ""}
                      onChange={(e) => setSelectedPair(e.target.value)}
                      sx={{
                        color: "#ffffff",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "rgba(0,255,255,0.3)",
                        },
                      }}
                    >
                      {availablePairs.map((pair) => (
                        <MenuItem key={pair} value={pair}>
                          {pair}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={2}>
                  <Button
                    variant="contained"
                    onClick={analyzeWithAI}
                    disabled={analyzing || !chartRawData}
                    startIcon={analyzing ? <CircularProgress size={20} /> : <Psychology />}
                    fullWidth
                    sx={{
                      backgroundColor: "#00ffff",
                      color: "#000000",
                      "&:hover": {
                        backgroundColor: "#00cccc",
                      },
                    }}
                  >
                    {analyzing ? "Analizando..." : "Analizar con IA"}
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6} md={1}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      loadRealChartData()
                    }}
                    disabled={loading}
                    startIcon={<Refresh />}
                    fullWidth
                    sx={{
                      borderColor: "#00ffff",
                      color: "#00ffff",
                      "&:hover": {
                        borderColor: "#00cccc",
                        backgroundColor: "rgba(0,255,255,0.1)",
                      },
                    }}
                  >
                    Actualizar
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Layout principal */}
          <Grid container spacing={3}>
            {/* Panel lateral */}
            <Grid item xs={12} lg={2.5}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {/* Watchlist */}
                <Card
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0,255,255,0.2)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: "#00ffff" }}>
                      <Star sx={{ mr: 1, verticalAlign: "middle" }} />
                      Watchlist
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {watchlist.map((pair) => (
                        <Button
                          key={pair}
                          variant={selectedPair === pair ? "contained" : "outlined"}
                          onClick={() => setSelectedPair(pair)}
                          size="small"
                          sx={{
                            borderColor: selectedPair === pair ? "#00ff88" : "rgba(255,255,255,0.3)",
                            backgroundColor: selectedPair === pair ? "#00ff88" : "transparent",
                            color: selectedPair === pair ? "#000000" : "#ffffff",
                            "&:hover": {
                              backgroundColor: selectedPair === pair ? "#00cc66" : "rgba(255,255,255,0.1)",
                            },
                          }}
                        >
                          {pair}
                          {multiPairPrices[pair] && (
                            <Chip
                              label={multiPairPrices[pair].price?.toFixed(pair.includes("JPY") ? 2 : 5)}
                              size="small"
                              sx={{
                                ml: 1,
                                height: "16px",
                                fontSize: "10px",
                                backgroundColor: multiPairPrices[pair].isRealTime ? "#00ff88" : "#ffaa00",
                                color: "#000000",
                              }}
                            />
                          )}
                        </Button>
                      ))}
                    </Box>
                  </CardContent>
                </Card>

                {/* Indicadores técnicos */}
                <Card
                  sx={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(0,255,255,0.2)",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: "#00ffff" }}>
                      <Assessment sx={{ mr: 1, verticalAlign: "middle" }} />
                      Indicadores
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {Object.entries(indicators)
                        .slice(0, 4)
                        .map(([key, value]) => (
                          <FormControlLabel
                            key={key}
                            control={
                              <Switch
                                checked={value}
                                onChange={(e) => setIndicators((prev) => ({ ...prev, [key]: e.target.checked }))}
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "#00ff88",
                                  },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                    backgroundColor: "#00ff88",
                                  },
                                }}
                              />
                            }
                            label={key.toUpperCase()}
                            sx={{ color: "#ffffff", m: 0 }}
                          />
                        ))}
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Grid>

<Grid item xs={12} lg={6.5}>
  <Card
    sx={{
      backgroundColor: "rgba(255,255,255,0.05)",
      backdropFilter: "blur(10px)",
      border: "1px solid rgba(0,255,255,0.2)",
      mb: 3,
      minHeight: "600px",
    }}
  >
    <CardContent>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ color: "#00ffff" }}>
          Gráfico de {selectedPair}
        </Typography>
        {/* Añadir selector de timeframe aquí si es necesario */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "#00ffff" }}>Timeframe</InputLabel>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            sx={{
              color: "#ffffff",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(0,255,255,0.3)",
              },
            }}
          >
            {timeframes.map((tf) => (
              <MenuItem key={tf.value} value={tf.value}>
                {tf.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ height: "100%", minHeight: 500 }}>
        {loading ? (
          <Box sx={{ height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress sx={{ color: "#00ffff" }} />
            <Typography variant="body1" sx={{ ml: 2, color: "rgba(255,255,255,0.7)" }}>
              Cargando datos de {selectedPair}...
            </Typography>
          </Box>
        ) : chartRawData ? (
          // ✅ CONTENEDOR PRINCIPAL PARA TRADINGVIEW
          <Box 
            id="tradingview-chart-container"
            ref={chartContainerRef}
            sx={{ 
              width: "100%", 
              height: 600,
              position: "relative"
            }}
          >
            {/* Overlay con información en tiempo real */}
            {realTimePrice && (
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  zIndex: 10,
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: `2px solid ${getDataFreshnessColor(dataFreshness)}`,
                }}
              >
                <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                  Precio actual: {realTimePrice.toFixed(selectedPair.includes("JPY") ? 2 : 5)}
                </Typography>
                <Typography variant="caption" sx={{ color: getDataFreshnessColor(dataFreshness) }}>
                  {dataFreshness === "fresh" && "🟢 Datos en vivo"}
                  {dataFreshness === "recent" && "🟡 Datos recientes"}
                  {dataFreshness === "stale" && "🔴 Datos obsoletos"}
                  {dataFreshness === "simulated" && "🟣 Simulado"}
                </Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              height: 600,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <ShowChart sx={{ fontSize: 64, color: "rgba(255,255,255,0.3)" }} />
            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.7)" }}>
              Selecciona un par para ver el gráfico
            </Typography>
            <Button
              variant="outlined"
              onClick={loadRealChartData}
              sx={{
                borderColor: "#00ffff",
                color: "#00ffff",
                "&:hover": {
                  backgroundColor: "rgba(0,255,255,0.1)",
                },
              }}
            >
              Cargar Datos
            </Button>
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
</Grid>

            {/* Panel de señales */}
            <Grid item xs={12} lg={3}>
              <Card
                sx={{
                  backgroundColor: "rgba(255,255,255,0.05)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0,255,255,0.2)",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ color: "#00ffff" }}>
                      <SmartToy sx={{ mr: 1, verticalAlign: "middle" }} />
                      Señales IA
                    </Typography>
                    <Chip
                      label={signals.length}
                      size="small"
                      sx={{
                        backgroundColor: "rgba(0,255,255,0.2)",
                        color: "#00ffff",
                      }}
                    />
                  </Box>
                  <Box sx={{ maxHeight: 600, overflowY: "auto" }}>
                    {signals.length > 0 ? (
                      signals.slice(0, 80).map((signal, index) => (
                        <Card
                          key={signal._id || signal.id || index}
                          sx={{
                            mb: 1,
                            backgroundColor: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            cursor: "pointer",
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,0.08)",
                              border: "1px solid rgba(0,255,255,0.3)",
                              transform: "translateY(-1px)",
                            },
                          }}
                          onClick={() => {
                            setSelectedSignalDetails(signal)
                            setSignalDetailsOpen(true)
                            if (signal.symbol === selectedPair) {
                              createChartAnnotations(signal)
                            }
                          }}
                        >
                          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                              <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                                {signal.symbol}
                                {signal.analysis_timeframe && (
                                  <Chip
                                    label={signal.analysis_timeframe}
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      height: "14px",
                                      fontSize: "8px",
                                      backgroundColor: "#9c27b0",
                                      color: "#ffffff",
                                    }}
                                  />
                                )}
                                {multiPairPrices[signal.symbol] && (
                                  <Chip
                                    label={multiPairPrices[signal.symbol].price?.toFixed(
                                      signal.symbol.includes("JPY") ? 2 : 5,
                                    )}
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      height: "16px",
                                      fontSize: "9px",
                                      backgroundColor: multiPairPrices[signal.symbol].isRealTime
                                        ? "#00ff88"
                                        : "#ffaa00",
                                      color: "#000000",
                                    }}
                                  />
                                )}
                              </Typography>
                              <Chip
                                label={signal.signal_type?.toUpperCase() || "N/A"}
                                size="small"
                                sx={{
                                  backgroundColor: getSignalTypeColor(signal.signal_type) + "20",
                                  color: getSignalTypeColor(signal.signal_type),
                                  border: `1px solid ${getSignalTypeColor(signal.signal_type)}40`,
                                }}
                              />
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
                                Confluencia
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={(signal.confluence_score || 0) * 100}
                                  sx={{
                                    width: 40,
                                    height: 4,
                                    borderRadius: 2,
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                    "& .MuiLinearProgress-bar": {
                                      backgroundColor: getConfluenceColor(signal.confluence_score || 0),
                                    },
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{ color: getConfluenceColor(signal.confluence_score || 0) }}
                                >
                                  {((signal.confluence_score || 0) * 100).toFixed(0)}%
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                                Entrada: {signal.entry_price?.toFixed(selectedPair.includes("JPY") ? 2 : 5) || "N/A"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
                                {new Date(signal.created_at).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <Box
                        sx={{
                          textAlign: "center",
                          py: 4,
                          color: "rgba(255,255,255,0.5)",
                        }}
                      >
                        <SmartToy sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          No hay señales disponibles
                        </Typography>
                        <Button
                          variant="outlined"
                          onClick={analyzeWithAI}
                          disabled={analyzing}
                          size="small"
                          sx={{
                            borderColor: "#00ffff",
                            color: "#00ffff",
                            "&:hover": {
                              backgroundColor: "rgba(0,255,255,0.1)",
                            },
                          }}
                        >
                          Generar Señales
                        </Button>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Floating Action Button */}
          <Fab
            onClick={analyzeWithAI}
            disabled={analyzing || !chartRawData}
            sx={{
              position: "fixed",
              bottom: 24,
              right: 24,
              backgroundColor: "#00ffff",
              color: "#000000",
              zIndex: 1000,
              "&:hover": {
                backgroundColor: "#00cccc",
              },
            }}
          >
            {analyzing ? <CircularProgress size={24} sx={{ color: "#000000" }} /> : <SmartToy />}
          </Fab>

          {/*  Dialog de configuración con temporalidad  */}
          <SettingsDialog
            open={settingsOpen}
            onClose={() => setSettingsOpen(false)}
            riskManagement={riskManagement}
            onRiskLocked={handleRiskLockedUI} // Changed to the UI handler
            onMT5StateChange={setMt5Session}
            setRiskManagement={setRiskManagement}
            aiSettings={aiSettings}
            setAiSettings={setAiSettings}
            realtimeSettings={realtimeSettings}
            setRealtimeSettings={setRealtimeSettings}
            showSnackbar={showSnackbarRef.current}
            mt5Session={mt5Session}
            setMt5Session={setMt5Session}
            timeframes={timeframes}
            extendedRiskManagement={extendedRiskManagement}
            setExtendedRiskManagement={setExtendedRiskManagement}
          />

          <SignalDetailsDialog
            signalDetailsOpen={signalDetailsOpen}
            selectedSignalDetails={selectedSignalDetails}
            chartImageUrl={chartImageUrl}
            chartImageLoading={chartImageLoading}
            multiPairPrices={multiPairPrices}
            selectedPair={selectedPair}
            realTimePrice={realTimePrice}
            realtimeEnabled={realtimeEnabled}
            connectionStatus={connectionStatus}
            dataFreshness={dataFreshness}
            connectionQuality={connectionQuality}
            aiSettings={aiSettings}
            currentSignalId={currentSignalId}
            setSignalDetailsOpen={setSignalDetailsOpen}
            setChartImageUrl={setChartImageUrl}
            setChartImageError={setChartImageError}
            setChartImageLoading={setChartImageLoading}
            setImageGenerationAttempted={setImageGenerationAttempted}
            setCurrentSignalId={setCurrentSignalId}
            getMT5DataForPair={getMT5DataForPair}
            showSnackbar={showSnackbarRef.current}
            generateChartImage={generateChartImage}
            executeSignal={executeSignal}
            getConfluenceColor={getConfluenceColor}
            getSignalTypeColor={getSignalTypeColor}
            generateNaturalLanguageExplanation={generateNaturalLanguageExplanation}
            getConnectionQualityColor={getConnectionQualityColor}
            api={api}
          />

          {/* Snackbar para notificaciones */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Alert
              onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
              severity={snackbar.severity}
              sx={{
                backgroundColor: "rgba(0,0,0,0.9)",
                color: "#ffffff",
                border: "1px solid rgba(0,255,255,0.3)",
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ChartErrorBoundary>
  )
}
export default Charts
