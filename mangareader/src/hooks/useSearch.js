import { useState, useCallback, useRef } from 'react';
import { searchManga } from '../lib/api';

export function useSearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const abortRef = useRef(null);

  const search = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setQuery('');
      return;
    }

    setQuery(q);
    setLoading(true);
    setError(null);

    try {
      const data = await searchManga(q, 12);
      setResults(data);
    } catch (err) {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { results, loading, error, query, search };
}
