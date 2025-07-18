const axios = require('axios');

async function testCrawler() {
    const baseUrl = 'http://localhost:6329';
    
    console.log('🧪 Testing Ketivee Search Engine Crawler...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health check...');
        const healthResponse = await axios.get(`${baseUrl}/health`);
        console.log('✅ Health check passed:', healthResponse.data.status);
        console.log('');

        // Test 2: Start crawling
        console.log('2️⃣ Starting web crawler...');
        const crawlResponse = await axios.post(`${baseUrl}/api/crawler/start`, {
            seedUrls: [
                'https://example.com',
                'https://httpbin.org/html',
                'https://jsonplaceholder.typicode.com'
            ],
            options: {
                maxDepth: 2,
                maxPages: 10,
                delay: 500
            }
        });
        console.log('✅ Crawling completed:', crawlResponse.data.message);
        console.log('📊 Stats:', crawlResponse.data.stats);
        console.log('');

        // Test 3: Get crawler stats
        console.log('3️⃣ Getting crawler statistics...');
        const statsResponse = await axios.get(`${baseUrl}/api/crawler/stats`);
        console.log('✅ Crawler stats:', statsResponse.data.stats);
        console.log('');

        // Test 4: Search in crawled content
        console.log('4️⃣ Searching in crawled content...');
        const searchResponse = await axios.get(`${baseUrl}/api/crawler/search?q=example&limit=5`);
        console.log('✅ Search results:', searchResponse.data.results.length, 'results found');
        console.log('');

        // Test 5: Test real search
        console.log('5️⃣ Testing real web search...');
        const realSearchResponse = await axios.get(`${baseUrl}/api/search?q=javascript tutorial&limit=5`);
        console.log('✅ Real search results:', realSearchResponse.data.results.length, 'results found');
        console.log('🔍 Engines used:', realSearchResponse.data.engines);
        console.log('');

        // Test 6: Get search suggestions
        console.log('6️⃣ Testing search suggestions...');
        const suggestionsResponse = await axios.get(`${baseUrl}/api/search/suggest?q=javascript`);
        console.log('✅ Suggestions:', suggestionsResponse.data);
        console.log('');

        console.log('🎉 All tests completed successfully!');
        console.log('\n🌐 Frontend URL: http://localhost:4045');
        console.log('🔧 Backend API: http://localhost:6329');
        console.log('🕷️ Crawler API: http://localhost:6329/api/crawler');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testCrawler(); 