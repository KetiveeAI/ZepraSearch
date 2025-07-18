#pragma once
#include <string>
#include <vector>
#include "text/stemmer.h"
#include "text/stopwords.h"

class QueryAnalyzer {
public:
    struct AnalyzedQuery {
        std::vector<std::string> keywords;
        std::vector<std::string> phrases;
        std::vector<std::string> excluded_terms;
        bool is_question = false;
    };
    
    static AnalyzedQuery analyze(const std::string& query);
}; 