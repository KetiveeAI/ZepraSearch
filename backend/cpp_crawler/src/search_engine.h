#pragma once

#include "search/inverted_index.h"
#include "search/ranker.h"
#include "crawler/crawler.h"
#include <memory>

class SearchEngine {
public:
    SearchEngine() : index_(std::make_unique<InvertedIndex>()) {}
    
    void crawl(const std::vector<std::string>& seed_urls) {
        crawler_.start(seed_urls);
    }
    
    std::vector<InvertedIndex::Document> search(const std::string& query) {
        auto terms = TextParser::tokenize(query);
        auto results = Ranker::rank(terms, *index_, index_->getDocumentCount());
        
        std::vector<InvertedIndex::Document> docs;
        for (const auto& result : results) {
            docs.push_back(index_->getDocument(result.doc_id));
        }
        
        return docs;
    }
    
private:
    std::unique_ptr<InvertedIndex> index_;
    Crawler crawler_;
}; 