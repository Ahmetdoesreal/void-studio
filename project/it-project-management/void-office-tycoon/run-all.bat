@echo off
setlocal

cd /d "%~dp0"
python tools\launch.py all --open
if errorlevel 1 pause
