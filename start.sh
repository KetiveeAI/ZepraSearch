#!/bin/bash

echo "Starting Ketivee Search Engine..."
echo

echo "Starting Backend Server..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

echo
echo "Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:6329"
echo "Frontend: http://localhost:4045"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 