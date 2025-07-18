#pragma once

#include "../net/http_client.h"
#include "../text/parser.h"
#include <queue>
#include <unordered_set>
#include <thread>
#include <mutex>

class Crawler {
public:
    Crawler(size_t max_pages = 1000) : max_pages_(max_pages) {}
    
    void start(const std::vector<std::string>& seed_urls) {
        for (const auto& url : seed_urls) {
            frontier_.push(url);
            discovered_.insert(url);
        }
        
        std::vector<std::thread> workers;
        for (size_t i = 0; i < std::thread::hardware_concurrency(); ++i) {
            workers.emplace_back(&Crawler::workerThread, this);
        }
        
        for (auto& worker : workers) {
            worker.join();
        }
    }
    
private:
    std::queue<std::string> frontier_;
    std::unordered_set<std::string> discovered_;
    std::mutex queue_mutex_;
    std::mutex discovered_mutex_;
    size_t max_pages_;
    size_t crawled_count_ = 0;
    
    void workerThread() {
        while (true) {
            std::string url;
            
            {
                std::lock_guard<std::mutex> lock(queue_mutex_);
                if (frontier_.empty() || crawled_count_ >= max_pages_) {
                    return;
                }
                url = frontier_.front();
                frontier_.pop();
                crawled_count_++;
            }
            
            try {
                auto response = HttpClient::get(url);
                if (response.status_code == 200) {
                    processPage(url, response.body);
                }
            } catch (const std::exception& e) {
                // Log error
            }
        }
    }
    
    void processPage(const std::string& url, const std::string& content) {
        // Extract links
        auto links = TextParser::extractLinks(content);
        
        // Add to frontier
        std::lock_guard<std::mutex> lock1(queue_mutex_);
        std::lock_guard<std::mutex> lock2(discovered_mutex_);
        
        for (const auto& link : links) {
            if (discovered_.find(link) == discovered_.end()) {
                frontier_.push(link);
                discovered_.insert(link);
            }
        }
        
        // Index page (would call indexer in real implementation)
        auto tokens = TextParser::tokenize(content);
        // indexer.addDocument({url, extractTitle(content), tokens});
    }
    
    std::string extractTitle(const std::string& html) {
        size_t title_start = html.find("<title>");
        if (title_start == std::string::npos) return "";
        
        title_start += 7;
        size_t title_end = html.find("</title>", title_start);
        if (title_end == std::string::npos) return "";
        
        return html.substr(title_start, title_end - title_start);
    }
}; 