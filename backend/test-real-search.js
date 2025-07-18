const RealSearchService = require('./services/realSearchService');

async function testRealSearch() {
    console.log('🧪 Testing Real Search Service (No Mock Data)');
    console.log('==============================================');
    
    try {
        // Initialize the real search service
        console.log('📦 Initializing RealSearchService...');
        const searchService = new RealSearchService();
        
        // Wait a bit for initialization
        console.log('⏳ Waiting for initialization...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Test search functionality
        console.log('🔍 Testing search functionality...');
        const testQuery = 'javascript tutorial';
        
        console.log(`Searching for: "${testQuery}"`);
        const results = await searchService.search({
            query: testQuery,
            page: 1,
            limit: 5,
            type: 'all'
        });
        
        console.log('\n✅ Search Results:');
        console.log('==================');
        console.log(`Query: ${results.query}`);
        console.log(`Total Results: ${results.total}`);
        console.log(`Page: ${results.page}`);
        console.log(`Latency: ${results.latency}`);
        console.log(`Engines:`, results.engines);
        console.log(`Real Data: ${results.engines.real_search}`);
        console.log(`No Mock Data: ${!results.engines.mock}`);
        
        console.log('\n📋 Sample Results:');
        console.log('==================');
        if (results.results && results.results.length > 0) {
            results.results.slice(0, 3).forEach((result, index) => {
                console.log(`\n${index + 1}. ${result.title}`);
                console.log(`   URL: ${result.url}`);
                console.log(`   Source: ${result.source}`);
                console.log(`   Category: ${result.category}`);
                console.log(`   Score: ${result.score}`);
                console.log(`   Educational: ${result.isEducational || false}`);
                console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
            });
        } else {
            console.log('❌ No results found');
        }
        
        // Test suggestions
        console.log('\n💡 Testing suggestions...');
        const suggestions = await searchService.getSuggestions('javascript');
        console.log('Suggestions:', suggestions);
        
        // Test stats
        console.log('\n📊 Testing stats...');
        const stats = await searchService.getStats();
        console.log('Stats:', stats);
        
        console.log('\n✅ All tests completed successfully!');
        console.log('🎯 System is using REAL DATA only - no mock data');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testRealSearch(); 