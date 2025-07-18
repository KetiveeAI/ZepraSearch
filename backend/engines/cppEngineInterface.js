/**
 * C++ Engine Interface
 * 
 * Provides a Node.js interface to the C++ processing engine
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class CppEngineInterface {
    constructor() {
        this.enginePath = path.join(__dirname, '../cpp_engine/lib_process_data.so');
        this.isAvailable = this.checkEngineAvailability();
    }

    checkEngineAvailability() {
        try {
            return fs.existsSync(this.enginePath);
        } catch (error) {
            console.warn('C++ engine not available:', error.message);
            return false;
        }
    }

    async processData(data, options = {}) {
        if (!this.isAvailable) {
            throw new Error('C++ engine not available');
        }

        return new Promise((resolve, reject) => {
            const process = spawn(this.enginePath, [JSON.stringify(data)]);
            
            let output = '';
            let errorOutput = '';

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.stderr.on('data', (data) => {
                errorOutput += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(output);
                        resolve(result);
                    } catch (error) {
                        reject(new Error(`Failed to parse C++ engine output: ${error.message}`));
                    }
                } else {
                    reject(new Error(`C++ engine failed with code ${code}: ${errorOutput}`));
                }
            });

            process.on('error', (error) => {
                reject(new Error(`Failed to start C++ engine: ${error.message}`));
            });
        });
    }

    async optimizeSearchQuery(query) {
        return this.processData({
            type: 'query_optimization',
            query: query
        });
    }

    async processSearchResults(results) {
        return this.processData({
            type: 'result_processing',
            results: results
        });
    }

    async extractKeywords(text) {
        return this.processData({
            type: 'keyword_extraction',
            text: text
        });
    }

    getStatus() {
        return {
            available: this.isAvailable,
            enginePath: this.enginePath,
            type: 'cpp_engine'
        };
    }
}

module.exports = CppEngineInterface; 