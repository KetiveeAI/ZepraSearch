/**
 * Configuration Manager
 * 
 * Centralized configuration management for the Ketivee Search Engine
 */

const fs = require('fs');
const path = require('path');

class ConfigManager {
    constructor() {
        this.config = {};
        this.env = process.env.NODE_ENV || 'development';
        this.loadConfiguration();
    }

    loadConfiguration() {
        // Load environment-specific config
        this.config = {
            // Server Configuration
            server: {
                port: parseInt(process.env.PORT) || 6329,
                host: process.env.HOST || 'localhost',
                cors: {
                    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
                    credentials: true
                }
            },

            // Database Configuration
            database: {
                mongodb: {
                    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ketivee_search',
                    options: {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        maxPoolSize: 10,
                        serverSelectionTimeoutMS: 5000,
                        socketTimeoutMS: 45000
                    }
                },
                redis: {
                    url: process.env.REDIS_URL || 'redis://localhost:6379',
                    options: {
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
                    }
                }
            },

            // Search Configuration
            search: {
                index: process.env.SEARCH_INDEX || 'search_index',
                defaultLimit: 10,
                maxLimit: 100,
                cacheTTL: parseInt(process.env.REDIS_CACHE_TTL) || 3600,
                textSearchWeights: {
                    title: 10,
                    content: 1
                }
            },

            // Engine Configuration
            engines: {
                cpp: {
                    enabled: process.env.CPP_ENGINE_ENABLED === 'true',
                    path: process.env.CPP_ENGINE_PATH || './cpp_engine/lib_process_data.so'
                },
                crawler: {
                    enabled: process.env.CRAWLER_ENABLED === 'true',
                    path: process.env.CRAWLER_PATH || './crawler/crawler.py',
                    defaultDelay: 1,
                    maxPages: 10,
                    userAgent: 'KetiveeBot/1.0'
                },
                ml: {
                    enabled: process.env.ML_ENGINE_ENABLED === 'true',
                    path: process.env.ML_ENGINE_PATH || './ml_engine/text_processor.py',
                    maxTextLength: 10000
                }
            },

            // Security Configuration
            security: {
                rateLimit: {
                    windowMs: 15 * 60 * 1000, // 15 minutes
                    max: 100 // limit each IP to 100 requests per windowMs
                },
                helmet: {
                    enabled: true,
                    options: {
                        contentSecurityPolicy: {
                            directives: {
                                defaultSrc: ["'self'"],
                                styleSrc: ["'self'", "'unsafe-inline'"],
                                scriptSrc: ["'self'"],
                                imgSrc: ["'self'", "data:", "https:"]
                            }
                        }
                    }
                }
            },

            // Analytics Configuration
            analytics: {
                enabled: process.env.ANALYTICS_ENABLED === 'true',
                collection: 'analytics',
                retentionDays: 30
            },

            // Monitoring Configuration
            monitoring: {
                enabled: process.env.MONITORING_ENABLED === 'true',
                collection: 'monitoring',
                intervalMs: 60000, // 1 minute
                retentionHours: 24
            },

            // Logging Configuration
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                format: process.env.LOG_FORMAT || 'json',
                file: process.env.LOG_FILE || null
            }
        };

        // Load environment-specific overrides
        this.loadEnvironmentOverrides();
    }

    loadEnvironmentOverrides() {
        const envConfigPath = path.join(__dirname, `config.${this.env}.js`);
        
        if (fs.existsSync(envConfigPath)) {
            try {
                const envConfig = require(envConfigPath);
                this.config = this.mergeConfig(this.config, envConfig);
                console.log(`Loaded environment config: ${this.env}`);
            } catch (error) {
                console.warn(`Failed to load environment config: ${error.message}`);
            }
        }
    }

    mergeConfig(base, override) {
        const result = { ...base };
        
        for (const key in override) {
            if (override.hasOwnProperty(key)) {
                if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
                    result[key] = this.mergeConfig(result[key] || {}, override[key]);
                } else {
                    result[key] = override[key];
                }
            }
        }
        
        return result;
    }

    get(path) {
        const keys = path.split('.');
        let value = this.config;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return undefined;
            }
        }
        
        return value;
    }

    set(path, value) {
        const keys = path.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current) || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
    }

    getAll() {
        return this.config;
    }

    getEnvironment() {
        return this.env;
    }

    isDevelopment() {
        return this.env === 'development';
    }

    isProduction() {
        return this.env === 'production';
    }

    isTest() {
        return this.env === 'test';
    }

    // Convenience methods for common config access
    getServerConfig() {
        return this.config.server;
    }

    getDatabaseConfig() {
        return this.config.database;
    }

    getSearchConfig() {
        return this.config.search;
    }

    getEnginesConfig() {
        return this.config.engines;
    }

    getSecurityConfig() {
        return this.config.security;
    }

    getAnalyticsConfig() {
        return this.config.analytics;
    }

    getMonitoringConfig() {
        return this.config.monitoring;
    }

    getLoggingConfig() {
        return this.config.logging;
    }

    // Validation methods
    validate() {
        const errors = [];

        // Validate required environment variables
        if (!process.env.MONGODB_URI) {
            errors.push('MONGODB_URI environment variable is required');
        }

        if (!process.env.REDIS_URL) {
            errors.push('REDIS_URL environment variable is required');
        }

        // Validate configuration structure
        if (!this.config.server.port) {
            errors.push('Server port configuration is missing');
        }

        if (!this.config.database.mongodb.uri) {
            errors.push('MongoDB URI configuration is missing');
        }

        if (errors.length > 0) {
            throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
        }

        return true;
    }

    // Export configuration for external use
    export() {
        return {
            environment: this.env,
            timestamp: new Date().toISOString(),
            config: this.config
        };
    }
}

module.exports = ConfigManager; 