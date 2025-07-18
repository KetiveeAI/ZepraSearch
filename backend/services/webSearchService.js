const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

class WebSearchService {
    constructor() {
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];
        
        this.searchEngines = [];

    }

    /**
     * Special search: PDF and deep name queries
     */
    /**
     * Batch and special search: PDF and deep name queries for multiple queries
     */
    async searchSpecial(query, limit = 10) {
        // Support: array of queries, or string with , ; or \n as separator
        let queries = [];
        if (Array.isArray(query)) {
            queries = query;
        } else if (typeof query === 'string' && /[;,\n]/.test(query)) {
            queries = query.split(/[;,\n]/).map(q => q.trim()).filter(Boolean);
        } else {
            queries = [query];
        }
        let allResults = [];
        for (const q of queries) {
            const results = await this._searchSpecialSingle(q, limit);
            if (Array.isArray(results)) allResults = allResults.concat(results);
        }
        return allResults.length > 0 ? allResults : null;
    }

    /**
     * Single special search for one query (PDF/deep name)
     */
    async _searchSpecialSingle(query, limit = 10) {

        const results = [];
        const pdfPattern = /\.pdf|\bpdf\b/i;
        const namePattern = /\$\w+|about\s+\w+|index\.\$\s*\w+/i;
        // PDF Search
        if (pdfPattern.test(query)) {
            // Use Bing as Google blocks automated scraping heavily
            const axios = require('axios');
            const cheerio = require('cheerio');
            const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}+filetype:pdf`;
            try {
                const response = await axios.get(searchUrl, { headers: { 'User-Agent': this.getRandomUserAgent() }, timeout: 10000 });
                const $ = cheerio.load(response.data);
                $('li.b_algo').each((i, el) => {
                    if (results.length >= limit) return false;
                    const link = $(el).find('a').attr('href');
                    const title = $(el).find('a').text().trim();
                    if (link && link.endsWith('.pdf')) {
                        results.push({
                            title,
                            url: link,
                            snippet: 'Direct PDF',
                            score: 1.0 - (i * 0.05),
                            source: 'PDF',
                            type: 'pdf',
                        });
                    }
                });
            } catch (err) {
                console.warn('PDF search failed:', err.message);
            }
            return results;
        }
        // Deep Name Search
        if (namePattern.test(query)) {
            // Remove special chars for name extraction
            const name = query.replace(/[^a-zA-Z0-9 ]/g, '').replace(/about|index|man/gi, '').trim();
            const deepQuery = `${name} profile biography details`; // Expand query for depth
            // Use Bing for deep search
            const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(deepQuery)}`;
            try {
                const response = await axios.get(searchUrl, { headers: { 'User-Agent': this.getRandomUserAgent() }, timeout: 10000 });
                const $ = cheerio.load(response.data);
                $('li.b_algo').each((i, el) => {
                    if (results.length >= limit) return false;
                    const link = $(el).find('a').attr('href');
                    const title = $(el).find('a').text().trim();
                    const snippet = $(el).find('p').text().trim();
                    let fast = false;
                    // Rank fast sites higher (e.g., wiki, linkedin, official, etc.)
                    if (/wiki|linkedin|official|imdb|twitter|facebook|about|bio|profile/i.test(link)) fast = true;
                    results.push({
                        title,
                        url: link,
                        snippet,
                        score: fast ? 1.0 : 0.8 - (i * 0.05),
                        source: 'DeepWeb',
                        type: 'profile',
                    });
                });
                // Sort fast results on top
                results.sort((a, b) => b.score - a.score);
            } catch (err) {
                console.warn('Deep name search failed:', err.message);
            }
            return results;
        }
        return null; // Not a special search
    }

    async search(query, limit = 10) {
        // Check for special search
        const specialResults = await this.searchSpecial(query, limit);
        if (Array.isArray(specialResults)) return specialResults;
        const results = [];
        
        try {
            // Try search engines
            for (const engine of this.searchEngines) {
                if (results.length >= limit) break;
                
                try {
                    const engineResults = await this.searchEngine(engine, query, limit - results.length);
                    results.push(...engineResults);
                } catch (error) {
                    console.warn(`Search engine ${engine.name} failed:`, error.message);
                }
            }
            
            // If no results from search engines, try direct website searches
            if (results.length === 0) {
                const directResults = await this.searchDirectWebsites(query, limit);
                results.push(...directResults);
            }
            
        } catch (error) {
            console.error('Web search error:', error);
        }
        
        return results;
    }

    async searchEngine(engine, query, limit) {
        const results = [];
        
        try {
            const params = { ...engine.params, q: query };
            const searchUrl = new URL(engine.url);
            Object.keys(params).forEach(key => searchUrl.searchParams.set(key, params[key]));
            
            const response = await axios.get(searchUrl.toString(), {
                headers: {
                    'User-Agent': this.getRandomUserAgent(),
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            
            $(engine.selectors.results).each((i, element) => {
                if (results.length >= limit) return false;
                
                const titleElement = $(element).find(engine.selectors.title);
                const linkElement = $(element).find(engine.selectors.link);
                const snippetElement = $(element).find(engine.selectors.snippet);
                
                if (titleElement.length && linkElement.length) {
                    const title = titleElement.text().trim();
                    const url = linkElement.attr('href');
                    const snippet = snippetElement.text().trim() || '';
                    
                    if (url && this.isValidUrl(url)) {
                        results.push({
                            url: this.cleanUrl(url),
                            title: title,
                            snippet: snippet,
                            score: 0.8 - (i * 0.1),
                            source: engine.name,
                            category: this.categorizeUrl(url)
                        });
                    }
                }
            });
            
        } catch (error) {
            console.warn(`Search engine ${engine.name} failed:`, error.message);
        }
        
        return results;
    }

    async searchDirectWebsites(query, limit) {
        const results = [];
        
        // List of educational and tech websites to search directly
        const websites = [
            {
                name: 'MDN',
                url: 'https://developer.mozilla.org/en-US/search',
                params: { q: query },
                selectors: {
                    results: '.result-list-item',
                    title: '.result-title',
                    link: '.result-title a',
                    snippet: '.result-snippet'
                }
            },
            {
                name: 'Stack Overflow',
                url: 'https://stackoverflow.com/search',
                params: { q: query },
                selectors: {
                    results: '.question-summary',
                    title: '.question-hyperlink',
                    link: '.question-hyperlink',
                    snippet: '.excerpt'
                }
            },
            {
                name: 'GitHub',
                url: 'https://github.com/search',
                params: { q: query, type: 'repositories' },
                selectors: {
                    results: '.repo-list-item',
                    title: '.f4 a',
                    link: '.f4 a',
                    snippet: '.mb-1'
                }
            }
        ];
        
        for (const site of websites) {
            if (results.length >= limit) break;
            
            try {
                const siteResults = await this.searchWebsite(site, query, limit - results.length);
                results.push(...siteResults);
            } catch (error) {
                console.warn(`Website ${site.name} search failed:`, error.message);
            }
        }
        
        return results;
    }

    async searchWebsite(site, query, limit) {
        const results = [];
        
        try {
            const params = { ...site.params, q: query };
            const searchUrl = new URL(site.url);
            Object.keys(params).forEach(key => searchUrl.searchParams.set(key, params[key]));
            
            const response = await axios.get(searchUrl.toString(), {
                headers: {
                    'User-Agent': this.getRandomUserAgent()
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            
            $(site.selectors.results).each((i, element) => {
                if (results.length >= limit) return false;
                
                const titleElement = $(element).find(site.selectors.title);
                const linkElement = $(element).find(site.selectors.link);
                const snippetElement = $(element).find(site.selectors.snippet);
                
                if (titleElement.length && linkElement.length) {
                    const title = titleElement.text().trim();
                    const url = linkElement.attr('href');
                    const snippet = snippetElement.text().trim() || '';
                    
                    if (url && this.isValidUrl(url)) {
                        results.push({
                            url: this.cleanUrl(url),
                            title: title,
                            snippet: snippet,
                            score: 0.9 - (i * 0.1),
                            source: site.name,
                            category: this.categorizeUrl(url)
                        });
                    }
                }
            });
            
        } catch (error) {
            console.warn(`Website ${site.name} search failed:`, error.message);
        }
        
        return results;
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    cleanUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.href;
        } catch {
            return url;
        }
    }

    categorizeUrl(url) {
        const urlLower = url.toLowerCase();
        
        if (urlLower.includes('github.com')) return 'technology';
        if (urlLower.includes('stackoverflow.com')) return 'technology';
        if (urlLower.includes('developer.mozilla.org')) return 'educational';
        if (urlLower.includes('w3schools.com')) return 'educational';
        if (urlLower.includes('tutorialspoint.com')) return 'educational';
        if (urlLower.includes('geeksforgeeks.org')) return 'educational';
        if (urlLower.includes('freecodecamp.org')) return 'educational';
        if (urlLower.includes('codecademy.com')) return 'educational';
        if (urlLower.includes('udemy.com')) return 'educational';
        if (urlLower.includes('coursera.org')) return 'educational';
        if (urlLower.includes('edx.org')) return 'educational';
        if (urlLower.includes('khanacademy.org')) return 'educational';
        
        return 'general';
    }

    getRandomUserAgent() {
        return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    }

    async getPageMetadata(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.getRandomUserAgent()
                },
                timeout: 5000
            });

            const $ = cheerio.load(response.data);
            
            return {
                title: $('title').text().trim(),
                description: $('meta[name="description"]').attr('content') || '',
                keywords: $('meta[name="keywords"]').attr('content') || '',
                ogTitle: $('meta[property="og:title"]').attr('content') || '',
                ogDescription: $('meta[property="og:description"]').attr('content') || '',
                ogImage: $('meta[property="og:image"]').attr('content') || '',
                canonical: $('link[rel="canonical"]').attr('href') || url
            };
        } catch (error) {
            console.warn(`Failed to get metadata for ${url}:`, error.message);
            return {};
        }
    }
}

module.exports = WebSearchService; 