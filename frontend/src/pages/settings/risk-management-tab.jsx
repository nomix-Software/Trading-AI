/* eslint-disable no-unused-vars */
"use client"
import {
  Typography,
  Box,
  Grid,
  Card,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  Fade,
  Slide,
  Zoom,
} from "@mui/material"
import { AccountBalanceWallet, Security, Lock } from "@mui/icons-material"
import { useState, useEffect } from "react"

const RiskManagementTab = ({
  riskManagement,
  setRiskManagement,
  extendedRiskManagement,
  setExtendedRiskManagement,
  handleLockRiskConfig,
  mt5State,
  isConnected,
  account,
  lockRiskConfiguration, // Added missing lockRiskConfiguration prop
}) => {
  const [showContent, setShowContent] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)

  useEffect(() => {
    setShowContent(true)
    const timer = setTimeout(() => setAnimateCards(true), 200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Fade in={showContent} timeout={800}>
      <Box
        sx={{
          p: 3,
          background:
            "linear-gradient(135deg, rgba(13, 71, 161, 0.08) 0%, rgba(25, 118, 210, 0.12) 50%, rgba(0, 150, 255, 0.06) 100%)",
          minHeight: "100vh",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(25, 118, 210, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 150, 255, 0.08) 0%, transparent 50%)",
            pointerEvents: "none",
          },
        }}
      >
        {isConnected && (
          <Slide direction="down" in={showContent} timeout={600}>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                backgroundColor: "rgba(76,175,80,0.15)",
                border: "1px solid rgba(25, 118, 210, 0.4)",
                boxShadow:
                  "0 4px 20px rgba(25, 118, 210, 0.2), 0 2px 8px rgba(76, 175, 80, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                borderLeft: "4px solid #1976d2",
                borderRadius: "12px",
                color: "#ffffff",
                "& .MuiAlert-message": { color: "#ffffff" },
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow:
                    "0 6px 25px rgba(25, 118, 210, 0.25), 0 4px 12px rgba(76, 175, 80, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(25, 118, 210, 0.6)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AccountBalanceWallet sx={{ color: "#1976d2" }} />
                <Typography variant="body2" sx={{ color: "#ffffff" }}>
                  {`Conectado a MT5 (${(account?.account_type || "demo").toUpperCase()}) • Saldo: ${
                    account?.currency ? account.currency + " " : "$"
                  }${Number(account?.balance ?? 0).toLocaleString()}`}
                </Typography>
              </Box>
            </Alert>
          </Slide>
        )}

        <Slide direction="down" in={showContent} timeout={800}>
          <Alert
            severity="warning"
            sx={{
              mb: 3,
              backgroundColor: "rgba(255,193,7,0.12)",
              border: "1px solid rgba(25, 118, 210, 0.3)",
              boxShadow:
                "0 4px 20px rgba(25, 118, 210, 0.15), 0 2px 8px rgba(255, 193, 7, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
              borderLeft: "4px solid #1976d2",
              borderRadius: "12px",
              color: "#ffffff",
              "& .MuiAlert-message": { color: "#ffffff" },
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow:
                  "0 6px 25px rgba(25, 118, 210, 0.2), 0 4px 12px rgba(255, 193, 7, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(25, 118, 210, 0.5)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Security sx={{ color: "#1976d2" }} />
              <Typography variant="body2" sx={{ color: "#ffffff" }}>
                <strong style={{ color: "#1976d2" }}>{"⚠️ IMPORTANTE:"}</strong>{" "}
                {
                  "Todas las configuraciones de gestión de riesgo se bloquearán juntas. Al confirmar, se guardará en tu perfil y no podrás modificarlas luego."
                }
              </Typography>
            </Box>
          </Alert>
        </Slide>

        <Zoom in={animateCards} timeout={1000}>
          <Card
            sx={{
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(25, 118, 210, 0.4)",
              boxShadow:
                "0 8px 32px rgba(25, 118, 210, 0.2), 0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              p: 4,
              position: "relative",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow:
                  "0 12px 40px rgba(25, 118, 210, 0.25), 0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(25, 118, 210, 0.6)",
              },
              "&::before": {
                content: '""',
                position: "absolute",
                top: -1,
                left: -1,
                right: -1,
                bottom: -1,
                background:
                  "linear-gradient(45deg, rgba(25, 118, 210, 0.3), rgba(0, 150, 255, 0.2), rgba(25, 118, 210, 0.3))",
                borderRadius: "16px",
                zIndex: -1,
                opacity: 0,
                transition: "opacity 0.3s ease-in-out",
              },
              "&:hover::before": {
                opacity: 0.6,
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: "#ffffff",
                mb: 4,
                fontWeight: "bold",
                textShadow: "0 2px 4px rgba(25, 118, 210, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3)",
                fontSize: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Security sx={{ color: "#1976d2", fontSize: "2rem" }} />
              {"💰 Configuración Completa de Gestión de Riesgo"}
            </Typography>

            <Grid container spacing={4}>
              {/* Configuración Básica */}
              <Grid item xs={12} md={4}>
                <Fade in={animateCards} timeout={1200}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "#ffffff",
                        mb: 3,
                        fontWeight: "bold",
                        borderBottom: "3px solid transparent",
                        backgroundImage: "linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)",
                        backgroundSize: "100% 3px",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "bottom",
                        paddingBottom: 1,
                        textShadow: "0 1px 2px rgba(25, 118, 210, 0.4)",
                      }}
                    >
                      {"📊 Configuración Básica"}
                    </Typography>

                    <TextField
                      fullWidth
                      label="Capital Total (USD)"
                      type="number"
                      value={riskManagement.totalCapital}
                      disabled
                      sx={{
                        mb: 3,
                        "& .MuiInputLabel-root": { color: "#ffffff" },
                        "& .MuiOutlinedInput-root": {
                          color: "#ffffff",
                          borderRadius: "12px",
                          transition: "all 0.3s ease-in-out",
                          "& fieldset": {
                            borderColor: "rgba(25, 118, 210, 0.6)",
                            borderWidth: "2px",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(25, 118, 210, 0.8)",
                            boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.15)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#1976d2",
                            boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.2)",
                          },
                        },
                        "& .MuiFormHelperText-root": { color: "rgba(255, 255, 255, 0.8)" },
                      }}
                      InputProps={{
                        readOnly: true,
                        startAdornment: <Typography sx={{ color: "#1976d2", mr: 1, fontWeight: "bold" }}>$</Typography>,
                      }}
                      helperText="Fijado automáticamente por saldo MT5"
                    />

                    <FormControl fullWidth sx={{ mb: 3 }}>
                      <InputLabel sx={{ color: "#ffffff" }}>{"Riesgo por Operación"}</InputLabel>
                      <Select
                        value={riskManagement.riskPercentage}
                        onChange={(e) =>
                          setRiskManagement((prev) => ({
                            ...prev,
                            riskPercentage: Number(e.target.value),
                          }))
                        }
                        disabled={riskManagement.isLocked}
                        sx={{
                          color: riskManagement.isLocked ? "rgba(255,255,255,0.5)" : "#ffffff",
                          borderRadius: "12px",
                          transition: "all 0.3s ease-in-out",
                          "& .MuiSelect-icon": { color: "#1976d2" },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(25, 118, 210, 0.6)",
                            borderWidth: "2px",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "rgba(25, 118, 210, 0.8)",
                            boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.15)",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#1976d2",
                            boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.2)",
                          },
                        }}
                      >
                        <MenuItem value={1} sx={{ color: "#000000" }}>
                          {"1% - Muy Conservador"}
                        </MenuItem>
                        <MenuItem value={2} sx={{ color: "#000000" }}>
                          {"2% - Balanceado"}
                        </MenuItem>
                        <MenuItem value={3} sx={{ color: "#000000" }}>
                          {"3% - Agresivo (Máximo)"}
                        </MenuItem>
                      </Select>
                    </FormControl>

                    <Zoom in={animateCards} timeout={1400}>
                      <Box
                        sx={{
                          p: 3,
                          background:
                            "linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(0, 150, 255, 0.1) 100%)",
                          borderRadius: "16px",
                          border: "2px solid rgba(25, 118, 210, 0.4)",
                          boxShadow: "0 4px 20px rgba(25, 118, 210, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            transform: "scale(1.02)",
                            boxShadow: "0 6px 25px rgba(25, 118, 210, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
                            border: "2px solid rgba(25, 118, 210, 0.6)",
                          },
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            color: "#ffffff",
                            mb: 3,
                            fontWeight: "bold",
                            textAlign: "center",
                            textShadow: "0 1px 2px rgba(25, 118, 210, 0.6)",
                          }}
                        >
                          💰 Resumen Principal
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <Box sx={{ textAlign: "center", mb: 2 }}>
                              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                                Capital Total
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: "#ffffff",
                                  fontWeight: "bold",
                                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                                }}
                              >
                                ${riskManagement.totalCapital.toLocaleString()}
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                                Riesgo
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: "#1976d2",
                                  fontWeight: "bold",
                                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                                }}
                              >
                                {riskManagement.riskPercentage}%
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                                Máximo
                              </Typography>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: "#1976d2",
                                  fontWeight: "bold",
                                  textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                                }}
                              >
                                $
                                {((riskManagement.totalCapital * riskManagement.riskPercentage) / 100).toLocaleString()}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Zoom>
                  </Box>
                </Fade>
              </Grid>

              {/* Configuración Avanzada */}
              <Grid item xs={12} md={8}>
                <Fade in={animateCards} timeout={1400}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: "#ffffff",
                        mb: 3,
                        fontWeight: "bold",
                        borderBottom: "3px solid transparent",
                        backgroundImage: "linear-gradient(90deg, #1976d2, #42a5f5, #1976d2)",
                        backgroundSize: "100% 3px",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "bottom",
                        paddingBottom: 1,
                        textShadow: "0 1px 2px rgba(25, 118, 210, 0.4)",
                      }}
                    >
                      {"⚠️ Configuración Avanzada"}
                    </Typography>

                    <Grid container spacing={3}>
                      {[
                        {
                          label: "📈 Límites Diarios",
                          field: "maxDailyLossPercent",
                          placeholder: "Pérdida máxima diaria (%)",
                        },
                        {
                          label: "📈 Límites Semanales",
                          field: "maxWeeklyLossPercent",
                          placeholder: "Pérdida máxima semanal (%)",
                        },
                        {
                          label: "📈 Ganancia Máxima",
                          field: "maxDailyProfitPercent",
                          placeholder: "Ganancia máxima diaria (%)",
                        },
                        {
                          label: "🎯 Operaciones Abiertas",
                          field: "maxOpenTrades",
                          placeholder: "Máximo operaciones abiertas",
                        },
                        { label: "🎯 Relación R:R Mínima", field: "minRRR", placeholder: "Relación R:R mínima" },
                        {
                          label: "🛡️ Protección de Capital",
                          field: "maxLosingStreak",
                          placeholder: "Racha máxima de pérdidas",
                        },
                      ].map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={item.field}>
                          <Slide direction="up" in={animateCards} timeout={1000 + index * 100}>
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "#ffffff",
                                  mb: 2,
                                  fontWeight: "bold",
                                  textShadow: "0 1px 2px rgba(25, 118, 210, 0.4)",
                                }}
                              >
                                {item.label}
                              </Typography>
                              <TextField
                                fullWidth
                                label={item.placeholder}
                                type="number"
                                value={extendedRiskManagement[item.field]}
                                onChange={(e) =>
                                  setExtendedRiskManagement((prev) => ({
                                    ...prev,
                                    [item.field]: Number(e.target.value),
                                  }))
                                }
                                disabled={riskManagement.isLocked}
                                sx={{
                                  mb: 2,
                                  "& .MuiInputLabel-root": { color: "#ffffff" },
                                  "& .MuiOutlinedInput-root": {
                                    color: "#ffffff",
                                    borderRadius: "12px",
                                    transition: "all 0.3s ease-in-out",
                                    "& fieldset": {
                                      borderColor: "rgba(25, 118, 210, 0.5)",
                                      borderWidth: "2px",
                                    },
                                    "&:hover fieldset": {
                                      borderColor: "rgba(25, 118, 210, 0.7)",
                                      boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.1)",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#1976d2",
                                      boxShadow: "0 0 0 3px rgba(25, 118, 210, 0.2)",
                                    },
                                  },
                                }}
                              />
                            </Box>
                          </Slide>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Fade>
              </Grid>

              {/* Botón de bloqueo */}
              <Grid item xs={12}>
                <Zoom in={animateCards} timeout={1600}>
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                    {!riskManagement.isLocked ? (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={lockRiskConfiguration}
                        disabled={!mt5State.connected}
                        startIcon={<Lock />}
                        sx={{
                          minWidth: 250,
                          borderRadius: "12px",
                          padding: "12px 32px",
                          fontSize: "1.1rem",
                          fontWeight: "bold",
                          background: "linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)",
                          boxShadow: "0 4px 20px rgba(25, 118, 210, 0.4), 0 2px 8px rgba(0, 0, 0, 0.1)",
                          border: "1px solid rgba(25, 118, 210, 0.3)",
                          transition: "all 0.3s ease-in-out",
                          "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: "0 6px 25px rgba(25, 118, 210, 0.5), 0 4px 12px rgba(0, 0, 0, 0.15)",
                            background: "linear-gradient(45deg, #1565c0 30%, #2196f3 90%)",
                            border: "1px solid rgba(25, 118, 210, 0.5)",
                          },
                          "&:active": {
                            transform: "translateY(0px)",
                          },
                          "&:disabled": {
                            background: "rgba(25, 118, 210, 0.3)",
                            color: "rgba(255, 255, 255, 0.5)",
                          },
                        }}
                      >
                        Bloquear Gestión de Riesgo
                      </Button>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          p: 3,
                          borderRadius: "12px",
                          background:
                            "linear-gradient(45deg, rgba(76, 175, 80, 0.2) 30%, rgba(129, 199, 132, 0.1) 90%)",
                          border: "2px solid rgba(76, 175, 80, 0.4)",
                          boxShadow: "0 4px 20px rgba(76, 175, 80, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                        }}
                      >
                        <Lock sx={{ color: "#4caf50", fontSize: "2rem" }} />
                        <Typography
                          variant="body1"
                          sx={{
                            color: "#ffffff",
                            textAlign: "center",
                            textShadow: "0 2px 4px rgba(76, 175, 80, 0.5)",
                            fontSize: "1.2rem",
                            fontWeight: "bold",
                          }}
                        >
                          🔒 Gestión de riesgo bloqueada y protegida
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Zoom>
              </Grid>

              {/* Resumen Detallado */}
              <Grid item xs={12}>
                <Slide direction="up" in={animateCards} timeout={1800}>
                  <Box
                    sx={{
                      p: 4,
                      background: "linear-gradient(135deg, rgba(25, 118, 210, 0.12) 0%, rgba(0, 150, 255, 0.08) 100%)",
                      borderRadius: "20px",
                      border: "2px solid rgba(25, 118, 210, 0.3)",
                      boxShadow: "0 8px 32px rgba(25, 118, 210, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)",
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        boxShadow: "0 12px 40px rgba(25, 118, 210, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.18)",
                        border: "2px solid rgba(25, 118, 210, 0.5)",
                      },
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        color: "#ffffff",
                        mb: 4,
                        fontWeight: "bold",
                        textAlign: "center",
                        textShadow: "0 2px 4px rgba(25, 118, 210, 0.5)",
                        fontSize: "1.4rem",
                      }}
                    >
                      📊 Resumen Detallado de Configuración
                    </Typography>

                    <Grid container spacing={4}>
                      {/* Cálculos de Trading */}
                      <Grid item xs={12} md={4}>
                        <Zoom in={animateCards} timeout={2000}>
                          <Box
                            sx={{
                              p: 3,
                              backgroundColor: "rgba(255,193,7,0.1)",
                              borderRadius: "16px",
                              border: "2px solid rgba(255,193,7,0.3)",
                              boxShadow: "0 4px 20px rgba(25, 118, 210, 0.1), 0 2px 8px rgba(255,193,7,0.2)",
                              height: "100%",
                              transition: "all 0.3s ease-in-out",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 8px 30px rgba(25, 118, 210, 0.15), 0 4px 12px rgba(255,193,7,0.3)",
                              },
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ color: "#ffffff", mb: 2, fontWeight: "bold", textAlign: "center" }}
                            >
                              📈 Cálculos de Trading
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={6}>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography variant="caption" sx={{ color: "#ffffff", display: "block" }}>
                                    Lote Calculado
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                                    {(
                                      (riskManagement.totalCapital * riskManagement.riskPercentage) /
                                      100 /
                                      100 /
                                      10
                                    ).toFixed(2)}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography variant="caption" sx={{ color: "#ffffff", display: "block" }}>
                                    R:R Mínima
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                                    1:{extendedRiskManagement.minRRR}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </Zoom>
                      </Grid>

                      {/* Límites Temporales */}
                      <Grid item xs={12} md={4}>
                        <Zoom in={animateCards} timeout={2200}>
                          <Box
                            sx={{
                              p: 3,
                              backgroundColor: "rgba(156,39,176,0.1)",
                              borderRadius: "16px",
                              border: "2px solid rgba(156,39,176,0.3)",
                              boxShadow: "0 4px 20px rgba(25, 118, 210, 0.1), 0 2px 8px rgba(156,39,176,0.2)",
                              height: "100%",
                              transition: "all 0.3s ease-in-out",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 8px 30px rgba(25, 118, 210, 0.15), 0 4px 12px rgba(156,39,176,0.3)",
                              },
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ color: "#ffffff", mb: 2, fontWeight: "bold", textAlign: "center" }}
                            >
                              ⏰ Límites Temporales
                            </Typography>
                            <Grid container spacing={1}>
                              <Grid item xs={6}>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography variant="caption" sx={{ color: "#ffffff", display: "block" }}>
                                    Pérd. Máx. Diaria
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                                    {extendedRiskManagement.maxDailyLossPercent}%
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#ffffff" }}>
                                    $
                                    {(
                                      (riskManagement.totalCapital * extendedRiskManagement.maxDailyLossPercent) /
                                      100
                                    ).toLocaleString()}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={6}>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography variant="caption" sx={{ color: "#ffffff", display: "block" }}>
                                    Pérd. Máx. Semanal
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                                    {extendedRiskManagement.maxWeeklyLossPercent}%
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#ffffff" }}>
                                    $
                                    {(
                                      (riskManagement.totalCapital * extendedRiskManagement.maxWeeklyLossPercent) /
                                      100
                                    ).toLocaleString()}
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Box sx={{ textAlign: "center", mt: 1 }}>
                                  <Typography variant="caption" sx={{ color: "#ffffff", display: "block" }}>
                                    Ganancia Máx. Diaria
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                                    {extendedRiskManagement.maxDailyProfitPercent}% • $
                                    {(
                                      (riskManagement.totalCapital * extendedRiskManagement.maxDailyProfitPercent) /
                                      100
                                    ).toLocaleString()}
                                  </Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </Zoom>
                      </Grid>

                      {/* Protección de Capital */}
                      <Grid item xs={12} md={4}>
                        <Zoom in={animateCards} timeout={2400}>
                          <Box
                            sx={{
                              p: 3,
                              backgroundColor: "rgba(244,67,54,0.1)",
                              borderRadius: "16px",
                              border: "2px solid rgba(244,67,54,0.3)",
                              boxShadow: "0 4px 20px rgba(25, 118, 210, 0.1), 0 2px 8px rgba(244,67,54,0.2)",
                              height: "100%",
                              transition: "all 0.3s ease-in-out",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: "0 8px 30px rgba(25, 118, 210, 0.15), 0 4px 12px rgba(244,67,54,0.3)",
                              },
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ color: "#ffffff", mb: 2, fontWeight: "bold", textAlign: "center" }}
                            >
                              🛡️ Protección de Capital
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12}>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography variant="caption" sx={{ color: "#ffffff", display: "block" }}>
                                    Racha Máx. de Pérdidas
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                                    {extendedRiskManagement.maxLosingStreak}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: "#ffffff" }}>
                                    operaciones consecutivas
                                  </Typography>
                                </Box>
                              </Grid>
                              <Grid item xs={12}>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography variant="caption" sx={{ color: "#ffffff", display: "block" }}>
                                    Estado de Configuración
                                  </Typography>
                                  <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                                    {riskManagement.isLocked ? "🔒 Bloqueada" : "🔓 Editable"}
                                  </Typography>
                                  {riskManagement.isLocked && riskManagement.lockedAt && (
                                    <Typography variant="caption" sx={{ color: "#ffffff" }}>
                                      desde {new Date(riskManagement.lockedAt).toLocaleDateString()}
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>
                        </Zoom>
                      </Grid>
                    </Grid>
                  </Box>
                </Slide>
              </Grid>
            </Grid>
          </Card>
        </Zoom>
      </Box>
    </Fade>
  )
}

export default RiskManagementTab
