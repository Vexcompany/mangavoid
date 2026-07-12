import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { typeLabel } from '../lib/api';
import { getSearchHistory, addSearchHistory, clearSearchHistory } from '../lib/storage';

function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

export default function SearchBox({ className = '', inputClassName = '', autoFocus = false }) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(-1);
  const [mode, setMode] = useState('history'); // 'history' | 'suggestions'
  const navigate = useNavigate();
  const ref = useRef(null);

  const fetchSuggestions = useCallback(
    debounce(async (q) => {
      if (!q.trim() || q.length < 2) { setSuggestions([]); setLoading(false); return; }
      try {
        const res = await axios.get('/api/search', { params: { q, limit: 6 } });
        setSuggestions(res.data.results || []);
        setMode('suggestions');
        setOpen(true);
      } catch { setSuggestions([]); }
      finally { setLoading(false); }
    }, 350), []
  );

  useEffect(() => {
    if (input.length >= 2) {
      setLoading(true);
      fetchSuggestions(input);
    } else {
      setSuggestions([]);
      setMode('history');
    }
  }, [input]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleFocus() {
    setHistory(getSearchHistory());
    setOpen(true);
  }

  function goSearch(q) {
    if (!q?.trim()) return;
    addSearchHistory(q.trim());
    navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    setInput('');
    setOpen(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (selected >= 0 && mode === 'suggestions' && suggestions[selected]) {
      navigate(`/manga/${suggestions[selected].hid}`);
      setOpen(false); setInput('');
    } else {
      goSearch(input);
    }
  }

  function handleKeyDown(e) {
    const list = mode === 'suggestions' ? suggestions : history;
    if (!open || list.length === 0) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, list.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, -1)); }
    if (e.key === 'Enter' && selected >= 0) {
      e.preventDefault();
      if (mode === 'suggestions') { navigate(`/manga/${suggestions[selected].hid}`); setOpen(false); setInput(''); }
      else { goSearch(history[selected]); }
    }
    if (e.key === 'Escape') setOpen(false);
  }

  const showHistory = mode === 'history' && history.length > 0;
  const showSuggestions = mode === 'suggestions' && suggestions.length > 0;
  const dropdownVisible = open && (showHistory || showSuggestions);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setSelected(-1); }}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            placeholder="Search manga, manhwa..."
            autoFocus={autoFocus}
            className={inputClassName || 'w-full bg-ink-800 border border-ink-600 rounded-md px-4 py-1.5 text-sm text-ash-200 placeholder-ash-400 focus:outline-none focus:border-crimson-500 focus:ring-1 focus:ring-crimson-500/30 transition-all pr-8'}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {loading
              ? <div className="w-3.5 h-3.5 border border-crimson-500 border-t-transparent rounded-full animate-spin" />
              : <button type="submit" className="text-ash-400 hover:text-crimson-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
            }
          </div>
        </div>
      </form>

      {dropdownVisible && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-ink-800 border border-ink-600 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">

          {showHistory && (
            <>
              <div className="flex items-center justify-between px-3 pt-2.5 pb-1">
                <span className="text-xs font-mono text-ash-500 uppercase tracking-wider">Recent</span>
                <button onClick={() => { clearSearchHistory(); setHistory([]); }}
                  className="text-xs text-ash-600 hover:text-ash-400 transition-colors">Clear</button>
              </div>
              {history.map((q, i) => (
                <button key={q} onClick={() => goSearch(q)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${i === selected ? 'bg-ink-700' : 'hover:bg-ink-700'}`}>
                  <svg className="w-3.5 h-3.5 text-ash-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-ash-300">{q}</span>
                </button>
              ))}
              <div className="border-t border-ink-700 mt-1" />
            </>
          )}

          {showSuggestions && suggestions.map((manga, i) => (
            <button key={manga.id} onClick={() => { navigate(`/manga/${manga.hid}`); setOpen(false); setInput(''); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${i === selected ? 'bg-ink-700' : 'hover:bg-ink-700'}`}>
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

          {showSuggestions && (
            <div className="border-t border-ink-700 px-3 py-2">
              <button onClick={() => goSearch(input)} className="text-xs text-crimson-400 hover:text-crimson-300 transition-colors">
                See all results for "{input}" →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
