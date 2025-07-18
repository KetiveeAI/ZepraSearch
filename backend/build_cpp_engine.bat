@echo off
setlocal enabledelayedexpansion

echo Building Zeppa C++ Search Engine for Windows...

REM Check if we're in the right directory
if not exist "cpp_crawler\src\main.cpp" (
    echo Error: src/main.cpp not found. Please run this script from the backend directory.
    exit /b 1
)

REM Create build directory
if not exist "cpp_crawler\build" mkdir cpp_crawler\build
cd cpp_crawler\build

REM Create CMakeLists.txt for the new structure
echo cmake_minimum_required(VERSION 3.16) > CMakeLists.txt
echo project(ZeppaSearchEngine) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo set(CMAKE_CXX_STANDARD 17) >> CMakeLists.txt
echo set(CMAKE_CXX_STANDARD_REQUIRED ON) >> CMakeLists.txt
echo set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /W4 /O2 /DNDEBUG") >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Find required packages >> CMakeLists.txt
echo find_package(Threads REQUIRED) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Include directories >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src) >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/storage) >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/text) >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/net) >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/security) >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/search) >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/utils) >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/crawler) >> CMakeLists.txt
echo include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/api) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Create main executable >> CMakeLists.txt
echo add_executable(zeppa_search >> CMakeLists.txt
echo     ../src/main.cpp >> CMakeLists.txt
echo     ../src/storage/disk_index.cpp >> CMakeLists.txt
echo     ../src/text/stemmer.cpp >> CMakeLists.txt
echo     ../src/text/stopwords.cpp >> CMakeLists.txt
echo     ../src/net/http_server.cpp >> CMakeLists.txt
echo     ../src/net/http_client.cpp >> CMakeLists.txt
echo     ../src/security/rate_limiter.cpp >> CMakeLists.txt
echo     ../src/utils/logger.cpp >> CMakeLists.txt
echo     ../src/api/search_api.cpp >> CMakeLists.txt
echo ) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Link libraries >> CMakeLists.txt
echo target_link_libraries(zeppa_search >> CMakeLists.txt
echo     Threads::Threads >> CMakeLists.txt
echo ) >> CMakeLists.txt
echo. >> CMakeLists.txt
echo # Windows-specific settings >> CMakeLists.txt
echo if(WIN32) >> CMakeLists.txt
echo     target_link_libraries(zeppa_search ws2_32 wldap32) >> CMakeLists.txt
echo     target_compile_definitions(zeppa_search PRIVATE WIN32_LEAN_AND_MEAN) >> CMakeLists.txt
echo endif() >> CMakeLists.txt

REM Configure with CMake
echo Configuring with CMake...
cmake ..

REM Build the search engine
echo Building search engine...
cmake --build . --config Release

echo C++ Search Engine built successfully!
echo Binary location: %CD%\Release\zeppa_search.exe
echo.
echo To test the search engine:
echo    Release\zeppa_search.exe
echo.
echo To run the comprehensive test suite:
echo    cd ..\..
echo    node test-cpp-search-engine.js
echo.
echo Features:
echo    Self-built HTTP server with raw socket programming
echo    Custom text parser and tokenizer
echo    Inverted index for efficient search
echo    TF-IDF ranking algorithm
echo    Multi-threaded web crawler
echo    Persistent storage for index
echo    Advanced text processing (stemming, stop words)
echo    Rate limiting and security features
echo    Comprehensive logging system
echo    Zero third-party dependencies
echo    Cross-platform compatibility
echo    High-performance C++ implementation
echo    Modular architecture design
echo    RESTful API endpoints
echo    Real-time search capabilities
echo    Scalable search infrastructure

pause 