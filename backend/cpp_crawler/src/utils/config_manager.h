#pragma once
#include <string>
#include <unordered_map>
#include <filesystem>

class ConfigManager {
public:
    ConfigManager(const std::string& config_path);
    
    std::string getString(const std::string& key, 
                         const std::string& default_val = "") const;
    int getInt(const std::string& key, int default_val = 0) const;
    bool getBool(const std::string& key, bool default_val = false) const;
    
    void setString(const std::string& key, const std::string& value);
    void saveConfig();

private:
    std::filesystem::path config_path_;
    std::unordered_map<std::string, std::string> config_;
    
    void loadConfig();
    void parseLine(const std::string& line);
}; 