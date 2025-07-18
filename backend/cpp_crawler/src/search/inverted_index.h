#pragma once

#include <unordered_map>
#include <vector>
#include <string>
#include <algorithm>

class InvertedIndex {
public:
    struct Document {
        size_t id;
        std::string url;
        std::string title;
        std::vector<std::string> tokens;
    };
    
    struct Posting {
        size_t doc_id;
        size_t frequency;
        std::vector<size_t> positions;
    };
    
    void addDocument(const Document& doc) {
        documents_[doc.id] = doc;
        
        for (size_t pos = 0; pos < doc.tokens.size(); ++pos) {
            const auto& token = doc.tokens[pos];
            auto& postings = index_[token];
            
            auto it = std::find_if(postings.begin(), postings.end(),
                [doc](const Posting& p) { return p.doc_id == doc.id; });
            
            if (it != postings.end()) {
                it->frequency++;
                it->positions.push_back(pos);
            } else {
                postings.push_back({doc.id, 1, {pos}});
            }
        }
    }
    
    const std::vector<Posting>& getPostings(const std::string& term) const {
        static const std::vector<Posting> empty;
        auto it = index_.find(term);
        return it != index_.end() ? it->second : empty;
    }
    
    const Document& getDocument(size_t id) const {
        return documents_.at(id);
    }
    
    size_t getDocumentCount() const {
        return documents_.size();
    }
    
private:
    std::unordered_map<std::string, std::vector<Posting>> index_;
    std::unordered_map<size_t, Document> documents_;
}; 