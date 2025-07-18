#pragma once

#include "../net/http_server.h"
#include "../search_engine.h"
#include <sstream>

class SearchApi {
public:
    SearchApi(SearchEngine& engine, int port = 8080) 
        : engine_(engine), server_(port) {
        
        server_.addRoute("/search", [this](auto&& headers, auto&& body) {
            return handleSearch(headers, body);
        });
        
        server_.addRoute("/crawl", [this](auto&& headers, auto&& body) {
            return handleCrawl(headers, body);
        });
    }
    
    void start() {
        server_.start();
    }
    
private:
    SearchEngine& engine_;
    HttpServer server_;
    
    std::string handleSearch(const HttpServer::Headers& headers, 
                           const std::string& body) {
        auto query_pos = body.find("query=");
        if (query_pos == std::string::npos) {
            return "HTTP/1.1 400 Bad Request\r\n\r\nMissing query";
        }
        
        std::string query = body.substr(query_pos + 6);
        auto results = engine_.search(query);
        
        std::ostringstream response;
        response << "HTTP/1.1 200 OK\r\n"
                << "Content-Type: text/html\r\n"
                << "\r\n"
                << "<html><body><h1>Search Results</h1><ul>";
        
        for (const auto& doc : results) {
            response << "<li><a href=\"" << doc.url << "\">" << doc.title << "</a></li>";
        }
        
        response << "</ul></body></html>";
        return response.str();
    }
    
    std::string handleCrawl(const HttpServer::Headers& headers,
                          const std::string& body) {
        std::vector<std::string> seed_urls = {
            "http://example.com",
            "http://example.org"
        };
        
        engine_.crawl(seed_urls);
        return "HTTP/1.1 200 OK\r\n\r\nCrawl started";
    }
}; 