@echo off
setlocal enabledelayedexpansion

echo 🚀 Building Enhanced Ketivee Search Bot for Windows...

REM Check if we're in the right directory
if not exist "cpp_crawler\enhanced_search_bot.cpp" (
    echo ❌ Error: enhanced_search_bot.cpp not found. Please run this script from the backend directory.
    exit /b 1
)

REM Create build directory
if not exist "cpp_crawler\build_enhanced" mkdir cpp_crawler\build_enhanced
cd cpp_crawler\build_enhanced

REM Download nlohmann/json if not exists
if not exist "nlohmann" (
    echo 📥 Downloading nlohmann/json...
    mkdir nlohmann
    cd nlohmann
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/nlohmann/json/releases/download/v3.11.2/json.hpp' -OutFile 'json.hpp'"
    cd ..
)

REM Create a simple CMakeLists.txt for this build
echo cmake_minimum_required(VERSION 3.10) > CMakeLists.txt
echo project(EnhancedSearchBot) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo set(CMAKE_CXX_STANDARD 17) >> CMakeLists.txt
echo set(CMAKE_CXX_STANDARD_REQUIRED ON) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Find CURL >> CMakeLists.txt
echo find_package(CURL REQUIRED) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Include nlohmann/json >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/nlohmann) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Create executable >> CMakeLists.txt
echo add_executable(enhanced_search_bot ../enhanced_search_bot.cpp) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Include directories >> CMakeLists.txt
echo target_include_directories(enhanced_search_bot PRIVATE >> CMakeLists.txt
echo     ${CURL_INCLUDE_DIRS} >> CMakeLists.txt
echo ) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Link libraries >> CMakeLists.txt
echo target_link_libraries(enhanced_search_bot >> CMakeLists.txt
echo     ${CURL_LIBRARIES} >> CMakeLists.txt
echo ) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Compiler flags >> CMakeLists.txt
echo target_compile_options(enhanced_search_bot PRIVATE /W4) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Windows-specific settings >> CMakeLists.txt
echo if(WIN32) >> CMakeLists.txt
echo     target_link_libraries(enhanced_search_bot ws2_32 wldap32) >> CMakeLists.txt
echo endif() >> CMakeLists.txt

REM Configure with CMake
echo ⚙️ Configuring with CMake...
cmake ..

REM Build the enhanced search bot
echo 🔨 Building enhanced search bot...
cmake --build . --config Release

echo ✅ Enhanced Search Bot built successfully!
echo 📍 Binary location: %CD%\Release\enhanced_search_bot.exe
echo.
echo 🚀 To test the enhanced search bot:
echo    Release\enhanced_search_bot.exe
echo.
echo 🔧 To integrate with Node.js backend:
echo    cd ..\..
echo    node index.js
echo.
echo 📊 Features:
echo    ✅ Enhanced HTTP client with CURL
echo    ✅ Advanced HTML parsing
echo    ✅ JSON output format
echo    ✅ Educational content detection
echo    ✅ Category classification
echo    ✅ Relevance scoring
echo    ✅ Multi-threaded crawling

pause 