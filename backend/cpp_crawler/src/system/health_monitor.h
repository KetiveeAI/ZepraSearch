#pragma once
#include <atomic>
#include <thread>
#include <chrono>
#include <unordered_map>
#include <mutex>

class HealthMonitor {
public:
    enum MetricType {
        CPU_USAGE,
        MEMORY_USAGE,
        QUEUE_SIZE,
        ACTIVE_CONNECTIONS
    };
    
    HealthMonitor();
    ~HealthMonitor();
    
    double getMetric(MetricType metric) const;
    bool isSystemHealthy() const;
    void start();
    void stop();

private:
    std::atomic<bool> running_{false};
    std::thread monitor_thread_;
    std::unordered_map<MetricType, double> current_metrics_;
    mutable std::mutex metrics_mutex_;
    
    void monitorLoop();
    void updateMetrics();
    double calculateCpuUsage() const;
    double calculateMemoryUsage() const;
}; 