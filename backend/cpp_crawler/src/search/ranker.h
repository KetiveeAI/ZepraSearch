#pragma once

#include "inverted_index.h"
#include <cmath>
#include <unordered_set>

class Ranker {
public:
    struct Result {
        size_t doc_id;
        double score;
    };
    
    static std::vector<Result> rank(
        const std::vector<std::string>& query_terms,
        const InvertedIndex& index,
        size_t total_docs) {
        
        std::unordered_set<size_t> candidate_docs;
        std::unordered_map<size_t, double> scores;
        
        // Find all candidate documents
        for (const auto& term : query_terms) {
            for (const auto& posting : index.getPostings(term)) {
                candidate_docs.insert(posting.doc_id);
            }
        }
        
        // Calculate scores
        for (size_t doc_id : candidate_docs) {
            double score = 0.0;
            
            for (const auto& term : query_terms) {
                const auto& postings = index.getPostings(term);
                auto it = std::find_if(postings.begin(), postings.end(),
                    [doc_id](const auto& p) { return p.doc_id == doc_id; });
                
                if (it != postings.end()) {
                    double tf = 1.0 + log(it->frequency);
                    double idf = log(total_docs / (1.0 + postings.size()));
                    score += tf * idf;
                }
            }
            
            scores[doc_id] = score;
        }
        
        // Sort results
        std::vector<Result> results;
        for (const auto& [doc_id, score] : scores) {
            results.push_back({doc_id, score});
        }
        
        std::sort(results.begin(), results.end(),
            [](const Result& a, const Result& b) {
                return a.score > b.score;
            });
        
        return results;
    }
}; 