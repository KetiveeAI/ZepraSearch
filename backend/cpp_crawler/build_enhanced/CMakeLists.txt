cmake_minimum_required(VERSION 3.10) 
project(EnhancedSearchBot) 
 
set(CMAKE_CXX_STANDARD 17) 
set(CMAKE_CXX_STANDARD_REQUIRED ON) 
 
# Find CURL 
find_package(CURL REQUIRED) 
 
# Include nlohmann/json 
include_directories(${CMAKE_CURRENT_SOURCE_DIR}/nlohmann) 
 
# Create executable 
add_executable(enhanced_search_bot ../enhanced_search_bot.cpp) 
 
# Include directories 
target_include_directories(enhanced_search_bot PRIVATE 
    ${CURL_INCLUDE_DIRS} 
) 
 
# Link libraries 
target_link_libraries(enhanced_search_bot 
    ${CURL_LIBRARIES} 
) 
 
# Compiler flags 
target_compile_options(enhanced_search_bot PRIVATE /W4) 
 
# Windows-specific settings 
if(WIN32) 
    target_link_libraries(enhanced_search_bot ws2_32 wldap32) 
endif() 
