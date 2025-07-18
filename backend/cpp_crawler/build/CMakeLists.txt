cmake_minimum_required(VERSION 3.16) 
project(ZeppaSearchEngine) 
 
set(CMAKE_CXX_STANDARD 17) 
set(CMAKE_CXX_STANDARD_REQUIRED ON) 
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /W4 /O2 /DNDEBUG") 
 
# Find required packages 
find_package(Threads REQUIRED) 
 
# Include directories 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src) 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/storage) 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/text) 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/net) 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/security) 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/search) 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/utils) 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/crawler) 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/src/api) 
 
# Create main executable 
add_executable(zeppa_search 
    ../src/main.cpp 
    ../src/storage/disk_index.cpp 
    ../src/text/stemmer.cpp 
    ../src/text/stopwords.cpp 
    ../src/net/http_server.cpp 
    ../src/net/http_client.cpp 
    ../src/security/rate_limiter.cpp 
    ../src/utils/logger.cpp 
    ../src/api/search_api.cpp 
) 
 
# Link libraries 
target_link_libraries(zeppa_search 
    Threads::Threads 
) 
 
# Windows-specific settings 
if(WIN32) 
    target_link_libraries(zeppa_search ws2_32 wldap32) 
    target_compile_definitions(zeppa_search PRIVATE WIN32_LEAN_AND_MEAN) 
endif() 
