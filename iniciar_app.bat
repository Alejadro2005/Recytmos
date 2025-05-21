@echo off
echo ============================
echo    Iniciando Recytmos...
echo ============================

REM Verificar si Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python no está instalado en el sistema.
    echo Por favor, instale Python 3.8 o superior desde https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Verificar si el entorno virtual existe
if not exist .venv (
    echo Creando entorno virtual...
    python -m venv .venv
    if errorlevel 1 (
        echo Error al crear el entorno virtual.
        pause
        exit /b 1
    )
)

REM Activar el entorno virtual
call .venv\Scripts\activate
if errorlevel 1 (
    echo Error al activar el entorno virtual.
    pause
    exit /b 1
)

REM Actualizar pip
python -m pip install --upgrade pip

REM Instalar Flask y dependencias
echo Instalando Flask y dependencias...
pip install flask flask-cors flask-sqlalchemy
if errorlevel 1 (
    echo Error al instalar Flask y dependencias.
    pause
    exit /b 1
)

REM Cambiar a la carpeta backend
cd backend

REM Iniciar el backend en una ventana nueva
start cmd /k "python -m flask run"

REM Esperar 3 segundos para que el backend arranque
timeout /t 3

REM Abrir el frontend en el navegador predeterminado
start "" "..\frontend\index.html"

REM Volver a la carpeta raíz
cd ..

echo.
echo La aplicación se ha iniciado correctamente.
echo Backend: http://localhost:5000
echo Frontend: Abierto en tu navegador predeterminado
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul 