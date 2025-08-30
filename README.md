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
6. [Screenshots](#-screenshots)
7. [Contribución](#-contribución)
8. [Licencia](#-licencia)

---

## 🚀 Requisitos previos

Asegúrate de tener instalados:

- [Python 3.9+](https://www.python.org/downloads/)
- [MetaTrader 5](https://www.metatrader5.com/en/download)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- [Node.js (v20+ recomendado)](https://nodejs.org/en/download/prebuilt-installer)
- [Git](https://git-scm.com/downloads)

---

## ⚙️ Configuración Backend

📂 Carpeta: `trading-ia/backend`

### 1. Crear entorno virtual

```bash
python -m venv venv
```

Activar entorno:

- Windows (PowerShell):
  ```bash
  venv\Scripts\activate
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

📷 _[Espacio reservado para captura de pantalla de la configuración]_

### 4. Configuración del archivo `.env`

En la carpeta raíz `trading-ia/` crear un archivo `.env` con el siguiente contenido:

```env
MONGODB_URL=mongodb://localhost:27017/trading_ai
MT5_LOGIN=tu_usuario
MT5_PASSWORD=tu_password
MT5_SERVER=nombre_servidor
JWT_SECRET=clave_secreta
DEBUG=true
LOG_LEVEL=INFO
```

📷 _[Espacio reservado para captura de pantalla del archivo .env]_

### 5. Iniciar Backend

Desde la carpeta `trading-ia/backend`:

```bash
python start.py
```

Endpoints disponibles:
- API: [http://localhost:8000](http://localhost:8000)
- Documentación Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/health](http://localhost:8000/health)

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

📷 _[Espacio reservado para captura de pantalla de frontend corriendo]_

---

## 🔑 Configuración del archivo `.env`

Además de las variables de conexión para MongoDB y MT5, puedes añadir claves adicionales como JWT o API Keys según las integraciones futuras.

Ejemplo extendido:

```env
MONGODB_URL=mongodb://localhost:27017/trading_ai
MT5_LOGIN=tu_usuario
MT5_PASSWORD=tu_password
MT5_SERVER=nombre_servidor
JWT_SECRET=clave_secreta
API_KEY=clave_para_servicios_externos
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

## 🖼️ Screenshots

_Agregar capturas en esta sección:_

1. Instalación de MT5  
2. Activación de trading algorítmico  
3. Ejecución del backend  
4. Ejecución del frontend  

---

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
