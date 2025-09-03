# Trading-AI Backend

## Requisitos previos
- Python 3.12.x instalado
- pip actualizado

## Crear y activar entorno virtual (venv)

### Windows (cmd):
```cmd
python -m venv venv
venv\Scripts\activate
```

### Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Windows (Git Bash o bash):
```bash
python -m venv venv
source venv/Scripts/activate
```

## Instalar dependencias
1. Instala TA-Lib manualmente (precompilado):
   - Descarga el archivo `.whl` correspondiente a tu versión de Python y Windows.
   - Instala con:
     ```bash
     pip install ta_lib-0.6.6-cp312-cp312-win_amd64.whl
     ```
2. Instala el resto de dependencias:
   ```bash
   pip install -r requirements.txt
   ```

## Uso del gestor de versiones (pyenv recomendado)
Si necesitas gestionar varias versiones de Python, puedes usar [pyenv-win](https://github.com/pyenv-win/pyenv-win):

### Instalación de pyenv-win
Sigue la guía oficial: https://github.com/pyenv-win/pyenv-win#installation


### Uso básico de pyenv-win
```bash
# Instalar una versión de Python
pyenv install 3.12.2
# Seleccionar la versión global
pyenv global 3.12.2
# Ver versiones instaladas
pyenv versions
# Eliminar una versión específica
pyenv uninstall 3.11.7
```

## Notas
- Recuerda activar el entorno virtual cada vez que trabajes en el proyecto.
- Si tienes problemas con TA-Lib, revisa que la versión del .whl coincida con tu versión de Python.
- Para salir del entorno virtual:
  ```bash
  deactivate
  ```
