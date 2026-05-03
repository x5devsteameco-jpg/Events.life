// ─── Enums ───────────────────────────────────────────────────────────────────

export type Role = 'ADMIN' | 'HOST' | 'ATTENDEE';
export type EventStatus = 'DRAFT' | 'LIVE' | 'PRIVATE' | 'CANCELLED' | 'ENDED';
export type EventVisibility = 'PUBLIC' | 'PRIVATE';
export type RSVPStatus = 'PENDING' | 'CONFIRMED' | 'WAITLISTED' | 'CANCELLED';
export type SharePermission = 'VIEW' | 'EDIT';

// ─── Models ──────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: Role;
  company: string | null;
  position: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  bannerImage: string | null;
  hostId: string;
  status: EventStatus;
  visibility: EventVisibility;
  date: Date;
  endDate: Date | null;
  location: string | null;
  address: string | null;
  isOnline: boolean;
  onlineLink: string | null;
  maxAttendees: number | null;
  ageGate: number;
  parkingAvailable: boolean;
  parkingNotes: string | null;
  thingsToKnow: string | null;
  requiresCertification: boolean;
  certificationNote: string | null;
  category: string | null;
  tags: string | null;
  customQuestions: string | null;
  faqs: string | null;
  emailInviteList: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  host?: User;
  rsvps?: RSVP[];
  _count?: { rsvps: number };
}

export interface RSVP {
  id: string;
  eventId: string;
  userId: string | null;
  guestEmail: string;
  guestName: string;
  storeName: string | null;
  storeAddress: string | null;
  brand: string | null;
  position: string | null;
  certificationUrl: string | null;
  status: RSVPStatus;
  answers: string | null;
  createdAt: Date;
  event?: Event;
  user?: User | null;
}

export interface Ticket {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: number;
  isFree: boolean;
  quantity: number | null;
  quantitySold: number;
  isVisible: boolean;
  createdAt: Date;
}

// ─── Custom Question Types ───────────────────────────────────────────────────

export interface CustomQuestion {
  id: string;
  label: string;
  type: 'text' | 'select' | 'checkbox';
  options?: string[];
  required: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
}

// ─── API Response Types ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export interface DashboardStats {
  totalEvents: number;
  totalRsvps: number;
  upcomingEvents: number;
  draftEvents: number;
}

// ─── Next-Auth Session Extension ─────────────────────────────────────────────

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: string;
    };
  }
  interface User {
    id: string;
    role?: string;
  }
}
