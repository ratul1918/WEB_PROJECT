import { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface CreatorResult {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CreatorSearchProps {
  placeholder?: string;
}

export function CreatorSearch({
  placeholder = 'Search creators by name',
}: CreatorSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CreatorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await api.users.searchCreators(q);
      setResults(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Creator search failed', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search on input change
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        handleSearch(query);
      }, 300);
    } else {
      setResults([]);
      setError(null);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full h-11 pl-11 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors placeholder:text-gray-400"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch(query);
            }}
          />
        </div>
        <button
          onClick={() => handleSearch(query)}
          disabled={loading || !query.trim()}
          className="h-11 px-6 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
          {results.map((creator) => (
            <button
              key={creator.id}
              onClick={() => navigate(`/creator/${creator.id}`)}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 group-hover:text-orange-600 transition-colors truncate">
                    {creator.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">{creator.email}</div>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium shrink-0 ${
                  creator.role === 'creator' ? 'bg-blue-100 text-blue-700' :
                  creator.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {creator.role}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && !error && results.length === 0 && query.trim() !== '' && (
        <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-600">No users found matching "<span className="font-medium">{query}</span>"</p>
          <p className="text-xs text-gray-500 mt-1">Try a different search term</p>
        </div>
      )}
    </div>
  );
}
