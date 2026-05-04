import { z } from 'zod';

export const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  company: z.string().optional(),
  position: z.string().optional(),
  acceptedTerms: z.boolean().refine((value) => value === true, {
    message: 'You must accept the Terms of Service.',
  }),
  acceptedPrivacy: z.boolean().refine((value) => value === true, {
    message: 'You must accept the Privacy Policy.',
  }),
  acceptedHostResponsibility: z.boolean().refine((value) => value === true, {
    message: 'You must accept host responsibility terms.',
  }),
});

export const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const eventSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  category: z.string().min(1, 'Category is required'),
  eventType: z.enum(['IN_PERSON', 'ONLINE', 'HYBRID']),
  description: z.string().optional(),
  bannerImage: z.string().optional(),
  date: z.string().min(1, 'Event date is required'),
  endDate: z.string().optional(),
  timezone: z.string().default('America/Toronto'),
  location: z.string().optional(),
  address: z.string().optional(),
  isOnline: z.boolean().default(false),
  onlineLink: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  parkingAvailable: z.boolean().default(false),
  parkingNotes: z.string().optional(),
  thingsToKnow: z.string().optional(),
  maxAttendees: z.number().int().positive().optional().nullable(),
  ageGate: z.number().int().min(0).default(0),
  requiresCertification: z.boolean().default(false),
  certificationNote: z.string().optional(),
  tags: z.string().optional(),
  customQuestions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      type: z.enum(['text', 'select', 'checkbox']),
      options: z.array(z.string()).optional(),
      required: z.boolean().default(false),
    })
  ).optional(),
  faqs: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      answer: z.string(),
    })
  ).optional(),
  emailInviteList: z.string().optional(),
  confirmationMessage: z.string().optional(),
  visibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  status: z.enum(['DRAFT', 'LIVE', 'PRIVATE', 'CANCELLED', 'ENDED']).default('DRAFT'),
  ticketName: z.string().default('General Admission'),
  ticketDescription: z.string().optional(),
  ticketQuantity: z.number().int().positive().optional().nullable(),
  ticketUnlimited: z.boolean().default(false),
});

export const rsvpSchema = z.object({
  guestName: z.string().min(2, 'Full name is required'),
  guestEmail: z.string().email('Valid email is required'),
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  brand: z.string().optional(),
  position: z.string().optional(),
  certificationUrl: z.string().optional(),
  answers: z.record(z.string(), z.string()).optional(),
  ageConfirmed: z.boolean().optional(),
});

export const inviteSchema = z.object({
  emails: z.array(z.string().email()).min(1, 'At least one email is required'),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type RSVPInput = z.infer<typeof rsvpSchema>;
export type InviteInput = z.infer<typeof inviteSchema>;
