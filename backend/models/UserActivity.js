const { ObjectId } = require('mongodb');

class UserActivity {
    constructor(db) {
        this.collection = db.collection('user_activity');
        this.createIndexes();
    }

    async createIndexes() {
        try {
            // User ID index
            await this.collection.createIndex(
                { userId: 1 },
                { name: "user_id_index" }
            );

            // Session ID index
            await this.collection.createIndex(
                { sessionId: 1 },
                { name: "session_id_index" }
            );

            // Activity type index
            await this.collection.createIndex(
                { activityType: 1 },
                { name: "activity_type_index" }
            );

            // Timestamp index
            await this.collection.createIndex(
                { timestamp: 1 },
                { name: "timestamp_index" }
            );

            // IP address index
            await this.collection.createIndex(
                { ipAddress: 1 },
                { name: "ip_address_index" }
            );

            // Query index
            await this.collection.createIndex(
                { query: 1 },
                { name: "query_index" }
            );

            // URL index
            await this.collection.createIndex(
                { url: 1 },
                { name: "url_index" }
            );

            // Compound index for user activity
            await this.collection.createIndex(
                { userId: 1, timestamp: -1 },
                { name: "user_activity_compound_index" }
            );

            console.log('✅ UserActivity indexes created');
        } catch (error) {
            console.error('❌ Failed to create UserActivity indexes:', error);
        }
    }

    async recordActivity(data) {
        try {
            const {
                userId = null,
                sessionId = null,
                activityType,
                query = null,
                url = null,
                ipAddress = null,
                userAgent = null,
                referrer = null,
                duration = null,
                success = true,
                error = null,
                metadata = {}
            } = data;

            const activity = {
                _id: new ObjectId(),
                userId: userId,
                sessionId: sessionId,
                activityType: activityType,
                query: query,
                url: url,
                ipAddress: ipAddress,
                userAgent: userAgent,
                referrer: referrer,
                duration: duration,
                success: success,
                error: error,
                metadata: metadata,
                timestamp: new Date(),
                realData: true,
                independent: true
            };

            const result = await this.collection.insertOne(activity);
            return result;
        } catch (error) {
            console.error('Error recording user activity:', error);
            throw error;
        }
    }

    async recordSearch(userId, sessionId, query, options = {}) {
        try {
            const {
                ipAddress = null,
                userAgent = null,
                referrer = null,
                resultsCount = 0,
                latency = 0,
                success = true,
                error = null
            } = options;

            return await this.recordActivity({
                userId,
                sessionId,
                activityType: 'search',
                query,
                ipAddress,
                userAgent,
                referrer,
                duration: latency,
                success,
                error,
                metadata: {
                    resultsCount,
                    latency
                }
            });
        } catch (error) {
            console.error('Error recording search activity:', error);
            throw error;
        }
    }

    async recordClick(userId, sessionId, query, url, options = {}) {
        try {
            const {
                ipAddress = null,
                userAgent = null,
                referrer = null,
                position = null,
                duration = null
            } = options;

            return await this.recordActivity({
                userId,
                sessionId,
                activityType: 'click',
                query,
                url,
                ipAddress,
                userAgent,
                referrer,
                duration,
                metadata: {
                    position
                }
            });
        } catch (error) {
            console.error('Error recording click activity:', error);
            throw error;
        }
    }

    async recordPageView(userId, sessionId, url, options = {}) {
        try {
            const {
                ipAddress = null,
                userAgent = null,
                referrer = null,
                duration = null
            } = options;

            return await this.recordActivity({
                userId,
                sessionId,
                activityType: 'pageview',
                url,
                ipAddress,
                userAgent,
                referrer,
                duration
            });
        } catch (error) {
            console.error('Error recording page view activity:', error);
            throw error;
        }
    }

    async getUserActivity(userId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                activityType = null,
                startDate = null,
                endDate = null
            } = options;

            const skip = (page - 1) * limit;
            const filter = { userId };

            if (activityType) {
                filter.activityType = activityType;
            }

            if (startDate || endDate) {
                filter.timestamp = {};
                if (startDate) filter.timestamp.$gte = new Date(startDate);
                if (endDate) filter.timestamp.$lte = new Date(endDate);
            }

            const results = await this.collection
                .find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await this.collection.countDocuments(filter);

            return {
                activities: results,
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            };
        } catch (error) {
            console.error('Error getting user activity:', error);
            throw error;
        }
    }

    async getSessionActivity(sessionId, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                activityType = null
            } = options;

            const skip = (page - 1) * limit;
            const filter = { sessionId };

            if (activityType) {
                filter.activityType = activityType;
            }

            const results = await this.collection
                .find(filter)
                .sort({ timestamp: 1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await this.collection.countDocuments(filter);

            return {
                activities: results,
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            };
        } catch (error) {
            console.error('Error getting session activity:', error);
            throw error;
        }
    }

    async getUserStats(userId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const stats = await this.collection.aggregate([
                {
                    $match: {
                        userId: userId,
                        timestamp: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$activityType',
                        count: { $sum: 1 },
                        avgDuration: { $avg: '$duration' }
                    }
                }
            ]).toArray();

            const searchStats = await this.collection.aggregate([
                {
                    $match: {
                        userId: userId,
                        activityType: 'search',
                        timestamp: { $gte: startDate }
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

            const clickStats = await this.collection.aggregate([
                {
                    $match: {
                        userId: userId,
                        activityType: 'click',
                        timestamp: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$url',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]).toArray();

            return {
                activityTypes: stats,
                topSearches: searchStats,
                topClicks: clickStats,
                period: `${days} days`,
                realData: true,
                independent: true
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw error;
        }
    }

    async getGlobalStats(days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const stats = await this.collection.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$activityType',
                        count: { $sum: 1 },
                        uniqueUsers: { $addToSet: '$userId' },
                        avgDuration: { $avg: '$duration' }
                    }
                }
            ]).toArray();

            const userStats = await this.collection.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate }
                    }
                },
                {
                    $group: {
                        _id: '$userId',
                        activityCount: { $sum: 1 },
                        searchCount: { $sum: { $cond: [{ $eq: ['$activityType', 'search'] }, 1, 0] } },
                        clickCount: { $sum: { $cond: [{ $eq: ['$activityType', 'click'] }, 1, 0] } }
                    }
                },
                { $sort: { activityCount: -1 } },
                { $limit: 10 }
            ]).toArray();

            const topQueries = await this.collection.aggregate([
                {
                    $match: {
                        activityType: 'search',
                        timestamp: { $gte: startDate }
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
                activityTypes: stats.map(stat => ({
                    ...stat,
                    uniqueUsers: stat.uniqueUsers.length
                })),
                topUsers: userStats,
                topQueries: topQueries,
                period: `${days} days`,
                realData: true,
                independent: true
            };
        } catch (error) {
            console.error('Error getting global stats:', error);
            throw error;
        }
    }

    async getActivityByType(activityType, options = {}) {
        try {
            const {
                page = 1,
                limit = 20,
                startDate = null,
                endDate = null
            } = options;

            const skip = (page - 1) * limit;
            const filter = { activityType };

            if (startDate || endDate) {
                filter.timestamp = {};
                if (startDate) filter.timestamp.$gte = new Date(startDate);
                if (endDate) filter.timestamp.$lte = new Date(endDate);
            }

            const results = await this.collection
                .find(filter)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await this.collection.countDocuments(filter);

            return {
                activities: results,
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            };
        } catch (error) {
            console.error('Error getting activity by type:', error);
            throw error;
        }
    }

    async deleteOldActivity(daysOld = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await this.collection.deleteMany({
                timestamp: { $lt: cutoffDate }
            });

            return result;
        } catch (error) {
            console.error('Error deleting old activity:', error);
            throw error;
        }
    }

    async cleanupUserData(userId) {
        try {
            const result = await this.collection.deleteMany({
                userId: userId
            });

            return result;
        } catch (error) {
            console.error('Error cleaning up user data:', error);
            throw error;
        }
    }
}

module.exports = UserActivity; 