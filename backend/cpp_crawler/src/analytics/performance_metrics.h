#pragma once
#include <chrono>
#include <map>
#include <string>
#include <mutex>

class PerformanceMetrics {
public:
    void startTimer(const std::string& metric_name);
    void stopTimer(const std::string& metric_name);
    
    double getAverageTime(const std::string& metric_name) const;
    std::map<std::string, double> getAllMetrics() const;
    
    void reset();

private:
    struct TimingData {
        std::chrono::nanoseconds total_time{0};
        int count{0};
        std::chrono::steady_clock::time_point start_time;
        bool running{false};
    };
    
    mutable std::mutex metrics_mutex_;
    std::map<std::string, TimingData> metrics_;
}; 