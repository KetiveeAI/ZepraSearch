const axios = require('axios');

async function testEnhancedSearch() {
    const baseUrl = 'http://localhost:6329';
    
    console.log('🧪 Testing Enhanced Ketivee Search Engine...\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing health check...');
        const healthResponse = await axios.get(`${baseUrl}/health`);
        console.log('✅ Health check passed:', healthResponse.data.status);
        console.log('');

        // Test 2: Educational search detection
        console.log('2️⃣ Testing educational search detection...');
        const educationalResponse = await axios.get(`${baseUrl}/api/search?q=javascript tutorial for beginners&type=educational&limit=5`);
        console.log('✅ Educational search results:', educationalResponse.data.results.length, 'results found');
        console.log('📚 Educational content detected:', educationalResponse.data.educationalContent?.isEducational);
        console.log('🎯 Educational suggestions:', educationalResponse.data.educationalContent?.suggestions);
        console.log('');

        // Test 3: Maps search
        console.log('3️⃣ Testing maps search...');
        const mapsResponse = await axios.get(`${baseUrl}/api/search?q=restaurants near me&type=maps&limit=3`);
        console.log('✅ Maps search results:', mapsResponse.data.results.length, 'results found');
        console.log('🗺️ Map results:', mapsResponse.data.results.filter(r => r.category === 'maps').length);
        console.log('');

        // Test 4: Videos search
        console.log('4️⃣ Testing videos search...');
        const videosResponse = await axios.get(`${baseUrl}/api/search?q=react tutorial&type=videos&limit=5`);
        console.log('✅ Videos search results:', videosResponse.data.results.length, 'results found');
        console.log('🎥 Video results:', videosResponse.data.results.filter(r => r.category === 'videos').length);
        console.log('📺 YouTube results:', videosResponse.data.results.filter(r => r.source === 'youtube').length);
        console.log('');

        // Test 5: Documents search
        console.log('5️⃣ Testing documents search...');
        const docsResponse = await axios.get(`${baseUrl}/api/search?q=python documentation&type=docs&limit=5`);
        console.log('✅ Documents search results:', docsResponse.data.results.length, 'results found');
        console.log('📄 Document results:', docsResponse.data.results.filter(r => r.category === 'docs').length);
        console.log('');

        // Test 6: News search
        console.log('6️⃣ Testing news search...');
        const newsResponse = await axios.get(`${baseUrl}/api/search?q=latest technology news&type=news&limit=5`);
        console.log('✅ News search results:', newsResponse.data.results.length, 'results found');
        console.log('📰 News results:', newsResponse.data.results.filter(r => r.category === 'news').length);
        console.log('');

        // Test 7: Shopping search
        console.log('7️⃣ Testing shopping search...');
        const shoppingResponse = await axios.get(`${baseUrl}/api/search?q=laptop deals&type=shopping&limit=5`);
        console.log('✅ Shopping search results:', shoppingResponse.data.results.length, 'results found');
        console.log('🛒 Shopping results:', shoppingResponse.data.results.filter(r => r.category === 'shopping').length);
        console.log('');

        // Test 8: Travel search
        console.log('8️⃣ Testing travel search...');
        const travelResponse = await axios.get(`${baseUrl}/api/search?q=paris travel guide&type=travel&limit=5`);
        console.log('✅ Travel search results:', travelResponse.data.results.length, 'results found');
        console.log('🌍 Travel results:', travelResponse.data.results.filter(r => r.category === 'travel').length);
        console.log('');

        // Test 9: Flights search
        console.log('9️⃣ Testing flights search...');
        const flightsResponse = await axios.get(`${baseUrl}/api/search?q=cheap flights to london&type=flights&limit=5`);
        console.log('✅ Flights search results:', flightsResponse.data.results.length, 'results found');
        console.log('✈️ Flight results:', flightsResponse.data.results.filter(r => r.category === 'flights').length);
        console.log('');

        // Test 10: All categories search
        console.log('🔟 Testing all categories search...');
        const allResponse = await axios.get(`${baseUrl}/api/search?q=artificial intelligence&type=all&limit=10`);
        console.log('✅ All categories search results:', allResponse.data.results.length, 'results found');
        console.log('📊 Available categories:', allResponse.data.categories?.length || 0);
        console.log('🔍 Engines used:', allResponse.data.engines);
        console.log('');

        // Test 11: Click tracking
        console.log('1️⃣1️⃣ Testing click tracking...');
        const clickResponse = await axios.post(`${baseUrl}/api/search/click`, {
            query: 'test query',
            url: 'https://example.com'
        });
        console.log('✅ Click tracking:', clickResponse.data.success);
        console.log('');

        // Test 12: Most clicked results
        console.log('1️⃣2️⃣ Testing most clicked results...');
        const mostClickedResponse = await axios.get(`${baseUrl}/api/search/most-clicked?q=javascript`);
        console.log('✅ Most clicked results:', mostClickedResponse.data.length, 'results found');
        console.log('');

        // Test 13: Trending searches
        console.log('1️⃣3️⃣ Testing trending searches...');
        const trendingResponse = await axios.get(`${baseUrl}/api/search/trending?limit=5`);
        console.log('✅ Trending searches:', trendingResponse.data.length, 'trends found');
        console.log('🔥 Top trends:', trendingResponse.data.slice(0, 3).map(t => t.query));
        console.log('');

        // Test 14: Search suggestions
        console.log('1️⃣4️⃣ Testing search suggestions...');
        const suggestionsResponse = await axios.get(`${baseUrl}/api/search/suggest?q=python`);
        console.log('✅ Search suggestions:', suggestionsResponse.data.length, 'suggestions found');
        console.log('💡 Suggestions:', suggestionsResponse.data.slice(0, 3));
        console.log('');

        // Test 15: Search statistics
        console.log('1️⃣5️⃣ Testing search statistics...');
        const statsResponse = await axios.get(`${baseUrl}/api/search/stats`);
        console.log('✅ Search statistics:', statsResponse.data);
        console.log('');

        console.log('🎉 All enhanced search tests completed successfully!');
        console.log('\n📈 New Features Added:');
        console.log('   🗺️ Maps & Location Search');
        console.log('   🎥 Videos & Media Search');
        console.log('   📄 Documents & Files Search');
        console.log('   📚 Enhanced Educational Content Detection');
        console.log('   📰 News & Media Search');
        console.log('   🛒 Shopping & E-commerce Search');
        console.log('   ✈️ Flights & Travel Search');
        console.log('   🌍 Travel & Tourism Search');
        console.log('   🔥 Trending Searches');
        console.log('   👆 Most Clicked Results');
        console.log('   📊 Click Tracking & Analytics');
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
testEnhancedSearch(); 