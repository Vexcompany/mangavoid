import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { saveProgress, markChapterRead, getPrefs, savePrefs } from '../lib/storage';
import { toast } from '../components/Toast';

export default function ReaderPage() {
  const { chapterId } = useParams();
  const [searchParams] = useSearchParams();
  const mangaHid = searchParams.get('manga');
  const chapterNum = searchParams.get('ch');
  const navigate = useNavigate();

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preloaded, setPreloaded] = useState({});
  const [imgLoaded, setImgLoaded] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);

  const prefs = getPrefs();
  const [mode, setMode] = useState(prefs.mode || 'scroll');
  const [direction, setDirection] = useState(prefs.direction || 'ltr');
  const [fit, setFit] = useState(prefs.fit || 'width');

  const navTimer = useRef(null);
  const preloadCache = useRef({});

  // Preload next N pages
  const preloadPages = useCallback((pages, currentIdx) => {
    const toPreload = pages.slice(currentIdx + 1, currentIdx + 4);
    toPreload.forEach(page => {
      if (preloadCache.current[page.url]) return;
      const img = new Image();
      img.src = page.url;
      img.onload = () => {
        preloadCache.current[page.url] = true;
        setPreloaded(p => ({ ...p, [page.index]: true }));
      };
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPages([]);
    setCurrentPage(0);
    setImgLoaded({});
    preloadCache.current = {};

    axios.get('/api/pages', { params: { chapterId } })
      .then(res => {
        const p = res.data.pages || [];
        setPages(p);
        if (mangaHid) {
          markChapterRead(mangaHid, chapterId);
          saveProgress(mangaHid, chapterId, 0, chapterNum);
        }
        // Preload first 3 pages immediately
        setTimeout(() => preloadPages(p, 0), 100);
      })
      .catch(() => setError('Failed to load chapter.'))
      .finally(() => setLoading(false));
  }, [chapterId]);

  useEffect(() => {
    if (pages.length > 0) preloadPages(pages, currentPage);
    if (mangaHid && pages.length > 0) saveProgress(mangaHid, chapterId, currentPage, chapterNum);
  }, [currentPage, pages]);

  useEffect(() => {
    savePrefs({ mode, direction, fit });
  }, [mode, direction, fit]);

  // Nav auto-hide
  useEffect(() => {
    const show = () => {
      setNavVisible(true);
      clearTimeout(navTimer.current);
      navTimer.current = setTimeout(() => setNavVisible(false), 3000);
    };
    window.addEventListener('mousemove', show);
    window.addEventListener('touchstart', show);
    return () => {
      window.removeEventListener('mousemove', show);
      window.removeEventListener('touchstart', show);
      clearTimeout(navTimer.current);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT') return;
      switch (e.key) {
        case 'Escape': setSettingsOpen(false); break;
        case 'f': case 'F':
          if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
          else document.exitFullscreen?.();
          break;
        case 's': case 'S':
          setMode(m => { const next = m === 'scroll' ? 'paged' : 'scroll'; toast(`Mode: ${next}`, 'info', 2000); return next; });
          break;
        case '[':
          toast('No previous chapter info available', 'info', 2000);
          break;
        case ']':
          toast('No next chapter info available', 'info', 2000);
          break;
        default:
          if (mode !== 'paged') break;
          const next = direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
          const prev = direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
          if (e.key === next || e.key === 'ArrowDown') setCurrentPage(p => Math.min(p + 1, pages.length - 1));
          if (e.key === prev || e.key === 'ArrowUp') setCurrentPage(p => Math.max(p - 1, 0));
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [mode, direction, pages.length]);

  // Fullscreen listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  function handlePagedClick(e) {
    if (settingsOpen) { setSettingsOpen(false); return; }
    const mid = window.innerWidth / 2;
    const goNext = direction === 'rtl' ? e.clientX < mid : e.clientX > mid;
    if (goNext) setCurrentPage(p => Math.min(p + 1, pages.length - 1));
    else setCurrentPage(p => Math.max(p - 1, 0));
  }

  const progress = pages.length > 0 ? ((currentPage + 1) / pages.length) * 100 : 0;

  if (loading) return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-crimson-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-ash-500 text-sm font-mono">Loading chapter...</p>
    </div>
  );

  if (error || pages.length === 0) return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center gap-4">
      <div className="font-display text-5xl text-ink-600">ERR</div>
      <p className="text-ash-500 text-sm">{error || 'No pages found.'}</p>
      <button onClick={() => navigate(-1)} className="text-crimson-400 border border-crimson-600/30 rounded-full px-4 py-2 text-sm">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] relative">
      {/* Top navbar */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-ink-950/95 backdrop-blur border-b border-ink-700 transition-all duration-300 ${navVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="max-w-4xl mx-auto px-4 h-12 flex items-center justify-between gap-3">
          <button onClick={() => navigate(mangaHid ? `/manga/${mangaHid}` : -1)}
            className="flex items-center gap-1.5 text-ash-400 hover:text-ash-100 transition-colors text-sm shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="hidden sm:inline text-xs">Back</span>
          </button>

          {chapterNum && <span className="text-xs font-mono text-ash-500">Chapter {chapterNum}</span>}

          <div className="flex items-center gap-1.5 ml-auto">
            <div className="flex items-center gap-1 bg-ink-800 rounded-lg p-0.5 border border-ink-600">
              {['scroll', 'paged'].map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-all capitalize ${mode === m ? 'bg-crimson-600 text-white' : 'text-ash-400 hover:text-ash-200'}`}>
                  {m}
                </button>
              ))}
            </div>

            {/* Fullscreen */}
            <button onClick={() => {
              if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
              else document.exitFullscreen?.();
            }} className="w-8 h-8 flex items-center justify-center rounded-lg bg-ink-800 border border-ink-600 text-ash-400 hover:text-ash-200 transition-colors">
              {isFullscreen
                ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" /></svg>
                : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
              }
            </button>

            {/* Settings */}
            <button onClick={() => setSettingsOpen(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-ink-800 border border-ink-600 text-ash-400 hover:text-ash-200 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </button>

            <span className="text-xs font-mono text-ash-500 shrink-0 hidden sm:inline">
              {mode === 'paged' ? `${currentPage + 1}/${pages.length}` : `${pages.length}p`}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-ink-700">
          <div className="h-full bg-crimson-500 transition-all duration-300" style={{ width: `${mode === 'scroll' ? (Object.keys(imgLoaded).length / pages.length * 100) : progress}%` }} />
        </div>
      </div>

      {/* Settings panel */}
      {settingsOpen && (
        <div className="fixed top-14 right-4 z-50 bg-ink-800 border border-ink-600 rounded-xl p-4 w-60 shadow-2xl animate-fade-in">
          <p className="text-xs font-mono text-ash-500 uppercase tracking-widest mb-3">Settings</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-ash-400 mb-1.5">Direction</p>
              <div className="flex gap-1">
                {[['ltr', 'L→R (Manhwa)'], ['rtl', 'R←L (Manga)']].map(([val, label]) => (
                  <button key={val} onClick={() => setDirection(val)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${direction === val ? 'bg-crimson-600 border-crimson-500 text-white' : 'border-ink-600 text-ash-400 hover:border-crimson-600/40'}`}>
                    {val === 'ltr' ? 'L→R' : 'R←L'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-ash-400 mb-1.5">Image Fit</p>
              <div className="flex gap-1">
                {[['width', 'Width'], ['height', 'Height'], ['original', 'Original']].map(([val, label]) => (
                  <button key={val} onClick={() => setFit(val)}
                    className={`flex-1 text-xs py-1.5 rounded-lg border transition-all ${fit === val ? 'bg-crimson-600 border-crimson-500 text-white' : 'border-ink-600 text-ash-400 hover:border-crimson-600/40'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t border-ink-700 pt-3">
              <p className="text-xs font-mono text-ash-600 uppercase tracking-wider mb-2">Shortcuts</p>
              <div className="space-y-1 text-xs text-ash-500">
                <div className="flex justify-between"><span>Toggle mode</span><kbd className="bg-ink-700 px-1.5 py-0.5 rounded font-mono">S</kbd></div>
                <div className="flex justify-between"><span>Fullscreen</span><kbd className="bg-ink-700 px-1.5 py-0.5 rounded font-mono">F</kbd></div>
                <div className="flex justify-between"><span>Prev/Next page</span><kbd className="bg-ink-700 px-1.5 py-0.5 rounded font-mono">← →</kbd></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="pt-12">
        {mode === 'scroll' ? (
          <div className="flex flex-col items-center">
            {pages.map((page, i) => (
              <img key={i} src={page.url} alt={`Page ${i + 1}`}
                className={`block ${fit === 'width' ? 'w-full max-w-3xl' : fit === 'height' ? 'max-h-screen max-w-full' : ''}`}
                loading={i < 3 ? 'eager' : 'lazy'}
                onLoad={() => setImgLoaded(prev => ({ ...prev, [i]: true }))}
              />
            ))}
            <div className="py-10 text-center">
              <p className="text-ash-500 text-sm font-mono mb-4">— End of Chapter {chapterNum} —</p>
              <button onClick={() => navigate(mangaHid ? `/manga/${mangaHid}` : -1)}
                className="text-crimson-400 border border-crimson-600/30 rounded-full px-5 py-2 text-sm hover:bg-crimson-600/10 transition-all">
                Back to chapters
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3rem)] cursor-pointer select-none"
            onClick={handlePagedClick}>
            {pages[currentPage] && (
              <img
                key={pages[currentPage].url}
                src={pages[currentPage].url}
                alt={`Page ${currentPage + 1}`}
                className={`object-contain ${fit === 'width' ? 'w-full max-w-3xl' : fit === 'height' ? 'max-h-[calc(100vh-5rem)]' : ''}`}
                loading="eager"
              />
            )}
            {/* Bottom progress bar */}
            <div className={`fixed bottom-0 left-0 right-0 h-1 bg-ink-800 transition-opacity duration-300 ${navVisible ? 'opacity-100' : 'opacity-30'}`}>
              <div className="h-full bg-crimson-500 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            {/* Page indicator */}
            <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 transition-all duration-300 ${navVisible ? 'opacity-100' : 'opacity-0'}`}>
              <span className="text-xs font-mono text-ash-400 bg-ink-900/90 px-3 py-1.5 rounded-full border border-ink-700">
                {currentPage + 1} / {pages.length}
              </span>
            </div>

            {currentPage === pages.length - 1 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-ink-900/95 border border-ink-700 rounded-2xl p-8 text-center pointer-events-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                  <p className="font-display text-2xl tracking-wider text-ash-100 mb-1">CHAPTER COMPLETE</p>
                  <p className="text-ash-500 text-sm mb-6">Chapter {chapterNum} finished</p>
                  <button onClick={() => navigate(mangaHid ? `/manga/${mangaHid}` : -1)}
                    className="bg-crimson-600 hover:bg-crimson-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">
                    Back to chapters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
