import { format, formatDistance, isToday, isTomorrow, differenceInCalendarDays } from 'date-fns';

// ─── className merger ────────────────────────────────────────────────────────
type ClassValue = string | number | boolean | undefined | null | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const flatten = (items: ClassValue[]): string[] =>
    items.flatMap((item) => {
      if (!item && item !== 0) return [];
      if (Array.isArray(item)) return flatten(item);
      return [String(item)];
    });
  return flatten(inputs).join(' ');
}

// ─── Slugify ────────────────────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// ─── Generate unique event slug ──────────────────────────────────────────────
export function generateEventSlug(title: string): string {
  const base = slugify(title);
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${base}-${suffix}`;
}

// ─── Format date ─────────────────────────────────────────────────────────────
export function formatDate(date: Date | string, fmt = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, fmt);
}

// ─── Format date + time ──────────────────────────────────────────────────────
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isToday(d)) return `Today at ${format(d, 'h:mm a')}`;
  if (isTomorrow(d)) return `Tomorrow at ${format(d, 'h:mm a')}`;
  return format(d, 'EEE, MMM d • h:mm a');
}

// ─── Format date range ───────────────────────────────────────────────────────
export function formatDateRange(start: Date | string, end?: Date | string | null): string {
  const s = typeof start === 'string' ? new Date(start) : start;
  const startStr = format(s, 'EEE, MMM d, yyyy · h:mm a');

  if (!end) return startStr;

  const e = typeof end === 'string' ? new Date(end) : end;
  const sameDay = differenceInCalendarDays(e, s) === 0;

  if (sameDay) {
    return `${format(s, 'EEE, MMM d, yyyy · h:mm a')} – ${format(e, 'h:mm a')}`;
  }
  return `${format(s, 'MMM d')} – ${format(e, 'MMM d, yyyy')}`;
}

// ─── Relative time ───────────────────────────────────────────────────────────
export function timeFromNow(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistance(d, new Date(), { addSuffix: true });
}

// ─── Truncate ────────────────────────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

// ─── Parse email list ────────────────────────────────────────────────────────
export function parseEmailList(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
}

// ─── Format bytes ────────────────────────────────────────────────────────────
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
