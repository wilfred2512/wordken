#!/bin/bash
# =============================================================================
#  Lanzador del juego para macOS y Linux.
#  Uso:  ./jugar.sh      (si no arranca:  bash jugar.sh)
# =============================================================================
cd "$(dirname "$0")" || exit 1

echo
echo "  Preparando el juego..."
echo

if ! command -v node >/dev/null 2>&1; then
  echo "  [!] No se encuentra Node.js en este equipo."
  echo "      Instalalo desde https://nodejs.org y vuelve a ejecutar este archivo."
  echo
  exit 1
fi

if [ ! -d "backend/node_modules" ]; then
  echo "  Primera vez: instalando las dependencias del backend."
  echo "  Esto solo pasa una vez y tarda un poco."
  echo
  (cd backend && npm install)
  echo
fi

node herramientas/arrancar-todo.mjs
