/**
 * Analytics Service
 * 
 * Tracks search performance, user behavior, and system metrics
 */

const fs = require('fs').promises;
const path = require('path');

class AnalyticsService {
    constructor() {
        this.dataPath = path.join(__dirname, '../data/analytics');
        this.ensureDataDirectory();
        
        // In-memory analytics data (in production, use a database)
        this.analytics = {
            searches: [],
            clicks: [],
            performance: [],
            errors: [],
            trends: new Map(),
            userSessions: new Map()
        };
        
        // Start periodic data persistence
        this.startDataPersistence();
    }

    async ensureDataDirectory() {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
        } catch (error) {
            console.warn('Could not create analytics directory:', error.message);
        }
    }

    // Record search analytics
    async recordSearch(query, results, latency, userId = null, userAgent = null) {
        const searchData = {
            id: this.generateId(),
            query: query.toLowerCase(),
            originalQuery: query,
            resultsCount: results?.length || 0,
            latency: latency,
            userId: userId,
            userAgent: userAgent,
            timestamp: new Date().toISOString(),
            hasResults: results && results.length > 0,
            categories: this.extractCategories(results),
            educationalContent: this.hasEducationalContent(results)
        };

        this.analytics.searches.push(searchData);
        
        // Update trends
        this.updateTrends(query, searchData);
        
        // Update user session
        if (userId) {
            this.updateUserSession(userId, searchData);
        }

        return searchData;
    }

    // Record click analytics
    async recordClick(query, url, userId = null, position = null) {
        const clickData = {
            id: this.generateId(),
            query: query.toLowerCase(),
            url: url,
            userId: userId,
            position: position,
            timestamp: new Date().toISOString()
        };

        this.analytics.clicks.push(clickData);
        return clickData;
    }

    // Record performance metrics
    async recordPerformance(operation, duration, success = true, error = null) {
        const performanceData = {
            id: this.generateId(),
            operation: operation,
            duration: duration,
            success: success,
            error: error?.message || null,
            timestamp: new Date().toISOString()
        };

        this.analytics.performance.push(performanceData);
        return performanceData;
    }

    // Record error analytics
    async recordError(error, context = {}) {
        const errorData = {
            id: this.generateId(),
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString()
        };

        this.analytics.errors.push(errorData);
        return errorData;
    }

    // Get search analytics
    async getSearchAnalytics(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentSearches = this.analytics.searches.filter(
            search => new Date(search.timestamp) >= cutoffDate
        );

        const totalSearches = recentSearches.length;
        const successfulSearches = recentSearches.filter(s => s.hasResults).length;
        const averageLatency = recentSearches.reduce((sum, s) => sum + s.latency, 0) / totalSearches || 0;

        // Popular queries
        const queryCounts = {};
        recentSearches.forEach(search => {
            queryCounts[search.query] = (queryCounts[search.query] || 0) + 1;
        });

        const popularQueries = Object.entries(queryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([query, count]) => ({ query, count }));

        // Category distribution
        const categoryCounts = {};
        recentSearches.forEach(search => {
            search.categories.forEach(category => {
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });
        });

        return {
            period: `${days} days`,
            totalSearches: totalSearches,
            successfulSearches: successfulSearches,
            successRate: totalSearches > 0 ? (successfulSearches / totalSearches * 100).toFixed(2) : 0,
            averageLatency: averageLatency.toFixed(2),
            popularQueries: popularQueries,
            categoryDistribution: categoryCounts,
            educationalContentRate: this.calculateEducationalRate(recentSearches)
        };
    }

    // Get performance analytics
    async getPerformanceAnalytics(days = 7) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const recentPerformance = this.analytics.performance.filter(
            perf => new Date(perf.timestamp) >= cutoffDate
        );

        const operations = {};
        recentPerformance.forEach(perf => {
            if (!operations[perf.operation]) {
                operations[perf.operation] = {
                    count: 0,
                    totalDuration: 0,
                    successCount: 0,
                    errorCount: 0
                };
            }
            
            operations[perf.operation].count++;
            operations[perf.operation].totalDuration += perf.duration;
            if (perf.success) {
                operations[perf.operation].successCount++;
            } else {
                operations[perf.operation].errorCount++;
            }
        });

        // Calculate averages
        Object.keys(operations).forEach(op => {
            const opData = operations[op];
            opData.averageDuration = opData.count > 0 ? opData.totalDuration / opData.count : 0;
            opData.successRate = opData.count > 0 ? (opData.successCount / opData.count * 100).toFixed(2) : 0;
        });

        return {
            period: `${days} days`,
            totalOperations: recentPerformance.length,
            operations: operations,
            overallSuccessRate: recentPerformance.length > 0 ? 
                (recentPerformance.filter(p => p.success).length / recentPerformance.length * 100).toFixed(2) : 0
        };
    }

    // Get trending analytics
    async getTrendingAnalytics() {
        const trends = Array.from(this.analytics.trends.entries())
            .map(([query, data]) => ({
                query: query,
                count: data.count,
                lastSearched: data.lastSearched,
                averageLatency: data.totalLatency / data.count
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 20);

        return {
            trendingQueries: trends,
            totalTrendingQueries: trends.length
        };
    }

    // Get user analytics
    async getUserAnalytics(userId) {
        const userSearches = this.analytics.searches.filter(s => s.userId === userId);
        const userClicks = this.analytics.clicks.filter(c => c.userId === userId);

        return {
            userId: userId,
            totalSearches: userSearches.length,
            totalClicks: userClicks.length,
            averageLatency: userSearches.length > 0 ? 
                userSearches.reduce((sum, s) => sum + s.latency, 0) / userSearches.length : 0,
            favoriteCategories: this.getUserFavoriteCategories(userSearches),
            searchHistory: userSearches.slice(-10).reverse(),
            clickHistory: userClicks.slice(-10).reverse()
        };
    }

    // Get system health analytics
    async getSystemHealthAnalytics() {
        const last24Hours = new Date();
        last24Hours.setHours(last24Hours.getHours() - 24);

        const recentErrors = this.analytics.errors.filter(
            error => new Date(error.timestamp) >= last24Hours
        );

        const recentPerformance = this.analytics.performance.filter(
            perf => new Date(perf.timestamp) >= last24Hours
        );

        return {
            period: 'Last 24 hours',
            totalErrors: recentErrors.length,
            errorRate: recentPerformance.length > 0 ? 
                (recentErrors.length / recentPerformance.length * 100).toFixed(2) : 0,
            averageResponseTime: recentPerformance.length > 0 ? 
                recentPerformance.reduce((sum, p) => sum + p.duration, 0) / recentPerformance.length : 0,
            recentErrors: recentErrors.slice(-5),
            systemStatus: this.calculateSystemStatus(recentErrors, recentPerformance)
        };
    }

    // Helper methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    extractCategories(results) {
        if (!results || !Array.isArray(results)) return [];
        
        const categories = new Set();
        results.forEach(result => {
            if (result.category) {
                categories.add(result.category);
            }
        });
        
        return Array.from(categories);
    }

    hasEducationalContent(results) {
        if (!results || !Array.isArray(results)) return false;
        return results.some(result => result.isEducational);
    }

    updateTrends(query, searchData) {
        if (!this.analytics.trends.has(query)) {
            this.analytics.trends.set(query, {
                count: 0,
                totalLatency: 0,
                lastSearched: null
            });
        }

        const trend = this.analytics.trends.get(query);
        trend.count++;
        trend.totalLatency += searchData.latency;
        trend.lastSearched = searchData.timestamp;
    }

    updateUserSession(userId, searchData) {
        if (!this.analytics.userSessions.has(userId)) {
            this.analytics.userSessions.set(userId, {
                firstSeen: searchData.timestamp,
                lastSeen: searchData.timestamp,
                searchCount: 0
            });
        }

        const session = this.analytics.userSessions.get(userId);
        session.lastSeen = searchData.timestamp;
        session.searchCount++;
    }

    calculateEducationalRate(searches) {
        if (searches.length === 0) return 0;
        const educationalSearches = searches.filter(s => s.educationalContent).length;
        return (educationalSearches / searches.length * 100).toFixed(2);
    }

    getUserFavoriteCategories(userSearches) {
        const categoryCounts = {};
        userSearches.forEach(search => {
            search.categories.forEach(category => {
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });
        });

        return Object.entries(categoryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => ({ category, count }));
    }

    calculateSystemStatus(errors, performance) {
        const errorRate = performance.length > 0 ? errors.length / performance.length : 0;
        const avgResponseTime = performance.length > 0 ? 
            performance.reduce((sum, p) => sum + p.duration, 0) / performance.length : 0;

        if (errorRate > 0.1) return 'critical';
        if (errorRate > 0.05) return 'warning';
        if (avgResponseTime > 5000) return 'degraded';
        return 'healthy';
    }

    // Data persistence
    async startDataPersistence() {
        setInterval(async () => {
            await this.persistData();
        }, 5 * 60 * 1000); // Every 5 minutes
    }

    async persistData() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const dataFile = path.join(this.dataPath, `analytics-${timestamp}.json`);
            
            await fs.writeFile(dataFile, JSON.stringify(this.analytics, null, 2));
            
            // Clean up old files (keep last 7 days)
            await this.cleanupOldFiles();
        } catch (error) {
            console.error('Failed to persist analytics data:', error.message);
        }
    }

    async cleanupOldFiles() {
        try {
            const files = await fs.readdir(this.dataPath);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 7);

            for (const file of files) {
                if (file.startsWith('analytics-') && file.endsWith('.json')) {
                    const filePath = path.join(this.dataPath, file);
                    const stats = await fs.stat(filePath);
                    
                    if (stats.mtime < cutoffDate) {
                        await fs.unlink(filePath);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to cleanup old analytics files:', error.message);
        }
    }

    // Export analytics data
    async exportAnalytics(format = 'json') {
        const data = {
            searches: this.analytics.searches,
            clicks: this.analytics.clicks,
            performance: this.analytics.performance,
            errors: this.analytics.errors,
            trends: Array.from(this.analytics.trends.entries()),
            userSessions: Array.from(this.analytics.userSessions.entries()),
            exportDate: new Date().toISOString()
        };

        if (format === 'csv') {
            return this.convertToCSV(data);
        }

        return data;
    }

    convertToCSV(data) {
        // Simple CSV conversion for searches
        const headers = ['id', 'query', 'resultsCount', 'latency', 'timestamp', 'hasResults'];
        const csvRows = [headers.join(',')];
        
        data.searches.forEach(search => {
            const row = headers.map(header => {
                const value = search[header];
                return typeof value === 'string' ? `"${value}"` : value;
            });
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Get daily search counts for the last N days
    async getDailySearchCounts(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const counts = {};
        for (let i = 0; i < days; i++) {
            const d = new Date(cutoffDate);
            d.setDate(d.getDate() + i);
            const key = d.toISOString().slice(0, 10);
            counts[key] = 0;
        }
        this.analytics.searches.forEach(search => {
            const date = search.timestamp.slice(0, 10);
            if (counts.hasOwnProperty(date)) {
                counts[date]++;
            }
        });
        return Object.entries(counts).map(([date, count]) => ({ date, count }));
    }
}

module.exports = AnalyticsService; 