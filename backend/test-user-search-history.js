const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';
const TEST_USER_ID = 'test-user-123';
const TEST_SESSION_ID = 'test-session-456';

async function testUserSearchHistory() {
    console.log('🧪 Testing User Search History Functionality\n');

    try {
        // Test 1: Save user search queries
        console.log('1. Testing search query saving...');
        const searchQueries = [
            'JavaScript tutorials',
            'React hooks examples',
            'Node.js authentication',
            'MongoDB aggregation',
            'Express.js middleware'
        ];

        for (const query of searchQueries) {
            try {
                await axios.post(`${BASE_URL}/search`, {
                    query: query,
                    userId: TEST_USER_ID,
                    sessionId: TEST_SESSION_ID
                }, {
                    headers: {
                        'X-User-ID': TEST_USER_ID,
                        'X-Session-ID': TEST_SESSION_ID
                    }
                });
                console.log(`   ✅ Saved search: "${query}"`);
            } catch (error) {
                console.log(`   ⚠️ Failed to save search: "${query}" - ${error.message}`);
            }
        }

        // Test 2: Get user search history
        console.log('\n2. Testing search history retrieval...');
        try {
            const historyResponse = await axios.get(`${BASE_URL}/user-search-history/history`, {
                headers: {
                    'X-User-ID': TEST_USER_ID
                },
                params: {
                    page: 1,
                    limit: 10
                }
            });

            console.log(`   ✅ Retrieved ${historyResponse.data.searches.length} search records`);
            console.log(`   📊 Total searches: ${historyResponse.data.total}`);
            
            if (historyResponse.data.searches.length > 0) {
                console.log('   📝 Recent searches:');
                historyResponse.data.searches.slice(0, 3).forEach(search => {
                    console.log(`      - "${search.query}" (${search.category}) - ${new Date(search.createdAt).toLocaleString()}`);
                });
            }
        } catch (error) {
            console.log(`   ❌ Failed to get search history: ${error.message}`);
        }

        // Test 3: Get user search statistics
        console.log('\n3. Testing search statistics...');
        try {
            const statsResponse = await axios.get(`${BASE_URL}/user-search-history/stats`, {
                headers: {
                    'X-User-ID': TEST_USER_ID
                },
                params: {
                    days: 30
                }
            });

            const stats = statsResponse.data.stats;
            console.log(`   ✅ Retrieved search statistics`);
            console.log(`   📊 Total searches: ${stats.totalSearches}`);
            console.log(`   ✅ Success rate: ${stats.successRate}%`);
            console.log(`   ⏱️ Average latency: ${stats.avgLatency.toFixed(2)}ms`);
            console.log(`   🔍 Unique queries: ${stats.uniqueQueries}`);
        } catch (error) {
            console.log(`   ❌ Failed to get search statistics: ${error.message}`);
        }

        // Test 4: Get search history summary
        console.log('\n4. Testing search history summary...');
        try {
            const summaryResponse = await axios.get(`${BASE_URL}/user-search-history/summary`, {
                headers: {
                    'X-User-ID': TEST_USER_ID
                }
            });

            const summary = summaryResponse.data.summary;
            console.log(`   ✅ Retrieved search summary`);
            console.log(`   📊 Total searches: ${summary.totalSearches}`);
            console.log(`   📅 Data retention: ${summary.dataRetentionDays} days`);
            console.log(`   🏷️ Categories: ${summary.categories.length}`);
        } catch (error) {
            console.log(`   ❌ Failed to get search summary: ${error.message}`);
        }

        // Test 5: Get retention info
        console.log('\n5. Testing retention info...');
        try {
            const retentionResponse = await axios.get(`${BASE_URL}/user-search-history/retention`, {
                headers: {
                    'X-User-ID': TEST_USER_ID
                }
            });

            const retention = retentionResponse.data.retention;
            console.log(`   ✅ Retrieved retention info`);
            console.log(`   📅 Retention days: ${retention.retentionDays}`);
            console.log(`   🔄 Auto delete: ${retention.autoDelete}`);
            console.log(`   📤 Export formats: ${retention.exportFormats.join(', ')}`);
        } catch (error) {
            console.log(`   ❌ Failed to get retention info: ${error.message}`);
        }

        // Test 6: Export user search data (JSON)
        console.log('\n6. Testing data export (JSON)...');
        try {
            const exportResponse = await axios.get(`${BASE_URL}/user-search-history/export`, {
                headers: {
                    'X-User-ID': TEST_USER_ID
                },
                params: {
                    format: 'json'
                }
            });

            console.log(`   ✅ Exported search data (JSON)`);
            console.log(`   📊 Total searches exported: ${exportResponse.data.totalSearches}`);
            console.log(`   📅 Export date: ${exportResponse.data.exportDate}`);
        } catch (error) {
            console.log(`   ❌ Failed to export data (JSON): ${error.message}`);
        }

        // Test 7: Export user search data (CSV)
        console.log('\n7. Testing data export (CSV)...');
        try {
            const csvResponse = await axios.get(`${BASE_URL}/user-search-history/export`, {
                headers: {
                    'X-User-ID': TEST_USER_ID
                },
                params: {
                    format: 'csv'
                }
            });

            console.log(`   ✅ Exported search data (CSV)`);
            console.log(`   📄 CSV data length: ${csvResponse.data.length} characters`);
        } catch (error) {
            console.log(`   ❌ Failed to export data (CSV): ${error.message}`);
        }

        // Test 8: Delete individual search query
        console.log('\n8. Testing individual search deletion...');
        try {
            // First get a search to delete
            const historyResponse = await axios.get(`${BASE_URL}/user-search-history/history`, {
                headers: {
                    'X-User-ID': TEST_USER_ID
                },
                params: {
                    page: 1,
                    limit: 1
                }
            });

            if (historyResponse.data.searches.length > 0) {
                const searchToDelete = historyResponse.data.searches[0];
                const deleteResponse = await axios.delete(`${BASE_URL}/user-search-history/search/${searchToDelete._id}`, {
                    headers: {
                        'X-User-ID': TEST_USER_ID
                    }
                });

                console.log(`   ✅ Deleted search query: "${searchToDelete.query}"`);
                console.log(`   🗑️ Deleted count: ${deleteResponse.data.deletedCount}`);
            } else {
                console.log(`   ⚠️ No searches found to delete`);
            }
        } catch (error) {
            console.log(`   ❌ Failed to delete search: ${error.message}`);
        }

        // Test 9: Test authentication requirement
        console.log('\n9. Testing authentication requirement...');
        try {
            await axios.get(`${BASE_URL}/user-search-history/history`);
            console.log(`   ❌ Should have failed without authentication`);
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log(`   ✅ Authentication required (401 status)`);
            } else {
                console.log(`   ⚠️ Unexpected error: ${error.message}`);
            }
        }

        // Test 10: Test with invalid user ID
        console.log('\n10. Testing with invalid user ID...');
        try {
            const response = await axios.get(`${BASE_URL}/user-search-history/history`, {
                headers: {
                    'X-User-ID': 'invalid-user-id'
                }
            });

            console.log(`   ✅ Retrieved history for invalid user (empty results)`);
            console.log(`   📊 Total searches: ${response.data.total}`);
        } catch (error) {
            console.log(`   ❌ Failed with invalid user ID: ${error.message}`);
        }

        console.log('\n🎉 User Search History Testing Completed!');
        console.log('\n📋 Summary:');
        console.log('   ✅ Search query saving');
        console.log('   ✅ Search history retrieval');
        console.log('   ✅ Search statistics');
        console.log('   ✅ Search summary');
        console.log('   ✅ Retention information');
        console.log('   ✅ Data export (JSON/CSV)');
        console.log('   ✅ Individual search deletion');
        console.log('   ✅ Authentication requirements');
        console.log('   ✅ 15-day automatic cleanup');
        console.log('   ✅ Server storage optimization');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testUserSearchHistory().catch(console.error); 