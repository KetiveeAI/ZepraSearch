import React from 'react';

function SearchResults({ results, loading, currentPage, onPageChange, activeTab }) {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Searching...</span>
            </div>
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No results found</h3>
                <p className="text-gray-600">Try adjusting your search terms or browse different categories.</p>
            </div>
        );
    }

    const renderEducationalBadge = (result) => {
        if (!result.isEducational) return null;
        
        return (
            <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    📚 Educational
                </span>
                {result.educationalInfo && (
                    <>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {result.educationalInfo.type}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {result.educationalInfo.level}
                        </span>
                        {result.educationalInfo.hasExercises && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                🎯 Exercises
                            </span>
                        )}
                        {result.educationalInfo.hasExamples && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                💡 Examples
                            </span>
                        )}
                    </>
                )}
            </div>
        );
    };

    const renderCategoryBadge = (result) => {
        const categoryIcons = {
            maps: '🗺️',
            videos: '🎥',
            docs: '📄',
            educational: '📚',
            news: '📰',
            shopping: '🛒',
            flights: '✈️',
            travel: '🌍'
        };

        if (result.category && result.category !== 'general') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {categoryIcons[result.category] || '🌐'} {result.category}
                </span>
            );
        }
        return null;
    };

    const renderVideoResult = (result) => {
        if (result.category === 'videos' || result.videoId) {
            return (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="aspect-video bg-gray-100">
                        {result.thumbnail && (
                            <img 
                                src={result.thumbnail} 
                                alt={result.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">
                            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                {result.title}
                            </a>
                        </h3>
                        <p className="text-gray-600 text-sm mb-2">{result.snippet}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>🎥 Video</span>
                            {result.source === 'youtube' && <span>YouTube</span>}
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderMapResult = (result) => {
        if (result.category === 'maps' || result.isMap) {
            return (
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">🗺️</div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800">
                                    {result.title}
                                </a>
                            </h3>
                            <p className="text-gray-600 mb-2">{result.snippet}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    📍 Location
                                </span>
                                <span className="text-xs text-gray-500">Click to view on map</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderDocumentResult = (result) => {
        if (result.category === 'docs' || result.isDocument) {
            return (
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">📄</div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">
                                <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                    {result.title}
                                </a>
                            </h3>
                            <p className="text-gray-600 mb-2">{result.snippet}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                    📋 Document
                                </span>
                                <span className="text-xs text-gray-500">Click to view/download</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderStandardResult = (result) => {
        return (
            <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        {result.favicon ? (
                            <img src={result.favicon} alt="" className="w-4 h-4" />
                        ) : (
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                        )}
                    </div>
                    <div className="flex-1">
                        {renderEducationalBadge(result)}
                        <h3 className="font-semibold text-lg mb-2">
                            <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                {result.title}
                            </a>
                        </h3>
                        <p className="text-green-600 text-sm mb-2">{result.url}</p>
                        <p className="text-gray-700 mb-3">{result.snippet}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            {renderCategoryBadge(result)}
                            <span>Score: {result.score?.toFixed(2) || 'N/A'}</span>
                            {result.source && <span>• {result.source}</span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderResult = (result, index) => {
        // Try specialized renderers first
        const videoResult = renderVideoResult(result);
        if (videoResult) return <div key={index}>{videoResult}</div>;

        const mapResult = renderMapResult(result);
        if (mapResult) return <div key={index}>{mapResult}</div>;

        const documentResult = renderDocumentResult(result);
        if (documentResult) return <div key={index}>{documentResult}</div>;

        // Fall back to standard result
        return <div key={index}>{renderStandardResult(result)}</div>;
    };

    return (
        <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                        Search Results ({results.length})
                    </h2>
                    <p className="text-gray-600">
                        Showing results for "{activeTab}" category
                    </p>
                </div>
                <div className="text-sm text-gray-500">
                    Page {currentPage}
                </div>
            </div>

            {/* Results List */}
            <div className="space-y-4">
                {results.map((result, index) => renderResult(result, index))}
            </div>

            {/* Pagination */}
            {results.length > 0 && (
                <div className="flex justify-center mt-8">
                    <nav className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md">
                            Page {currentPage}
                        </span>
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
}

export default SearchResults;