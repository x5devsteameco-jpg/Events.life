'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const variantConfig: Record<ToastVariant, { icon: string; color: string; bg: string; border: string }> = {
  success: {
    icon: 'ok',
    color: '#00e5cc',
    bg: 'rgba(0,229,204,0.08)',
    border: 'rgba(0,229,204,0.25)',
  },
  error: {
    icon: 'x',
    color: '#ff3cac',
    bg: 'rgba(255,60,172,0.08)',
    border: 'rgba(255,60,172,0.25)',
  },
  warning: {
    icon: '!',
    color: '#ffa500',
    bg: 'rgba(255,165,0,0.08)',
    border: 'rgba(255,165,0,0.25)',
  },
  info: {
    icon: 'i',
    color: '#7aafc4',
    bg: 'rgba(122,175,196,0.08)',
    border: 'rgba(122,175,196,0.25)',
  },
};

// ─── Single Toast Item ────────────────────────────────────────────────────────
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = variantConfig[toast.variant];

  React.useEffect(() => {
    const timer = setTimeout(() => onDismiss(toast.id), toast.duration ?? 5000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: config.bg,
        border: `1px solid ${config.border}`,
        backdropFilter: 'blur(16px)',
      }}
      className="relative flex items-start gap-3 p-4 rounded-xl min-w-[300px] max-w-[400px] shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
    >
      {/* Icon */}
      <div
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold"
        style={{ background: `${config.color}20`, color: config.color }}
      >
        {config.icon}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm text-[#e8f4f8] leading-relaxed pt-0.5">
        {toast.message}
      </p>

      {/* Close */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded text-[#4d7a90] hover:text-[#e8f4f8] transition-colors"
        aria-label="Dismiss notification"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-xl"
        style={{ background: config.color, originX: 0 }}
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (toast.duration ?? 5000) / 1000, ease: 'linear' }}
      />
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 5000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-4), { id, message, variant, duration }]);
  }, []);

  const value: ToastContextValue = {
    toasts,
    toast: addToast,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    warning: (msg) => addToast(msg, 'warning'),
    info: (msg) => addToast(msg, 'info'),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container */}
      <div
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onDismiss={dismiss} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
