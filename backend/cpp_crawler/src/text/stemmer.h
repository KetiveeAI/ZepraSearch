#pragma once
#include <string>

class Stemmer {
public:
    static std::string stem(const std::string& word);
    
private:
    static bool endsWith(std::string const &value, std::string const &ending);
    static void replaceEnd(std::string &word, const std::string &oldEnd, const std::string &newEnd);
}; 