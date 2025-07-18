@echo off
REM Ketivee C++ Crawler Build Script for Windows
REM This script builds the high-performance C++ crawler on Windows

echo 🚀 Building Ketivee C++ Crawler for Windows...

REM Check if we're in the right directory
if not exist "cpp_crawler\main.cpp" (
    echo ❌ Error: main.cpp not found. Please run this script from the backend directory.
    exit /b 1
)

REM Create build directory
if not exist "cpp_crawler\build" mkdir cpp_crawler\build
cd cpp_crawler\build

REM Check if vcpkg is available
where vcpkg >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing vcpkg for dependency management...
    git clone https://github.com/Microsoft/vcpkg.git
    cd vcpkg
    call bootstrap-vcpkg.bat
    cd ..
)

REM Install dependencies using vcpkg
echo 📦 Installing C++ dependencies...
vcpkg\vcpkg install curl:x64-windows
vcpkg\vcpkg install mongo-cxx-driver:x64-windows
vcpkg\vcpkg install gumbo:x64-windows

REM Clone Gumbo parser if not exists
if not exist "vendor\gumbo-parser" (
    echo 📥 Cloning Gumbo HTML parser...
    mkdir vendor
    cd vendor
    git clone https://github.com/google/gumbo-parser.git
    cd ..
)

REM Configure with CMake using vcpkg toolchain
echo ⚙️ Configuring with CMake...
cmake .. -DCMAKE_TOOLCHAIN_FILE=vcpkg\scripts\buildsystems\vcpkg.cmake

REM Build the crawler
echo 🔨 Building crawler...
cmake --build . --config Release

echo ✅ C++ Crawler built successfully!
echo 📍 Binary location: %cd%\Release\crawler.exe
echo.
echo 🚀 To run the crawler:
echo    Release\crawler.exe
echo.
echo 🔧 To test with Node.js backend:
echo    cd ..\..
echo    node index.js 