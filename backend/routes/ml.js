const express = require('express');
const router = express.Router();

// Initialize text processor if available
let textProcessor = null;
try {
    const TextProcessor = require('../ml_engine/text_processor');
    textProcessor = new TextProcessor();
} catch (error) {
    console.warn('ML text processor not available:', error.message);
    // Create a dummy text processor to prevent errors
    textProcessor = {
        rank_results: (query) => {
            return [{ query, score: 0.5, source: 'dummy' }];
        }
    };
}

router.post('/search', (req, res) => {
    try {
        const { query } = req.body;
        
        if (!textProcessor) {
            return res.status(503).json({ 
                error: 'ML processor not available',
                message: 'Text processing service is not initialized'
            });
        }
        
        const results = textProcessor.rank_results(query);
        res.json({ results });
    } catch (error) {
        console.error('ML search error:', error);
        res.status(500).json({ 
            error: 'ML processing failed',
            message: error.message
        });
    }
});

module.exports = router;