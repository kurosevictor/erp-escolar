@echo off
title GESTAO FUTURA
cd /d "D:\erp-escolar"
echo Iniciando GESTAO FUTURA...
start "" cmd /c "timeout /t 8 /nobreak >nul && start http://localhost:3000"
"C:\Program Files\nodejs\npm.cmd" run dev
pause
