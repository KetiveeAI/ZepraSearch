#!/bin/bash

# Ketivee C++ Crawler Build Script
# This script builds the high-performance C++ crawler

set -e

echo "🚀 Building Ketivee C++ Crawler..."

# Check if we're in the right directory
if [ ! -f "cpp_crawler/main.cpp" ]; then
    echo "❌ Error: main.cpp not found. Please run this script from the backend directory."
    exit 1
fi

# Create build directory
mkdir -p cpp_crawler/build
cd cpp_crawler/build

# Install system dependencies (Ubuntu/Debian)
echo "📦 Installing system dependencies..."
sudo apt-get update
sudo apt-get install -y \
    build-essential \
    cmake \
    libcurl4-openssl-dev \
    libmongocxx-dev \
    libbsoncxx-dev \
    git

# Clone Gumbo parser if not exists
if [ ! -d "vendor/gumbo-parser" ]; then
    echo "📥 Cloning Gumbo HTML parser..."
    mkdir -p vendor
    cd vendor
    git clone https://github.com/google/gumbo-parser.git
    cd ..
fi

# Configure with CMake
echo "⚙️ Configuring with CMake..."
cmake ..

# Build the crawler
echo "🔨 Building crawler..."
make -j$(nproc)

# Make executable
chmod +x crawler

echo "✅ C++ Crawler built successfully!"
echo "📍 Binary location: $(pwd)/crawler"
echo ""
echo "🚀 To run the crawler:"
echo "   ./crawler"
echo ""
echo "🔧 To test with Node.js backend:"
echo "   cd ../.."
echo "   node index.js" 