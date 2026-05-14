'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Loading } from '@/components/ui/Loading';
import { 
  Search, 
  X, 
  TrendingUp, 
  Clock,
  ArrowRight
} from 'lucide-react';

interface SearchSuggestion {
  name: string;
  slug: string;
  image: string;
  price: number;
}

interface SearchBarProps {
  onClose?: () => void;
  placeholder?: string;
  showSuggestions?: boolean;
  className?: string;
}

export function SearchBar({ 
  onClose, 
  placeholder = 'Search products...',
  showSuggestions = true,
  className = ''
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [trendingSearches, setTrendingSearches] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Mock trending searches
    setTrendingSearches([
      'Wireless Headphones',
      'Smart Watch',
      'Laptop Stand',
      'Phone Case',
      'Bluetooth Speaker'
    ]);
  }, []);

  // Fetch suggestions when query changes
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      try {
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock suggestions
        const mockSuggestions: SearchSuggestion[] = [
          {
            name: `${query} Pro`,
            slug: `${query.toLowerCase().replace(/\s+/g, '-')}-pro`,
            image: '/api/placeholder/60/60',
            price: 29.99
          },
          {
            name: `${query} Plus`,
            slug: `${query.toLowerCase().replace(/\s+/g, '-')}-plus`,
            image: '/api/placeholder/60/60',
            price: 39.99
          }
        ];
        
        setSuggestions(mockSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    
    if (finalQuery.trim()) {
      // Save to recent searches
      const updatedRecent = [finalQuery, ...recentSearches.filter(s => s !== finalQuery)].slice(0, 5);
      setRecentSearches(updatedRecent);
      localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
      
      // Navigate to search results
      router.push(`/products?q=${encodeURIComponent(finalQuery)}`);
      
      // Close search bar if onClose is provided
      if (onClose) {
        onClose();
      }
      
      setIsOpen(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    router.push(`/products/${suggestion.slug}`);
    if (onClose) {
      onClose();
    }
    setIsOpen(false);
    setQuery('');
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  return (
    <div className={`relative w-full min-w-80 ${className}`}>
      {/* Search Input */}
      <div className="relative w-full">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            } else if (e.key === 'Escape') {
              setIsOpen(false);
              if (onClose) onClose();
            }
          }}
          className="pl-10 pr-10 w-full"
          rightElement={
            query && (
              <button
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )
          }
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (query.length >= 2 || recentSearches.length > 0 || trendingSearches.length > 0) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <Loading size="sm" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          ) : (
            <div className="py-2">
              {/* Product Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-2">
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Products
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-accent transition-colors text-left"
                    >
                      <img
                        src={suggestion.image}
                        alt={suggestion.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {suggestion.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatPrice(suggestion.price)}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              )}

              {/* Recent Searches */}
              {recentSearches.length > 0 && query.length < 2 && (
                <div className="mb-2">
                  <div className="px-4 py-2 flex items-center justify-between">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Recent
                    </div>
                    <button
                      onClick={handleClearRecent}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-accent transition-colors text-left"
                    >
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Trending Searches */}
              {trendingSearches.length > 0 && query.length < 2 && (
                <div>
                  <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Trending
                  </div>
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full px-4 py-2 flex items-center space-x-3 hover:bg-accent transition-colors text-left"
                    >
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{search}</span>
                      <Badge variant="secondary" className="text-xs">
                        Hot
                      </Badge>
                    </button>
                  ))}
                </div>
              )}

              {/* No Results */}
              {query.length >= 2 && suggestions.length === 0 && !isLoading && (
                <div className="px-4 py-8 text-center text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <div className="text-sm">No products found for "{query}"</div>
                  <div className="text-xs mt-1">Try different keywords or browse categories</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
