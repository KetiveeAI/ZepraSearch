#pragma once
#include <unordered_map>
#include <vector>
#include <string>
#include <mutex>

class PersonalizationEngine {
public:
    void recordUserAction(const std::string& user_id, 
                        const std::string& document_id,
                        const std::string& action_type);
    
    double getPersonalizationScore(const std::string& user_id,
                                 const std::string& document_id) const;
    
    void saveUserProfiles(const std::string& path);
    void loadUserProfiles(const std::string& path);

private:
    struct UserProfile {
        std::unordered_map<std::string, int> clicks;
        std::unordered_map<std::string, int> bookmarks;
        std::unordered_map<std::string, int> shares;
    };
    
    mutable std::mutex profiles_mutex_;
    std::unordered_map<std::string, UserProfile> user_profiles_;
    
    void updateProfile(UserProfile& profile, 
                      const std::string& document_id,
                      const std::string& action_type);
}; 