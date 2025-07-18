cmake_minimum_required(VERSION 3.10)
project(ketivee_crawler_simple)

set(CMAKE_CXX_STANDARD 17)

# Windows-specific settings
if(WIN32)
    set(CMAKE_WINDOWS_EXPORT_ALL_SYMBOLS ON)
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} /utf-8")
endif()

# Find threads
find_package(Threads REQUIRED)

# Main executable (simplified version)
add_executable(crawler_simple
    main_simple.cpp
)

# Link libraries
target_link_libraries(crawler_simple
    PRIVATE
        Threads::Threads
)

# Windows-specific libraries
if(WIN32)
    target_link_libraries(crawler_simple PRIVATE ws2_32)
endif()

# Copy executable to parent directory for easy access
add_custom_command(TARGET crawler_simple POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy $<TARGET_FILE:crawler_simple> ${CMAKE_SOURCE_DIR}/../crawler_simple.exe
) 