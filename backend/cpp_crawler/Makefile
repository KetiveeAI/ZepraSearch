# Makefile for Zeppa Search Engine
CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O3 -pthread
LDFLAGS = -lz -pthread

# Source directories
SRC_DIRS = src src/storage src/text src/net src/security src/search src/utils src/crawler src/api

# Find all source files
SRC = $(wildcard $(addsuffix /*.cpp,$(SRC_DIRS)))
OBJ = $(SRC:.cpp=.o)
EXE = zeppa_search

# Default target
all: $(EXE)

# Link the executable
$(EXE): $(OBJ)
	$(CXX) $(CXXFLAGS) -o $@ $^ $(LDFLAGS)
	@echo "Build complete: $(EXE)"

# Compile source files
%.o: %.cpp
	$(CXX) $(CXXFLAGS) -c -o $@ $<

# Clean build artifacts
clean:
	rm -f $(OBJ) $(EXE)
	@echo "Clean complete"

# Run the application
run: $(EXE)
	./$(EXE)

# Install dependencies (for Ubuntu/Debian)
install-deps:
	sudo apt-get update
	sudo apt-get install -y build-essential cmake libcurl4-openssl-dev

# Test the build
test: $(EXE)
	@echo "Testing Zeppa Search Engine..."
	@echo "Starting server on port 8080..."
	@echo "Use Ctrl+C to stop"
	./$(EXE)

# Development target with debug symbols
debug: CXXFLAGS += -g -DDEBUG
debug: $(EXE)

# Release target with optimizations
release: CXXFLAGS += -DNDEBUG
release: $(EXE)

.PHONY: all clean run install-deps test debug release 