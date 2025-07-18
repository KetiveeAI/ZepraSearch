import React from 'react';

// Category icons
const CategoryIcons = {
    all: '🔍',
    maps: '🗺️',
    videos: '🎥',
    docs: '📄',
    educational: '📚',
    news: '📰',
    shopping: '🛒',
    flights: '✈️',
    travel: '🌍',
    trending: '🔥',
    'most-clicked': '👆'
};

// Category descriptions
const CategoryDescriptions = {
    all: 'All results from across the web',
    maps: 'Find locations, directions, and places',
    videos: 'Watch videos, tutorials, and media content',
    docs: 'Access documents, presentations, and files',
    educational: 'Learn with tutorials, courses, and educational resources',
    news: 'Stay updated with latest news and media',
    shopping: 'Shop online and find products',
    flights: 'Book flights and travel arrangements',
    travel: 'Plan trips and explore destinations',
    trending: 'Popular searches and trending topics',
    'most-clicked': 'Most clicked results by users'
};

function TabNavigation({ activeTab, onTabChange, resultCounts = {}, educationalContent = null }) {
    const categories = [
        { id: 'all', name: 'All', priority: 1 },
        { id: 'maps', name: 'Maps & Location', priority: 2 },
        { id: 'videos', name: 'Videos & Media', priority: 3 },
        { id: 'docs', name: 'Documents & Files', priority: 4 },
        { id: 'educational', name: 'Educational Content', priority: 5 },
        { id: 'news', name: 'News & Media', priority: 6 },
        { id: 'shopping', name: 'Shopping & E-commerce', priority: 7 },
        { id: 'flights', name: 'Flights & Travel', priority: 8 },
        { id: 'travel', name: 'Travel & Tourism', priority: 9 },
        { id: 'trending', name: 'Trending', priority: 10 },
        { id: 'most-clicked', name: 'Most Clicked', priority: 11 }
    ];

    return (
        <div className="mb-6">
            {/* Educational Content Banner */}
            {educationalContent && educationalContent.isEducational && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="text-2xl">📚</div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900">Educational Search Detected</h3>
                            <p className="text-sm text-blue-700">
                                We found educational keywords in your search. 
                                Results are enhanced with learning resources, tutorials, and courses.
                            </p>
                            {educationalContent.suggestions.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-xs text-blue-600 font-medium mb-1">Suggested searches:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {educationalContent.suggestions.slice(0, 3).map((suggestion, index) => (
                                            <button
                                                key={index}
                                                onClick={() => onTabChange('educational', suggestion)}
                                                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded-full transition-colors"
                                            >
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
                {categories.map(category => {
                    const count = resultCounts[category.id] || 0;
                    const isActive = activeTab === category.id;
                    
                    return (
                        <button
                            key={category.id}
                            onClick={() => onTabChange(category.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                ${isActive 
                                    ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                                    : 'bg-white/10 text-gray-700 hover:bg-white/20 hover:text-gray-900'
                                }
                                ${category.id === 'educational' && educationalContent?.isEducational 
                                    ? 'ring-2 ring-blue-300 ring-offset-2' 
                                    : ''
                                }
                            `}
                        >
                            <span className="text-lg">{CategoryIcons[category.id]}</span>
                            <span>{category.name}</span>
                            {count > 0 && (
                                <span className={`
                                    px-2 py-0.5 rounded-full text-xs font-bold
                                    ${isActive 
                                        ? 'bg-white/20 text-white' 
                                        : 'bg-gray-200 text-gray-700'
                                    }
                                `}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Category Description */}
            <div className="mt-3 text-sm text-gray-600">
                {CategoryDescriptions[activeTab] || 'Search results from across the web'}
            </div>
        </div>
    );
}

export default TabNavigation;