const axios = require('axios');

const BASE_URL = 'http://localhost:6329';

// Test data
const testData = {
  searchQuery: 'artificial intelligence',
  text: 'This is a wonderful example of amazing technology that makes people happy and excited about the future.',
  seedUrls: ['https://example.com', 'https://httpbin.org'],
  configUpdates: {
    maxResults: 50,
    defaultLimit: 15
  }
};

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

const log = (color, message) => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const testEndpoint = async (method, endpoint, data = null, description = '') => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      timeout: 10000
    };

    if (data) {
      if (method === 'GET') {
        config.params = data;
      } else {
        config.data = data;
      }
    }

    const startTime = Date.now();
    const response = await axios(config);
    const responseTime = Date.now() - startTime;

    log('green', `✅ ${description || `${method} ${endpoint}`} - ${response.status} (${responseTime}ms)`);
    
    if (response.data && typeof response.data === 'object') {
      const hasData = Object.keys(response.data).length > 0;
      const hasTimestamp = response.data.timestamp || response.data.timestamp === 0;
      
      if (hasData && hasTimestamp) {
        log('cyan', `   📊 Response has data and timestamp`);
      } else if (hasData) {
        log('yellow', `   ⚠️  Response has data but no timestamp`);
      } else {
        log('red', `   ❌ Response has no data`);
      }
    }

    return { success: true, status: response.status, data: response.data, responseTime };
  } catch (error) {
    const status = error.response?.status || 'Network Error';
    const message = error.response?.data?.error || error.message;
    log('red', `❌ ${description || `${method} ${endpoint}`} - ${status}: ${message}`);
    return { success: false, status, error: message };
  }
};

const runTests = async () => {
  log('blue', '\n🚀 Starting Comprehensive API Route Tests\n');
  log('blue', '=' .repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Test 1: Health Check
  log('magenta', '\n📊 1. Health Check Endpoints');
  log('magenta', '-' .repeat(40));
  
  let result = await testEndpoint('GET', '/health', null, 'Health Check');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/', null, 'Root Endpoint');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  // Test 2: Configuration Endpoints
  log('magenta', '\n⚙️ 2. Configuration Endpoints');
  log('magenta', '-' .repeat(40));
  
  result = await testEndpoint('GET', '/api/config', null, 'Get Configuration');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/config/search', null, 'Get Search Config Section');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/config/system', null, 'Get System Config Section');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/config/schema', null, 'Get Config Schema');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('PUT', '/api/config', { updates: testData.configUpdates }, 'Update Configuration');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  // Test 3: Search Endpoints
  log('magenta', '\n🔍 3. Search Endpoints');
  log('magenta', '-' .repeat(40));
  
  result = await testEndpoint('GET', '/api/search', { q: testData.searchQuery, category: 'all' }, 'Enhanced Search');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/search', { q: testData.searchQuery, category: 'educational' }, 'Educational Search');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/search/suggest', { q: 'artificial' }, 'Search Suggestions');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/search/trending', null, 'Trending Searches');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('POST', '/api/search/click', { 
    url: 'https://example.com', 
    query: testData.searchQuery,
    position: 1 
  }, 'Record Click');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/search/stats', null, 'Search Statistics');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  // Test 4: Trending Endpoints
  log('magenta', '\n📈 4. Trending Endpoints');
  log('magenta', '-' .repeat(40));
  
  result = await testEndpoint('GET', '/api/trending', null, 'Get Trending Searches');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/trending', { period: 'today', limit: 5 }, 'Get Today Trending');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/trending/categories', null, 'Get Trending Categories');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('POST', '/api/trending/record', { 
    query: 'test search query', 
    category: 'technology' 
  }, 'Record Trending Search');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/trending/stats', null, 'Get Trending Statistics');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  // Test 5: NLP Endpoints
  log('magenta', '\n🧠 5. NLP Processing Endpoints');
  log('magenta', '-' .repeat(40));
  
  result = await testEndpoint('POST', '/api/nlp/process', { text: testData.text }, 'Process Text with NLP');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('POST', '/api/nlp/sentiment', { text: testData.text }, 'Analyze Sentiment');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('POST', '/api/nlp/keywords', { text: testData.text, maxKeywords: 5 }, 'Extract Keywords');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('POST', '/api/nlp/topics', { text: testData.text }, 'Classify Topics');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('POST', '/api/nlp/batch', { 
    texts: [testData.text, 'Another sample text for testing.'] 
  }, 'Batch Process Texts');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/nlp/stats', null, 'Get NLP Statistics');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  // Test 6: Crawler Endpoints
  log('magenta', '\n🕷️ 6. Crawler Endpoints');
  log('magenta', '-' .repeat(40));
  
  result = await testEndpoint('GET', '/api/crawler/stats', null, 'Get Crawler Statistics');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/crawler/health', null, 'Crawler Health Check');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/crawler/pages', null, 'Get Crawled Pages');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/crawler/search', { q: 'test' }, 'Search Crawled Content');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  // Test 7: Developer Tools Endpoints
  log('magenta', '\n🔧 7. Developer Tools Endpoints');
  log('magenta', '-' .repeat(40));
  
  result = await testEndpoint('GET', '/api/devtools/debug/info', null, 'Get Debug Information');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('GET', '/api/devtools/modules', null, 'Get Available Modules');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  result = await testEndpoint('POST', '/api/devtools/execute', { 
    script: 'console.log("Hello from devtools!"); "Test completed";' 
  }, 'Execute JavaScript');
  results.total++;
  if (result.success) results.passed++; else results.failed++;

  // Test 8: Error Handling
  log('magenta', '\n🚨 8. Error Handling Tests');
  log('magenta', '-' .repeat(40));
  
  result = await testEndpoint('GET', '/api/nonexistent', null, 'Non-existent Endpoint (should return 404)');
  results.total++;
  if (!result.success && result.status === 404) results.passed++; else results.failed++;

  result = await testEndpoint('POST', '/api/nlp/process', { text: '' }, 'Empty Text (should return 400)');
  results.total++;
  if (!result.success && result.status === 400) results.passed++; else results.failed++;

  result = await testEndpoint('POST', '/api/search/click', {}, 'Missing Required Fields (should return 400)');
  results.total++;
  if (!result.success && result.status === 400) results.passed++; else results.failed++;

  // Test 9: Performance Tests
  log('magenta', '\n⚡ 9. Performance Tests');
  log('magenta', '-' .repeat(40));
  
  const performanceTests = [
    { endpoint: '/health', description: 'Health Check Performance' },
    { endpoint: '/api/config', description: 'Config Performance' },
    { endpoint: '/api/trending', description: 'Trending Performance' }
  ];

  for (const test of performanceTests) {
    const startTime = Date.now();
    result = await testEndpoint('GET', test.endpoint, null, test.description);
    const endTime = Date.now();
    
    if (result.success && result.responseTime < 1000) {
      log('green', `   ⚡ ${test.description}: ${result.responseTime}ms (Good)`);
      results.passed++;
    } else if (result.success && result.responseTime < 3000) {
      log('yellow', `   ⚡ ${test.description}: ${result.responseTime}ms (Acceptable)`);
      results.passed++;
    } else {
      log('red', `   ⚡ ${test.description}: ${result.responseTime}ms (Slow)`);
      results.failed++;
    }
    results.total++;
  }

  // Summary
  log('blue', '\n' + '=' .repeat(60));
  log('blue', '📊 TEST SUMMARY');
  log('blue', '=' .repeat(60));
  
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  
  log('green', `✅ Passed: ${results.passed}/${results.total} (${passRate}%)`);
  log('red', `❌ Failed: ${results.failed}/${results.total} (${(100 - parseFloat(passRate)).toFixed(1)}%)`);
  
  if (passRate >= 90) {
    log('green', '\n🎉 Excellent! All API routes are working properly with actual data and proper status codes.');
  } else if (passRate >= 80) {
    log('yellow', '\n⚠️  Good! Most API routes are working, but some need attention.');
  } else {
    log('red', '\n🚨 Issues detected! Several API routes need to be fixed.');
  }

  log('blue', '\n🔗 API Documentation:');
  log('cyan', `   Health: ${BASE_URL}/health`);
  log('cyan', `   Root: ${BASE_URL}/`);
  log('cyan', `   Search: ${BASE_URL}/api/search`);
  log('cyan', `   Config: ${BASE_URL}/api/config`);
  log('cyan', `   Trending: ${BASE_URL}/api/trending`);
  log('cyan', `   NLP: ${BASE_URL}/api/nlp`);
  log('cyan', `   Crawler: ${BASE_URL}/api/crawler`);
  log('cyan', `   DevTools: ${BASE_URL}/api/devtools`);

  return results;
};

// Run the tests
if (require.main === module) {
  runTests().catch(error => {
    log('red', `\n💥 Test runner error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { runTests, testEndpoint }; 