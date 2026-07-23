@echo off
echo ========================================
echo   MING COFFEE - Starting Backend Server
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting MING COFFEE Backend Server...
echo.
echo Server will be available at: http://localhost:3000
echo.
echo - Customer Website: http://localhost:3000/web.html
echo - Order Page: http://localhost:3000/order.html
echo - Admin Panel: http://localhost:3000/admin.html
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

pause