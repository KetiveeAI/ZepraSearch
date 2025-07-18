#pragma once
#include <string>
#include <fstream>
#include <mutex>

class Logger {
public:
    enum Level {
        DEBUG,
        INFO,
        WARN,
        ERROR
    };
    
    static void init(const std::string& filename);
    static void log(Level level, const std::string& message);
    
    static void debug(const std::string& message) { log(DEBUG, message); }
    static void info(const std::string& message) { log(INFO, message); }
    static void warn(const std::string& message) { log(WARN, message); }
    static void error(const std::string& message) { log(ERROR, message); }
    
private:
    static std::ofstream log_file_;
    static std::mutex log_mutex_;
    static std::string levelToString(Level level);
}; 