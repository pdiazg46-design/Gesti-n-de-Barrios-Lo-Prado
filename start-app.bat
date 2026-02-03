@echo off
echo [BarrioLoop] Verificando entorno...

if not exist node_modules (
    echo [!] Dependencias no instaladas. Ejecutando npm install...
    call npm install
)

echo [OK] Entorno listo. Iniciando servidor de desarrollo...
start http://localhost:3000
npm run dev
