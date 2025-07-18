#pragma once
#include <unordered_map>
#include <chrono>
#include <mutex>

class RateLimiter {
public:
    RateLimiter(int max_requests, std::chrono::seconds interval);
    
    bool check(const std::string& client_id);
    
private:
    struct ClientState {
        int count;
        std::chrono::steady_clock::time_point window_start;
    };
    
    int max_requests_;
    std::chrono::seconds interval_;
    std::unordered_map<std::string, ClientState> clients_;
    std::mutex mutex_;
}; 