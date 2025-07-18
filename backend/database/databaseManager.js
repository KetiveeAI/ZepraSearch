/**
 * Database Manager
 * 
 * Centralized database connection management for MongoDB and Redis
 */

const { MongoClient } = require('mongodb');
const redis = require('redis');

class DatabaseManager {
    constructor() {
        this.mongoClient = null;
        this.redisClient = null;
        this.db = null;
        this.collections = {};
        this.isConnected = false;
    }

    async connect() {
        try {
            console.log('🔌 Connecting to databases...');
            
            // Connect to MongoDB
            this.mongoClient = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017/ketivee', {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            await this.mongoClient.connect();
            this.db = this.mongoClient.db();
            
            // Initialize collections for C++ crawler integration
            this.collections.pages = this.db.collection('pages'); // C++ crawler stores here
            this.collections.search = this.db.collection('search_index'); // Legacy search index
            this.collections.analytics = this.db.collection('analytics');
            this.collections.monitoring = this.db.collection('monitoring');
            this.collections.trending = this.db.collection('trending');
            this.collections.users = this.db.collection('users');
            
            // Connect to Redis (modern async API)
            this.redisClient = redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        return new Error('Redis server refused connection');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > 10) {
                        return undefined;
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            await this.redisClient.connect();
            
            this.isConnected = true;
            console.log('✅ Database connections established');
            
            // Set up connection event handlers
            this.setupEventHandlers();
            
        } catch (error) {
            console.error('❌ Database connection failed:', error);
            this.isConnected = false;
            // Don't throw error, just log it for now
            console.log('⚠️ Continuing without database connection...');
        }
    }

    setupEventHandlers() {
        if (this.mongoClient) {
            // MongoDB event handlers
            this.mongoClient.on('connected', () => {
                console.log('📊 MongoDB connected');
            });

            this.mongoClient.on('disconnected', () => {
                console.log('⚠️ MongoDB disconnected');
                this.isConnected = false;
            });

            this.mongoClient.on('error', (error) => {
                console.error('❌ MongoDB error:', error);
            });
        }

        if (this.redisClient) {
            // Redis event handlers
            this.redisClient.on('connect', () => {
                console.log('🔴 Redis connected');
            });

            this.redisClient.on('disconnect', () => {
                console.log('⚠️ Redis disconnected');
            });

            this.redisClient.on('error', (error) => {
                console.error('❌ Redis error:', error);
            });
        }
    }

    async disconnect() {
        try {
            if (this.mongoClient) {
                await this.mongoClient.close();
                console.log('📊 MongoDB disconnected');
            }
            
            if (this.redisClient) {
                await this.redisClient.quit();
                console.log('🔴 Redis disconnected');
            }
            
            this.isConnected = false;
        } catch (error) {
            console.error('Error disconnecting from databases:', error);
        }
    }

    getCollection(name) {
        if (!this.isConnected || !this.db) {
            throw new Error('Database not connected');
        }
        
        if (this.collections[name]) {
            return this.collections[name];
        }
        
        // Create collection if it doesn't exist
        this.collections[name] = this.db.collection(name);
        return this.collections[name];
    }

    async createIndexes() {
        try {
            if (!this.isConnected) {
                console.log('⚠️ Skipping index creation - database not connected');
                return;
            }

            console.log('🔍 Creating database indexes...');
            
            // Text index for C++ crawler pages collection
            await this.collections.pages.createIndex(
                { title: "text", content: "text" },
                { 
                    weights: { title: 10, content: 5 },
                    name: "TextIndex",
                    default_language: "english"
                }
            );

            // URL index for uniqueness in pages collection
            await this.collections.pages.createIndex(
                { url: 1 },
                { unique: true, name: "url_unique" }
            );

            // Legacy search index (for backward compatibility)
            await this.collections.search.createIndex(
                { content: "text", title: "text" },
                { 
                    weights: { title: 10, content: 1 },
                    name: "text_search"
                }
            );

            // URL index for legacy search
            await this.collections.search.createIndex(
                { url: 1 },
                { unique: true, name: "url_unique_legacy" }
            );

            // Timestamp index for analytics
            await this.collections.analytics.createIndex(
                { timestamp: 1 },
                { name: "timestamp_index" }
            );

            // Query index for trending
            await this.collections.trending.createIndex(
                { query: 1 },
                { name: "query_index" }
            );

            console.log('✅ Database indexes created');
        } catch (error) {
            console.error('❌ Failed to create indexes:', error);
        }
    }

    async getStats() {
        if (!this.isConnected) {
            return { error: 'Database not connected' };
        }

        try {
            const stats = {
                mongo: {
                    collections: Object.keys(this.collections).length,
                    pages: await this.collections.pages.countDocuments(),
                    search: await this.collections.search.countDocuments(),
                    analytics: await this.collections.analytics.countDocuments(),
                    trending: await this.collections.trending.countDocuments()
                },
                redis: {
                    connected: this.redisClient.isReady
                }
            };
            
            return stats;
        } catch (error) {
            return { error: error.message };
        }
    }

    async healthCheck() {
        try {
            if (!this.isConnected) {
                return { status: 'disconnected', error: 'Database not connected' };
            }

            // Test MongoDB
            await this.db.admin().ping();
            
            // Test Redis
            await this.redisClient.ping();
            
            return { status: 'healthy', timestamp: new Date().toISOString() };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    // Redis cache methods (using modern async API)
    async getCached(key) {
        try {
            if (!this.redisClient || !this.redisClient.isReady) {
                return null;
            }
            return await this.redisClient.get(key);
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    async setCached(key, value, ttl = 3600) {
        try {
            if (!this.redisClient || !this.redisClient.isReady) {
                return false;
            }
            await this.redisClient.setEx(key, ttl, value);
            return true;
        } catch (error) {
            console.error('Redis set error:', error);
            return false;
        }
    }

    async deleteCached(key) {
        try {
            if (!this.redisClient || !this.redisClient.isReady) {
                return false;
            }
            await this.redisClient.del(key);
            return true;
        } catch (error) {
            console.error('Redis delete error:', error);
            return false;
        }
    }

    async clearCache(pattern = '*') {
        try {
            if (!this.redisClient || !this.redisClient.isReady) {
                return false;
            }
            const keys = await this.redisClient.keys(pattern);
            if (keys.length > 0) {
                await this.redisClient.del(keys);
            }
            return true;
        } catch (error) {
            console.error('Redis clear cache error:', error);
            return false;
        }
    }
}

module.exports = DatabaseManager; 