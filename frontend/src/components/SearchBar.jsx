import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, X } from 'lucide-react';

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 50px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:focus-within {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 18px 24px;
  border: none;
  font-size: 18px;
  background: transparent;
  
  &:focus {
    outline: none;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const SearchButton = styled.button`
  padding: 18px 24px;
  border: none;
  background: #667eea;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #5a6fd8;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ClearButton = styled.button`
  padding: 8px;
  border: none;
  background: transparent;
  color: #999;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f0f0f0;
    color: #666;
  }
`;

const SuggestionsContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  margin-top: 8px;
  overflow: hidden;
`;

const SuggestionItem = styled.div`
  padding: 12px 24px;
  cursor: pointer;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #eee;
  }
`;

function SearchBar({ value, onChange, onSearch, loading }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length > 2) {
        try {
          const apiKey = localStorage.getItem('ketivee_api_key');
          if (!apiKey) return;
          
          const response = await fetch(
            `http://localhost:3001/api/search/suggestions?q=${encodeURIComponent(value)}`,
            {
              headers: {
                'X-API-Key': apiKey
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            setSuggestions(data.suggestions || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          console.error('Failed to fetch suggestions:', error);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [value]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSearch(value.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <SearchContainer>
      <form onSubmit={handleSubmit}>
        <SearchInputContainer>
          <SearchInput
            type="text"
            placeholder="Search the web..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          
          {value && (
            <ClearButton type="button" onClick={handleClear}>
              <X size={16} />
            </ClearButton>
          )}
          
          <SearchButton type="submit" disabled={loading || !value.trim()}>
            <Search size={20} />
            {loading ? 'Searching...' : 'Search'}
          </SearchButton>
        </SearchInputContainer>
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionsContainer>
          {suggestions.map((suggestion, index) => (
            <SuggestionItem
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </SuggestionItem>
          ))}
        </SuggestionsContainer>
      )}
    </SearchContainer>
  );
}

export default SearchBar;