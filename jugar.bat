@echo off
rem ============================================================================
rem  Lanzador del juego para Windows.
rem  Doble clic en este archivo y se abre todo: backend, servidor y navegador.
rem ============================================================================
chcp 65001 >nul
title Lanzador del juego
cd /d "%~dp0"

echo.
echo   Preparando el juego...
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo   [!] No se encuentra Node.js en este equipo.
  echo       Instalalo desde https://nodejs.org y vuelve a ejecutar este archivo.
  echo.
  pause
  exit /b 1
)

if not exist "backend\node_modules" (
  echo   Primera vez: instalando las dependencias del backend.
  echo   Esto solo pasa una vez y tarda un poco.
  echo.
  pushd backend
  call npm install
  popd
  echo.
)

node "herramientas\arrancar-todo.mjs"

echo.
echo   El lanzador se ha cerrado.
pause
