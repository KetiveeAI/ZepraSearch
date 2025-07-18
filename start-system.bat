@echo off
echo 🚀 Starting Ketivee Search Engine System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Start backend server
echo 🔧 Starting Backend Server...
cd backend
start "Ketivee Backend" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🌐 Starting Frontend Server...
cd ..\frontend
start "Ketivee Frontend" cmd /k "node server.js"
timeout /t 3 /nobreak >nul

echo.
echo ✅ Ketivee Search Engine System Started!
echo.
echo 📊 Backend API: http://localhost:6329
echo 🌐 Frontend: http://localhost:3000
echo 📈 Analytics: http://localhost:6329/api/analytics
echo 🕷️ Crawler: http://localhost:6329/api/crawler
echo.
echo Press any key to open the frontend in your browser...
pause >nul

REM Open frontend in default browser
start http://localhost:3000

echo.
echo 🎉 System is ready! You can now:
echo   1. Search at http://localhost:3000
echo   2. View analytics at http://localhost:6329/api/analytics/summary
echo   3. Start crawling at http://localhost:6329/api/crawler/start
echo   4. Monitor system health at http://localhost:6329/health
echo.
echo Press Ctrl+C in the server windows to stop the servers.
pause 