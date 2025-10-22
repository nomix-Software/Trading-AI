"use client"

import { useState, useCallback } from "react"
import { Box, Typography, Button, CircularProgress } from "@mui/material"
import { ImageOutlined } from "@mui/icons-material"

const ChartImageComponent = ({ signal, imageUrl, isLoading, onRetry }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(
    (error) => {
      console.error("Error cargando imagen del gráfico:", imageUrl, error)
      setImageLoading(false)
      setImageError(true)
    },
    [imageUrl],
  )

  const handleRetry = useCallback(() => {
    setImageError(false)
    setImageLoading(true)
    onRetry()
  }, [onRetry])

  if (!imageUrl && !isLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: 300,
          backgroundColor: "rgba(255,255,255,0.03)",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(0,255,255,0.1)",
          gap: 2,
        }}
      >
        <ImageOutlined sx={{ fontSize: 48, color: "rgba(255,255,255,0.3)" }} />
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
          No se pudo generar el gráfico con análisis técnico
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleRetry}
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

  return (
    <Box
      sx={{
        width: "100%",
        height: 300,
        backgroundColor: "rgba(255,255,255,0.03)",
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(0,255,255,0.1)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {(isLoading || imageLoading) && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 2,
          }}
        >
          <CircularProgress sx={{ color: "#00ffff", mb: 2 }} />
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Generando gráfico con análisis técnico...
          </Typography>
        </Box>
      )}

      {imageError && !isLoading && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            textAlign: "center",
            p: 2,
          }}
        >
          <ImageOutlined sx={{ fontSize: 48, color: "rgba(255,255,255,0.3)" }} />
          <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
            Error al cargar la imagen
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleRetry}
            sx={{
              borderColor: "#00ffff",
              color: "#00ffff",
              "&:hover": { backgroundColor: "rgba(0,255,255,0.1)" },
            }}
          >
            Reintentar
          </Button>
        </Box>
      )}

      {imageUrl && !imageError && (
        <img
          src={imageUrl || "/placeholder.svg"}
          alt={`Gráfico de ${signal?.symbol || "señal"}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: imageLoading ? "none" : "block",
          }}
        />
      )}
    </Box>
  )
}

export default ChartImageComponent
