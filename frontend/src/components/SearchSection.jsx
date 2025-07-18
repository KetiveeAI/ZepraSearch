import React, { useState } from 'react';

const SearchSection = ({ onSearch, loading, error }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isVisualSearch, setIsVisualSearch] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };

    const handleVoiceSearch = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            
            recognition.lang = 'en-US';
            recognition.continuous = false;
            recognition.interimResults = false;
            
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setSearchQuery(transcript);
                onSearch(transcript);
            };
            
            recognition.start();
        } else {
            alert('Speech recognition is not supported in this browser.');
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4">
                    Ketivee Search
                </h1>
                <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
                    Advanced search engine with AI-powered discovery and real-time web crawling
                </p>
            </div>

            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 lg:p-8 mb-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <div className="flex items-center bg-gray-50 rounded-xl overflow-hidden border border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all duration-200">
                            <div className="pl-6 pr-4">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder={isVisualSearch ? "Upload an image or paste image URL..." : "Search the web with AI assistance..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-4 py-4 text-lg bg-transparent border-none outline-none placeholder-gray-500"
                                disabled={loading}
                            />
                            <div className="flex items-center gap-2 pr-4">
                                <button
                                    type="button"
                                    onClick={handleVoiceSearch}
                                    className="p-2 text-gray-500 hover:text-blue-500 transition-colors rounded-full hover:bg-gray-100"
                                    title="Voice Search"
                                    disabled={loading}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsVisualSearch(!isVisualSearch)}
                                    className={`p-2 transition-colors rounded-full ${
                                        isVisualSearch 
                                            ? 'text-blue-500 bg-blue-50' 
                                            : 'text-gray-500 hover:text-blue-500 hover:bg-gray-100'
                                    }`}
                                    title="Visual Search"
                                    disabled={loading}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !searchQuery.trim()}
                                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Searching...
                                        </div>
                                    ) : (
                                        'Search'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </div>
                        </div>
                    )}
                </form>
            </div>

            {/* Quick Search Suggestions */}
            <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Try searching for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {['JavaScript tutorials', 'React development', 'Python programming', 'Machine learning', 'Web design'].map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => {
                                setSearchQuery(suggestion);
                                onSearch(suggestion);
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
                            disabled={loading}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SearchSection; 