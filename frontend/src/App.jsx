import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import SearchResults from './components/SearchResults';
import TabNavigation from './components/TabNavigation';
import CrawlerStatus from './components/CrawlerStatus';
import LoginSuggestion from './components/LoginSuggestion';
import SearchSpikeGraph from './components/SearchSpikeGraph';
import Trending from './components/Trending';

function App() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeNav, setActiveNav] = useState('search');
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [educationalContent, setEducationalContent] = useState(null);
    const [showLoginSuggestion, setShowLoginSuggestion] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Use Vite proxy configuration
    const API_BASE_URL = '/api';

    const handleSearch = async (query) => {
        if (!query || !query.trim()) return;

        setSearchQuery(query);
        setLoading(true);
        setError('');
        setCurrentPage(1);

        try {
            const response = await fetch(
                `${API_BASE_URL}/search?q=${encodeURIComponent(query.trim())}&page=1&type=${activeTab}`,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Search failed');
            }

            const data = await response.json();
            setSearchResults(data);
            setEducationalContent(data.educationalContent);
            
            // Record click for analytics
            if (data.results && data.results.length > 0) {
                recordSearchClick(query, data.results[0]?.url);
            }
        } catch (err) {
            setError(err.message);
            setSearchResults(null);
        } finally {
            setLoading(false);
        }
    };

    const recordSearchClick = async (query, url) => {
        try {
            await fetch(`${API_BASE_URL}/search/click`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query, url })
            });
        } catch (error) {
            console.warn('Failed to record click:', error);
        }
    };

    const handleTabChange = (tab, suggestion = null) => {
        setActiveTab(tab);
        if (suggestion) {
            handleSearch(suggestion);
        } else if (searchQuery.trim()) {
            handleSearch(searchQuery);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        if (searchQuery.trim()) {
            handleSearch(searchQuery);
        }
    };

    const handleLogin = () => {
        // Redirect to account.ketivee.com for login
        window.open('https://account.ketivee.com/login', '_blank');
        setShowLoginSuggestion(false);
    };

    const handleSignup = () => {
        // Redirect to account.ketivee.com for signup
        window.open('https://account.ketivee.com/signup', '_blank');
        setShowLoginSuggestion(false);
    };

    const handleCloseLoginSuggestion = () => {
        setShowLoginSuggestion(false);
    };

    const renderContent = () => {
        switch (activeNav) {
            case 'crawler':
                return <CrawlerStatus />;
            case 'analytics':
                return (
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Search Analytics</h2>
                            <p className="text-gray-600">Analytics dashboard coming soon...</p>
                        </div>
                    </div>
                );
            case 'api':
                return (
                    <div className="w-full max-w-6xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">API Documentation</h2>
                            <p className="text-gray-600">API documentation coming soon...</p>
                        </div>
                    </div>
                );
            case 'search':
            default:
                return (
                    <div className="w-full">
                        {/* Search Section */}
                        <SearchSection 
                            onSearch={handleSearch}
                            loading={loading}
                            error={error}
                        />

                        {/* Tab Navigation */}
                        {searchResults && (
                            <div className="w-full max-w-6xl mx-auto mb-8">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                                    <TabNavigation 
                                        activeTab={activeTab}
                                        onTabChange={handleTabChange}
                                        resultCounts={{
                                            all: searchResults.total || 0,
                                            maps: searchResults.results?.filter(r => r.category === 'maps').length || 0,
                                            videos: searchResults.results?.filter(r => r.category === 'videos').length || 0,
                                            docs: searchResults.results?.filter(r => r.category === 'docs').length || 0,
                                            educational: searchResults.results?.filter(r => r.isEducational).length || 0,
                                            news: searchResults.results?.filter(r => r.category === 'news').length || 0,
                                            shopping: searchResults.results?.filter(r => r.category === 'shopping').length || 0,
                                            flights: searchResults.results?.filter(r => r.category === 'flights').length || 0,
                                            travel: searchResults.results?.filter(r => r.category === 'travel').length || 0
                                        }}
                                        educationalContent={educationalContent}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Search Results */}
                        {searchResults && (
                            <div className="w-full max-w-6xl mx-auto">
                                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                                    <SearchResults 
                                        results={searchResults.results || []}
                                        loading={loading}
                                        currentPage={currentPage}
                                        onPageChange={handlePageChange}
                                        activeTab={activeTab}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header 
                activeNav={activeNav}
                setActiveNav={setActiveNav}
                onLogin={handleLogin}
                onSignup={handleSignup}
            />

            {/* Main Content */}
            <main className="flex-1 p-4 lg:p-8">
                {renderContent()}
            </main>

            {/* Login Suggestion Popup */}
            {showLoginSuggestion && !isLoggedIn && (
                <LoginSuggestion 
                    onClose={handleCloseLoginSuggestion}
                    onLogin={handleLogin}
                    onSignup={handleSignup}
                />
            )}

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 mt-16">
                <div className="max-w-7xl mx-auto p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Company Info */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">K</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">Ketivee Search</span>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Advanced search engine with AI-powered discovery and real-time web crawling capabilities.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                            <div className="space-y-2 text-sm">
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Search Engine</a>
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Web Crawler</a>
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">API</a>
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Analytics</a>
                            </div>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                            <div className="space-y-2 text-sm">
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">About</a>
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Blog</a>
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Careers</a>
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Contact</a>
                            </div>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                            <div className="space-y-2 text-sm">
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Help Center</a>
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Documentation</a>
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Status</a>
                                <a href="#" className="block text-gray-600 hover:text-gray-900 transition-colors">Privacy</a>
                            </div>
                        </div>
                    </div>
                    
                    <div className="border-t border-gray-200 mt-8 pt-8 text-center">
                        <p className="text-sm text-gray-500">
                            © 2024 Ketivee Search. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default App;