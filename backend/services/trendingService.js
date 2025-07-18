const redis = require('redis');

class TrendingService {
    constructor() {
        this.client = redis.createClient({
            url: process.env.REDIS_URL || 'redis://localhost:6379',
        });
        this.ready = false;
        this.client.connect().then(() => {
            this.ready = true;
        }).catch((err) => {
            console.error('Redis connection error (TrendingService):', err);
        });
    }

    async recordSearch(query) {
        if (!this.ready) return;
        await this.client.zIncrBy('search:trending', 1, query.toLowerCase());
    }

    async getTrending(limit = 10) {
        if (!this.ready) return [];
        return await this.client.zRevRangeWithScores('search:trending', 0, limit - 1);
    }
}

module.exports = new TrendingService();