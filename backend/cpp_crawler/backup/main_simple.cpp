#include <iostream>
#include <string>
#include <vector>
#include <queue>
#include <set>
#include <thread>
#include <mutex>
#include <chrono>
#include <fstream>
#include <sstream>

using namespace std;

// Simple HTML parser (basic implementation)
class SimpleHTMLParser {
public:
    explicit SimpleHTMLParser(const string& html) : html_(html) {}

    string extract_title() {
        size_t start = html_.find("<title>");
        if (start == string::npos) return "";
        
        start += 7; // length of "<title>"
        size_t end = html_.find("</title>", start);
        if (end == string::npos) return "";
        
        return html_.substr(start, end - start);
    }

    string extract_text() {
        string text = html_;
        
        // Remove script tags
        removeTags(text, "<script", "</script>");
        // Remove style tags
        removeTags(text, "<style", "</style>");
        // Remove HTML tags
        removeHTMLTags(text);
        
        return text;
    }

    vector<string> extract_links(const string& base_url) {
        vector<string> links;
        size_t pos = 0;
        
        while ((pos = html_.find("href=\"", pos)) != string::npos) {
            pos += 6; // length of "href=\""
            size_t end = html_.find("\"", pos);
            if (end == string::npos) break;
            
            string url = html_.substr(pos, end - pos);
            if (url.find("http") != 0) {
                if (base_url.back() == '/') {
                    url = base_url + url;
                } else {
                    url = base_url + '/' + url;
                }
            }
            links.push_back(url);
            pos = end + 1;
        }
        
        return links;
    }

private:
    string html_;
    
    void removeTags(string& text, const string& startTag, const string& endTag) {
        size_t pos = 0;
        while ((pos = text.find(startTag, pos)) != string::npos) {
            size_t end = text.find(endTag, pos);
            if (end == string::npos) break;
            text.erase(pos, end + endTag.length() - pos);
        }
    }
    
    void removeHTMLTags(string& text) {
        size_t pos = 0;
        while ((pos = text.find('<', pos)) != string::npos) {
            size_t end = text.find('>', pos);
            if (end == string::npos) break;
            text.erase(pos, end - pos + 1);
        }
    }
};

// Simple HTTP downloader using Windows APIs
class SimplePageDownloader {
public:
    string download(const string& url) {
        // For now, return a simple response for testing
        return "<html><head><title>Test Page</title></head><body><h1>Test Content</h1><a href=\"https://example.com\">Link</a></body></html>";
    }
};

// Thread-safe URL queue
class URLQueue {
public:
    void push(const string& url, int depth) {
        lock_guard<mutex> lock(mutex_);
        if (visited_.find(url) == visited_.end()) {
            queue_.push({url, depth});
            visited_.insert(url);
        }
    }

    bool pop(string& url, int& depth) {
        lock_guard<mutex> lock(mutex_);
        if (queue_.empty()) return false;
        
        auto item = queue_.front();
        queue_.pop();
        url = item.first;
        depth = item.second;
        return true;
    }

    size_t size() const {
        lock_guard<mutex> lock(mutex_);
        return queue_.size();
    }

private:
    queue<pair<string, int>> queue_;
    set<string> visited_;
    mutable mutex mutex_;
};

// Simple file storage handler
class FileStorage {
public:
    void store_page(const string& url, const string& title, const string& content, int depth) {
        ofstream file("crawled_pages.txt", ios::app);
        if (file.is_open()) {
            file << "URL: " << url << endl;
            file << "Title: " << title << endl;
            file << "Content: " << content.substr(0, 500) << "..." << endl;
            file << "Depth: " << depth << endl;
            file << "Timestamp: " << chrono::system_clock::now().time_since_epoch().count() << endl;
            file << "---" << endl;
            file.close();
        }
    }
};

// Crawler worker
void crawler_worker(URLQueue& queue, FileStorage& storage, int max_depth) {
    SimplePageDownloader downloader;
    
    while (true) {
        string url;
        int depth;
        
        if (!queue.pop(url, depth) || depth > max_depth) {
            this_thread::sleep_for(chrono::milliseconds(100));
            if (queue.size() == 0) break;
            continue;
        }
        
        cout << "Crawling: " << url << " (depth: " << depth << ")" << endl;
        
        string html = downloader.download(url);
        if (html.empty()) continue;
        
        SimpleHTMLParser parser(html);
        string title = parser.extract_title();
        string content = parser.extract_text();
        
        storage.store_page(url, title, content, depth);
        
        if (depth < max_depth) {
            vector<string> links = parser.extract_links(url);
            for (const auto& link : links) {
                queue.push(link, depth + 1);
            }
        }
    }
}

int main() {
    const string start_url = "http://example.com";
    const int max_depth = 2;
    const int num_threads = 4;
    
    URLQueue queue;
    FileStorage storage;
    
    queue.push(start_url, 0);
    
    vector<thread> workers;
    for (int i = 0; i < num_threads; i++) {
        workers.emplace_back(crawler_worker, ref(queue), ref(storage), max_depth);
    }
    
    for (auto& worker : workers) {
        worker.join();
    }
    
    cout << "Crawling completed! Check crawled_pages.txt for results." << endl;
    return 0;
} 