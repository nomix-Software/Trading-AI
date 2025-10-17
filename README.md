# 🤖 Trading AI

Sistema de **Trading Algorítmico con Inteligencia Artificial** que integra:

- **Backend** en Python con FastAPI + conexión a MetaTrader 5 y MongoDB.
- **Frontend** en React + Vite.
- Algoritmos de Machine Learning y Deep Learning para análisis técnico y señales de trading.

---

## 📋 Índice

1. [Requisitos previos](#-requisitos-previos)
2. [Instalación Backend](#-configuración-backend)
3. [Instalación Frontend](#-configuración-frontend)
4. [Archivo .env](#-configuración-del-archivo-env)
5. [Ejecución del proyecto](#-ejecución-del-proyecto)
<!-- 6. [Screenshots](#-screenshots) -->
6. [Contribución](#-contribución)
7. [Licencia](#-licencia)

---

## 🚀 Requisitos previos

Asegúrate de tener instalados:

- [Python 3.12.2](https://www.python.org/downloads/windows/)
- [MetaTrader 5](https://www.metatrader5.com/en/download)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- [Node.js (v20+ recomendado)](https://nodejs.org/en/download/prebuilt-installer)
- [Git](https://git-scm.com/downloads)

---
### 0. Descargar Python compatible con MT5

MetaTrader 5 requiere **Python 3.12.2** para funcionar correctamente.  
Asegúrate de no instalar la versión estándar más reciente si no coincide con la compatible.

1. Descargar Python 3.12.2 desde la página oficial: [https://www.python.org/downloads/windows/](https://www.python.org/downloads/windows/)

<img src="./frontend/images/descarga de python 1.png" alt="Captura de configuración MT5" />

2. Durante la instalación, **marca la opción "Add Python to PATH"** para facilitar el uso desde la terminal.

<img src="./frontend/images/descarga de python 2.png" alt="Captura de configuración MT5" />

## ⚙️ Configuración Backend

📂 Carpeta: `trading-ia/backend`

### 1. Crear entorno virtual

```bash
python -m venv venv
```

Activar entorno:

- Windows (terminal de vs):
  ```bash
   source venv/Scripts/activate
  ```
- Linux / Mac:
  ```bash
  source venv/bin/activate
  ```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Configurar MetaTrader 5

1. Descargar [MetaTrader 5](https://www.metatrader5.com/en/download).
2. Abrir una cuenta demo o real.
3. Activar la opción **"Permitir trading algorítmico"** en la configuración.
4. Dejar abierto MT5 mientras se ejecuta la API.

<img src="./frontend/images/descarga de mt5.png" alt="Captura de configuración MT5" />

### 3.2 Activar trading algorítmico en MT5

Para que el backend pueda ejecutar operaciones automáticas, es necesario **activar la opción de trading algorítmico** en MetaTrader 5:

<img src="./frontend/images/activacion de trading algoritmico.png" alt="Captura de configuración MT5" />

### 4. Configuración del archivo `.env`

En la carpeta raíz `trading-ia/backend` crear un archivo `.env` con el siguiente contenido:

```env
ENVIRONMENT=development

HOST=127.0.0.1
PORT=8000
DEBUG=true

# Base de datos MongoDB Atlas 
MONGODB_URL=***
appName=**
MONGODB_DATABASE=****


SECRET_KEY=your-super-secret-key-change-this-in-production-make-it-very-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://localhost:5173"]

# MetaTrader 5
MT5_ENABLED=true
MT5_TIMEOUT=60000

# Configuración de IA
AI_CONFIDENCE_THRESHOLD=0.7
ELLIOTT_WAVE_ENABLED=true
CHART_PATTERNS_ENABLED=true
FIBONACCI_ENABLED=true

# Análisis en tiempo real
REALTIME_ANALYSIS_INTERVAL=60
MAX_CONCURRENT_ANALYSIS=10

# Logging
LOG_LEVEL=INFO
LOG_FILE=trading_ai.log

# WebSocket
WEBSOCKET_PING_INTERVAL=20
WEBSOCKET_PING_TIMEOUT=10

# Pares de trading por defecto
DEFAULT_TIMEFRAMES=["M1","M5","M15","M30","H1","H4","D1"]
MAJOR_PAIRS=["EURUSD","GBPUSD","USDJPY","USDCHF","AUDUSD","USDCAD","NZDUSD"]

# Gestión de riesgo
MAX_RISK_PER_TRADE=0.02
MAX_DAILY_DRAWDOWN=0.05

# Notificaciones
NOTIFICATIONS_ENABLED=true
EMAIL_NOTIFICATIONS=false

# Configuración de email (opcional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```



### 5. Iniciar Backend

Desde la carpeta `trading-ia/backend`:

```bash
python start.py
```

Endpoints disponibles:
- API: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Documentación Swagger: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🎨 Configuración Frontend

📂 Carpeta: `trading-ia/frontend`

### 1. Instalar dependencias

```bash
npm install
```

### 2. Ejecutar en modo desarrollo

```bash
npm run dev
```

Aplicación disponible en 👉 [http://localhost:5173](http://localhost:5173)



---

## 🔑 Configuración del archivo `.env`

Además de las variables de conexión para MongoDB y MT5, puedes añadir claves adicionales como JWT o API Keys según las integraciones futuras.



```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## ▶️ Ejecución del proyecto

1. **Levantar el backend**:
   ```bash
   cd trading-ia/backend
   python start.py
   ```

2. **Levantar el frontend**:
   ```bash
   cd trading-ia/frontend
   npm run dev
   ```

3. Acceder al frontend en `http://localhost:5173` y al backend en `http://localhost:8000`

---
## 📚 Básicos de Trading

Este proyecto incluye una serie de documentos educativos para programadores sin experiencia previa en trading.  
Puedes encontrarlos en la carpeta [`docs/`](./docs/):

- [Volumen 1: Introducción al Trading](./docs/basico_trading_vol1.md)  
- [Volumen 2: Conceptos Clave](./docs/basico_trading_vol2.md)  
- [Volumen 3: Fundamentos para Trading Algorítmico](./docs/basico_trading_vol3.md)  

Cada volumen tiene una extensión máxima de 4 páginas para facilitar su lectura.

## 👥 Contribución

1. Haz un **fork** del proyecto.
2. Crea una rama nueva:
   ```bash
   git checkout -b feature-nueva
   ```
3. Haz commit de tus cambios:
   ```bash
   git commit -m "Agrego nueva funcionalidad"
   ```
4. Haz push a tu rama:
   ```bash
   git push origin feature-nueva
   ```
5. Abre un **Pull Request**.

---

## 📜 Licencia

Este proyecto es privado para el equipo de desarrollo de **Trading AI**.  
No está permitido el uso sin autorización previa.

---



## 📌 Notas importantes

- El proyecto requiere **MetaTrader 5** abierto y con la opción de trading algorítmico activa para funcionar con datos en tiempo real.
- El archivo `.env` **no debe subirse al repositorio** por razones de seguridad (añadido en `.gitignore`).
- MongoDB debe estar corriendo en segundo plano para que la aplicación almacene y consulte datos correctamente.
