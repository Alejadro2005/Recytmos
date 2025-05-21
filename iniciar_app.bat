@echo off
echo ============================
echo    Iniciando Recytmos...
echo ============================
REM Activa el entorno virtual
call .venv\Scripts\activate

REM Cambia a la carpeta backend
cd backend

REM Inicia el backend en una ventana nueva
start cmd /k "flask run"

REM Espera 3 segundos para que el backend arranque
timeout /t 3

REM Abre el frontend (index.html) en el navegador
start "" "..\frontend\index.html"

REM Vuelve a la carpeta raíz (opcional)
cd .. 