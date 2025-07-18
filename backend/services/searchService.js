const DatabaseManager = require('../database/databaseManager');
const CppEngineInterface = require('../engines/cppEngineInterface');
const MlEngineInterface = require('../engines/mlEngineInterface');

const natural = require('natural');
const fuzz = require('fuzzball');
const stemmer = natural.PorterStemmer;

function parseQuery(rawQuery) {
    // Simple parser for demonstration: recognizes quoted phrases, AND, OR, NOT
    const phrases = [];
    const terms = [];
    let q = rawQuery;
    const phraseRegex = /"([^"]+)"/g;
    let match;
    while ((match = phraseRegex.exec(q)) !== null) {
        phrases.push(match[1]);
        q = q.replace(match[0], '');
    }
    q.split(/\s+/).forEach(token => {
        if (token && !['AND','OR','NOT'].includes(token.toUpperCase())) terms.push(token);
    });
    return { phrases, terms };
}

class SearchService {
    constructor() {
        this.database = new DatabaseManager();
        this.cppEngine = new CppEngineInterface();
        this.mlEngine = new MlEngineInterface();
        this.connect();
    }

    async connect() {
        await this.database.connect();
        this.collection = this.database.getCollection('pages'); // Use 'pages' collection for C++ crawler
        console.log('Search service connected to database');
    }


    async search({ query, page = 1, limit = 10 }) {
        const cacheKey = `search:${query}:${page}:${limit}`;
        const cached = await this.database.getCached(cacheKey);
        
        if (cached) {
            return cached;
        }

        const start = Date.now();
        
        // Advanced Query Parsing
        const { phrases, terms } = parseQuery(query);
        let processedQuery = terms.map(t=>stemmer.stem(t)).join(' ');
        if (this.mlEngine.isAvailable) {
            try {
                const optimization = await this.mlEngine.processText(query, 'keywords');
                if (optimization && optimization.keywords) {
                    processedQuery += ' ' + optimization.keywords.map(t=>stemmer.stem(t)).join(' ');
                }
            } catch (error) {
                console.warn('ML query optimization failed:', error.message);
            }
        }

        // Build $text search and fallback to fuzzy/phrase
        let textMatch = { $text: { $search: processedQuery } };
        if (phrases.length) {
            textMatch = {
                $and: [
                    { $text: { $search: processedQuery } },
                    ...phrases.map(p => ({ content: { $regex: p, $options: 'i' } }))
                ]
            };
        }

        // Enhanced MongoDB aggregation pipeline
        const pipeline = [
            { $match: textMatch },
            {
                $project: {
                    _id: 0,
                    url: 1,
                    title: 1,
                    description: 1,
                    author: "$metadata.author",
                    language: "$metadata.language",
                    publishDate: "$metadata.lastModified",
                    contentLength: 1,
                    snippet: {
                        $substr: [
                            "$content",
                            { 
                                $max: [
                                    0, 
                                    { $subtract: [
                                        { $indexOfCP: ["$content", processedQuery] },
                                        50
                                    ]}
                                ]
                            },
                            300
                        ]
                    },
                    score: { $meta: "textScore" },
                    freshness: {
                        $cond: [
                            { $gt: ["$metadata.lastModified", null] },
                            { $divide: [
                                { $subtract: [new Date(), { $toDate: "$metadata.lastModified" }] },
                                1000 * 60 * 60 * 24
                            ] },
                            null
                        ]
                    }
                }
            },
            { $addFields: {
                combinedScore: {
                    $add: [
                        { $multiply: ["$score", 0.7] },
                        { $cond: [
                            { $ifNull: ["$freshness", false] },
                            { $multiply: [
                                { $divide: [1, { $add: [1, "$freshness"] }] },
                                0.3
                            ] },
                            0
                        ] }
                    ]
                }
            } },
            { $sort: { combinedScore: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ];

        // Use C++ engine for result processing if available
        let results = await this.collection.aggregate(pipeline).toArray();

        // Post-process results with C++ engine if available
        if (this.cppEngine.isAvailable && results.length > 0) {
            try {
                const processedResults = await this.cppEngine.processSearchResults(results);
                if (processedResults && processedResults.results) {
                    results = processedResults.results;
                }
            } catch (error) {
                console.warn('C++ result processing failed:', error.message);
            }
        }

        const total = await this.collection.countDocuments({
            $text: { $search: processedQuery }
        });

        const response = {
            query: processedQuery,
            originalQuery: query,
            page,
            total,
            pages: Math.ceil(total / limit),
            results,
            latency: `${Date.now() - start}ms`,
            engines: {
                ml: this.mlEngine.isAvailable,
                cpp: this.cppEngine.isAvailable
            }
        };

        await this.database.setCached(cacheKey, response, 3600);
        return response;
    }

    async getSuggestions(query) {
        if (query.length < 2) return [];
        
        const cacheKey = `suggestions:${query}`;
        const cached = await this.database.getCached(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        // Use distinct for better performance
        const suggestions = await this.collection.distinct("title", {
            title: new RegExp(`^${query}`, 'i')
        }, { limit: 5 });

        await this.database.setCached(cacheKey, suggestions, 1800);
        return suggestions;
    }

    async indexDocument(document) {
        try {
            // Pre-process content with ML engine if available
            if (this.mlEngine.isAvailable && document.content) {
                try {
                    const analysis = await this.mlEngine.processText(document.content, 'analyze');
                    if (analysis) {
                        document.keywords = analysis.keywords || [];
                        document.sentiment = analysis.sentiment;
                        document.entities = analysis.entities;
                    }
                } catch (error) {
                    console.warn('ML content analysis failed:', error.message);
                }
            }

            // Use C++ engine for content processing if available
            if (this.cppEngine.isAvailable && document.content) {
                try {
                    const processed = await this.cppEngine.extractKeywords(document.content);
                    if (processed && processed.keywords) {
                        document.extractedKeywords = processed.keywords;
                    }
                } catch (error) {
                    console.warn('C++ content processing failed:', error.message);
                }
            }

            const result = await this.collection.updateOne(
                { url: document.url },
                { $set: document },
                { upsert: true }
            );

            return {
                success: true,
                inserted: result.upsertedCount,
                modified: result.modifiedCount
            };
        } catch (error) {
            console.error('Document indexing failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async bulkIndex(documents) {
        const results = [];
        
        for (const document of documents) {
            const result = await this.indexDocument(document);
            results.push({
                url: document.url,
                ...result
            });
        }
        
        return results;
    }

    async deleteDocument(url) {
        try {
            const result = await this.collection.deleteOne({ url });
            return {
                success: true,
                deleted: result.deletedCount
            };
        } catch (error) {
            console.error('Document deletion failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getStats() {
        try {
            const totalDocuments = await this.collection.countDocuments();
            const totalSize = await this.collection.stats();
            
            return {
                totalDocuments,
                totalSize: totalSize.size,
                avgDocumentSize: totalSize.avgObjSize,
                indexes: totalSize.nindexes,
                engines: {
                    ml: this.mlEngine.getStatus(),
                    cpp: this.cppEngine.getStatus()
                }
            };
        } catch (error) {
            console.error('Failed to get search stats:', error);
            return { error: error.message };
        }
    }

    async reindex() {
        try {
            console.log('Starting search index rebuild...');
            
            // Drop existing indexes
            await this.collection.dropIndexes();
            
            // Recreate indexes
            await this.database.createIndexes();
            
            console.log('Search index rebuild completed');
            return { success: true };
        } catch (error) {
            console.error('Search index rebuild failed:', error);
            return { success: false, error: error.message };
        }
    }
}

module.exports = new SearchService();