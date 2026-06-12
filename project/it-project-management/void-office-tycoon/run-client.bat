@echo off
setlocal
cd /d %~dp0client
npm run dev
if errorlevel 1 pause
