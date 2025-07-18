/**
 * Monitoring Service
 * 
 * Monitors system health, performance, and resource usage
 */

const os = require('os');
const { MongoClient } = require('mongodb');
const redis = require('redis');
const { promisify } = require('util');

class MonitoringService {
    constructor() {
        this.mongoClient = new MongoClient(process.env.MONGODB_URI);
        this.redisClient = redis.createClient(process.env.REDIS_URL);
        this.getAsync = promisify(this.redisClient.get).bind(this.redisClient);
        this.setAsync = promisify(this.redisClient.setex).bind(this.redisClient);
        this.monitoringInterval = null;
        this.connect();
    }

    async connect() {
        await this.mongoClient.connect();
        this.db = this.mongoClient.db();
        this.monitoringCollection = this.db.collection('monitoring');
        console.log('Monitoring service connected to MongoDB & Redis');
    }

    startMonitoring(intervalMs = 60000) {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
        }

        this.monitoringInterval = setInterval(async () => {
            await this.collectMetrics();
        }, intervalMs);

        console.log(`Monitoring started with ${intervalMs}ms interval`);
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
            console.log('Monitoring stopped');
        }
    }

    async collectMetrics() {
        try {
            const metrics = {
                timestamp: new Date(),
                system: await this.getSystemMetrics(),
                database: await this.getDatabaseMetrics(),
                redis: await this.getRedisMetrics(),
                application: await this.getApplicationMetrics()
            };

            await this.monitoringCollection.insertOne(metrics);
            
            // Cache latest metrics
            await this.setAsync('monitoring:latest', 300, JSON.stringify(metrics));
            
        } catch (error) {
            console.error('Failed to collect monitoring metrics:', error);
        }
    }

    async getSystemMetrics() {
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        return {
            cpu: {
                loadAverage: os.loadavg(),
                cores: os.cpus().length,
                usage: process.cpuUsage()
            },
            memory: {
                total: totalMem,
                free: freeMem,
                used: usedMem,
                usagePercent: (usedMem / totalMem) * 100
            },
            uptime: os.uptime(),
            platform: os.platform(),
            arch: os.arch()
        };
    }

    async getDatabaseMetrics() {
        try {
            const stats = await this.db.stats();
            const collections = await this.db.listCollections().toArray();
            
            return {
                database: stats.db,
                collections: collections.length,
                dataSize: stats.dataSize,
                storageSize: stats.storageSize,
                indexes: stats.indexes,
                indexSize: stats.indexSize
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getRedisMetrics() {
        try {
            const info = await this.redisClient.info();
            const lines = info.split('\r\n');
            const metrics = {};

            lines.forEach(line => {
                if (line.includes(':')) {
                    const [key, value] = line.split(':');
                    metrics[key] = value;
                }
            });

            return {
                connected_clients: metrics.connected_clients,
                used_memory: metrics.used_memory,
                used_memory_peak: metrics.used_memory_peak,
                total_commands_processed: metrics.total_commands_processed,
                keyspace_hits: metrics.keyspace_hits,
                keyspace_misses: metrics.keyspace_misses
            };
        } catch (error) {
            return { error: error.message };
        }
    }

    async getApplicationMetrics() {
        const memUsage = process.memoryUsage();
        
        return {
            memory: {
                rss: memUsage.rss,
                heapTotal: memUsage.heapTotal,
                heapUsed: memUsage.heapUsed,
                external: memUsage.external
            },
            uptime: process.uptime(),
            pid: process.pid,
            version: process.version,
            platform: process.platform
        };
    }

    async getHealthStatus() {
        const cacheKey = 'monitoring:health';
        const cached = await this.getAsync(cacheKey);
        
        if (cached) {
            return JSON.parse(cached);
        }

        const health = {
            timestamp: new Date(),
            status: 'healthy',
            checks: {
                database: await this.checkDatabaseHealth(),
                redis: await this.checkRedisHealth(),
                system: await this.checkSystemHealth()
            }
        };

        // Determine overall status
        const allChecks = Object.values(health.checks);
        if (allChecks.some(check => check.status === 'error')) {
            health.status = 'error';
        } else if (allChecks.some(check => check.status === 'warning')) {
            health.status = 'warning';
        }

        await this.setAsync(cacheKey, 60, JSON.stringify(health));
        return health;
    }

    async checkDatabaseHealth() {
        try {
            await this.db.admin().ping();
            return { status: 'healthy', message: 'Database connection OK' };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }

    async checkRedisHealth() {
        try {
            await this.redisClient.ping();
            return { status: 'healthy', message: 'Redis connection OK' };
        } catch (error) {
            return { status: 'error', message: error.message };
        }
    }

    async checkSystemHealth() {
        const memUsage = process.memoryUsage();
        const heapUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        if (heapUsagePercent > 90) {
            return { 
                status: 'error', 
                message: `High memory usage: ${heapUsagePercent.toFixed(2)}%` 
            };
        } else if (heapUsagePercent > 80) {
            return { 
                status: 'warning', 
                message: `Elevated memory usage: ${heapUsagePercent.toFixed(2)}%` 
            };
        }
        
        return { status: 'healthy', message: 'System resources OK' };
    }

    async getMetricsHistory(hours = 24) {
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - hours);

        return this.monitoringCollection.find({
            timestamp: { $gte: startTime }
        }).sort({ timestamp: -1 }).toArray();
    }

    async getAlerts() {
        const alerts = [];
        const health = await this.getHealthStatus();

        // Check for critical issues
        Object.entries(health.checks).forEach(([service, check]) => {
            if (check.status === 'error') {
                alerts.push({
                    level: 'critical',
                    service: service,
                    message: check.message,
                    timestamp: new Date()
                });
            }
        });

        return alerts;
    }
}

module.exports = MonitoringService; 