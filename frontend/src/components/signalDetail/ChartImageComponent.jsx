// ChartImageComponent.jsx
import React from "react"
import { Box, Typography, CircularProgress, Button } from "@mui/material"
import { ShowChart, Info } from "@mui/icons-material"

const ChartImageComponent = ({ signal, imageUrl, isLoading, }) => {
  // Si no hay imagen, mostramos un mensaje informativo
  if (!imageUrl && !isLoading) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,255,255,0.05)",
          borderRadius: 2,
          border: "1px solid rgba(0,255,255,0.2)",
          p: 3,
        }}
      >
        <ShowChart sx={{ fontSize: 64, color: "#00ffff", opacity: 0.5, mb: 2 }} />
        <Typography variant="body1" sx={{ color: "#00ffff", textAlign: "center", mb: 1 }}>
          Gráfico en Vivo Disponible
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", textAlign: "center", fontSize: "12px" }}>
          <Info sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
          El gráfico interactivo de {signal.symbol} está disponible en la vista principal con TradingView
        </Typography>
      </Box>
    )
  }

  if (isLoading) {
    return (
      <Box
        sx={{
          height: 300,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,255,255,0.05)",
          borderRadius: 2,
          border: "1px solid rgba(0,255,255,0.2)",
        }}
      >
        <CircularProgress sx={{ color: "#00ffff", mb: 2 }} />
        <Typography variant="body2" sx={{ color: "#00ffff" }}>
          Cargando gráfico...
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        height: 300,
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid rgba(0,255,255,0.2)",
      }}
    >
      <img
        src={imageUrl}
        alt={`Gráfico ${signal.symbol}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    </Box>
  )
}

export default ChartImageComponent