#include "api/search_api.h"
#include "search_engine.h"
#include "utils/logger.h"
#include <iostream>

int main() {
    try {
        Logger::init("zeppa.log");
        Logger::info("Starting Zeppa Search Engine");
        
        SearchEngine engine;
        SearchApi api(engine, 8080);
        
        std::cout << "Starting Zeppa Search Engine on http://localhost:8080\n";
        std::cout << "Available endpoints:\n";
        std::cout << "  GET /search?query=<search_term> - Search for documents\n";
        std::cout << "  POST /crawl - Start crawling process\n";
        
        api.start();
        
    } catch (const std::exception& e) {
        Logger::error("Fatal error: " + std::string(e.what()));
        std::cerr << "Fatal error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
} 