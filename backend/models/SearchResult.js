const { ObjectId } = require('mongodb');

class SearchResult {
    constructor(db) {
        this.collection = db.collection('search_results');
        this.createIndexes();
    }

    async createIndexes() {
        try {
            // Text search index
            await this.collection.createIndex(
                { 
                    title: "text", 
                    content: "text", 
                    description: "text",
                    keywords: "text"
                },
                { 
                    weights: { 
                        title: 10, 
                        content: 5, 
                        description: 3,
                        keywords: 2
                    },
                    name: "search_text_index",
                    default_language: "english"
                }
            );

            // URL uniqueness index
            await this.collection.createIndex(
                { url: 1 },
                { unique: true, name: "url_unique_index" }
            );

            // Category index
            await this.collection.createIndex(
                { category: 1 },
                { name: "category_index" }
            );

            // Source index
            await this.collection.createIndex(
                { source: 1 },
                { name: "source_index" }
            );

            // Educational content index
            await this.collection.createIndex(
                { isEducational: 1 },
                { name: "educational_index" }
            );

            // Timestamp index
            await this.collection.createIndex(
                { createdAt: 1 },
                { name: "created_at_index" }
            );

            // Score index for ranking
            await this.collection.createIndex(
                { score: -1 },
                { name: "score_index" }
            );

            // Domain index
            await this.collection.createIndex(
                { domain: 1 },
                { name: "domain_index" }
            );

            console.log('✅ SearchResult indexes created');
        } catch (error) {
            console.error('❌ Failed to create SearchResult indexes:', error);
        }
    }

    async saveSearchResult(data) {
        try {
            const searchResult = {
                _id: new ObjectId(),
                url: data.url,
                title: data.title,
                description: data.description || '',
                content: data.content || '',
                snippet: data.snippet || '',
                keywords: data.keywords || [],
                category: data.category || 'general',
                source: data.source || 'unknown',
                score: data.score || 0,
                isEducational: data.isEducational || false,
                educationalType: data.educationalType || null,
                educationalLevel: data.educationalLevel || null,
                subjects: data.subjects || [],
                hasExercises: data.hasExercises || false,
                hasExamples: data.hasExamples || false,
                domain: this.extractDomain(data.url),
                language: data.language || 'en',
                author: data.author || '',
                lastModified: data.lastModified || null,
                contentLength: data.contentLength || 0,
                metadata: data.metadata || {},
                createdAt: new Date(),
                updatedAt: new Date(),
                crawlCount: 1,
                lastCrawled: new Date(),
                searchCount: 0,
                clickCount: 0,
                realData: true,
                independent: true
            };

            // Use upsert to avoid duplicates
            const result = await this.collection.updateOne(
                { url: data.url },
                { 
                    $set: searchResult,
                    $inc: { crawlCount: 1 },
                    $setOnInsert: { createdAt: new Date() }
                },
                { upsert: true }
            );

            return result;
        } catch (error) {
            console.error('Error saving search result:', error);
            throw error;
        }
    }

    async saveMultipleSearchResults(results) {
        try {
            const operations = results.map(data => ({
                updateOne: {
                    filter: { url: data.url },
                    update: {
                        $set: {
                            ...data,
                            domain: this.extractDomain(data.url),
                            updatedAt: new Date(),
                            realData: true,
                            independent: true
                        },
                        $inc: { crawlCount: 1 },
                        $setOnInsert: { createdAt: new Date() }
                    },
                    upsert: true
                }
            }));

            const result = await this.collection.bulkWrite(operations);
            return result;
        } catch (error) {
            console.error('Error saving multiple search results:', error);
            throw error;
        }
    }

    async search(query, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                category = 'all',
                source = 'all',
                educationalOnly = false,
                sortBy = 'score',
                sortOrder = -1
            } = options;

            const skip = (page - 1) * limit;
            const filter = {};

            // Text search
            if (query && query.trim()) {
                filter.$text = { $search: query };
            }

            // Category filter
            if (category && category !== 'all') {
                filter.category = category;
            }

            // Source filter
            if (source && source !== 'all') {
                filter.source = source;
            }

            // Educational content filter
            if (educationalOnly) {
                filter.isEducational = true;
            }

            const sort = {};
            sort[sortBy] = sortOrder;

            const results = await this.collection
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await this.collection.countDocuments(filter);

            return {
                results,
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            };
        } catch (error) {
            console.error('Error searching results:', error);
            throw error;
        }
    }

    async getByUrl(url) {
        try {
            return await this.collection.findOne({ url });
        } catch (error) {
            console.error('Error getting result by URL:', error);
            throw error;
        }
    }

    async updateSearchCount(url) {
        try {
            await this.collection.updateOne(
                { url },
                { $inc: { searchCount: 1 } }
            );
        } catch (error) {
            console.error('Error updating search count:', error);
        }
    }

    async updateClickCount(url) {
        try {
            await this.collection.updateOne(
                { url },
                { $inc: { clickCount: 1 } }
            );
        } catch (error) {
            console.error('Error updating click count:', error);
        }
    }

    async getStats() {
        try {
            const stats = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalResults: { $sum: 1 },
                        totalEducational: { $sum: { $cond: ['$isEducational', 1, 0] } },
                        avgScore: { $avg: '$score' },
                        totalSearches: { $sum: '$searchCount' },
                        totalClicks: { $sum: '$clickCount' }
                    }
                }
            ]).toArray();

            const categoryStats = await this.collection.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]).toArray();

            const sourceStats = await this.collection.aggregate([
                {
                    $group: {
                        _id: '$source',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]).toArray();

            return {
                ...stats[0],
                categories: categoryStats,
                sources: sourceStats,
                realData: true,
                independent: true
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            throw error;
        }
    }

    async getTrendingResults(limit = 10) {
        try {
            return await this.collection
                .find({})
                .sort({ searchCount: -1, clickCount: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error getting trending results:', error);
            throw error;
        }
    }

    async getEducationalContent(limit = 20) {
        try {
            return await this.collection
                .find({ isEducational: true })
                .sort({ score: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error getting educational content:', error);
            throw error;
        }
    }

    async deleteOldResults(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await this.collection.deleteMany({
                createdAt: { $lt: cutoffDate }
            });

            return result;
        } catch (error) {
            console.error('Error deleting old results:', error);
            throw error;
        }
    }

    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname;
        } catch {
            return 'unknown';
        }
    }
}

module.exports = SearchResult; 