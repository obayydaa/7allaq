import { Timestamp } from 'firebase/firestore';

// ─── Service ───────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  duration: number; // minutes
  description: string;
  descriptionAr: string;
  category: 'haircut' | 'beard' | 'combo' | 'treatment';
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type ServiceFormData = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;

// ─── Barber ────────────────────────────────────────────
export interface Barber {
  id: string;
  name: string;
  nameAr: string;
  isActive: boolean;
  order: number;
  createdAt: Timestamp;
}

export type BarberFormData = Omit<Barber, 'id' | 'createdAt'>;

// ─── Booking ───────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  serviceNameAr: string;
  barberId: string;
  barberName: string;
  barberNameAr: string;
  customerName: string;
  customerPhone: string;
  date: string;       // "2026-05-25"
  time: string;       // "14:00"
  duration: number;
  price: number;
  status: BookingStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface BookingFormData {
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
}

// ─── Availability ──────────────────────────────────────
export interface Availability {
  id: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday
  startTime: string;   // "09:00"
  endTime: string;     // "21:00"
  isActive: boolean;
  slotDuration: number; // 30 minutes default
}

// ─── Blocked Slot ──────────────────────────────────────
export interface BlockedSlot {
  id: string;
  barberId?: string;   // Optional: block for specific barber
  date: string;        // "2026-05-25"
  time: string;        // "14:00"
  reason?: string;
  createdAt: Timestamp;
}

// ─── i18n ──────────────────────────────────────────────
export type Language = 'en' | 'ar';

export interface TranslationStrings {
  [key: string]: string;
}

// ─── Time Slot ─────────────────────────────────────────
export interface TimeSlot {
  time: string;        // "14:00"
  available: boolean;
  barberId?: string;
}
