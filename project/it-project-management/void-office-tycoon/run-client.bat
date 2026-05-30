@echo off
setlocal

cd /d "%~dp0"
python tools\launch.py client
if errorlevel 1 pause
