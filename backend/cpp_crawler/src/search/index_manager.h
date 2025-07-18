#pragma once
#include "inverted_index.h"
#include "storage/disk_index.h"
#include <memory>
#include <mutex>

class IndexManager {
public:
    IndexManager(const std::string& data_path);
    
    void addDocument(const InvertedIndex::Document& doc);
    void removeDocument(const std::string& url);
    void updateDocument(const InvertedIndex::Document& doc);
    
    std::vector<InvertedIndex::Document> search(const std::string& query);
    
    void save();
    void load();

private:
    std::unique_ptr<InvertedIndex> index_;
    DiskIndex disk_index_;
    std::mutex index_mutex_;
    
    void applyUpdates();
    std::vector<InvertedIndex::Document> processResults(
        const std::vector<AdvancedRanker::Result>& results);
}; 