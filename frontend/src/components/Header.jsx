import React, { useState } from 'react';

const Header = ({ activeNav, setActiveNav, onLogin, onSignup }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navItems = [
        { id: 'search', icon: '🔍', label: 'Search', description: 'Web search & discovery' },
        { id: 'crawler', icon: '🕷️', label: 'Crawler', description: 'Web crawling tools' },
        { id: 'analytics', icon: '📊', label: 'Analytics', description: 'Search analytics' },
        { id: 'api', icon: '🔌', label: 'API', description: 'Developer tools' }
    ];

    const handleNavClick = (navId) => {
        setActiveNav(navId);
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white/95 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo and Brand */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">K</span>
                                </div>
                                <span className="text-xl font-bold text-gray-900">Ketivee Search</span>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                    activeNav === item.id
                                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        {/* Search Button */}
                        <button
                            onClick={() => handleNavClick('search')}
                            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Search
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* User Dropdown */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">Guest User</p>
                                        <p className="text-xs text-gray-500">Sign in for more features</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            onLogin();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsUserMenuOpen(false);
                                            onSignup();
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Create Account
                                    </button>
                                    <div className="border-t border-gray-100 mt-2 pt-2">
                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            Help & Support
                                        </button>
                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                            Settings
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 py-4">
                        <div className="space-y-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                                        activeNav === item.id
                                            ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                                            : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <div>
                                        <div className="font-medium">{item.label}</div>
                                        <div className="text-sm text-gray-500">{item.description}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        {/* Mobile User Actions */}
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onLogin();
                                }}
                                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    onSignup();
                                }}
                                className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header; 