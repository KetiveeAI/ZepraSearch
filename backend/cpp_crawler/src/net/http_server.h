#pragma once

#include <functional>
#include <string>
#include <unordered_map>
#include <thread>
#include <sys/socket.h>
#include <netinet/in.h>

class HttpServer {
public:
    using Handler = std::function<std::string(
        const std::unordered_map<std::string, std::string>& headers,
        const std::string& body
    )>;

    HttpServer(int port = 8080);
    ~HttpServer();
    
    void start();
    void stop();
    void addRoute(const std::string& path, Handler handler);
    
private:
    int port_;
    int server_fd_;
    std::thread server_thread_;
    bool running_;
    std::unordered_map<std::string, Handler> routes_;
    
    void handleClient(int client_socket);
    static std::string urlDecode(const std::string& str);
}; 