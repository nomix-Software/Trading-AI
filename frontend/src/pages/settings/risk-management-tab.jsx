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
} from "@mui/material"
import { AccountBalanceWallet } from "@mui/icons-material"

const RiskManagementTab = ({
  riskManagement,
  setRiskManagement,
  extendedRiskManagement,
  setExtendedRiskManagement,
  handleLockRiskConfig,
  mt5State,
  isConnected,
  account,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      {isConnected && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            backgroundColor: "rgba(76,175,80,0.15)",
            border: "1px solid rgba(76,175,80,0.35)",
            color: "#ffffff",
            "& .MuiAlert-message": { color: "#ffffff" },
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountBalanceWallet sx={{ color: "#ffffff" }} />
            <Typography variant="body2" sx={{ color: "#ffffff" }}>
              {`Conectado a MT5 (${(account?.account_type || "demo").toUpperCase()}) • Saldo: ${
                account?.currency ? account.currency + " " : "$"
              }${Number(account?.balance ?? 0).toLocaleString()}`}
            </Typography>
          </Box>
        </Alert>
      )}
      
      <Alert
        severity="warning"
        sx={{
          mb: 3,
          backgroundColor: "rgba(255,193,7,0.1)",
          border: "1px solid rgba(255,193,7,0.3)",
          color: "#ffffff",
          "& .MuiAlert-message": { color: "#ffffff" },
        }}
      >
        <Typography variant="body2" sx={{ color: "#ffffff" }}>
          <strong style={{ color: "#ffffff" }}>{"⚠️ IMPORTANTE:"}</strong>{" "}
          {
            "Todas las configuraciones de gestión de riesgo se bloquearán juntas. Al confirmar, se guardará en tu perfil y no podrás modificarlas luego."
          }
        </Typography>
      </Alert>

      <Card
        sx={{
          backgroundColor: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(0,255,255,0.2)",
          p: 3,
        }}
      >
        <Typography variant="h6" sx={{ color: "#ffffff", mb: 3, fontWeight: "bold" }}>
          {"💰 Configuración Completa de Gestión de Riesgo"}
        </Typography>

        <Grid container spacing={3}>
          {/* Configuracion Básica */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" sx={{ color: "#ffffff", mb: 2, fontWeight: "bold" }}>
              {"📊 Configuración Básica"}
            </Typography>

            <TextField
              fullWidth
              label="Capital Total (USD)"
              type="number"
              value={riskManagement.totalCapital}
              disabled
              sx={{
                mb: 2,
                "& .MuiInputLabel-root": { color: "#ffffff" },
                "& .MuiOutlinedInput-root": { 
                  color: "#ffffff",
                  "& fieldset": {
                    borderColor: "#ffffff",
                  },
                  "&:hover fieldset": {
                    borderColor: "#ffffff",
                  },
                },
                "& .MuiFormHelperText-root": { color: "#ffffff" },
              }}
              InputProps={{
                readOnly: true,
                startAdornment: <Typography sx={{ color: "#ffffff", mr: 1 }}>$</Typography>,
              }}
              helperText="Fijado automáticamente por saldo MT5"
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
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
                  "& .MuiSelect-icon": { color: "#ffffff" },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffffff",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#ffffff",
                  },
                }}
              >
                <MenuItem value={1} sx={{ color: "#000000" }}>{"1% - Muy Conservador"}</MenuItem>
                <MenuItem value={2} sx={{ color: "#000000" }}>{"2% - Balanceado"}</MenuItem>
                <MenuItem value={3} sx={{ color: "#000000" }}>{"3% - Agresivo (Máximo)"}</MenuItem>
              </Select>
            </FormControl>

            <Box
              sx={{
                p: 2,
                backgroundColor: "rgba(0,255,255,0.1)",
                borderRadius: 1,
                border: "1px solid rgba(0,255,255,0.3)",
              }}
            >
              <Typography variant="subtitle2" sx={{ color: "#ffffff", mb: 2, fontWeight: "bold", textAlign: "center" }}>
                💰 Resumen Principal
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Box sx={{ textAlign: "center", mb: 1 }}>
                    <Typography variant="caption" sx={{ color: "#ffffff" }}>
                      Capital Total
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      ${riskManagement.totalCapital.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "#ffffff" }}>
                      Riesgo
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      {riskManagement.riskPercentage}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="caption" sx={{ color: "#ffffff" }}>
                      Máximo
                    </Typography>
                    <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: "bold" }}>
                      ${((riskManagement.totalCapital * riskManagement.riskPercentage) / 100).toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Configuracion Avanzada */}
          <Grid item xs={12} md={8}>
            <Typography variant="subtitle1" sx={{ color: "#ffffff", mb: 2, fontWeight: "bold" }}>
              {"⚠️ Configuración Avanzada"}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" sx={{ color: "#ffffff", mb: 1, fontWeight: "bold" }}>
                  📈 Límites Diarios
                </Typography>
                <TextField
                  fullWidth
                  label="Pérdida máxima diaria (%)"
                  type="number"
                  value={extendedRiskManagement.maxDailyLossPercent}
                  onChange={(e) =>
                    setExtendedRiskManagement((prev) => ({
                      ...prev,
                      maxDailyLossPercent: Number(e.target.value),
                    }))
                  }
                  disabled={riskManagement.isLocked}
                  sx={{
                    mb: 2,
                    "& .MuiInputLabel-root": { color: "#ffffff" },
                    "& .MuiOutlinedInput-root": { 
                      color: "#ffffff",
                      "& fieldset": {
                        borderColor: "#ffffff",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ffffff",
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" sx={{ color: "#ffffff", mb: 1, fontWeight: "bold" }}>
                  📈 Límites Semanales
                </Typography>
                <TextField
                  fullWidth
                  label="Pérdida máxima semanal (%)"
                  type="number"
                  value={extendedRiskManagement.maxWeeklyLossPercent}
                  onChange={(e) =>
                    setExtendedRiskManagement((prev) => ({
                      ...prev,
                      maxWeeklyLossPercent: Number(e.target.value),
                    }))
                  }
                  disabled={riskManagement.isLocked}
                  sx={{
                    mb: 2,
                    "& .MuiInputLabel-root": { color: "#ffffff" },
                    "& .MuiOutlinedInput-root": { 
                      color: "#ffffff",
                      "& fieldset": {
                        borderColor: "#ffffff",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ffffff",
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" sx={{ color: "#ffffff", mb: 1, fontWeight: "bold" }}>
                  📈 Ganancia Máxima
                </Typography>
                <TextField
                  fullWidth
                  label="Ganancia máxima diaria (%)"
                  type="number"
                  value={extendedRiskManagement.maxDailyProfitPercent}
                  onChange={(e) =>
                    setExtendedRiskManagement((prev) => ({
                      ...prev,
                      maxDailyProfitPercent: Number(e.target.value),
                    }))
                  }
                  disabled={riskManagement.isLocked}
                  sx={{
                    mb: 2,
                    "& .MuiInputLabel-root": { color: "#ffffff" },
                    "& .MuiOutlinedInput-root": { 
                      color: "#ffffff",
                      "& fieldset": {
                        borderColor: "#ffffff",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ffffff",
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" sx={{ color: "#ffffff", mb: 1, fontWeight: "bold" }}>
                  🎯 Operaciones Abiertas
                </Typography>
                <TextField
                  fullWidth
                  label="Máximo operaciones abiertas"
                  type="number"
                  value={extendedRiskManagement.maxOpenTrades}
                  onChange={(e) =>
                    setExtendedRiskManagement((prev) => ({ ...prev, maxOpenTrades: Number(e.target.value) }))
                  }
                  disabled={riskManagement.isLocked}
                  sx={{
                    mb: 2,
                    "& .MuiInputLabel-root": { color: "#ffffff" },
                    "& .MuiOutlinedInput-root": { 
                      color: "#ffffff",
                      "& fieldset": {
                        borderColor: "#ffffff",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ffffff",
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" sx={{ color: "#ffffff", mb: 1, fontWeight: "bold" }}>
                  🎯 Relación R:R Mínima
                </Typography>
                <TextField
                  fullWidth
                  label="Relación R:R mínima"
                  type="number"
                  value={extendedRiskManagement.minRRR}
                  onChange={(e) => setExtendedRiskManagement((prev) => ({ ...prev, minRRR: Number(e.target.value) }))}
                  disabled={riskManagement.isLocked}
                  sx={{
                    mb: 2,
                    "& .MuiInputLabel-root": { color: "#ffffff" },
                    "& .MuiOutlinedInput-root": { 
                      color: "#ffffff",
                      "& fieldset": {
                        borderColor: "#ffffff",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ffffff",
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="body2" sx={{ color: "#ffffff", mb: 1, fontWeight: "bold" }}>
                  🛡️ Protección de Capital
                </Typography>
                <TextField
                  fullWidth
                  label="Racha máxima de pérdidas"
                  type="number"
                  value={extendedRiskManagement.maxLosingStreak}
                  onChange={(e) =>
                    setExtendedRiskManagement((prev) => ({ ...prev, maxLosingStreak: Number(e.target.value) }))
                  }
                  disabled={riskManagement.isLocked}
                  sx={{
                    mb: 2,
                    "& .MuiInputLabel-root": { color: "#ffffff" },
                    "& .MuiOutlinedInput-root": { 
                      color: "#ffffff",
                      "& fieldset": {
                        borderColor: "#ffffff",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ffffff",
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Botón de bloqueo */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              {!riskManagement.isLocked ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLockRiskConfig}
                  disabled={!mt5State.connected}
                  sx={{ minWidth: 250 }}
                >
                  Bloquear Gestión de Riesgo
                </Button>
              ) : (
                <Typography variant="body1" sx={{ color: "#ffffff", textAlign: "center" }}>
                  🔒 Gestión de riesgo bloqueada
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Resumen Detallado */}
          <Grid item xs={12}>
            <Box sx={{ p: 2, backgroundColor: "rgba(0,255,136,0.1)", borderRadius: 1 }}>
              <Typography variant="h6" sx={{ color: "#ffffff", mb: 2, fontWeight: "bold", textAlign: "center" }}>
                📊 Resumen Detallado de Configuración
              </Typography>

              <Grid container spacing={2}>
                {/* Cálculos de Trading */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "rgba(255,193,7,0.1)",
                      borderRadius: 1,
                      border: "1px solid rgba(255,193,7,0.3)",
                      height: "100%",
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
                            {((riskManagement.totalCapital * riskManagement.riskPercentage) / 100 / 100 / 10).toFixed(
                              2,
                            )}
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
                </Grid>

                {/* Límites Temporales */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "rgba(156,39,176,0.1)",
                      borderRadius: 1,
                      border: "1px solid rgba(156,39,176,0.3)",
                      height: "100%",
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
                </Grid>

                {/* Protección de Capital */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      backgroundColor: "rgba(244,67,54,0.1)",
                      borderRadius: 1,
                      border: "1px solid rgba(244,67,54,0.3)",
                      height: "100%",
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
                          <Typography
                            variant="h6"
                            sx={{ color: "#ffffff", fontWeight: "bold" }}
                          >
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
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  )
}

export default RiskManagementTab