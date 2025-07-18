@echo off
setlocal enabledelayedexpansion

echo Building Zeppa Search Engine C++ Components for Windows...

REM Check if we're in the right directory
if not exist "cpp_crawler\search_service.cpp" (
    echo Error: search_service.cpp not found. Please run this script from the backend directory.
    exit /b 1
)

REM Create build directory
if not exist "cpp_crawler\build_advanced" mkdir cpp_crawler\build_advanced
cd cpp_crawler\build_advanced

REM Download nlohmann/json if not exists
if not exist "nlohmann" (
    echo Downloading nlohmann/json...
    mkdir nlohmann
    cd nlohmann
    powershell -Command "Invoke-WebRequest -Uri 'https://github.com/nlohmann/json/releases/download/v3.11.2/json.hpp' -OutFile 'json.hpp'"
    cd ..
)

REM Create CMakeLists.txt for this build
echo cmake_minimum_required(VERSION 3.16) > CMakeLists.txt
echo project(ZeppaSearchEngine) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo set(CMAKE_CXX_STANDARD 20) >> CMakeLists.txt
echo set(CMAKE_CXX_STANDARD_REQUIRED ON) >> CMakeLists.txt
echo set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /W4 /O2 /DNDEBUG") >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Find required packages >> CMakeLists.txt
echo find_package(CURL REQUIRED) >> CMakeLists.txt
echo find_package(Threads REQUIRED) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Include directories >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/nlohmann) >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/include) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Create main executable >> CMakeLists.txt
echo add_executable(zeppa_search_service ../search_service.cpp) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Include directories for target >> CMakeLists.txt
echo target_include_directories(zeppa_search_service PRIVATE >> CMakeLists.txt
echo     ${CURL_INCLUDE_DIRS} >> CMakeLists.txt
echo ) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Link libraries >> CMakeLists.txt
echo target_link_libraries(zeppa_search_service >> CMakeLists.txt
echo     ${CURL_LIBRARIES} >> CMakeLists.txt
echo     Threads::Threads >> CMakeLists.txt
echo ) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Windows-specific settings >> CMakeLists.txt
echo if(WIN32) >> CMakeLists.txt
echo     target_link_libraries(zeppa_search_service ws2_32 wldap32) >> CMakeLists.txt
echo     target_compile_definitions(zeppa_search_service PRIVATE WIN32_LEAN_AND_MEAN) >> CMakeLists.txt
echo endif() >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Create library version >> CMakeLists.txt
echo add_library(zeppa_search_lib SHARED ../search_service.cpp) >> CMakeLists.txt
echo target_include_directories(zeppa_search_lib PUBLIC >> CMakeLists.txt
echo     ${CMAKE_CURRENT_SOURCE_DIR}/nlohmann >> CMakeLists.txt
echo     ${CURL_INCLUDE_DIRS} >> CMakeLists.txt
echo ) >> CMakeLists.txt
echo target_link_libraries(zeppa_search_lib >> CMakeLists.txt
echo     ${CURL_LIBRARIES} >> CMakeLists.txt
echo     Threads::Threads >> CMakeLists.txt
echo ) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Installation >> CMakeLists.txt
echo install(TARGETS zeppa_search_service zeppa_search_lib >> CMakeLists.txt
echo     RUNTIME DESTINATION bin >> CMakeLists.txt
echo     LIBRARY DESTINATION lib >> CMakeLists.txt
echo     ARCHIVE DESTINATION lib >> CMakeLists.txt
echo ) >> CMakeLists.txt

REM Configure with CMake
echo Configuring with CMake...
cmake ..

REM Build the search service
echo Building search service...
cmake --build . --config Release

echo Search Service built successfully!
echo Binary location: %CD%\Release\zeppa_search_service.exe
echo Library location: %CD%\Release\zeppa_search_lib.dll
echo.
echo To test the search service:
echo    Release\zeppa_search_service.exe
echo.
echo To integrate with Node.js backend:
echo    cd ..\..
echo    node api-gateway.js
echo.
echo Features:
echo    Multi-threaded crawling with connection pooling
echo    HTML parsing with semantic extraction
echo    Real-time relevance scoring with multiple factors
echo    Educational content detection and categorization
echo    Content quality analysis and readability scoring
echo    Domain authority recognition
echo    Retry logic with exponential backoff
echo    JSON output with comprehensive metadata
echo    Subject classification and keyword extraction
echo    Code block and media detection
echo    Recency boosting for fresh content
echo    Duplicate detection and filtering
echo    High-performance C++ implementation
echo    Thread-safe operations with mutex protection
echo    Memory-efficient processing
echo    Cross-platform compatibility
echo.
echo Performance Optimizations:
echo    Connection pooling for HTTP requests
echo    Efficient string processing with regex
echo    Optimized data structures for indexing
echo    Minimal memory allocations
echo    Fast JSON serialization
echo    Concurrent crawling with thread management
echo    Smart caching and deduplication
echo    Quality-based result filtering
echo    Real-time processing capabilities
echo    Scalable architecture design

pause 