#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <queue>
#include <mutex>
#include <thread>
#include <chrono>
#include <algorithm>
#include <regex>
#include <curl/curl.h>
#include <nlohmann/json.hpp>
#include <fstream>
#include <sstream>
#include <iomanip>

using namespace std;
using json = nlohmann::json;

// HTTP Client with connection pooling and retry logic
class HTTPClient {
private:
    CURL* curl_handle;
    map<string, string> connection_pool;
    mutex pool_mutex;
    
    static size_t WriteCallback(void* contents, size_t size, size_t nmemb, string* userp) {
        userp->append((char*)contents, size * nmemb);
        return size * nmemb;
    }
    
    static size_t HeaderCallback(char* buffer, size_t size, size_t nitems, void* userdata) {
        return size * nitems;
    }

public:
    AdvancedHTTPClient() {
        curl_global_init(CURL_GLOBAL_ALL);
        curl_handle = curl_easy_init();
        if (curl_handle) {
            curl_easy_setopt(curl_handle, CURLOPT_FOLLOWLOCATION, 1L);
            curl_easy_setopt(curl_handle, CURLOPT_MAXREDIRS, 5L);
            curl_easy_setopt(curl_handle, CURLOPT_TIMEOUT, 10L);
            curl_easy_setopt(curl_handle, CURLOPT_CONNECTTIMEOUT, 5L);
            curl_easy_setopt(curl_handle, CURLOPT_SSL_VERIFYPEER, 0L);
            curl_easy_setopt(curl_handle, CURLOPT_USERAGENT, "ZeppaBot/2.0");
        }
    }
    
    ~AdvancedHTTPClient() {
        if (curl_handle) {
            curl_easy_cleanup(curl_handle);
        }
        curl_global_cleanup();
    }
    
    struct HTTPResponse {
        string body;
        string headers;
        long status_code;
        string content_type;
        string last_modified;
        size_t content_length;
        double response_time;
        bool success;
    };
    
    HTTPResponse fetch(const string& url, const map<string, string>& headers = {}, int retries = 3) {
        HTTPResponse response;
        auto start_time = chrono::high_resolution_clock::now();
        
        for (int attempt = 0; attempt < retries; ++attempt) {
            if (curl_handle) {
                curl_easy_setopt(curl_handle, CURLOPT_URL, url.c_str());
                curl_easy_setopt(curl_handle, CURLOPT_WRITEFUNCTION, WriteCallback);
                curl_easy_setopt(curl_handle, CURLOPT_WRITEDATA, &response.body);
                curl_easy_setopt(curl_handle, CURLOPT_HEADERFUNCTION, HeaderCallback);
                curl_easy_setopt(curl_handle, CURLOPT_HEADERDATA, &response.headers);
                
                // Set custom headers
                struct curl_slist* header_list = nullptr;
                for (const auto& header : headers) {
                    string header_line = header.first + ": " + header.second;
                    header_list = curl_slist_append(header_list, header_line.c_str());
                }
                if (header_list) {
                    curl_easy_setopt(curl_handle, CURLOPT_HTTPHEADER, header_list);
                }
                
                CURLcode res = curl_easy_perform(curl_handle);
                
                if (res == CURLE_OK) {
                    curl_easy_getinfo(curl_handle, CURLINFO_RESPONSE_CODE, &response.status_code);
                    curl_easy_getinfo(curl_handle, CURLINFO_CONTENT_TYPE, &response.content_type);
                    curl_easy_getinfo(curl_handle, CURLINFO_CONTENT_LENGTH_DOWNLOAD, &response.content_length);
                    
                    if (response.status_code == 200) {
                        response.success = true;
                        break;
                    }
                }
                
                if (header_list) {
                    curl_slist_free_all(header_list);
                }
                
                // Exponential backoff
                if (attempt < retries - 1) {
                    this_thread::sleep_for(chrono::milliseconds(1000 * (1 << attempt)));
                }
            }
        }
        
        auto end_time = chrono::high_resolution_clock::now();
        response.response_time = chrono::duration<double, milli>(end_time - start_time).count();
        
        return response;
    }
};

// HTML Parser with semantic extraction
class HTMLParser {
private:
    string html_;
    string base_url_;
    regex tag_regex_;
    regex entity_regex_;
    
    string cleanText(const string& text) {
        string cleaned = text;
        
        // Remove control characters except newlines and tabs
        cleaned.erase(remove_if(cleaned.begin(), cleaned.end(),
            [](char c) { return c < 32 && c != '\n' && c != '\t'; }), cleaned.end());
        
        // Normalize whitespace
        regex whitespace_regex("\\s+");
        cleaned = regex_replace(cleaned, whitespace_regex, " ");
        
        return cleaned;
    }
    
    string extractMetaContent(const string& name) {
        regex meta_regex("<meta[^>]*name=[\"']" + name + "[\"'][^>]*content=[\"']([^\"']*)[\"'][^>]*>", regex::icase);
        smatch match;
        if (regex_search(html_, match, meta_regex)) {
            return decodeHTMLEntities(match[1].str());
        }
        return "";
    }
    
    string extractOpenGraphContent(const string& property) {
        regex og_regex("<meta[^>]*property=[\"']og:" + property + "[\"'][^>]*content=[\"']([^\"']*)[\"'][^>]*>", regex::icase);
        smatch match;
        if (regex_search(html_, match, og_regex)) {
            return decodeHTMLEntities(match[1].str());
        }
        return "";
    }

public:
    AdvancedHTMLParser(const string& html, const string& base_url = "") 
        : html_(html), base_url_(base_url), 
          tag_regex_("<[^>]*>"), 
          entity_regex_("&[a-zA-Z0-9#]+;") {}
    
    string extractTitle() {
        // Try multiple title extraction methods
        vector<string> title_selectors = {
            "<title[^>]*>([^<]*)</title>",
            "<h1[^>]*>([^<]*)</h1>",
            "<meta[^>]*property=[\"']og:title[\"'][^>]*content=[\"']([^\"']*)[\"'][^>]*>",
            "<meta[^>]*name=[\"']title[\"'][^>]*content=[\"']([^\"']*)[\"'][^>]*>"
        };
        
        for (const auto& selector : title_selectors) {
            regex title_regex(selector, regex::icase);
            smatch match;
            if (regex_search(html_, match, title_regex)) {
                string title = decodeHTMLEntities(match[1].str());
                if (!title.empty()) {
                    return cleanText(title);
                }
            }
        }
        
        return "";
    }
    
    string extractDescription() {
        string description = extractMetaContent("description");
        if (description.empty()) {
            description = extractOpenGraphContent("description");
        }
        if (description.empty()) {
            // Extract from first paragraph
            regex p_regex("<p[^>]*>([^<]*)</p>", regex::icase);
            smatch match;
            if (regex_search(html_, match, p_regex)) {
                description = decodeHTMLEntities(match[1].str());
            }
        }
        return cleanText(description);
    }
    
    string extractMainContent() {
        // Advanced content extraction with multiple strategies
        vector<string> content_selectors = {
            "<main[^>]*>([\\s\\S]*?)</main>",
            "<article[^>]*>([\\s\\S]*?)</article>",
            "<div[^>]*class=[\"'][^\"']*content[^\"']*[\"'][^>]*>([\\s\\S]*?)</div>",
            "<div[^>]*id=[\"']content[\"'][^>]*>([\\s\\S]*?)</div>",
            "<body[^>]*>([\\s\\S]*?)</body>"
        };
        
        for (const auto& selector : content_selectors) {
            regex content_regex(selector, regex::icase);
            smatch match;
            if (regex_search(html_, match, content_regex)) {
                string content = match[1].str();
                
                // Remove script and style tags
                content = regex_replace(content, regex("<script[^>]*>[\\s\\S]*?</script>", regex::icase), "");
                content = regex_replace(content, regex("<style[^>]*>[\\s\\S]*?</style>", regex::icase), "");
                
                // Remove HTML tags
                content = regex_replace(content, tag_regex_, " ");
                
                return cleanText(content);
            }
        }
        
        return "";
    }
    
    vector<string> extractLinks() {
        vector<string> links;
        regex link_regex("<a[^>]*href=[\"']([^\"']*)[\"'][^>]*>", regex::icase);
        
        auto begin = sregex_iterator(html_.begin(), html_.end(), link_regex);
        auto end = sregex_iterator();
        
        for (sregex_iterator i = begin; i != end; ++i) {
            smatch match = *i;
            string href = match[1].str();
            
            // Convert relative URLs to absolute
            if (href.starts_with("/") && !base_url_.empty()) {
                href = base_url_ + href;
            } else if (!href.starts_with("http")) {
                continue; // Skip non-http links
            }
            
            links.push_back(href);
        }
        
        return links;
    }
    
    map<string, string> extractMetadata() {
        map<string, string> metadata;
        
        metadata["title"] = extractTitle();
        metadata["description"] = extractDescription();
        metadata["keywords"] = extractMetaContent("keywords");
        metadata["author"] = extractMetaContent("author");
        metadata["language"] = extractMetaContent("language");
        metadata["robots"] = extractMetaContent("robots");
        
        // Open Graph metadata
        metadata["og_title"] = extractOpenGraphContent("title");
        metadata["og_description"] = extractOpenGraphContent("description");
        metadata["og_type"] = extractOpenGraphContent("type");
        metadata["og_image"] = extractOpenGraphContent("image");
        
        return metadata;
    }

private:
    string decodeHTMLEntities(const string& text) {
        string decoded = text;
        
        // Common HTML entities
        map<string, string> entities = {
            {"&amp;", "&"}, {"&lt;", "<"}, {"&gt;", ">"}, {"&quot;", "\""},
            {"&#39;", "'"}, {"&nbsp;", " "}, {"&copy;", "©"}, {"&reg;", "®"}
        };
        
        for (const auto& entity : entities) {
            regex entity_regex(entity.first);
            decoded = regex_replace(decoded, entity_regex, entity.second);
        }
        
        return decoded;
    }
};

// Search Result with semantic analysis
struct SearchResult {
    string url;
    string title;
    string description;
    string content;
    string content_type;
    string language;
    vector<string> keywords;
    map<string, string> metadata;
    double relevance_score;
    string source;
    string category;
    chrono::system_clock::time_point crawled_at;
    size_t content_length;
    bool is_educational;
    vector<string> subjects;
    double semantic_similarity;
    int word_count;
    double readability_score;
    bool has_code_blocks;
    bool has_images;
    bool has_videos;
    
    json toJSON() const {
        json j;
        j["url"] = url;
        j["title"] = title;
        j["description"] = description;
        j["content"] = content.substr(0, 2000); // Limit content size
        j["content_type"] = content_type;
        j["language"] = language;
        j["keywords"] = keywords;
        j["metadata"] = metadata;
        j["relevance_score"] = relevance_score;
        j["source"] = source;
        j["category"] = category;
        j["crawled_at"] = chrono::duration_cast<chrono::seconds>(
            crawled_at.time_since_epoch()).count();
        j["content_length"] = content_length;
        j["is_educational"] = is_educational;
        j["subjects"] = subjects;
        j["semantic_similarity"] = semantic_similarity;
        j["word_count"] = word_count;
        j["readability_score"] = readability_score;
        j["has_code_blocks"] = has_code_blocks;
        j["has_images"] = has_images;
        j["has_videos"] = has_videos;
        return j;
    }
};

// Search Service Implementation
class SearchService {
private:
    HTTPClient http_client;
    vector<SearchResult> indexed_pages;
    mutex index_mutex;
    set<string> visited_urls;
    map<string, double> keyword_scores;
    map<string, vector<string>> semantic_index;
    
    // Relevance scoring with multiple factors
    double calculateRelevanceScore(const SearchResult& result, const string& query) {
        double score = 0.0;
        string query_lower = toLower(query);
        string title_lower = toLower(result.title);
        string content_lower = toLower(result.content);
        
        // Title relevance (highest weight)
        if (title_lower.find(query_lower) != string::npos) {
            score += 0.4;
        }
        
        // Content relevance
        size_t content_pos = content_lower.find(query_lower);
        if (content_pos != string::npos) {
            score += 0.3;
            // Boost if query appears early in content
            if (content_pos < content_lower.length() * 0.1) {
                score += 0.1;
            }
        }
        
        // Keyword matching
        vector<string> query_words = splitString(query_lower, " ");
        for (const string& word : query_words) {
            if (title_lower.find(word) != string::npos) score += 0.05;
            if (content_lower.find(word) != string::npos) score += 0.02;
        }
        
        // Domain authority
        if (isHighAuthorityDomain(result.url)) {
            score += 0.1;
        }
        
        // Content quality
        score += calculateContentQuality(result);
        
        // Educational content boost
        if (result.is_educational) {
            score += 0.15;
        }
        
        // Recency boost
        auto now = chrono::system_clock::now();
        auto age = chrono::duration_cast<chrono::hours>(now - result.crawled_at).count();
        if (age < 24) score += 0.05;
        else if (age < 168) score += 0.02; // 1 week
        
        return min(score, 1.0);
    }
    
    bool isHighAuthorityDomain(const string& url) {
        vector<string> high_authority_domains = {
            "developer.mozilla.org", "stackoverflow.com", "github.com",
            "w3schools.com", "tutorialspoint.com", "geeksforgeeks.org",
            "freecodecamp.org", "codecademy.com", "udemy.com", "coursera.org",
            "wikipedia.org", "medium.com", "dev.to", "hashnode.dev"
        };
        
        for (const string& domain : high_authority_domains) {
            if (url.find(domain) != string::npos) {
                return true;
            }
        }
        return false;
    }
    
    double calculateContentQuality(const SearchResult& result) {
        double quality = 0.0;
        
        // Word count quality
        if (result.word_count > 500) quality += 0.1;
        else if (result.word_count > 200) quality += 0.05;
        
        // Readability score
        if (result.readability_score > 0.7) quality += 0.1;
        else if (result.readability_score > 0.5) quality += 0.05;
        
        // Code blocks (good for technical content)
        if (result.has_code_blocks) quality += 0.05;
        
        // Images and videos
        if (result.has_images) quality += 0.02;
        if (result.has_videos) quality += 0.03;
        
        return quality;
    }
    
    string toLower(const string& str) {
        string lower = str;
        transform(lower.begin(), lower.end(), lower.begin(), ::tolower);
        return lower;
    }
    
    vector<string> splitString(const string& str, const string& delimiter) {
        vector<string> tokens;
        size_t start = 0;
        size_t end = str.find(delimiter);
        
        while (end != string::npos) {
            tokens.push_back(str.substr(start, end - start));
            start = end + delimiter.length();
            end = str.find(delimiter, start);
        }
        tokens.push_back(str.substr(start));
        
        return tokens;
    }
    
    bool isEducationalContent(const SearchResult& result) {
        vector<string> educational_indicators = {
            "tutorial", "learn", "course", "education", "study", "guide",
            "how to", "documentation", "reference", "manual", "textbook",
            "lesson", "class", "training", "workshop", "seminar", "lecture",
            "explanation", "example", "exercise", "practice", "assignment"
        };
        
        string content_lower = toLower(result.title + " " + result.content);
        for (const string& indicator : educational_indicators) {
            if (content_lower.find(indicator) != string::npos) {
                return true;
            }
        }
        
        return isEducationalDomain(result.url);
    }
    
    bool isEducationalDomain(const string& url) {
        vector<string> educational_domains = {
            "developer.mozilla.org", "w3schools.com", "stackoverflow.com",
            "github.com", "tutorialspoint.com", "geeksforgeeks.org",
            "freecodecamp.org", "codecademy.com", "udemy.com", "coursera.org",
            "edx.org", "khanacademy.org", "wikipedia.org", "brilliant.org"
        };
        
        for (const string& domain : educational_domains) {
            if (url.find(domain) != string::npos) {
                return true;
            }
        }
        return false;
    }
    
    vector<string> extractSubjects(const AdvancedSearchResult& result) {
        vector<string> subjects;
        string content_lower = toLower(result.title + " " + result.content);
        
        map<string, vector<string>> subject_keywords = {
            {"programming", {"programming", "coding", "code", "developer", "development", "software"}},
            {"javascript", {"javascript", "js", "es6", "react", "vue", "angular", "node.js"}},
            {"python", {"python", "django", "flask", "pandas", "numpy", "scikit-learn"}},
            {"web", {"web", "html", "css", "frontend", "backend", "fullstack", "responsive"}},
            {"database", {"database", "sql", "mongodb", "mysql", "postgresql", "redis"}},
            {"ai", {"artificial intelligence", "machine learning", "ai", "ml", "neural", "deep learning"}},
            {"data", {"data science", "data analysis", "big data", "analytics", "visualization"}},
            {"mobile", {"mobile", "android", "ios", "react native", "flutter", "swift"}},
            {"cloud", {"cloud", "aws", "azure", "google cloud", "docker", "kubernetes"}},
            {"security", {"security", "cybersecurity", "encryption", "authentication", "authorization"}}
        };
        
        for (const auto& [subject, keywords] : subject_keywords) {
            for (const string& keyword : keywords) {
                if (content_lower.find(keyword) != string::npos) {
                    subjects.push_back(subject);
                    break;
                }
            }
        }
        
        return subjects;
    }

public:
    void crawlAndIndex(const string& url, int max_depth = 2) {
        cout << "Crawling: " << url << endl;
        
        if (visited_urls.find(url) != visited_urls.end()) {
            return;
        }
        visited_urls.insert(url);
        
        try {
            HTTPClient client;
            auto response = client.fetch(url);
            
            if (response.success && response.status_code == 200) {
                HTMLParser parser(response.body, url);
                
                SearchResult result;
                result.url = url;
                result.title = parser.extractTitle();
                result.description = parser.extractDescription();
                result.content = parser.extractMainContent();
                result.content_type = response.content_type;
                result.crawled_at = chrono::system_clock::now();
                result.content_length = response.content_length;
                result.response_time = response.response_time;
                
                // Extract metadata
                auto metadata = parser.extractMetadata();
                result.metadata = metadata;
                result.language = metadata["language"];
                
                // Extract keywords
                string keywords_str = metadata["keywords"];
                if (!keywords_str.empty()) {
                    result.keywords = splitString(keywords_str, ",");
                }
                
                // Analyze content
                result.is_educational = isEducationalContent(result);
                result.subjects = extractSubjects(result);
                result.word_count = splitString(result.content, " ").size();
                result.readability_score = calculateReadability(result.content);
                result.has_code_blocks = result.content.find("```") != string::npos || 
                                        result.content.find("<code>") != string::npos;
                result.has_images = response.body.find("<img") != string::npos;
                result.has_videos = response.body.find("<video") != string::npos || 
                                   response.body.find("youtube.com") != string::npos;
                
                // Categorize
                result.category = categorizeUrl(url);
                result.source = "advanced_crawler";
                
                // Add to index
                {
                    lock_guard<mutex> lock(index_mutex);
                    indexed_pages.push_back(result);
                }
                
                cout << "Indexed: " << result.title << " (" << result.word_count << " words)" << endl;
                
                // Extract links for further crawling
                if (max_depth > 0) {
                    auto links = parser.extractLinks();
                    for (const string& link : links) {
                        if (visited_urls.find(link) == visited_urls.end()) {
                            // Add to queue for async processing
                            thread([this, link, max_depth]() {
                                this->crawlAndIndex(link, max_depth - 1);
                            }).detach();
                        }
                    }
                }
            }
        } catch (const exception& e) {
            cerr << "Error crawling " << url << ": " << e.what() << endl;
        }
    }
    
    json search(const string& query, int limit = 10) {
        lock_guard<mutex> lock(index_mutex);
        
        vector<pair<double, SearchResult>> scored_results;
        
        for (const auto& result : indexed_pages) {
            double score = calculateRelevanceScore(result, query);
            if (score > 0.1) { // Minimum relevance threshold
                scored_results.push_back({score, result});
            }
        }
        
        // Sort by score (descending)
        sort(scored_results.begin(), scored_results.end(),
             [](const auto& a, const auto& b) { return a.first > b.first; });
        
        // Take top results
        json results_array = json::array();
        for (int i = 0; i < min(limit, (int)scored_results.size()); ++i) {
            auto result = scored_results[i].second;
            result.relevance_score = scored_results[i].first;
            results_array.push_back(result.toJSON());
        }
        
        json response;
        response["query"] = query;
        response["total"] = scored_results.size();
        response["results"] = results_array;
        response["search_time"] = chrono::duration_cast<chrono::milliseconds>(
            chrono::high_resolution_clock::now().time_since_epoch()).count();
        
        return response;
    }
    
    json getIndexStats() {
        lock_guard<mutex> lock(index_mutex);
        
        json stats;
        stats["total_pages"] = indexed_pages.size();
        stats["visited_urls"] = visited_urls.size();
        stats["index_size_mb"] = calculateIndexSize();
        
        // Category distribution
        map<string, int> category_counts;
        for (const auto& page : indexed_pages) {
            category_counts[page.category]++;
        }
        stats["categories"] = category_counts;
        
        // Educational content stats
        int educational_count = 0;
        for (const auto& page : indexed_pages) {
            if (page.is_educational) educational_count++;
        }
        stats["educational_content"] = educational_count;
        
        return stats;
    }
    
    void clearIndex() {
        lock_guard<mutex> lock(index_mutex);
        indexed_pages.clear();
        visited_urls.clear();
        keyword_scores.clear();
        semantic_index.clear();
    }

private:
    string categorizeUrl(const string& url) {
        string url_lower = toLower(url);
        
        if (url_lower.find("tutorial") != string::npos || 
            url_lower.find("learn") != string::npos || 
            url_lower.find("course") != string::npos) {
            return "educational";
        } else if (url_lower.find("news") != string::npos || 
                   url_lower.find("article") != string::npos) {
            return "news";
        } else if (url_lower.find("shop") != string::npos || 
                   url_lower.find("store") != string::npos || 
                   url_lower.find("buy") != string::npos) {
            return "shopping";
        } else if (url_lower.find("github.com") != string::npos || 
                   url_lower.find("stackoverflow.com") != string::npos || 
                   url_lower.find("developer.mozilla.org") != string::npos) {
            return "technology";
        } else {
            return "general";
        }
    }
    
    double calculateReadability(const string& text) {
        // Simple Flesch Reading Ease approximation
        vector<string> words = splitString(text, " ");
        vector<string> sentences = splitString(text, ".!?");
        
        if (words.empty() || sentences.empty()) return 0.0;
        
        double avg_sentence_length = (double)words.size() / sentences.size();
        double avg_word_length = 0.0;
        
        for (const string& word : words) {
            avg_word_length += word.length();
        }
        avg_word_length /= words.size();
        
        // Simplified readability score (0-1)
        double score = 1.0 - (avg_sentence_length / 20.0) - (avg_word_length / 10.0);
        return max(0.0, min(1.0, score));
    }
    
    double calculateIndexSize() {
        size_t total_size = 0;
        for (const auto& page : indexed_pages) {
            total_size += page.title.length() + page.content.length() + page.url.length();
        }
        return (double)total_size / (1024 * 1024); // Convert to MB
    }
};

int main() {
    cout << "Zeppa Search Service Starting..." << endl;
    
    SearchService service;
    
    // Seed URLs for crawling
    vector<string> seed_urls; // No default seed URLs; crawling is triggered on-demand only

    
    cout << "Starting crawling..." << endl;
    
    // Crawl seed URLs
    for (const string& url : seed_urls) {
        service.crawlAndIndex(url, 1);
        this_thread::sleep_for(chrono::milliseconds(1000)); // Polite delay
    }
    
    // Wait for crawling to complete
    this_thread::sleep_for(chrono::seconds(10));
    
    cout << "\nIndex Statistics:" << endl;
    json stats = service.getIndexStats();
    cout << stats.dump(2) << endl;
    
    // Test search functionality
    cout << "\nTesting search functionality..." << endl;
    vector<string> test_queries = {
        "javascript tutorial",
        "web development",
        "react framework",
        "python programming",
        "machine learning"
    };
    
    for (const string& query : test_queries) {
        cout << "\nSearching for: " << query << endl;
        json results = service.search(query, 3);
        cout << "Found " << results["total"] << " results" << endl;
        
        for (const auto& result : results["results"]) {
            cout << "  - " << result["title"] << " (Score: " 
                 << fixed << setprecision(2) << (result["relevance_score"].get<double>() * 100) << "%)" << endl;
        }
    }
    
    cout << "\nZeppa Search Service completed successfully!" << endl;
    return 0;
} 