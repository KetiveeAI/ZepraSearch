import React, { useState, useEffect } from 'react';

const LoginSuggestion = ({ onClose, onLogin, onSignup }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Show the popup after a delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleLogin = () => {
        handleClose();
        onLogin();
    };

    const handleSignup = () => {
        handleClose();
        onSignup();
    };

    if (!isVisible) return null;

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ease-in-out ${
            isClosing ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
        }`}>
            <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-6 max-w-sm w-80">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">Unlock More Features</h3>
                        <p className="text-sm text-gray-600">Personalize your search experience</p>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save your search history
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Get personalized recommendations
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Access advanced search filters
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Export your search data
                    </div>
                </div>

                {/* Action buttons */}
                <div className="space-y-2">
                    <button
                        onClick={handleLogin}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                    >
                        Sign In
                    </button>
                    <button
                        onClick={handleSignup}
                        className="w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
                    >
                        Create Account
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-3 text-center">
                    <p className="text-xs text-gray-500">
                        Free forever • No credit card required
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginSuggestion; 