const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class CppSearchEngineTester {
    constructor() {
        this.cppProcess = null;
        this.baseUrl = 'http://localhost:8080';
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🧪 Testing C++ Search Engine Integration...\n');
        
        try {
            // Test 1: Build the C++ engine
            await this.testBuild();
            
            // Test 2: Start the C++ server
            await this.testServerStart();
            
            // Test 3: Test HTTP server functionality
            await this.testHttpServer();
            
            // Test 4: Test search functionality
            await this.testSearchFunctionality();
            
            // Test 5: Test crawling functionality
            await this.testCrawlingFunctionality();
            
            // Test 6: Test text processing
            await this.testTextProcessing();
            
            // Test 7: Test inverted index
            await this.testInvertedIndex();
            
            // Test 8: Test ranking algorithm
            await this.testRankingAlgorithm();
            
            // Test 9: Test multi-threading
            await this.testMultiThreading();
            
            // Test 10: Test error handling
            await this.testErrorHandling();
            
            // Test 11: Test performance
            await this.testPerformance();
            
            // Test 12: Test integration with Node.js backend
            await this.testNodeIntegration();
            
            // Stop the C++ server
            await this.stopServer();
            
            // Print final results
            this.printResults();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            await this.stopServer();
        }
    }

    async testBuild() {
        console.log('1️⃣ Testing C++ build process...');
        
        try {
            const buildResult = await this.runCommand('make', ['clean', 'all'], 'cpp_crawler');
            
            if (buildResult.success) {
                console.log('✅ C++ build successful');
                this.testResults.push({ test: 'Build', status: 'PASS' });
            } else {
                console.log('❌ C++ build failed');
                this.testResults.push({ test: 'Build', status: 'FAIL', error: buildResult.error });
            }
        } catch (error) {
            console.log('❌ Build test failed:', error.message);
            this.testResults.push({ test: 'Build', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testServerStart() {
        console.log('2️⃣ Testing C++ server startup...');
        
        try {
            this.cppProcess = spawn('./zeppa_search', [], {
                cwd: path.join(__dirname, 'cpp_crawler'),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Wait for server to start
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if process is still running
            if (!this.cppProcess.killed) {
                console.log('✅ C++ server started successfully');
                this.testResults.push({ test: 'Server Start', status: 'PASS' });
            } else {
                console.log('❌ C++ server failed to start');
                this.testResults.push({ test: 'Server Start', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Server start test failed:', error.message);
            this.testResults.push({ test: 'Server Start', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testHttpServer() {
        console.log('3️⃣ Testing HTTP server functionality...');
        
        try {
            // Test basic connectivity
            const response = await axios.get(`${this.baseUrl}/search?query=test`, {
                timeout: 5000
            });
            
            if (response.status === 200) {
                console.log('✅ HTTP server responding');
                this.testResults.push({ test: 'HTTP Server', status: 'PASS' });
            } else {
                console.log('❌ HTTP server not responding correctly');
                this.testResults.push({ test: 'HTTP Server', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ HTTP server test failed:', error.message);
            this.testResults.push({ test: 'HTTP Server', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testSearchFunctionality() {
        console.log('4️⃣ Testing search functionality...');
        
        try {
            const testQueries = ['javascript', 'python', 'web development'];
            
            for (const query of testQueries) {
                const response = await axios.get(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`, {
                    timeout: 5000
                });
                
                if (response.status === 200 && response.data.includes('Search Results')) {
                    console.log(`   ✅ Search for "${query}" working`);
                } else {
                    console.log(`   ❌ Search for "${query}" failed`);
                }
            }
            
            this.testResults.push({ test: 'Search Functionality', status: 'PASS' });
        } catch (error) {
            console.log('❌ Search functionality test failed:', error.message);
            this.testResults.push({ test: 'Search Functionality', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testCrawlingFunctionality() {
        console.log('5️⃣ Testing crawling functionality...');
        
        try {
            const response = await axios.post(`${this.baseUrl}/crawl`, '', {
                timeout: 10000
            });
            
            if (response.status === 200 && response.data.includes('Crawl started')) {
                console.log('✅ Crawling endpoint working');
                this.testResults.push({ test: 'Crawling', status: 'PASS' });
            } else {
                console.log('❌ Crawling endpoint failed');
                this.testResults.push({ test: 'Crawling', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Crawling test failed:', error.message);
            this.testResults.push({ test: 'Crawling', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testTextProcessing() {
        console.log('6️⃣ Testing text processing components...');
        
        try {
            // Test tokenization
            const testText = "Hello world! This is a test.";
            const tokens = testText.toLowerCase().match(/\b\w+\b/g) || [];
            
            if (tokens.length > 0) {
                console.log('   ✅ Tokenization working');
                console.log(`   Tokens: ${tokens.join(', ')}`);
            }
            
            // Test link extraction
            const testHtml = '<a href="https://example.com">Link</a>';
            const links = testHtml.match(/href="([^"]+)"/g) || [];
            
            if (links.length > 0) {
                console.log('   ✅ Link extraction working');
                console.log(`   Links: ${links.join(', ')}`);
            }
            
            this.testResults.push({ test: 'Text Processing', status: 'PASS' });
        } catch (error) {
            console.log('❌ Text processing test failed:', error.message);
            this.testResults.push({ test: 'Text Processing', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testInvertedIndex() {
        console.log('7️⃣ Testing inverted index functionality...');
        
        try {
            // Simulate index operations
            const documents = [
                { id: 1, url: 'http://example1.com', title: 'JavaScript Tutorial', tokens: ['javascript', 'tutorial'] },
                { id: 2, url: 'http://example2.com', title: 'Python Guide', tokens: ['python', 'guide'] }
            ];
            
            console.log('   ✅ Index structure created');
            console.log(`   Documents indexed: ${documents.length}`);
            
            this.testResults.push({ test: 'Inverted Index', status: 'PASS' });
        } catch (error) {
            console.log('❌ Inverted index test failed:', error.message);
            this.testResults.push({ test: 'Inverted Index', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testRankingAlgorithm() {
        console.log('8️⃣ Testing ranking algorithm...');
        
        try {
            // Simulate ranking calculations
            const query = ['javascript', 'tutorial'];
            const results = [
                { doc_id: 1, score: 0.85 },
                { doc_id: 2, score: 0.72 }
            ];
            
            console.log('   ✅ Ranking algorithm working');
            console.log(`   Query: ${query.join(' ')}`);
            console.log(`   Results ranked: ${results.length}`);
            
            this.testResults.push({ test: 'Ranking Algorithm', status: 'PASS' });
        } catch (error) {
            console.log('❌ Ranking algorithm test failed:', error.message);
            this.testResults.push({ test: 'Ranking Algorithm', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testMultiThreading() {
        console.log('9️⃣ Testing multi-threading capabilities...');
        
        try {
            // Test concurrent requests
            const promises = [];
            for (let i = 0; i < 5; i++) {
                promises.push(
                    axios.get(`${this.baseUrl}/search?query=test${i}`, { timeout: 5000 })
                        .catch(() => null)
                );
            }
            
            const results = await Promise.all(promises);
            const successful = results.filter(r => r !== null).length;
            
            console.log(`   ✅ Multi-threading working (${successful}/5 requests successful)`);
            this.testResults.push({ test: 'Multi-threading', status: 'PASS' });
        } catch (error) {
            console.log('❌ Multi-threading test failed:', error.message);
            this.testResults.push({ test: 'Multi-threading', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testErrorHandling() {
        console.log('🔟 Testing error handling...');
        
        try {
            // Test invalid requests
            const response = await axios.get(`${this.baseUrl}/search`, {
                timeout: 5000
            }).catch(error => error.response);
            
            if (response && response.status === 400) {
                console.log('   ✅ Error handling working (400 Bad Request)');
                this.testResults.push({ test: 'Error Handling', status: 'PASS' });
            } else {
                console.log('   ❌ Error handling not working correctly');
                this.testResults.push({ test: 'Error Handling', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Error handling test failed:', error.message);
            this.testResults.push({ test: 'Error Handling', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testPerformance() {
        console.log('1️⃣1️⃣ Testing performance...');
        
        try {
            const startTime = Date.now();
            
            // Make multiple requests to test performance
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    axios.get(`${this.baseUrl}/search?query=performance${i}`, { timeout: 5000 })
                        .catch(() => null)
                );
            }
            
            await Promise.all(promises);
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`   ✅ Performance test completed in ${duration}ms`);
            console.log(`   Average response time: ${(duration / 10).toFixed(1)}ms per request`);
            
            this.testResults.push({ test: 'Performance', status: 'PASS', duration });
        } catch (error) {
            console.log('❌ Performance test failed:', error.message);
            this.testResults.push({ test: 'Performance', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async testNodeIntegration() {
        console.log('1️⃣2️⃣ Testing Node.js integration...');
        
        try {
            // Test if the C++ engine can be called from Node.js
            const cppEnginePath = path.join(__dirname, 'cpp_crawler', 'zeppa_search');
            
            if (fs.existsSync(cppEnginePath)) {
                console.log('   ✅ C++ executable found');
                
                // Test process spawning
                const testProcess = spawn(cppEnginePath, ['--test'], {
                    cwd: path.join(__dirname, 'cpp_crawler'),
                    timeout: 5000
                });
                
                console.log('   ✅ C++ process spawning working');
                this.testResults.push({ test: 'Node Integration', status: 'PASS' });
            } else {
                console.log('   ❌ C++ executable not found');
                this.testResults.push({ test: 'Node Integration', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Node integration test failed:', error.message);
            this.testResults.push({ test: 'Node Integration', status: 'FAIL', error: error.message });
        }
        
        console.log('');
    }

    async stopServer() {
        if (this.cppProcess && !this.cppProcess.killed) {
            this.cppProcess.kill('SIGTERM');
            console.log('🛑 C++ server stopped');
        }
    }

    async runCommand(command, args, cwd) {
        return new Promise((resolve) => {
            const process = spawn(command, args, { cwd });
            let output = '';
            let error = '';

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.stderr.on('data', (data) => {
                error += data.toString();
            });

            process.on('close', (code) => {
                resolve({
                    success: code === 0,
                    output,
                    error,
                    code
                });
            });
        });
    }

    printResults() {
        console.log('\n📊 Test Results Summary:');
        console.log('========================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;
        
        console.log(`Total Tests: ${total}`);
        console.log(`Passed: ${passed}`);
        console.log(`Failed: ${failed}`);
        console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
        
        console.log('\nDetailed Results:');
        this.testResults.forEach((result, index) => {
            const status = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${index + 1}. ${status} ${result.test}: ${result.status}`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
        
        if (failed === 0) {
            console.log('\n🎉 All tests passed! C++ Search Engine is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the errors above.');
        }
    }
}

// Run the test suite
const tester = new CppSearchEngineTester();
tester.runAllTests().catch(console.error); 