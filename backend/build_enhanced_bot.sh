#!/bin/bash

# Enhanced Ketivee Search Bot Build Script
# This script builds the enhanced C++ search bot with CURL and JSON support

set -e

echo "🚀 Building Enhanced Ketivee Search Bot..."

# Check if we're in the right directory
if [ ! -f "cpp_crawler/enhanced_search_bot.cpp" ]; then
    echo "❌ Error: enhanced_search_bot.cpp not found. Please run this script from the backend directory."
    exit 1
fi

# Create build directory
mkdir -p cpp_crawler/build_enhanced
cd cpp_crawler/build_enhanced

# Install system dependencies (Ubuntu/Debian)
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    cmake \
    libcurl4-openssl-dev \
    git \
    pkg-config

# Download nlohmann/json if not exists
if [ ! -d "nlohmann" ]; then
    echo "📥 Downloading nlohmann/json..."
    mkdir -p nlohmann
    cd nlohmann
    wget https://github.com/nlohmann/json/releases/download/v3.11.2/json.hpp
    cd ..
fi

# Create a simple CMakeLists.txt for this build
cat > CMakeLists.txt << 'EOF'
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
target_compile_options(enhanced_search_bot PRIVATE -Wall -Wextra -O2)

# Installation
install(TARGETS enhanced_search_bot
    RUNTIME DESTINATION bin
)
EOF

# Configure with CMake
echo "⚙️ Configuring with CMake..."
cmake ..

# Build the enhanced search bot
echo "🔨 Building enhanced search bot..."
make -j$(nproc)

# Make executable
chmod +x enhanced_search_bot

echo "✅ Enhanced Search Bot built successfully!"
echo "📍 Binary location: $(pwd)/enhanced_search_bot"
echo ""
echo "🚀 To test the enhanced search bot:"
echo "   ./enhanced_search_bot"
echo ""
echo "🔧 To integrate with Node.js backend:"
echo "   cd ../.."
echo "   node index.js"
echo ""
echo "📊 Features:"
echo "   ✅ Enhanced HTTP client with CURL"
echo "   ✅ Advanced HTML parsing"
echo "   ✅ JSON output format"
echo "   ✅ Educational content detection"
echo "   ✅ Category classification"
echo "   ✅ Relevance scoring"
echo "   ✅ Multi-threaded crawling" 