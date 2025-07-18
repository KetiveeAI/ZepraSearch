#pragma once
#include <vector>
#include <string>
#include <opencv2/core.hpp>
#include <mutex>

class ImageSearch {
public:
    struct ImageResult {
        std::string image_url;
        std::string page_url;
        double similarity;
    };
    
    void indexImage(const std::string& image_url, 
                   const std::string& page_url,
                   const cv::Mat& features);
    
    std::vector<ImageResult> searchByImage(const cv::Mat& query_features, 
                                         size_t max_results = 10);
    
    void loadIndex(const std::string& path);
    void saveIndex(const std::string& path);

private:
    struct IndexedImage {
        std::string image_url;
        std::string page_url;
        cv::Mat features;
    };
    
    std::vector<IndexedImage> image_index_;
    std::mutex index_mutex_;
    
    cv::Mat extractFeatures(const cv::Mat& image) const;
    double calculateSimilarity(const cv::Mat& features1, 
                             const cv::Mat& features2) const;
}; 