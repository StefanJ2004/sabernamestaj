@echo off
chcp 65001 > NUL
cd /d "%~dp0"
set PY=python
where py > NUL 2> NUL && set PY=py
%PY% --version > NUL 2> NUL || goto nopython
start "" http://localhost:8080
%PY% scripts\dev-server.py
pause
exit /b 0

:nopython
echo Python nije instaliran.
echo Instaliraj ga sa https://www.python.org/downloads/ i stikliraj "Add python.exe to PATH".
pause
exit /b 1
