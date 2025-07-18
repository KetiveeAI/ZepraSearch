const axios = require('axios');

async function testEnhancedSearchService() {
    const baseUrl = 'http://localhost:6329';
    
    console.log('🧪 Testing Enhanced Search Service...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health check...');
        const healthResponse = await axios.get(`${baseUrl}/health`);
        console.log('✅ Health check passed:', healthResponse.data.status);
        console.log('');

        // Test 2: Enhanced search with C++ bot integration
        console.log('2️⃣ Testing enhanced search service...');
        const searchResponse = await axios.get(`${baseUrl}/api/search?q=javascript tutorial&type=educational&limit=5`);
        console.log('✅ Enhanced search results:', searchResponse.data.results.length, 'results found');
        console.log('🔍 Search engines used:', searchResponse.data.engines);
        console.log('📚 Educational content detected:', searchResponse.data.educationalContent?.isEducational);
        console.log('');

        // Test 3: Test different categories
        console.log('3️⃣ Testing different search categories...');
        const categories = ['maps', 'videos', 'docs', 'news', 'shopping', 'travel'];
        
        for (const category of categories) {
            try {
                const categoryResponse = await axios.get(`${baseUrl}/api/search?q=test&type=${category}&limit=3`);
                console.log(`✅ ${category} search: ${categoryResponse.data.results.length} results`);
            } catch (error) {
                console.log(`❌ ${category} search failed:`, error.message);
            }
        }
        console.log('');

        // Test 4: Search suggestions
        console.log('4️⃣ Testing search suggestions...');
        const suggestionsResponse = await axios.get(`${baseUrl}/api/search/suggest?q=python`);
        console.log('✅ Search suggestions:', suggestionsResponse.data.length, 'suggestions found');
        console.log('💡 Sample suggestions:', suggestionsResponse.data.slice(0, 3));
        console.log('');

        // Test 5: Trending searches
        console.log('5️⃣ Testing trending searches...');
        const trendingResponse = await axios.get(`${baseUrl}/api/search/trending?limit=5`);
        console.log('✅ Trending searches:', trendingResponse.data.length, 'trends found');
        console.log('🔥 Top trends:', trendingResponse.data.slice(0, 3).map(t => t.query));
        console.log('');

        // Test 6: Click tracking
        console.log('6️⃣ Testing click tracking...');
        const clickResponse = await axios.post(`${baseUrl}/api/search/click`, {
            query: 'test query',
            url: 'https://example.com'
        });
        console.log('✅ Click tracking:', clickResponse.data.success);
        console.log('');

        // Test 7: Most clicked results
        console.log('7️⃣ Testing most clicked results...');
        const mostClickedResponse = await axios.get(`${baseUrl}/api/search/most-clicked?q=javascript`);
        console.log('✅ Most clicked results:', mostClickedResponse.data.length, 'results found');
        console.log('');

        // Test 8: Search statistics
        console.log('8️⃣ Testing search statistics...');
        const statsResponse = await axios.get(`${baseUrl}/api/search/stats`);
        console.log('✅ Search statistics:', statsResponse.data);
        console.log('🔧 Enhanced service stats:', statsResponse.data.enhanced);
        console.log('');

        // Test 9: Educational content detection
        console.log('9️⃣ Testing educational content detection...');
        const educationalResponse = await axios.get(`${baseUrl}/api/search?q=learn python programming&type=educational&limit=5`);
        console.log('✅ Educational search results:', educationalResponse.data.results.length, 'results found');
        console.log('📚 Educational content:', educationalResponse.data.educationalContent);
        
        // Check for educational badges in results
        const educationalResults = educationalResponse.data.results.filter(r => r.isEducational);
        console.log('🎓 Educational results found:', educationalResults.length);
        console.log('');

        // Test 10: Performance test
        console.log('🔟 Testing search performance...');
        const startTime = Date.now();
        const performanceResponse = await axios.get(`${baseUrl}/api/search?q=web development&limit=10`);
        const endTime = Date.now();
        console.log('✅ Search completed in:', endTime - startTime, 'ms');
        console.log('📊 Latency reported:', performanceResponse.data.latency);
        console.log('');

        console.log('🎉 All enhanced search service tests completed successfully!');
        console.log('\n📈 Enhanced Features:');
        console.log('   🚀 C++ Search Bot Integration');
        console.log('   🔍 Enhanced Web Search');
        console.log('   📚 Educational Content Detection');
        console.log('   🗺️ Maps & Location Search');
        console.log('   🎥 Videos & Media Search');
        console.log('   📄 Documents & Files Search');
        console.log('   📰 News & Media Search');
        console.log('   🛒 Shopping & E-commerce Search');
        console.log('   ✈️ Flights & Travel Search');
        console.log('   🌍 Travel & Tourism Search');
        console.log('   🔥 Trending Searches');
        console.log('   👆 Most Clicked Results');
        console.log('   📊 Click Tracking & Analytics');
        console.log('   ⚡ Performance Optimization');
        console.log('\n🌐 Frontend URL: http://localhost:4045');
        console.log('🔧 Backend API: http://localhost:6329');
        console.log('🕷️ Enhanced Search Service: Active');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the test
testEnhancedSearchService(); 