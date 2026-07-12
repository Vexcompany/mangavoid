import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import DetailPage from './pages/Detail';
import ReaderPage from './pages/Reader';
import StatsPage from './pages/Stats';
import BackToTop from './components/BackToTop';
import { ToastContainer } from './components/Toast';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/read/:chapterId" element={<ReaderPage />} />
        <Route path="*" element={
          <div className="min-h-screen bg-ink-950 text-ash-200">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/manga/:hid" element={<DetailPage />} />
              <Route path="/stats" element={<StatsPage />} />
            </Routes>
            <footer className="border-t border-ink-700 mt-16 py-8 text-center">
              <p className="font-display text-xl tracking-widest text-ink-600">MANGAVOID</p>
              <p className="text-xs text-ink-500 font-mono mt-1">Powered by MangaDex</p>
            </footer>
            <BackToTop />
          </div>
        } />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}
