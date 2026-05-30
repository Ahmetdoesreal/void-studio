@echo off
setlocal

cd /d "%~dp0"
python tools\launch.py api
if errorlevel 1 pause
