#pragma once
#include <queue>
#include <thread>
#include <mutex>
#include <condition_variable>
#include "search/inverted_index.h"

class RealtimeUpdater {
public:
    enum UpdateType { ADD, UPDATE, DELETE };
    
    struct UpdateTask {
        UpdateType type;
        InvertedIndex::Document doc;
    };
    
    RealtimeUpdater(IndexManager& manager);
    ~RealtimeUpdater();
    
    void enqueue(const UpdateTask& task);
    void start();
    void stop();

private:
    IndexManager& index_manager_;
    std::queue<UpdateTask> task_queue_;
    std::mutex queue_mutex_;
    std::condition_variable queue_cv_;
    std::thread worker_thread_;
    bool running_ = false;
    
    void processTasks();
}; 