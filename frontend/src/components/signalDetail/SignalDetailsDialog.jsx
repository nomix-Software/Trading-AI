"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Tooltip,
} from "@mui/material"
import {
  Close,
  ImageOutlined,
  Psychology,
  Analytics,
  ExpandMore,
  Refresh,
  PlayCircleOutline,
  ShowChartOutlined,
  TrendingFlat,
} from "@mui/icons-material"
import TimelineIcon from "@mui/icons-material/Timeline"
import ChartImageComponent from "./ChartImageComponent"

const SignalDetailsDialog = ({
  signalDetailsOpen,
  selectedSignalDetails,
  chartImageUrl,
  chartImageLoading,
  multiPairPrices,
  selectedPair,
  realTimePrice,
  realtimeEnabled,
  connectionStatus,
  dataFreshness,
  connectionQuality,
  aiSettings,
  currentSignalId,
  setSignalDetailsOpen,
  setChartImageUrl,
  setChartImageError,
  setChartImageLoading,
  setImageGenerationAttempted,
  setCurrentSignalId,
  getMT5DataForPair,
  showSnackbar,
  generateChartImage,
  executeSignal,
  getConfluenceColor,
  getSignalTypeColor,
  generateNaturalLanguageExplanation,
  getConnectionQualityColor,
}) => {
  const signal = useMemo(() => selectedSignalDetails, [selectedSignalDetails])
  const signalId = useMemo(() => {
    if (!signal) return null
    return `${signal._id || signal.id}-${signal.symbol}-${signal.timeframe}-${signal.created_at}`
  }, [signal])

  const [localStates, setLocalStates] = useState({
    isUpdatingPrice: false,
    lastManualUpdate: null,
    imageGenerationAttempted: false,
    localChartImageUrl: null,
    localChartImageLoading: false,
    localChartImageError: false,
  })

  const currentPriceForSignal = useMemo(() => {
    if (!signal) return null
    const pairPrice = multiPairPrices[signal.symbol]
    if (pairPrice && pairPrice.price) {
      return pairPrice.price
    }

    if (signal.symbol === selectedPair && realTimePrice) {
      return realTimePrice
    }

    if (signal.entry_price) {
      const volatility = signal.symbol.includes("JPY") ? 0.5 : 0.0005
      const change = (Math.random() - 0.5) * volatility
      const simulatedPrice = signal.entry_price + change
      return Number.parseFloat(simulatedPrice.toFixed(signal.symbol.includes("JPY") ? 2 : 5))
    }
    return null
  }, [signal, multiPairPrices, selectedPair, realTimePrice])

  // Calcular diferencia y porcentaje considerando BUY/SELL
  const priceDifference = useMemo(() => {
    if (!signal || !currentPriceForSignal || !signal.entry_price || !signal.signal_type) return null
    const entryPrice = signal.entry_price
    const currentPrice = currentPriceForSignal
    const signalType = signal.signal_type.toLowerCase()
    let diff, percentage, isProfit

    if (signalType === "buy") {
      diff = currentPrice - entryPrice
      percentage = (diff / entryPrice) * 100
      isProfit = diff > 0
    } else if (signalType === "sell") {
      diff = entryPrice - currentPrice
      percentage = (diff / entryPrice) * 100
      isProfit = diff > 0
    } else {
      diff = currentPrice - entryPrice
      percentage = (diff / entryPrice) * 100
      isProfit = diff > 0
    }

    return {
      absolute: diff,
      percentage: percentage,
      isProfit: isProfit,
      signalType: signalType,
    }
  }, [signal, currentPriceForSignal])

  const pipsCalculation = useMemo(() => {
    if (!priceDifference || !signal) return null
    const isJPY = signal.symbol.includes("JPY")
    const pipValue = isJPY ? 0.01 : 0.0001
    const pips = Math.abs(priceDifference.absolute) / pipValue
    const pipInfo = {
      pips: pips.toFixed(1),
      isJPY: isJPY,
      pipValue: pipValue,
      signalType: priceDifference.signalType,
      isProfit: priceDifference.isProfit,
      pipValueUSD: isJPY ? pips * 0.91 : pips * 1.0,
      direction: priceDifference.isProfit ? "favorable" : "desfavorable",
    }
    return pipInfo
  }, [priceDifference, signal])

  const handleUpdatePrice = useCallback(async () => {
    if (!signal || !signal.symbol || localStates.isUpdatingPrice) return
    setLocalStates((prev) => ({ ...prev, isUpdatingPrice: true }))
    try {
      console.log(`🔄 Actualizando precio manualmente para ${signal.symbol}...`)
      await getMT5DataForPair(signal.symbol, true)
      setLocalStates((prev) => ({
        ...prev,
        lastManualUpdate: new Date(),
        isUpdatingPrice: false,
      }))
      showSnackbar(`✅ Precio actualizado para ${signal.symbol}`, "success")
    } catch (error) {
      console.error("❌ Error actualizando precio:", error)
      showSnackbar(`❌ Error actualizando precio de ${signal.symbol}`, "error")
      setLocalStates((prev) => ({ ...prev, isUpdatingPrice: false }))
    }
  }, [signal, localStates.isUpdatingPrice, getMT5DataForPair, showSnackbar])

  const handleCloseDialog = useCallback(() => {
    setSignalDetailsOpen(false)
    setChartImageUrl(null)
    setChartImageError(false)
    setChartImageLoading(false)
    setImageGenerationAttempted(false)
    setCurrentSignalId(null)
    setLocalStates({
      isUpdatingPrice: false,
      lastManualUpdate: null,
      imageGenerationAttempted: false,
      localChartImageUrl: null,
      localChartImageLoading: false,
      localChartImageError: false,
    })
  }, [
    setSignalDetailsOpen,
    setChartImageUrl,
    setChartImageError,
    setChartImageLoading,
    setImageGenerationAttempted,
    setCurrentSignalId,
  ])

  const handleRetryChartImage = useCallback(() => {
    if (signal) {
      setLocalStates((prev) => ({
        ...prev,
        imageGenerationAttempted: false,
        localChartImageError: false,
        localChartImageUrl: null,
      }))
      setChartImageError(false)
      setChartImageUrl(null)
      setCurrentSignalId(null)
      console.log("Reintentando generación de imagen para:", signal.symbol)
      generateChartImage(signal)
    }
  }, [signal, generateChartImage, setChartImageUrl, setChartImageError, setCurrentSignalId])

  useEffect(() => {
    if (
      signalDetailsOpen &&
      signal &&
      signalId &&
      !localStates.imageGenerationAttempted &&
      currentSignalId !== signalId
    ) {
      console.log("Generando imagen del gráfico para señal:", signalId)
      setLocalStates((prev) => ({ ...prev, imageGenerationAttempted: true }))
      generateChartImage(signal)
    }
  }, [signalDetailsOpen, signalId, localStates.imageGenerationAttempted, currentSignalId, generateChartImage, signal])

  useEffect(() => {
    if (!signalDetailsOpen) {
      setLocalStates((prev) => ({
        ...prev,
        imageGenerationAttempted: false,
        isUpdatingPrice: false,
        lastManualUpdate: null,
      }))
    }
  }, [signalDetailsOpen])

  useEffect(() => {
    if (signalDetailsOpen && signal && signal?.symbol && !multiPairPrices[signal.symbol]) {
      console.log("Obteniendo precio inicial para señal:", signal.symbol)
      getMT5DataForPair(signal.symbol)
    }
  }, [signalDetailsOpen, signal, multiPairPrices, getMT5DataForPair])

  const signalDataStatus = useMemo(() => {
    if (!signal) return { isLive: false, status: "unknown", quality: "unknown" }
    const pairData = multiPairPrices[signal.symbol]

    if (signal.symbol === selectedPair && realtimeEnabled && connectionStatus === "connected") {
      return {
        isLive: dataFreshness === "fresh" && !pairData?.simulated,
        status: pairData?.simulated ? "simulated" : dataFreshness,
        quality: connectionQuality,
        isSelectedPair: true,
        source: pairData?.source || "unknown",
      }
    }

    if (pairData) {
      const dataAge = Date.now() - new Date(pairData.timestamp).getTime()
      let status = "stale"
      if (pairData.simulated) {
        status = "simulated"
      } else if (dataAge < 2000) {
        status = "fresh"
      } else if (dataAge < 10000) {
        status = "recent"
      }
      return {
        isLive: pairData.isRealTime && status === "fresh" && !pairData.simulated,
        status: status,
        quality: pairData.quality || "unknown",
        isSelectedPair: false,
        latency: pairData.latency,
        source: pairData.source || "unknown",
      }
    }

    return {
      isLive: false,
      status: "no_data",
      quality: "unknown",
      isSelectedPair: false,
      source: "none",
    }
  }, [signal, multiPairPrices, selectedPair, realtimeEnabled, connectionStatus, dataFreshness, connectionQuality])

  const naturalExplanation = useMemo(() => {
    return generateNaturalLanguageExplanation(signal)
  }, [signal, generateNaturalLanguageExplanation])

  if (!signal) return null

  return (
    <Dialog
      open={signalDetailsOpen}
      onClose={handleCloseDialog}
      maxWidth="xl"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "rgba(0,0,0,0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0,255,255,0.3)",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle sx={{ color: "#00ffff", borderBottom: "1px solid rgba(0,255,255,0.2)" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h5">
            Señal {signal.signal_type?.toUpperCase()} - {signal.symbol}
            {signal.analysis_timeframe && (
              <Chip
                label={`Análisis: ${aiSettings.analysisTimeframe}`}
                sx={{
                  ml: 2,
                  backgroundColor: "#9c27b0",
                  color: "#ffffff",
                  fontSize: "12px",
                }}
              />
            )}
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Chip
              label={`Confluencia: ${((signal.confluence_score || 0) * 100).toFixed(0)}%`}
              sx={{
                backgroundColor: getConfluenceColor(signal.confluence_score || 0) + "20",
                color: getConfluenceColor(signal.confluence_score || 0),
                border: `1px solid ${getConfluenceColor(signal.confluence_score || 0)}40`,
              }}
            />
            <IconButton onClick={handleCloseDialog} sx={{ color: "#ffffff" }}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ color: "#ffffff", p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)", mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: "#00ffff", mb: 2 }}>
                  <ImageOutlined sx={{ mr: 1, verticalAlign: "middle" }} />
                  Gráfico con Análisis
                </Typography>

                <ChartImageComponent
                  signal={signal}
                  imageUrl={chartImageUrl}
                  isLoading={chartImageLoading}
                  onRetry={handleRetryChartImage}
                />

                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                    <Typography variant="h6" sx={{ color: "#00ffff" }}>
                      Información de Trading
                    </Typography>
                    <Tooltip title="Actualizar precio actual">
                      <IconButton
                        onClick={handleUpdatePrice}
                        disabled={localStates.isUpdatingPrice}
                        size="small"
                        sx={{
                          color: "#00ffff",
                          backgroundColor: "rgba(0,255,255,0.1)",
                          border: "1px solid rgba(0,255,255,0.3)",
                          "&:hover": {
                            backgroundColor: "rgba(0,255,255,0.2)",
                          },
                          "&:disabled": {
                            color: "rgba(0,255,255,0.5)",
                          },
                        }}
                      >
                        {localStates.isUpdatingPrice ? (
                          <CircularProgress size={16} sx={{ color: "#00ffff" }} />
                        ) : (
                          <Refresh sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Typography variant="body2" sx={{ color: "#00ff88" }}>
                      <strong>Entrada:</strong>{" "}
                      {signal.entry_price?.toFixed(signal.symbol.includes("JPY") ? 2 : 5) || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ff4444" }}>
                      <strong>Stop Loss:</strong>{" "}
                      {signal.stop_loss?.toFixed(signal.symbol.includes("JPY") ? 2 : 5) || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#00ff88" }}>
                      <strong>Take Profit:</strong>{" "}
                      {signal.take_profit?.toFixed(signal.symbol.includes("JPY") ? 2 : 5) || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ffffff" }}>
                      <strong>Timeframe:</strong> {signal.timeframe || signal.analysis_timeframe || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#ffffff" }}>
                      <strong>Estado:</strong> {signal.status || "Activo"}
                    </Typography>

                    {currentPriceForSignal && (
                      <Box
                        sx={{
                          backgroundColor: "rgba(0,255,255,0.1)",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid rgba(0,255,255,0.3)",
                          position: "relative",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#00ffff",
                            fontWeight: "bold",
                            mb: 1,
                          }}
                        >
                          <strong>Precio Actual:</strong>{" "}
                          {currentPriceForSignal.toFixed(signal.symbol.includes("JPY") ? 2 : 5)}
                          {signalDataStatus.isLive && signalDataStatus.status === "fresh" && (
                            <Chip
                              label="🔴 EN VIVO"
                              size="small"
                              sx={{
                                ml: 1,
                                backgroundColor: "#00ff88",
                                color: "#000000",
                                fontSize: "10px",
                                height: "16px",
                                animation: "pulse 2s infinite",
                              }}
                            />
                          )}
                          {!signalDataStatus.isLive && signalDataStatus.status === "recent" && (
                            <Chip
                              label="🟡 RECIENTE"
                              size="small"
                              sx={{
                                ml: 1,
                                backgroundColor: "#ffaa00",
                                color: "#000000",
                                fontSize: "10px",
                                height: "16px",
                              }}
                            />
                          )}
                          {signalDataStatus.status === "simulated" && (
                            <Chip
                              label="🟣 SIM"
                              size="small"
                              sx={{
                                ml: 1,
                                backgroundColor: "#9c27b0",
                                color: "#ffffff",
                                fontSize: "10px",
                                height: "16px",
                              }}
                            />
                          )}
                        </Typography>
                        {localStates.lastManualUpdate && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#00ff88",
                              fontSize: "9px",
                              display: "block",
                            }}
                          >
                            ✅ Actualizado manualmente: {localStates.lastManualUpdate.toLocaleTimeString()}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {priceDifference && (
                      <Box
                        sx={{
                          backgroundColor: "rgba(255,255,255,0.02)",
                          padding: "8px",
                          borderRadius: "4px",
                          border: `1px solid ${priceDifference.isProfit ? "#00ff88" : "#ff4444"}40`,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            color: priceDifference.isProfit ? "#00ff88" : "#ff4444",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          <strong>Diferencia ({priceDifference.signalType.toUpperCase()}):</strong>{" "}
                          {priceDifference.isProfit ? "+" : ""}
                          {priceDifference.absolute.toFixed(signal.symbol.includes("JPY") ? 2 : 5)} (
                          {priceDifference.isProfit ? "+" : ""}
                          {priceDifference.percentage.toFixed(2)}%)
                        </Typography>
                        {pipsCalculation && (
                          <Box sx={{ mt: 0.5 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                color: priceDifference.isProfit ? "#00ff88" : "#ff4444",
                                fontSize: "11px",
                              }}
                            >
                              <strong>Pips:</strong> {priceDifference.isProfit ? "+" : "-"}
                              {pipsCalculation.pips} pips
                              {pipsCalculation.isJPY && (
                                <Chip
                                  label="JPY"
                                  size="small"
                                  sx={{
                                    ml: 1,
                                    height: "14px",
                                    fontSize: "8px",
                                    backgroundColor: "#ffaa00",
                                    color: "#000000",
                                  }}
                                />
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "rgba(255,255,255,0.6)",
                                fontSize: "9px",
                                display: "block",
                                mt: 0.5,
                              }}
                            >
                              Valor pip: {pipsCalculation.pipValue} | Dirección: {pipsCalculation.direction}
                            </Typography>
                          </Box>
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "rgba(255,255,255,0.6)",
                            fontSize: "10px",
                            mt: 0.5,
                          }}
                        >
                          {priceDifference.isProfit ? "📈 Ganando" : "📉 Perdiendo"} | Tipo:{" "}
                          {priceDifference.signalType.toUpperCase()}
                        </Typography>
                      </Box>
                    )}

                    {multiPairPrices[signal.symbol] && (
                      <Box
                        sx={{
                          mt: 1,
                          p: 1,
                          backgroundColor: "rgba(255,255,255,0.02)",
                          borderRadius: "4px",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.7)",
                            fontSize: "10px",
                            display: "block",
                          }}
                        >
                          <strong>Última actualización:</strong>{" "}
                          {new Date(multiPairPrices[signal.symbol].timestamp).toLocaleTimeString()}
                        </Typography>
                        {multiPairPrices[signal.symbol].latency && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: multiPairPrices[signal.symbol].latency < 1000 ? "#00ff88" : "#ffaa00",
                              fontSize: "10px",
                              display: "block",
                            }}
                          >
                            <strong>Latencia:</strong> {multiPairPrices[signal.symbol].latency}ms
                          </Typography>
                        )}
                        {signalDataStatus.quality !== "unknown" && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: getConnectionQualityColor(signalDataStatus.quality),
                              fontSize: "10px",
                              display: "block",
                            }}
                          >
                            <strong>Calidad:</strong> {signalDataStatus.quality}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)", mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: "#00ffff", mb: 2 }}>
                  <Psychology sx={{ mr: 1, verticalAlign: "middle" }} />
                  Explicación del Análisis
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#ffffff",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {naturalExplanation}
                </Typography>
              </CardContent>
            </Card>

            <Card sx={{ backgroundColor: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,255,255,0.2)" }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: "#00ffff", mb: 2 }}>
                  <Analytics sx={{ mr: 1, verticalAlign: "middle" }} />
                  Análisis Técnicos Detallados
                </Typography>
                {signal.technical_analyses && signal.technical_analyses.length > 0 ? (
                  signal.technical_analyses.map((analysis, index) => (
                    <Accordion
                      key={`${analysis.type}-${index}`}
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        color: "#ffffff",
                        mb: 1,
                        "&:before": { display: "none" },
                      }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore sx={{ color: "#00ffff" }} />}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                            mr: 2,
                          }}
                        >
                          <Typography variant="subtitle1">
                            {analysis.type === "elliott_wave" && (
                              <TimelineIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                            )}
                            {analysis.type === "fibonacci" && (
                              <ShowChartOutlined sx={{ mr: 1, verticalAlign: "middle" }} />
                            )}
                            {analysis.type === "support_resistance" && (
                              <TrendingFlat sx={{ mr: 1, verticalAlign: "middle" }} />
                            )}
                            {analysis.description || analysis.type.replace("_", " ").toUpperCase()}
                          </Typography>
                          <Chip
                            label={`${((analysis.confidence || 0) * 100).toFixed(0)}%`}
                            size="small"
                            sx={{
                              backgroundColor: getConfluenceColor(analysis.confidence || 0) + "20",
                              color: getConfluenceColor(analysis.confidence || 0),
                            }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body2">Análisis detallado para {analysis.type}</Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))
                ) : (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 4,
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    <Analytics sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                    <Typography variant="body1">No hay análisis técnicos detallados disponibles</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: "1px solid rgba(0,255,255,0.2)" }}>
        <Button onClick={handleCloseDialog} sx={{ color: "#ffffff" }}>
          Cerrar
        </Button>
        <Button
          variant="contained"
          onClick={() => executeSignal(signal)}
          startIcon={<PlayCircleOutline />}
          sx={{
            backgroundColor: getSignalTypeColor(signal.signal_type),
            color: "#000000",
            "&:hover": {
              backgroundColor: getSignalTypeColor(signal.signal_type),
              opacity: 0.8,
            },
          }}
        >
          Ejecutar Señal
        </Button>
      </DialogActions>
    </Dialog>
  )
}

SignalDetailsDialog.displayName = "SignalDetailsDialog"

export default React.memo(SignalDetailsDialog)
