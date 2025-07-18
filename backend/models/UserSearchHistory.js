const { ObjectId } = require('mongodb');

class UserSearchHistory {
    constructor(db) {
        this.collection = db.collection('user_search_history');
        this.createIndexes();
    }

    async createIndexes() {
        try {
            // User ID index
            await this.collection.createIndex(
                { userId: 1 },
                { name: "user_id_index" }
            );

            // Timestamp index for cleanup
            await this.collection.createIndex(
                { createdAt: 1 },
                { name: "created_at_index" }
            );

            // Query text index
            await this.collection.createIndex(
                { query: "text" },
                { 
                    weights: { query: 1 },
                    name: "query_text_index",
                    default_language: "english"
                }
            );

            // Session ID index
            await this.collection.createIndex(
                { sessionId: 1 },
                { name: "session_id_index" }
            );

            // Compound index for user queries
            await this.collection.createIndex(
                { userId: 1, createdAt: -1 },
                { name: "user_queries_compound_index" }
            );

            console.log('✅ UserSearchHistory indexes created');
        } catch (error) {
            console.error('❌ Failed to create UserSearchHistory indexes:', error);
        }
    }

    async saveSearchQuery(userId, query, options = {}) {
        try {
            const {
                sessionId = null,
                ipAddress = null,
                userAgent = null,
                resultsCount = 0,
                latency = 0,
                success = true,
                error = null,
                category = 'general',
                results = []
            } = options;

            const searchRecord = {
                _id: new ObjectId(),
                userId: userId,
                query: query.trim(),
                originalQuery: query,
                sessionId: sessionId,
                ipAddress: ipAddress,
                userAgent: userAgent,
                resultsCount: resultsCount,
                latency: latency,
                success: success,
                error: error,
                category: category,
                results: results.slice(0, 10), // Store only first 10 results
                createdAt: new Date(),
                updatedAt: new Date(),
                expiresAt: new Date(Date.now() + (15 * 24 * 60 * 60 * 1000)), // 15 days
                realData: true,
                independent: true
            };

            const result = await this.collection.insertOne(searchRecord);
            return result;
        } catch (error) {
            console.error('Error saving user search query:', error);
            throw error;
        }
    }

    async getUserSearchHistory(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                startDate = null,
                endDate = null,
                category = null,
                query = null
            } = options;

            const skip = (page - 1) * limit;
            const filter = { userId };

            // Date range filter
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) filter.createdAt.$gte = new Date(startDate);
                if (endDate) filter.createdAt.$lte = new Date(endDate);
            }

            // Category filter
            if (category) {
                filter.category = category;
            }

            // Query text search
            if (query) {
                filter.$text = { $search: query };
            }

            const results = await this.collection
                .find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await this.collection.countDocuments(filter);

            return {
                searches: results,
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            };
        } catch (error) {
            console.error('Error getting user search history:', error);
            throw error;
        }
    }

    async deleteUserSearch(userId, searchId) {
        try {
            const result = await this.collection.deleteOne({
                _id: new ObjectId(searchId),
                userId: userId
            });

            return result;
        } catch (error) {
            console.error('Error deleting user search:', error);
            throw error;
        }
    }

    async deleteUserSearchHistory(userId, options = {}) {
        try {
            const {
                startDate = null,
                endDate = null,
                category = null
            } = options;

            const filter = { userId };

            // Date range filter
            if (startDate || endDate) {
                filter.createdAt = {};
                if (startDate) filter.createdAt.$gte = new Date(startDate);
                if (endDate) filter.createdAt.$lte = new Date(endDate);
            }

            // Category filter
            if (category) {
                filter.category = category;
            }

            const result = await this.collection.deleteMany(filter);
            return result;
        } catch (error) {
            console.error('Error deleting user search history:', error);
            throw error;
        }
    }

    async exportUserData(userId, format = 'json') {
        try {
            const searches = await this.collection
                .find({ userId })
                .sort({ createdAt: -1 })
                .toArray();

            const exportData = {
                userId: userId,
                exportDate: new Date().toISOString(),
                totalSearches: searches.length,
                searches: searches.map(search => ({
                    id: search._id.toString(),
                    query: search.query,
                    originalQuery: search.originalQuery,
                    category: search.category,
                    resultsCount: search.resultsCount,
                    latency: search.latency,
                    success: search.success,
                    createdAt: search.createdAt,
                    sessionId: search.sessionId
                }))
            };

            if (format === 'csv') {
                return this.convertToCSV(exportData);
            }

            return exportData;
        } catch (error) {
            console.error('Error exporting user data:', error);
            throw error;
        }
    }

    convertToCSV(data) {
        const headers = ['id', 'query', 'originalQuery', 'category', 'resultsCount', 'latency', 'success', 'createdAt'];
        const csvRows = [headers.join(',')];
        
        data.searches.forEach(search => {
            const row = headers.map(header => {
                const value = search[header];
                if (header === 'createdAt') {
                    return new Date(value).toISOString();
                }
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    async getUserStats(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const stats = await this.collection.aggregate([
                {
                    $match: {
                        userId: userId,
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalSearches: { $sum: 1 },
                        successfulSearches: { $sum: { $cond: ['$success', 1, 0] } },
                        totalResults: { $sum: '$resultsCount' },
                        avgLatency: { $avg: '$latency' },
                        uniqueQueries: { $addToSet: '$query' }
                    }
                }
            ]).toArray();

            const categoryStats = await this.collection.aggregate([
                {
                    $match: {
                        userId: userId,
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]).toArray();

            const popularQueries = await this.collection.aggregate([
                {
                    $match: {
                        userId: userId,
                        createdAt: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$query',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]).toArray();

            return {
                period: `${days} days`,
                totalSearches: stats[0]?.totalSearches || 0,
                successfulSearches: stats[0]?.successfulSearches || 0,
                successRate: stats[0]?.totalSearches > 0 ? 
                    (stats[0].successfulSearches / stats[0].totalSearches * 100).toFixed(2) : 0,
                totalResults: stats[0]?.totalResults || 0,
                avgLatency: stats[0]?.avgLatency || 0,
                uniqueQueries: stats[0]?.uniqueQueries?.length || 0,
                categories: categoryStats,
                popularQueries: popularQueries,
                realData: true,
                independent: true
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    async cleanupExpiredData() {
        try {
            const now = new Date();
            const result = await this.collection.deleteMany({
                expiresAt: { $lt: now }
            });

            console.log(`🧹 Cleaned up ${result.deletedCount} expired search records`);
            return result;
        } catch (error) {
            console.error('Error cleaning up expired data:', error);
            throw error;
        }
    }

    async getExpiredDataCount() {
        try {
            const now = new Date();
            const count = await this.collection.countDocuments({
                expiresAt: { $lt: now }
            });

            return count;
        } catch (error) {
            console.error('Error getting expired data count:', error);
            throw error;
        }
    }

    async scheduleCleanup() {
        // Run cleanup every 24 hours
        setInterval(async () => {
            try {
                await this.cleanupExpiredData();
            } catch (error) {
                console.error('Scheduled cleanup failed:', error);
            }
        }, 24 * 60 * 60 * 1000);

        console.log('🕐 Scheduled search history cleanup every 24 hours');
    }
}

module.exports = UserSearchHistory; 