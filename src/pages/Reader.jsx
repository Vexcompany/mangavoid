import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ReaderPage() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [mode, setMode] = useState('scroll');
  const [navVisible, setNavVisible] = useState(true);
  const [imgErrors, setImgErrors] = useState({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPages([]);
    setCurrentPage(0);
    axios.get('/api/pages', { params: { chapterId } })
      .then(res => setPages(res.data.pages || []))
      .catch(() => setError('Failed to load chapter.'))
      .finally(() => setLoading(false));
  }, [chapterId]);

  useEffect(() => {
    let timer;
    const handleMove = () => {
      setNavVisible(true);
      clearTimeout(timer);
      timer = setTimeout(() => setNavVisible(false), 3000);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    function handleKey(e) {
      if (mode !== 'paged') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setCurrentPage(p => Math.min(p + 1, pages.length - 1));
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setCurrentPage(p => Math.max(p - 1, 0));
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, pages.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-2 border-crimson-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-ash-500 text-sm font-mono">Loading chapter...</p>
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center gap-4">
        <div className="font-display text-5xl text-ink-600">ERR</div>
        <p className="text-ash-500 text-sm">{error || 'No pages found.'}</p>
        <button onClick={() => navigate(-1)} className="text-crimson-400 border border-crimson-600/30 rounded-full px-4 py-2 text-sm hover:bg-crimson-600/10 transition-all">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className={`fixed top-0 left-0 right-0 z-50 bg-ink-950/95 backdrop-blur border-b border-ink-700 transition-all duration-300 ${navVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-ash-400 hover:text-ash-100 transition-colors text-sm shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode('scroll')}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${mode === 'scroll' ? 'bg-crimson-600 border-crimson-500 text-white' : 'border-ink-600 text-ash-400 hover:border-crimson-600/40'}`}
            >
              Scroll
            </button>
            <button
              onClick={() => setMode('paged')}
              className={`text-xs px-3 py-1 rounded-full border transition-all ${mode === 'paged' ? 'bg-crimson-600 border-crimson-500 text-white' : 'border-ink-600 text-ash-400 hover:border-crimson-600/40'}`}
            >
              Paged
            </button>
          </div>

          <span className="text-xs font-mono text-ash-500 shrink-0">
            {mode === 'paged' ? `${currentPage + 1} / ${pages.length}` : `${pages.length}p`}
          </span>
        </div>
      </div>

      <div className="pt-12">
        {mode === 'scroll' ? (
          <div className="flex flex-col items-center">
            {pages.map((page, i) => (
              <img
                key={page.index}
                src={imgErrors[i] ? page.url.replace('/api/page?url=', '') : page.url}
                alt={`Page ${i + 1}`}
                className="w-full max-w-3xl block"
                loading={i < 3 ? 'eager' : 'lazy'}
                onError={() => setImgErrors(prev => ({ ...prev, [i]: true }))}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] px-4 cursor-pointer select-none"
            onClick={e => {
              const mid = window.innerWidth / 2;
              if (e.clientX > mid) setCurrentPage(p => Math.min(p + 1, pages.length - 1));
              else setCurrentPage(p => Math.max(p - 1, 0));
            }}
          >
            {pages[currentPage] && (
              <img
                src={pages[currentPage].url}
                alt={`Page ${currentPage + 1}`}
                className="max-h-[calc(100vh-5rem)] max-w-full object-contain"
                loading="eager"
              />
            )}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                onClick={e => { e.stopPropagation(); setCurrentPage(p => Math.max(p - 1, 0)); }}
                disabled={currentPage === 0}
                className="w-10 h-10 rounded-full bg-ink-800/90 border border-ink-600 text-ash-300 disabled:opacity-30 flex items-center justify-center hover:border-crimson-600/40 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-xs font-mono text-ash-400 bg-ink-800/90 px-3 py-1.5 rounded-full border border-ink-600">
                {currentPage + 1} / {pages.length}
              </span>
              <button
                onClick={e => { e.stopPropagation(); setCurrentPage(p => Math.min(p + 1, pages.length - 1)); }}
                disabled={currentPage === pages.length - 1}
                className="w-10 h-10 rounded-full bg-ink-800/90 border border-ink-600 text-ash-300 disabled:opacity-30 flex items-center justify-center hover:border-crimson-600/40 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
