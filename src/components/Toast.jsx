import { useState, useEffect, useCallback } from 'react';

let toastQueue = [];
let listeners = [];

export function toast(message, type = 'info', duration = 4000) {
  const id = Date.now() + Math.random();
  const item = { id, message, type, duration };
  toastQueue = [...toastQueue, item];
  listeners.forEach(fn => fn([...toastQueue]));
  return id;
}

export function useToastStore() {
  const [toasts, setToasts] = useState([...toastQueue]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => { listeners = listeners.filter(fn => fn !== setToasts); };
  }, []);

  const dismiss = useCallback((id) => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    listeners.forEach(fn => fn([...toastQueue]));
  }, []);

  return { toasts, dismiss };
}

const ICONS = {
  info: (
    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  success: (
    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  update: (
    <svg className="w-4 h-4 text-crimson-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 4v8m0 0l4-4m-4 4l-4-4" />
    </svg>
  ),
  bookmark: (
    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  ),
};

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex items-start gap-3 bg-ink-800 border border-ink-600 rounded-xl px-4 py-3 shadow-2xl min-w-[260px] max-w-[340px] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div className="shrink-0 mt-0.5">{ICONS[toast.type] || ICONS.info}</div>
      <p className="text-sm text-ash-200 leading-snug flex-1">{toast.message}</p>
      <button onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300); }}
        className="shrink-0 text-ash-500 hover:text-ash-200 transition-colors mt-0.5">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();
  return (
    <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 items-end">
      {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={dismiss} />)}
    </div>
  );
}
