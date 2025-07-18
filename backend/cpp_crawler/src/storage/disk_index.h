#pragma once
#include "../search/inverted_index.h"
#include <string>
#include <fstream>

class DiskIndex {
public:
    DiskIndex(const std::string& base_path);
    
    void save(const InvertedIndex& index);
    void load(InvertedIndex& index);
    
private:
    std::string base_path_;
    
    void writePostings(std::ofstream& out, const std::vector<InvertedIndex::Posting>& postings);
    void readPostings(std::ifstream& in, std::vector<InvertedIndex::Posting>& postings);
}; 