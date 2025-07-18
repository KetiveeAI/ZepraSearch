const SearchResult = require('./SearchResult');
const SearchQuery = require('./SearchQuery');
const CrawledPage = require('./CrawledPage');
const UserActivity = require('./UserActivity');
const UserSearchHistory = require('./UserSearchHistory');

class ModelManager {
    constructor(db) {
        this.db = db;
        this.models = {};
        this.initializeModels();
    }

    initializeModels() {
        try {
            this.models.searchResult = new SearchResult(this.db);
            this.models.searchQuery = new SearchQuery(this.db);
            this.models.crawledPage = new CrawledPage(this.db);
            this.models.userActivity = new UserActivity(this.db);
            this.models.userSearchHistory = new UserSearchHistory(this.db);
            
            // Start cleanup scheduler
            this.models.userSearchHistory.scheduleCleanup();
            
            console.log('✅ All models initialized');
        } catch (error) {
            console.error('❌ Failed to initialize models:', error);
        }
    }

    // Search Result operations
    async saveSearchResult(data) {
        try {
            return await this.models.searchResult.saveSearchResult(data);
        } catch (error) {
            console.error('Error saving search result:', error);
            throw error;
        }
    }

    async saveMultipleSearchResults(results) {
        try {
            return await this.models.searchResult.saveMultipleSearchResults(results);
        } catch (error) {
            console.error('Error saving multiple search results:', error);
            throw error;
        }
    }

    async searchInDatabase(query, options = {}) {
        try {
            return await this.models.searchResult.search(query, options);
        } catch (error) {
            console.error('Error searching in database:', error);
            throw error;
        }
    }

    async updateSearchCount(url) {
        try {
            await this.models.searchResult.updateSearchCount(url);
        } catch (error) {
            console.error('Error updating search count:', error);
        }
    }

    async updateClickCount(url) {
        try {
            await this.models.searchResult.updateClickCount(url);
        } catch (error) {
            console.error('Error updating click count:', error);
        }
    }

    // Search Query operations
    async recordSearchQuery(query, options = {}) {
        try {
            return await this.models.searchQuery.recordSearch(query, options);
        } catch (error) {
            console.error('Error recording search query:', error);
            throw error;
        }
    }

    async getTrendingQueries(limit = 10, period = 'all') {
        try {
            return await this.models.searchQuery.getTrendingQueries(limit, period);
        } catch (error) {
            console.error('Error getting trending queries:', error);
            throw error;
        }
    }

    async getQuerySuggestions(partialQuery, limit = 5) {
        try {
            return await this.models.searchQuery.getQuerySuggestions(partialQuery, limit);
        } catch (error) {
            console.error('Error getting query suggestions:', error);
            throw error;
        }
    }

    // Crawled Page operations
    async saveCrawledPage(data) {
        try {
            return await this.models.crawledPage.saveCrawledPage(data);
        } catch (error) {
            console.error('Error saving crawled page:', error);
            throw error;
        }
    }

    async saveMultipleCrawledPages(pages) {
        try {
            return await this.models.crawledPage.saveMultipleCrawledPages(pages);
        } catch (error) {
            console.error('Error saving multiple crawled pages:', error);
            throw error;
        }
    }

    async searchInCrawledContent(query, options = {}) {
        try {
            return await this.models.crawledPage.searchInCrawledContent(query, options);
        } catch (error) {
            console.error('Error searching crawled content:', error);
            throw error;
        }
    }

    async updateCrawlStatus(url, status, error = null) {
        try {
            await this.models.crawledPage.updateCrawlStatus(url, status, error);
        } catch (error) {
            console.error('Error updating crawl status:', error);
        }
    }

    // User Activity operations
    async recordUserActivity(data) {
        try {
            return await this.models.userActivity.recordActivity(data);
        } catch (error) {
            console.error('Error recording user activity:', error);
            throw error;
        }
    }

    async recordSearchActivity(userId, sessionId, query, options = {}) {
        try {
            return await this.models.userActivity.recordSearch(userId, sessionId, query, options);
        } catch (error) {
            console.error('Error recording search activity:', error);
            throw error;
        }
    }

    async recordClickActivity(userId, sessionId, query, url, options = {}) {
        try {
            return await this.models.userActivity.recordClick(userId, sessionId, query, url, options);
        } catch (error) {
            console.error('Error recording click activity:', error);
            throw error;
        }
    }

    async getUserActivity(userId, options = {}) {
        try {
            return await this.models.userActivity.getUserActivity(userId, options);
        } catch (error) {
            console.error('Error getting user activity:', error);
            throw error;
        }
    }

    // Statistics operations
    async getSearchResultStats() {
        try {
            return await this.models.searchResult.getStats();
        } catch (error) {
            console.error('Error getting search result stats:', error);
            throw error;
        }
    }

    async getSearchQueryStats() {
        try {
            return await this.models.searchQuery.getStats();
        } catch (error) {
            console.error('Error getting search query stats:', error);
            throw error;
        }
    }

    async getCrawlerStats() {
        try {
            return await this.models.crawledPage.getCrawlerStats();
        } catch (error) {
            console.error('Error getting crawler stats:', error);
            throw error;
        }
    }

    async getUserActivityStats(userId, days = 30) {
        try {
            return await this.models.userActivity.getUserStats(userId, days);
        } catch (error) {
            console.error('Error getting user activity stats:', error);
            throw error;
        }
    }

    async getGlobalActivityStats(days = 30) {
        try {
            return await this.models.userActivity.getGlobalStats(days);
        } catch (error) {
            console.error('Error getting global activity stats:', error);
            throw error;
        }
    }

    // Combined operations
    async processSearchResults(results, query, userId = null, sessionId = null) {
        try {
            // Save search results to database
            if (results && results.length > 0) {
                await this.saveMultipleSearchResults(results);
                
                // Update search counts for each result
                for (const result of results) {
                    await this.updateSearchCount(result.url);
                }
            }

            // Record search query
            await this.recordSearchQuery(query, {
                userId,
                sessionId,
                resultsCount: results.length,
                success: results.length > 0
            });

            // Record user activity if user is provided
            if (userId) {
                await this.recordSearchActivity(userId, sessionId, query, {
                    resultsCount: results.length,
                    success: results.length > 0
                });
            }

            return true;
        } catch (error) {
            console.error('Error processing search results:', error);
            throw error;
        }
    }

    async processClick(query, url, userId = null, sessionId = null, position = null) {
        try {
            // Update click count
            await this.updateClickCount(url);

            // Record user activity if user is provided
            if (userId) {
                await this.recordClickActivity(userId, sessionId, query, url, {
                    position
                });
            }

            return true;
        } catch (error) {
            console.error('Error processing click:', error);
            throw error;
        }
    }

    async getComprehensiveStats() {
        try {
            const [
                searchResultStats,
                searchQueryStats,
                crawlerStats,
                globalActivityStats
            ] = await Promise.all([
                this.getSearchResultStats(),
                this.getSearchQueryStats(),
                this.getCrawlerStats(),
                this.getGlobalActivityStats(30)
            ]);

            return {
                searchResults: searchResultStats,
                searchQueries: searchQueryStats,
                crawler: crawlerStats,
                userActivity: globalActivityStats,
                realData: true,
                independent: true,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting comprehensive stats:', error);
            throw error;
        }
    }

    // Cleanup operations
    async cleanupOldData() {
        try {
            const results = await Promise.all([
                this.models.searchResult.deleteOldResults(30),
                this.models.searchQuery.deleteOldQueries(90),
                this.models.crawledPage.deleteOldCrawls(30),
                this.models.userActivity.deleteOldActivity(90)
            ]);

            return {
                searchResults: results[0],
                searchQueries: results[1],
                crawledPages: results[2],
                userActivity: results[3]
            };
        } catch (error) {
            console.error('Error cleaning up old data:', error);
            throw error;
        }
    }

    // Get model instances
    getSearchResultModel() {
        return this.models.searchResult;
    }

    getSearchQueryModel() {
        return this.models.searchQuery;
    }

    getCrawledPageModel() {
        return this.models.crawledPage;
    }

    getUserActivityModel() {
        return this.models.userActivity;
    }

    getUserSearchHistoryModel() {
        return this.models.userSearchHistory;
    }

    // User Search History operations
    async saveUserSearchQuery(userId, query, options = {}) {
        try {
            return await this.models.userSearchHistory.saveSearchQuery(userId, query, options);
        } catch (error) {
            console.error('Error saving user search query:', error);
            throw error;
        }
    }

    async getUserSearchHistory(userId, options = {}) {
        try {
            return await this.models.userSearchHistory.getUserSearchHistory(userId, options);
        } catch (error) {
            console.error('Error getting user search history:', error);
            throw error;
        }
    }

    async deleteUserSearch(userId, searchId) {
        try {
            return await this.models.userSearchHistory.deleteUserSearch(userId, searchId);
        } catch (error) {
            console.error('Error deleting user search:', error);
            throw error;
        }
    }

    async deleteUserSearchHistory(userId, options = {}) {
        try {
            return await this.models.userSearchHistory.deleteUserSearchHistory(userId, options);
        } catch (error) {
            console.error('Error deleting user search history:', error);
            throw error;
        }
    }

    async exportUserSearchData(userId, format = 'json') {
        try {
            return await this.models.userSearchHistory.exportUserData(userId, format);
        } catch (error) {
            console.error('Error exporting user search data:', error);
            throw error;
        }
    }

    async getUserSearchStats(userId, days = 30) {
        try {
            return await this.models.userSearchHistory.getUserStats(userId, days);
        } catch (error) {
            console.error('Error getting user search stats:', error);
            throw error;
        }
    }

    async cleanupExpiredSearchData() {
        try {
            return await this.models.userSearchHistory.cleanupExpiredData();
        } catch (error) {
            console.error('Error cleaning up expired search data:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        try {
            const checks = await Promise.all([
                this.models.searchResult.collection.countDocuments(),
                this.models.searchQuery.collection.countDocuments(),
                this.models.crawledPage.collection.countDocuments(),
                this.models.userActivity.collection.countDocuments()
            ]);

            return {
                status: 'healthy',
                collections: {
                    searchResults: checks[0],
                    searchQueries: checks[1],
                    crawledPages: checks[2],
                    userActivity: checks[3]
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = ModelManager; 