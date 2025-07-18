#pragma once

#include <vector>
#include <string>
#include <cctype>

class TextParser {
public:
    static std::vector<std::string> tokenize(const std::string& text) {
        std::vector<std::string> tokens;
        std::string current;
        
        for (char c : text) {
            if (std::isalnum(c) || c == '\'') {
                current += std::tolower(c);
            } else if (!current.empty()) {
                tokens.push_back(current);
                current.clear();
            }
        }
        
        if (!current.empty()) {
            tokens.push_back(current);
        }
        
        return tokens;
    }
    
    static std::vector<std::string> extractLinks(const std::string& html) {
        std::vector<std::string> links;
        size_t pos = 0;
        
        while ((pos = html.find("href=\"", pos)) != std::string::npos) {
            pos += 6; // Skip href="
            size_t end = html.find("\"", pos);
            if (end == std::string::npos) break;
            
            std::string url = html.substr(pos, end - pos);
            if (!url.empty() && url.find("://") != std::string::npos) {
                links.push_back(url);
            }
            
            pos = end + 1;
        }
        
        return links;
    }
}; 