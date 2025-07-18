import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CrawlerStatus = () => {
    const [stats, setStats] = useState(null);
    const [isCrawling, setIsCrawling] = useState(false);
    const [crawledPages, setCrawledPages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [seedUrls, setSeedUrls] = useState('https://example.com\nhttps://httpbin.org/html');
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await axios.get('/api/crawler/stats');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const startCrawling = async () => {
        setIsCrawling(true);
        setLoading(true);
        try {
            const urls = seedUrls.split('\n').filter(url => url.trim());
            const response = await axios.post('/api/crawler/start', {
                seedUrls: urls,
                options: {
                    maxDepth: 2,
                    maxPages: 20,
                    delay: 1000
                }
            });
            console.log('Crawling completed:', response.data);
            await fetchStats();
            await fetchCrawledPages();
        } catch (error) {
            console.error('Crawling failed:', error);
        } finally {
            setIsCrawling(false);
            setLoading(false);
        }
    };

    const fetchCrawledPages = async () => {
        try {
            const response = await axios.get('/api/crawler/pages?limit=10');
            setCrawledPages(response.data.pages);
        } catch (error) {
            console.error('Failed to fetch pages:', error);
        }
    };

    const searchCrawledContent = async () => {
        if (!searchQuery.trim()) return;
        
        setLoading(true);
        try {
            const response = await axios.get(`/api/crawler/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
            setSearchResults(response.data.results);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearCache = async () => {
        try {
            await axios.delete('/api/crawler/clear');
            setStats(null);
            setCrawledPages([]);
            setSearchResults([]);
        } catch (error) {
            console.error('Failed to clear cache:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchCrawledPages();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">🕷️ Web Crawler Status</h2>
                
                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats.totalPages}</div>
                            <div className="text-sm text-gray-600">Total Pages</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats.visitedUrls}</div>
                            <div className="text-sm text-gray-600">Visited URLs</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{stats.queueSize}</div>
                            <div className="text-sm text-gray-600">Queue Size</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{stats.maxDepth}</div>
                            <div className="text-sm text-gray-600">Max Depth</div>
                        </div>
                    </div>
                )}

                {/* Crawler Controls */}
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Seed URLs (one per line)
                        </label>
                        <textarea
                            value={seedUrls}
                            onChange={(e) => setSeedUrls(e.target.value)}
                            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter URLs to crawl..."
                        />
                    </div>
                    
                    <div className="flex space-x-4">
                        <button
                            onClick={startCrawling}
                            disabled={isCrawling || loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isCrawling ? '🕷️ Crawling...' : '🚀 Start Crawling'}
                        </button>
                        
                        <button
                            onClick={clearCache}
                            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
                        >
                            🗑️ Clear Cache
                        </button>
                        
                        <button
                            onClick={fetchStats}
                            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                        >
                            🔄 Refresh Stats
                        </button>
                    </div>
                </div>

                {/* Search in Crawled Content */}
                <div className="space-y-4 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800">Search Crawled Content</h3>
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search in crawled content..."
                            className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={searchCrawledContent}
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            🔍 Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Search Results ({searchResults.length})
                    </h3>
                    <div className="space-y-4">
                        {searchResults.map((result, index) => (
                            <div key={index} className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-medium text-blue-600">
                                    <a href={result.url} target="_blank" rel="noopener noreferrer">
                                        {result.title}
                                    </a>
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{result.url}</p>
                                <p className="text-gray-700 mt-2">{result.snippet}</p>
                                <div className="text-xs text-gray-500 mt-2">
                                    Score: {result.score.toFixed(2)} | 
                                    Crawled: {new Date(result.crawledAt).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Crawled Pages */}
            {crawledPages.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Recently Crawled Pages ({crawledPages.length})
                    </h3>
                    <div className="space-y-3">
                        {crawledPages.map((page, index) => (
                            <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0">
                                <h4 className="font-medium text-gray-800">
                                    <a href={page.url} target="_blank" rel="noopener noreferrer">
                                        {page.title}
                                    </a>
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{page.url}</p>
                                <p className="text-gray-700 mt-2 text-sm">
                                    {page.description || page.content.substring(0, 150)}...
                                </p>
                                <div className="text-xs text-gray-500 mt-2">
                                    Depth: {page.depth} | 
                                    Links: {page.links.length} | 
                                    Crawled: {new Date(page.crawledAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Loading...</p>
                </div>
            )}
        </div>
    );
};

export default CrawlerStatus; 