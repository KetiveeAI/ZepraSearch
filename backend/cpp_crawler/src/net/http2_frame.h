#pragma once
#include <cstdint>
#include <vector>

class Http2Frame {
public:
    enum Type : uint8_t {
        DATA = 0,
        HEADERS = 1,
        PRIORITY = 2,
        // ... other frame types
    };
    
    Http2Frame(Type type, uint32_t stream_id, const std::vector<uint8_t>& payload);
    
    std::vector<uint8_t> serialize() const;
    static Http2Frame parse(const std::vector<uint8_t>& data);
    
    Type type;
    uint32_t stream_id;
    std::vector<uint8_t> payload;
}; 