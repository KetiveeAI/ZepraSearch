const { ObjectId } = require('mongodb');

class CrawledPage {
    constructor(db) {
        this.collection = db.collection('crawled_pages');
        this.createIndexes();
    }

    async createIndexes() {
        try {
            // Text search index
            await this.collection.createIndex(
                { 
                    title: "text", 
                    content: "text", 
                    description: "text"
                },
                { 
                    weights: { 
                        title: 10, 
                        content: 5, 
                        description: 3
                    },
                    name: "crawled_text_index",
                    default_language: "english"
                }
            );

            // URL uniqueness index
            await this.collection.createIndex(
                { url: 1 },
                { unique: true, name: "crawled_url_unique_index" }
            );

            // Domain index
            await this.collection.createIndex(
                { domain: 1 },
                { name: "domain_index" }
            );

            // Crawl depth index
            await this.collection.createIndex(
                { crawlDepth: 1 },
                { name: "crawl_depth_index" }
            );

            // Status index
            await this.collection.createIndex(
                { status: 1 },
                { name: "status_index" }
            );

            // Timestamp index
            await this.collection.createIndex(
                { crawledAt: 1 },
                { name: "crawled_at_index" }
            );

            // Content type index
            await this.collection.createIndex(
                { contentType: 1 },
                { name: "content_type_index" }
            );

            // Language index
            await this.collection.createIndex(
                { language: 1 },
                { name: "language_index" }
            );

            console.log('✅ CrawledPage indexes created');
        } catch (error) {
            console.error('❌ Failed to create CrawledPage indexes:', error);
        }
    }

    async saveCrawledPage(data) {
        try {
            const crawledPage = {
                _id: new ObjectId(),
                url: data.url,
                title: data.title || '',
                description: data.description || '',
                content: data.content || '',
                contentType: data.contentType || 'text/html',
                language: data.language || 'en',
                domain: this.extractDomain(data.url),
                crawlDepth: data.crawlDepth || 0,
                status: data.status || 'crawled',
                statusCode: data.statusCode || 200,
                responseTime: data.responseTime || 0,
                contentLength: data.contentLength || 0,
                links: data.links || [],
                images: data.images || [],
                metadata: {
                    ...data.metadata,
                    og: data.metadata?.og || {},
                    schema: data.metadata?.schema || {},
                    canonical: data.metadata?.canonical || '',
                    alternate: data.metadata?.alternate || '',
                    readingTimeMin: data.metadata?.readingTimeMin || 0,
                    wordCount: data.metadata?.wordCount || 0,
                    headers: data.metadata?.headers || {},
                },
                headers: data.headers || {},
                userAgent: data.userAgent || '',
                crawledAt: new Date(),
                updatedAt: new Date(),
                crawlCount: 1,
                lastCrawled: new Date(),
                realData: true,
                independent: true
            };

            // Use upsert to avoid duplicates
            const result = await this.collection.updateOne(
                { url: data.url },
                { 
                    $set: crawledPage,
                    $inc: { crawlCount: 1 },
                    $setOnInsert: { createdAt: new Date() }
                },
                { upsert: true }
            );

            return result;
        } catch (error) {
            console.error('Error saving crawled page:', error);
            throw error;
        }
    }

    async saveMultipleCrawledPages(pages) {
        try {
            const operations = pages.map(data => ({
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
            console.error('Error saving multiple crawled pages:', error);
            throw error;
        }
    }

    async searchInCrawledContent(query, options = {}) {
        try {
            const {
                page = 1,
                limit = 10,
                domain = null,
                contentType = null,
                language = null
            } = options;

            const skip = (page - 1) * limit;
            const filter = {};

            // Text search
            if (query && query.trim()) {
                filter.$text = { $search: query };
            }

            // Domain filter
            if (domain) {
                filter.domain = domain;
            }

            // Content type filter
            if (contentType) {
                filter.contentType = contentType;
            }

            // Language filter
            if (language) {
                filter.language = language;
            }

            const results = await this.collection
                .find(filter)
                .sort({ score: { $meta: "textScore" }, crawledAt: -1 })
                .skip(skip)
                .limit(limit)
                .toArray();

            const total = await this.collection.countDocuments(filter);

            return {
                results: results.map(page => ({
                    url: page.url,
                    title: page.title,
                    description: page.description,
                    content: page.content.substring(0, 500) + '...',
                    domain: page.domain,
                    contentType: page.contentType,
                    language: page.language,
                    crawledAt: page.crawledAt,
                    score: page.score || 0
                })),
                total,
                page,
                pages: Math.ceil(total / limit),
                hasMore: page * limit < total
            };
        } catch (error) {
            console.error('Error searching crawled content:', error);
            throw error;
        }
    }

    async getByUrl(url) {
        try {
            return await this.collection.findOne({ url });
        } catch (error) {
            console.error('Error getting crawled page by URL:', error);
            throw error;
        }
    }

    async getByDomain(domain, limit = 50) {
        try {
            return await this.collection
                .find({ domain })
                .sort({ crawledAt: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error getting crawled pages by domain:', error);
            throw error;
        }
    }

    async updateCrawlStatus(url, status, error = null) {
        try {
            const update = {
                status: status,
                updatedAt: new Date(),
                lastCrawled: new Date()
            };

            if (error) {
                update.lastError = error;
                update.errorCount = { $inc: 1 };
            }

            await this.collection.updateOne(
                { url },
                { $set: update }
            );
        } catch (error) {
            console.error('Error updating crawl status:', error);
        }
    }

    async getCrawlerStats() {
        try {
            const stats = await this.collection.aggregate([
                {
                    $group: {
                        _id: null,
                        totalPages: { $sum: 1 },
                        totalDomains: { $addToSet: '$domain' },
                        avgContentLength: { $avg: '$contentLength' },
                        avgResponseTime: { $avg: '$responseTime' }
                    }
                }
            ]).toArray();

            const domainStats = await this.collection.aggregate([
                {
                    $group: {
                        _id: '$domain',
                        count: { $sum: 1 },
                        avgContentLength: { $avg: '$contentLength' }
                    }
                },
                { $sort: { count: -1 } }
            ]).toArray();

            const statusStats = await this.collection.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]).toArray();

            const contentTypeStats = await this.collection.aggregate([
                {
                    $group: {
                        _id: '$contentType',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } }
            ]).toArray();

            return {
                totalPages: stats[0]?.totalPages || 0,
                totalDomains: stats[0]?.totalDomains?.length || 0,
                avgContentLength: stats[0]?.avgContentLength || 0,
                avgResponseTime: stats[0]?.avgResponseTime || 0,
                domains: domainStats,
                statuses: statusStats,
                contentTypes: contentTypeStats,
                realData: true,
                independent: true
            };
        } catch (error) {
            console.error('Error getting crawler stats:', error);
            throw error;
        }
    }

    async getRecentCrawls(limit = 20) {
        try {
            return await this.collection
                .find({})
                .sort({ crawledAt: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error getting recent crawls:', error);
            throw error;
        }
    }

    async getFailedCrawls(limit = 20) {
        try {
            return await this.collection
                .find({ status: { $ne: 'crawled' } })
                .sort({ updatedAt: -1 })
                .limit(limit)
                .toArray();
        } catch (error) {
            console.error('Error getting failed crawls:', error);
            throw error;
        }
    }

    async deleteOldCrawls(daysOld = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await this.collection.deleteMany({
                crawledAt: { $lt: cutoffDate }
            });

            return result;
        } catch (error) {
            console.error('Error deleting old crawls:', error);
            throw error;
        }
    }

    async cleanupContent(daysOld = 7) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);

            const result = await this.collection.updateMany(
                { crawledAt: { $lt: cutoffDate } },
                { $unset: { content: "" } }
            );

            return result;
        } catch (error) {
            console.error('Error cleaning up content:', error);
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

module.exports = CrawledPage; 