const express = require('express');
const router = express.Router();
const { spawn } = require('child_process');

// In-memory NLP cache for processed results
const nlpCache = new Map();

// Simple NLP processing functions (in production, you'd use a proper NLP library)
const processTextNLP = (text) => {
  const words = text.toLowerCase().split(/\s+/);
  const wordCount = words.length;
  const charCount = text.length;
  
  // Simple sentiment analysis
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'like', 'happy', 'joy'];
  const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'sad', 'angry', 'frustrated', 'disappointed'];
  
  let positiveScore = 0;
  let negativeScore = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveScore++;
    if (negativeWords.includes(word)) negativeScore++;
  });
  
  const sentiment = positiveScore > negativeScore ? 'positive' : 
                   negativeScore > positiveScore ? 'negative' : 'neutral';
  
  // Extract keywords (simple approach)
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'];
  const keywords = words.filter(word => 
    word.length > 3 && !stopWords.includes(word)
  ).slice(0, 10);
  
  // Language detection (simple approach)
  const englishWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const detectedLanguage = englishWords.some(word => words.includes(word)) ? 'english' : 'unknown';
  
  // Topic classification (simple approach)
  const topics = {
    technology: ['computer', 'software', 'hardware', 'programming', 'code', 'algorithm', 'data', 'system', 'network', 'internet'],
    science: ['research', 'study', 'experiment', 'theory', 'hypothesis', 'analysis', 'scientific', 'discovery', 'innovation'],
    business: ['company', 'business', 'market', 'finance', 'investment', 'profit', 'revenue', 'strategy', 'management'],
    health: ['health', 'medical', 'doctor', 'patient', 'treatment', 'disease', 'medicine', 'hospital', 'clinic'],
    education: ['learn', 'study', 'education', 'school', 'university', 'course', 'lesson', 'teacher', 'student']
  };
  
  let detectedTopics = [];
  Object.entries(topics).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => words.includes(keyword))) {
      detectedTopics.push(topic);
    }
  });
  
  return {
    text: text,
    wordCount: wordCount,
    charCount: charCount,
    sentiment: sentiment,
    sentimentScore: {
      positive: positiveScore,
      negative: negativeScore,
      neutral: wordCount - positiveScore - negativeScore
    },
    keywords: keywords,
    language: detectedLanguage,
    topics: detectedTopics,
    readability: {
      averageWordLength: charCount / wordCount || 0,
      complexity: wordCount > 20 ? 'complex' : wordCount > 10 ? 'moderate' : 'simple'
    },
    processingTime: Date.now()
  };
};

// Process text with NLP
router.post('/process', async (req, res) => {
  try {
    const { text, cache = true } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Valid text is required' 
      });
    }

    const normalizedText = text.trim();
    const cacheKey = normalizedText.toLowerCase();
    
    // Check cache first
    if (cache && nlpCache.has(cacheKey)) {
      const cachedResult = nlpCache.get(cacheKey);
      return res.status(200).json({
        success: true,
        cached: true,
        result: cachedResult,
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🧠 Processing text with NLP (${normalizedText.length} characters)`);

    // Process the text
    const result = processTextNLP(normalizedText);
    
    // Cache the result
    if (cache) {
      nlpCache.set(cacheKey, result);
      
      // Limit cache size
      if (nlpCache.size > 1000) {
        const firstKey = nlpCache.keys().next().value;
        nlpCache.delete(firstKey);
      }
    }

    res.status(200).json({
      success: true,
      cached: false,
      result: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('NLP processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process text',
      message: error.message 
    });
  }
});

// Batch process multiple texts
router.post('/batch', async (req, res) => {
  try {
    const { texts, cache = true } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return res.status(400).json({ 
        error: 'Texts array is required' 
      });
    }

    if (texts.length > 50) {
      return res.status(400).json({ 
        error: 'Maximum 50 texts allowed per batch' 
      });
    }

    console.log(`🧠 Batch processing ${texts.length} texts`);

    const results = [];
    const startTime = Date.now();

    for (const text of texts) {
      if (typeof text === 'string' && text.trim().length > 0) {
        const result = processTextNLP(text.trim());
        results.push(result);
      }
    }

    const processingTime = Date.now() - startTime;

    res.status(200).json({
      success: true,
      processed: results.length,
      total: texts.length,
      processingTime: processingTime,
      results: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('NLP batch processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process texts',
      message: error.message 
    });
  }
});

// Analyze sentiment
router.post('/sentiment', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Valid text is required' 
      });
    }

    const normalizedText = text.trim();
    console.log(`😊 Analyzing sentiment for text (${normalizedText.length} characters)`);

    const result = processTextNLP(normalizedText);

    res.status(200).json({
      success: true,
      text: normalizedText,
      sentiment: result.sentiment,
      sentimentScore: result.sentimentScore,
      confidence: Math.abs(result.sentimentScore.positive - result.sentimentScore.negative) / 
                 (result.sentimentScore.positive + result.sentimentScore.negative + result.sentimentScore.neutral),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze sentiment',
      message: error.message 
    });
  }
});

// Extract keywords
router.post('/keywords', async (req, res) => {
  try {
    const { text, maxKeywords = 10 } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Valid text is required' 
      });
    }

    const normalizedText = text.trim();
    console.log(`🔑 Extracting keywords from text (${normalizedText.length} characters)`);

    const result = processTextNLP(normalizedText);
    const limitedKeywords = result.keywords.slice(0, parseInt(maxKeywords));

    res.status(200).json({
      success: true,
      text: normalizedText,
      keywords: limitedKeywords,
      totalKeywords: result.keywords.length,
      requestedMax: parseInt(maxKeywords),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Keyword extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract keywords',
      message: error.message 
    });
  }
});

// Classify topics
router.post('/topics', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Valid text is required' 
      });
    }

    const normalizedText = text.trim();
    console.log(`📚 Classifying topics for text (${normalizedText.length} characters)`);

    const result = processTextNLP(normalizedText);

    res.status(200).json({
      success: true,
      text: normalizedText,
      topics: result.topics,
      confidence: result.topics.length > 0 ? 0.8 : 0.2, // Simple confidence scoring
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Topic classification error:', error);
    res.status(500).json({ 
      error: 'Failed to classify topics',
      message: error.message 
    });
  }
});

// Get NLP statistics
router.get('/stats', async (req, res) => {
  try {
    const cacheSize = nlpCache.size;
    const cacheKeys = Array.from(nlpCache.keys());
    
    // Analyze cached data
    const totalProcessed = cacheKeys.length;
    const averageTextLength = cacheKeys.reduce((sum, key) => sum + key.length, 0) / totalProcessed || 0;
    
    // Get most common keywords from cache
    const allKeywords = [];
    nlpCache.forEach(result => {
      allKeywords.push(...result.keywords);
    });
    
    const keywordCounts = {};
    allKeywords.forEach(keyword => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
    
    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([keyword, count]) => ({ keyword, count }));

    res.status(200).json({
      success: true,
      cache: {
        size: cacheSize,
        totalProcessed: totalProcessed,
        averageTextLength: Math.round(averageTextLength)
      },
      topKeywords: topKeywords,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('NLP stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get NLP statistics',
      message: error.message 
    });
  }
});

// Clear NLP cache
router.delete('/cache', async (req, res) => {
  try {
    const { confirm } = req.query;
    
    if (confirm !== 'true') {
      return res.status(400).json({ 
        error: 'Confirmation required. Add ?confirm=true to clear NLP cache.' 
      });
    }

    const cacheSize = nlpCache.size;
    nlpCache.clear();

    res.status(200).json({
      success: true,
      message: 'NLP cache cleared successfully',
      clearedEntries: cacheSize,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('NLP cache clear error:', error);
    res.status(500).json({ 
      error: 'Failed to clear NLP cache',
      message: error.message 
    });
  }
});

module.exports = router;