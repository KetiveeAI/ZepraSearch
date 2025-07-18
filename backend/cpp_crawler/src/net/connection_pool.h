#pragma once
#include <queue>
#include <mutex>
#include <condition_variable>
#include <netinet/in.h>

class ConnectionPool {
public:
    ConnectionPool(size_t max_connections, int port);
    ~ConnectionPool();
    
    int getConnection();
    void returnConnection(int socket_fd);
    
    void start();
    void stop();

private:
    size_t max_connections_;
    int server_fd_;
    std::queue<int> available_connections_;
    std::mutex pool_mutex_;
    std::condition_variable pool_cv_;
    bool running_ = false;
    
    void initializePool();
    void acceptConnections();
}; 