#pragma once
#include <string>
#include <vector>
#include <map>
#include <ctime>
#include <mutex>

class SearchAnalytics {
public:
    struct QueryStats {
        int total_searches;
        int successful_searches;
        std::map<std::string, int> related_queries;
    };
    
    void recordSearch(const std::string& query, bool successful);
    void recordClick(const std::string& query, const std::string& document_id);
    
    QueryStats getQueryStats(const std::string& query) const;
    std::map<std::string, int> getPopularQueries(size_t max_results = 10) const;
    
    void saveAnalytics(const std::string& path);
    void loadAnalytics(const std::string& path);

private:
    struct SearchRecord {
        std::time_t timestamp;
        std::string query;
        bool successful;
    };
    
    struct ClickRecord {
        std::time_t timestamp;
        std::string query;
        std::string document_id;
    };
    
    mutable std::mutex data_mutex_;
    std::vector<SearchRecord> search_log_;
    std::vector<ClickRecord> click_log_;
    
    void trimOldRecords();
}; 