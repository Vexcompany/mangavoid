import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { typeLabel } from '../lib/api';

function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export default function SearchBox({ className = '', inputClassName = '', autoFocus = false, onSearch }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const navigate = useNavigate();
  const ref = useRef(null);
  const inputRef = useRef(null);

  const fetchSuggestions = useCallback(
    debounce(async (q) => {
      if (!q.trim() || q.length < 2) { setSuggestions([]); setLoading(false); return; }
      try {
        const res = await axios.get('/api/search', { params: { q, limit: 6 } });
        setSuggestions(res.data.results || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 350),
    []
  );

  useEffect(() => {
    if (input.length >= 2) {
      setLoading(true);
      fetchSuggestions(input);
    } else {
      setSuggestions([]);
      setOpen(false);
    }
  }, [input]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    setOpen(false);
    if (onSearch) onSearch(input);
    else navigate(`/search?q=${encodeURIComponent(input.trim())}`);
  }

  function handleKeyDown(e) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, suggestions.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, -1)); }
    if (e.key === 'Enter' && selected >= 0) {
      e.preventDefault();
      const manga = suggestions[selected];
      navigate(`/manga/${manga.hid}`);
      setOpen(false);
      setInput('');
    }
    if (e.key === 'Escape') setOpen(false);
  }

  function pickSuggestion(manga) {
    navigate(`/manga/${manga.hid}`);
    setOpen(false);
    setInput('');
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setSelected(-1); }}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="Search manga, manhwa..."
            autoFocus={autoFocus}
            className={inputClassName || 'w-full bg-ink-800 border border-ink-600 rounded-md px-4 py-1.5 text-sm text-ash-200 placeholder-ash-400 focus:outline-none focus:border-crimson-500 focus:ring-1 focus:ring-crimson-500/30 transition-all'}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {loading
              ? <div className="w-3.5 h-3.5 border border-crimson-500 border-t-transparent rounded-full animate-spin" />
              : (
                <button type="submit" className="text-ash-400 hover:text-crimson-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              )
            }
          </div>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-ink-800 border border-ink-600 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          {suggestions.map((manga, i) => (
            <button
              key={manga.id}
              onClick={() => pickSuggestion(manga)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${i === selected ? 'bg-ink-700' : 'hover:bg-ink-700'}`}
            >
              <div className="w-8 h-11 rounded bg-ink-600 shrink-0 overflow-hidden">
                {manga.poster
                  ? <img src={manga.poster} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><span className="text-ink-400 text-xs font-display">M</span></div>
                }
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ash-100 truncate leading-tight">{manga.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-ash-500">{typeLabel(manga.type)}</span>
                  {manga.year && <span className="text-xs text-ash-600 font-mono">{manga.year}</span>}
                </div>
              </div>
              <svg className="w-3.5 h-3.5 text-ash-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
          <div className="border-t border-ink-700 px-3 py-2">
            <button onClick={handleSubmit} className="text-xs text-crimson-400 hover:text-crimson-300 transition-colors">
              See all results for "{input}" →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
