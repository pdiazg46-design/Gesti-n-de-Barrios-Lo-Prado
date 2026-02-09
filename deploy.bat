@echo off
echo ========================================
echo   DEPLOYMENT AUTOMATICO A VERCEL
echo ========================================
echo.

echo [1/3] Agregando archivos modificados...
git add src/components/UploadForm.tsx
git add src/app/api/municipal/send-alert/route.ts
git add scripts/create_system_profile.sql
git add scripts/create_system_profile.js

echo.
echo [2/3] Creando commit...
git commit -m "fix: agregar creator_id y community_id a reportes y alertas oficiales"

echo.
echo [3/3] Subiendo a GitHub (Vercel desplegara automaticamente)...
git push origin main

echo.
echo ========================================
echo   DEPLOYMENT COMPLETADO
echo ========================================
echo.
echo Vercel desplegara automaticamente en 2-3 minutos.
echo Puedes ver el progreso en: https://vercel.com/dashboard
echo.
pause
