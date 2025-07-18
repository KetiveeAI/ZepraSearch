const { ObjectId } = require('mongodb');

class SearchQuery {
    constructor(db) {
        this.collection = db.collection('search_queries');
        this.createIndexes();
    }

    async createIndexes() {
        try {
            // Query text index
            await this.collection.createIndex(
                { query: "text" },
                { 
                    weights: { query: 1 },
                    name: "query_text_index",
                    default_language: "english"
                }
            );

            // Query uniqueness index
            await this.collection.createIndex(
                { query: 1 },
                { unique: true, name: "query_unique_index" }
            );

            // Timestamp index
            await this.collection.createIndex(
                { createdAt: 1 },
                { name: "created_at_index" }
            );

            // Last searched index
            await this.collection.createIndex(
                { lastSearched: 1 },
                { name: "last_searched_index" }
            );

            // Search count index
            await this.collection.createIndex(
                { searchCount: -1 },
                { name: "search_count_index" }
            );

            // Category index
            await this.collection.createIndex(
                { category: 1 },
                { name: "category_index" }
            );

            // User ID index
            await this.collection.createIndex(
                { userId: 1 },
                { name: "user_id_index" }
            );

            console.log('✅ SearchQuery indexes created');
        } catch (error) {
            console.error('❌ Failed to create SearchQuery indexes:', error);
        }
    }

    async recordSearch(query, options = {}) {
        try {
            const {
                userId = null,
                userAgent = null,
                ipAddress = null,
                category = 'general',
                resultsCount = 0,
                latency = 0,
                success = true,
                error = null,
                sessionId = null
            } = options;

            const normalizedQuery = query.trim().toLowerCase();
            const now = new Date();

            // Try to update existing query
            const result = await this.collection.updateOne(
                { query: normalizedQuery },
                {
                    $set: {
                        lastSearched: now,
                        updatedAt: now,
                        category: category,
                        realData: true,
                        independent: true
                    },
                    $inc: {
                        searchCount: 1,
                        totalResults: resultsCount,
                        totalLatency: latency
                    },
                    $push: {
                        searchHistory: {
                            timestamp: now,
                            userId: userId,
                            userAgent: userAgent,
                            ipAddress: ipAddress,
                            resultsCount: resultsCount,
                            latency: latency,
                            success: success,
                            error: error,
                            sessionId: sessionId
                        }
                    },
                    $setOnInsert: {
                        _id: new ObjectId(),
                        query: normalizedQuery,
                        originalQuery: query,
                        createdAt: now,
                        firstSearched: now,
                        users: userId ? [userId] : [],
                        userAgents: userAgent ? [userAgent] : [],
                        ipAddresses: ipAddress ? [ipAddress] : []
                    }
                },
                { upsert: true }
            );

            // If it's a new query, add user info
            if (result.upsertedCount > 0) {
                await this.collection.updateOne(
                    { query: normalizedQuery },
                    {
                        $addToSet: {
                            users: userId,
                            userAgents: userAgent,
                            ipAddresses: ipAddress
                        }
                    }
                );
            }

            return result;
        } catch (error) {
            console.error('Error recording search query:', error);
            throw error;
        }
    }

    async getTrendingQueries(limit = 10, period = 'all') {
        try {
            const filter = {};
            
            if (period !== 'all') {
                const now = new Date();
                const periodMs = {
                    'hour': 60 * 60 * 1000,
                    'day': 24 * 60 * 60 * 1000,
                    'week': 7 * 24 * 60 * 60 * 1000,
                    'month': 30 * 24 * 60 * 60 * 1000
                };
                
                if (periodMs[period]) {
                    const cutoff = new Date(now.getTime() - periodMs[period]);
                    filter.lastSearched = { $gte: cutoff };
                }
            }

            const results = await this.collection
                .find(filter)
                .sort({ searchCount: -1, lastSearched: -1 })
                .limit(limit)
                .toArray();

            return results.map(query => ({
                query: query.query,
                searchCount: query.searchCount,
                lastSearched: query.lastSearched,
                category: query.category,
                avgLatency: query.totalLatency / query.searchCount,
                uniqueUsers: query.users ? query.users.length : 0
            }));
        } catch (error) {
            console.error('Error getting trending queries:', error);
            throw error;
        }
    }

    async getQueryStats(query) {
        try {
            const normalizedQuery = query.trim().toLowerCase();
            const result = await this.collection.findOne({ query: normalizedQuery });
            
            if (!result) {
                return null;
            }

            return {
                query: result.query,
                searchCount: result.searchCount,
                firstSearched: result.firstSearched,
                lastSearched: result.lastSearched,
                category: result.category,
                avgLatency: result.totalLatency / result.searchCount,
                totalResults: result.totalResults,
                uniqueUsers: result.users ? result.users.length : 0,
                searchHistory: result.searchHistory ? result.searchHistory.slice(-10) : []
            };
        } catch (error) {
            console.error('Error getting query stats:', error);
            throw error;
        }
    }

    async getPopularQueries(limit = 20) {
        try {
            return await this.collection
                .find({})
                .sort({ searchCount: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error getting popular queries:', error);
            throw error;
        }
    }

    async getQueriesByCategory(category, limit = 20) {
        try {
            return await this.collection
                .find({ category: category })
                .sort({ searchCount: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error getting queries by category:', error);
            throw error;
        }
    }

    async getUserQueries(userId, limit = 20) {
        try {
            return await this.collection
                .find({ users: userId })
                .sort({ lastSearched: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error getting user queries:', error);
            throw error;
        }
    }

    async getQuerySuggestions(partialQuery, limit = 5) {
        try {
            const normalizedQuery = partialQuery.trim().toLowerCase();
            
            return await this.collection
                .find({ 
                    query: { $regex: `^${normalizedQuery}`, $options: 'i' }
                })
                .sort({ searchCount: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error getting query suggestions:', error);
            throw error;
        }
    }

    async getStats() {
        try {
            const stats = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalQueries: { $sum: 1 },
                        totalSearches: { $sum: '$searchCount' },
                        avgSearchesPerQuery: { $avg: '$searchCount' },
                        totalLatency: { $sum: '$totalLatency' }
                    }
                }
            ]).toArray();

            const categoryStats = await this.collection.aggregate([
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        totalSearches: { $sum: '$searchCount' }
                    }
                },
                { $sort: { totalSearches: -1 } }
            ]).toArray();

            const recentQueries = await this.collection
                .find({})
                .sort({ lastSearched: -1 })
                .limit(10)
                .toArray();

            return {
                ...stats[0],
                categories: categoryStats,
                recentQueries: recentQueries.map(q => ({
                    query: q.query,
                    searchCount: q.searchCount,
                    lastSearched: q.lastSearched
                })),
                realData: true,
                independent: true
            };
        } catch (error) {
            console.error('Error getting query stats:', error);
            throw error;
        }
    }

    async deleteOldQueries(daysOld = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await this.collection.deleteMany({
                lastSearched: { $lt: cutoffDate }
            });

            return result;
        } catch (error) {
            console.error('Error deleting old queries:', error);
            throw error;
        }
    }

    async cleanupSearchHistory(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await this.collection.updateMany(
                {},
                {
                    $pull: {
                        searchHistory: {
                            timestamp: { $lt: cutoffDate }
                        }
                    }
                }
            );

            return result;
        } catch (error) {
            console.error('Error cleaning up search history:', error);
            throw error;
        }
    }
}

module.exports = SearchQuery; 