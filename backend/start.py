#!/usr/bin/env python3
"""
Script para iniciar la aplicación Trading AI
Maneja tanto el backend como la verificación de dependencias
"""

import os
import sys
import subprocess
import asyncio
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_python_version():
    """Verifica que la versión de Python sea compatible"""
    if sys.version_info < (3, 9):
        logger.error("❌ Python 3.9 o superior es requerido")
        logger.error(f"Versión actual: {sys.version}")
        sys.exit(1)
    logger.info(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

def check_requirements():
    """Verifica que las dependencias estén instaladas"""
    try:
        import fastapi
        import motor
        import pandas
        import numpy
        logger.info("✅ Dependencias principales verificadas")
        return True
    except ImportError as e:
        logger.error(f"❌ Falta instalar dependencias: {e}")
        logger.info("Ejecuta: pip install -r requirements.txt")
        return False

def check_metatrader5():
    """Verifica la disponibilidad de MetaTrader 5"""
    try:
        import MetaTrader5 as mt5
        if mt5.initialize():
            info = mt5.terminal_info()
            logger.info(f"✅ MetaTrader 5 conectado - {info.name}")
            mt5.shutdown()
            return True
        else:
            logger.warning("⚠️  MetaTrader 5 no está disponible")
            logger.info("La aplicación funcionará sin datos en tiempo real")
            return False
    except ImportError:
        logger.warning("⚠️  MetaTrader5 no está instalado")
        logger.info("Instala con: pip install MetaTrader5")
        return False

def check_mongodb():
    """Verifica la conexión a MongoDB"""
    try:
        import pymongo
        from dotenv import load_dotenv
        load_dotenv()
        mongodb_url = os.getenv("MONGODB_URL")
        
        if not mongodb_url:
            logger.error("❌ MONGODB_URL no encontrada en .env")
            return False
        
        client = pymongo.MongoClient(mongodb_url, serverSelectionTimeoutMS=5000)
        client.server_info()
        logger.info("✅ MongoDB conectado")
        client.close()
        return True
    except Exception as e:
        logger.error(f"❌ Error conectando a MongoDB: {e}")
        logger.info("Asegúrate de que MongoDB esté ejecutándose")
        return False

def check_kaleido():
    """Verifica Kaleido y descarga Chrome si es necesario"""
    try:
        import kaleido
        logger.info("✅ Kaleido instalado")
    except ImportError:
        logger.warning("⚠️  Kaleido no está instalado. Instalando...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "kaleido"])
        import kaleido
        logger.info("✅ Kaleido instalado correctamente")

    try:
        # Esto descarga Chromium si no lo encuentra
        kaleido.get_chrome_sync()
        logger.info("✅ Chrome para Kaleido disponible")
        return True
    except Exception as e:
        logger.error(f"❌ No se pudo descargar Chrome automáticamente: {e}")
        logger.info("Por favor instala Google Chrome manualmente")
        return False

def create_directories():
    """Crea los directorios necesarios"""
    directories = [
        "backend/logs",
        "frontend/dist",
        "data",
        "backups"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        logger.info(f"📁 Directorio creado/verificado: {directory}")

def setup_environment():
    """Configura las variables de entorno"""
    env_file = Path(".env")
    env_example = Path(".env.example")
    
    if not env_file.exists() and env_example.exists():
        logger.info("📋 Copiando .env.example a .env")
        import shutil
        shutil.copy(env_example, env_file)
        logger.warning("⚠️  Por favor, revisa y actualiza el archivo .env con tus configuraciones")

def start_backend():
    """Inicia el servidor backend FastAPI"""
    logger.info("🚀 Iniciando servidor backend...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        logger.error("❌ Directorio backend no encontrado")
        sys.exit(1)
    
    os.chdir(backend_dir)
    
    try:
        import uvicorn
        from config import settings
        
        host = "127.0.0.1" if settings.host == "0.0.0.0" else settings.host
        
        uvicorn.run(
            "main:app",
            host=host,
            port=settings.port,
            reload=settings.debug,
            log_level=settings.log_level.lower(),
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("🛑 Servidor detenido por el usuario")
    except Exception as e:
        logger.error(f"❌ Error iniciando el servidor: {e}")
        sys.exit(1)

def run_tests():
    """Ejecuta los tests del sistema"""
    logger.info("🧪 Ejecutando tests...")
    
    try:
        result = subprocess.run(
            ["python", "-m", "pytest", "tests/", "-v"],
            cwd="backend",
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            logger.info("✅ Todos los tests pasaron")
        else:
            logger.error("❌ Algunos tests fallaron")
            logger.error(result.stdout)
            logger.error(result.stderr)
            
    except FileNotFoundError:
        logger.warning("⚠️  pytest no encontrado, saltando tests")

def show_status():
    """Muestra el estado del sistema"""
    logger.info("📊 Estado del sistema Trading AI:")
    logger.info("=" * 50)
    
    python_ok = True  
    deps_ok = check_requirements()
    mt5_ok = check_metatrader5()
    mongo_ok = check_mongodb()
    kaleido_ok = check_kaleido()
    
    logger.info(f"Python 3.9+: {'✅' if python_ok else '❌'}")
    logger.info(f"Dependencias: {'✅' if deps_ok else '❌'}")
    logger.info(f"MetaTrader 5: {'✅' if mt5_ok else '⚠️'}")
    logger.info(f"MongoDB: {'✅' if mongo_ok else '❌'}")
    logger.info(f"Kaleido + Chrome: {'✅' if kaleido_ok else '❌'}")
    
    logger.info("=" * 50)
    
    all_critical_ok = python_ok and deps_ok and mongo_ok
    
    if all_critical_ok:
        logger.info("🎉 Sistema listo para funcionar!")
        if not mt5_ok:
            logger.info("💡 Tip: Instala MT5 para datos en tiempo real")
    else:
        logger.error("❌ Hay problemas que resolver antes de continuar")
        return False
    
    return True

def main():
    """Función principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Trading AI - Sistema de Trading con IA")
    parser.add_argument("--check", action="store_true", help="Solo verificar el estado del sistema")
    parser.add_argument("--test", action="store_true", help="Ejecutar tests")
    parser.add_argument("--setup", action="store_true", help="Solo configurar el entorno")
    parser.add_argument("--dev", action="store_true", help="Modo desarrollo con recarga automática")
    
    args = parser.parse_args()
    
    logger.info("🤖 Trading AI - Sistema de Trading con Inteligencia Artificial")
    logger.info("=" * 60)
    
    check_python_version()
    
    if args.setup:
        logger.info("⚙️  Configurando entorno...")
        create_directories()
        setup_environment()
        logger.info("✅ Configuración completada")
        return
    
    if args.check:
        show_status()
        return
    
    if args.test:
        if show_status():
            run_tests()
        return
    
    create_directories()
    setup_environment()
    
    if not show_status():
        logger.error("❌ No se puede iniciar debido a problemas en el sistema")
        sys.exit(1)
    
    if args.dev:
        os.environ["DEBUG"] = "true"
        os.environ["LOG_LEVEL"] = "DEBUG"
        logger.info("🔧 Modo desarrollo activado")
    
    logger.info(" Iniciando Trading AI...")
    logger.info(" Backend API estará disponible en: http://localhost:8000")
    logger.info(" Documentación API en: http://localhost:8000/docs")
    logger.info(" Health check en: http://localhost:8000/health")
    logger.info("=" * 60)
    
    try:
        start_backend()
    except KeyboardInterrupt:
        logger.info("\n👋 ¡Hasta luego! Trading AI detenido.")
    except Exception as e:
        logger.error(f"❌ Error crítico: {e}")
        sys.exit(1)
if __name__ == "__main__":
    main()
