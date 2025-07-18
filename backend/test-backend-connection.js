const http = require('http');

function testBackendConnection() {
    console.log('🔍 Testing backend connection...');
    
    const options = {
        hostname: 'localhost',
        port: 6329,
        path: '/health',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Backend is running! Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('📊 Backend Response:', response);
            } catch (error) {
                console.log('📄 Raw Response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Backend connection failed:', error.message);
        console.log('💡 Make sure the backend server is running on port 6329');
        console.log('💡 Run: cd ketiveeserchengin/backend && node server.js');
    });

    req.setTimeout(5000, () => {
        console.error('⏰ Connection timeout - backend might not be running');
    });

    req.end();
}

// Test search endpoint
function testSearchEndpoint() {
    console.log('\n🔍 Testing search endpoint...');
    
    const searchQuery = 'JavaScript tutorial';
    const options = {
        hostname: 'localhost',
        port: 6329,
        path: `/api/search?q=${encodeURIComponent(searchQuery)}`,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const req = http.request(options, (res) => {
        console.log(`✅ Search endpoint accessible! Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const response = JSON.parse(data);
                console.log('📊 Search Results:', {
                    query: response.query,
                    total: response.total,
                    resultsCount: response.results ? response.results.length : 0,
                    latency: response.latency
                });
                
                if (response.results && response.results.length > 0) {
                    console.log('📝 First Result:', {
                        title: response.results[0].title,
                        url: response.results[0].url,
                        snippet: response.results[0].snippet?.substring(0, 100) + '...'
                    });
                }
            } catch (error) {
                console.log('📄 Raw Search Response:', data);
            }
        });
    });

    req.on('error', (error) => {
        console.error('❌ Search endpoint failed:', error.message);
    });

    req.setTimeout(10000, () => {
        console.error('⏰ Search request timeout');
    });

    req.end();
}

// Run tests
testBackendConnection();
setTimeout(testSearchEndpoint, 2000); 