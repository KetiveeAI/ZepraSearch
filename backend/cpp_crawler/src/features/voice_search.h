#pragma once
#include <vector>
#include <string>
#include <memory>

class VoiceSearch {
public:
    VoiceSearch(const std::string& model_path);
    
    std::string speechToText(const std::vector<float>& audio_samples);
    std::vector<std::string> processVoiceCommand(const std::string& command);

private:
    // Embedded speech recognition model
    class SpeechModel;
    std::unique_ptr<SpeechModel> model_;
    
    std::string normalizeTranscript(const std::string& transcript);
}; 