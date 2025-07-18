#pragma once
#include <unordered_set>

class StopWords {
public:
    static bool isStopWord(const std::string& word);
    
private:
    static const std::unordered_set<std::string> STOP_WORDS;
}; 