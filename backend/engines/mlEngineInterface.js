/**
 * ML Engine Interface
 * 
 * Provides a Node.js interface to the Python ML engine
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

class MlEngineInterface {
    constructor() {
        this.mlEnginePath = path.join(__dirname, '../ml_engine/text_processor.py');
        this.isAvailable = this.checkMlEngineAvailability();
    }

    checkMlEngineAvailability() {
        try {
            return fs.existsSync(this.mlEnginePath);
        } catch (error) {
            console.warn('ML engine not available:', error.message);
            return false;
        }
    }

    async processText(text, operation = 'analyze') {
        if (!this.isAvailable) {
            throw new Error('ML engine not available');
        }

        return new Promise((resolve, reject) => {
            const args = [
                this.mlEnginePath,
                '--operation', operation,
                '--text', text,
                '--output-format', 'json'
            ];

            const process = spawn('python', args);
            
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
                        reject(new Error(`Failed to parse ML engine output: ${error.message}`));
                    }
                } else {
                    reject(new Error(`ML engine failed with code ${code}: ${errorOutput}`));
                }
            });

            process.on('error', (error) => {
                reject(new Error(`Failed to start ML engine: ${error.message}`));
            });
        });
    }

    async analyzeSentiment(text) {
        return this.processText(text, 'sentiment');
    }

    async extractEntities(text) {
        return this.processText(text, 'entities');
    }

    async classifyText(text) {
        return this.processText(text, 'classify');
    }

    async generateKeywords(text) {
        return this.processText(text, 'keywords');
    }

    async summarizeText(text, maxLength = 200) {
        return this.processText(text, 'summarize');
    }

    async translateText(text, targetLanguage = 'en') {
        return this.processText(text, 'translate');
    }

    async detectLanguage(text) {
        return this.processText(text, 'detect_language');
    }

    async getMlStatus() {
        return {
            available: this.isAvailable,
            mlEnginePath: this.mlEnginePath,
            type: 'python_ml_engine',
            operations: [
                'analyze',
                'sentiment',
                'entities',
                'classify',
                'keywords',
                'summarize',
                'translate',
                'detect_language'
            ]
        };
    }

    async batchProcess(texts, operation = 'analyze') {
        const results = [];
        
        for (const text of texts) {
            try {
                const result = await this.processText(text, operation);
                results.push({ text, success: true, data: result });
            } catch (error) {
                results.push({ text, success: false, error: error.message });
            }
        }
        
        return results;
    }
}

module.exports = MlEngineInterface; 