@echo off
echo Starting Ketivee Search Engine...
echo.

echo Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..

echo.
echo Starting Frontend Server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo Both servers are starting...
echo Backend: http://localhost:6329
echo Frontend: http://localhost:4045
echo.
echo Press any key to exit...
pause > nul 