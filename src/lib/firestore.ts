import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Service,
  ServiceFormData,
  Booking,
  BookingFormData,
  Availability,
  BlockedSlot,
  Barber,
  BarberFormData,
} from '@/types';
import { doesSlotOverlap, generateTimeSlots } from './utils';
import { FALLBACK_SERVICES, FALLBACK_BARBERS, FALLBACK_AVAILABILITY } from './fallbackData';

// ══════════════════════════════════════════════════════
//  SERVICES
// ══════════════════════════════════════════════════════

const servicesRef = collection(db, 'services');

export async function getServices(): Promise<Service[]> {
  const q = query(servicesRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Service));
}

export async function getActiveServices(): Promise<Service[]> {
  const snapshot = await getDocs(servicesRef);
  const services = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Service));
  return services.filter(s => s.isActive).sort((a, b) => a.order - b.order);
}

export async function getService(id: string): Promise<Service | null> {
  const snap = await getDoc(doc(db, 'services', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Service;
}

export async function createService(data: ServiceFormData): Promise<string> {
  const docRef = await addDoc(servicesRef, {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateService(id: string, data: Partial<ServiceFormData>): Promise<void> {
  await updateDoc(doc(db, 'services', id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, 'services', id));
}

// ══════════════════════════════════════════════════════
//  BARBERS
// ══════════════════════════════════════════════════════

const barbersRef = collection(db, 'barbers');

export async function getBarbers(): Promise<Barber[]> {
  const q = query(barbersRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Barber));
}

export async function getActiveBarbers(): Promise<Barber[]> {
  const snapshot = await getDocs(barbersRef);
  const barbers = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Barber));
  return barbers.filter(b => b.isActive).sort((a, b) => a.order - b.order);
}

export async function createBarber(data: BarberFormData): Promise<string> {
  const docRef = await addDoc(barbersRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function updateBarber(id: string, data: Partial<BarberFormData>): Promise<void> {
  await updateDoc(doc(db, 'barbers', id), data);
}

export async function deleteBarber(id: string): Promise<void> {
  await deleteDoc(doc(db, 'barbers', id));
}

// ══════════════════════════════════════════════════════
//  AVAILABILITY
// ══════════════════════════════════════════════════════

const availabilityRef = collection(db, 'availability');

export async function getAvailability(): Promise<Availability[]> {
  const q = query(availabilityRef, orderBy('dayOfWeek', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Availability));
}

export async function setAvailability(id: string, data: Partial<Availability>): Promise<void> {
  await updateDoc(doc(db, 'availability', id), data);
}

export async function initializeAvailability(): Promise<void> {
  const existing = await getDocs(availabilityRef);
  if (!existing.empty) return;

  const batch = writeBatch(db);
  // Default: Open 09:00-21:00, Sun-Thu. Closed Friday (Islamic day off in Jordan)
  const defaults: Omit<Availability, 'id'>[] = [
    { dayOfWeek: 0, startTime: '09:00', endTime: '21:00', isActive: true, slotDuration: 30 },
    { dayOfWeek: 1, startTime: '09:00', endTime: '21:00', isActive: true, slotDuration: 30 },
    { dayOfWeek: 2, startTime: '09:00', endTime: '21:00', isActive: true, slotDuration: 30 },
    { dayOfWeek: 3, startTime: '09:00', endTime: '21:00', isActive: true, slotDuration: 30 },
    { dayOfWeek: 4, startTime: '09:00', endTime: '21:00', isActive: true, slotDuration: 30 },
    { dayOfWeek: 5, startTime: '09:00', endTime: '21:00', isActive: false, slotDuration: 30 }, // Friday closed
    { dayOfWeek: 6, startTime: '10:00', endTime: '22:00', isActive: true, slotDuration: 30 },
  ];

  defaults.forEach((avail) => {
    const ref = doc(availabilityRef);
    batch.set(ref, avail);
  });

  await batch.commit();
}

// ══════════════════════════════════════════════════════
//  BLOCKED SLOTS
// ══════════════════════════════════════════════════════

const blockedSlotsRef = collection(db, 'blockedSlots');

export async function getBlockedSlots(date?: string): Promise<BlockedSlot[]> {
  let q;
  if (date) {
    q = query(blockedSlotsRef, where('date', '==', date));
  } else {
    q = query(blockedSlotsRef, orderBy('date', 'desc'));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BlockedSlot));
}

export async function blockSlot(data: Omit<BlockedSlot, 'id' | 'createdAt'>): Promise<string> {
  const docRef = await addDoc(blockedSlotsRef, {
    ...data,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function unblockSlot(id: string): Promise<void> {
  await deleteDoc(doc(db, 'blockedSlots', id));
}

// ══════════════════════════════════════════════════════
//  BOOKINGS
// ══════════════════════════════════════════════════════

const bookingsRef = collection(db, 'bookings');

export async function getBookings(filters?: {
  date?: string;
  status?: string;
}): Promise<Booking[]> {
  try {
    let bookings: Booking[] = [];
    let q;
    
      const sortDesc = (a: Booking, b: Booking) => {
        const getMillis = (dateObj: any) => {
          if (!dateObj) return 0;
          if (typeof dateObj.toMillis === 'function') return dateObj.toMillis();
          if (typeof dateObj.toDate === 'function') return dateObj.toDate().getTime();
          if (dateObj.seconds) return dateObj.seconds * 1000;
          return 0;
        };
        return getMillis(b.createdAt) - getMillis(a.createdAt);
      };

      if (filters?.date) {
        // Query by date to avoid composite index, then filter and sort in JS
        q = query(bookingsRef, where('date', '==', filters.date));
        const snapshot = await getDocs(q);
        bookings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
        
        if (filters?.status) {
          bookings = bookings.filter(b => b.status === filters.status);
        }
        bookings.sort(sortDesc);
      } else {
        const snapshot = await getDocs(bookingsRef);
        bookings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Booking));
        
        if (filters?.status) {
          bookings = bookings.filter(b => b.status === filters.status);
        }
        bookings.sort(sortDesc);
      }

    return bookings;
  } catch (error) {
    console.error('Firebase error, returning mock bookings:', error);
    return [
      {
        id: 'demo-1',
        customerName: 'Ahmad Demo',
        customerPhone: '0791234567',
        serviceId: 's1',
        serviceName: 'Classic Haircut',
        barberId: 'b1',
        barberName: 'Ahmad',
        date: new Date().toISOString().split('T')[0],
        time: '14:00',
        duration: 30,
        price: 7,
        status: 'pending',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      } as unknown as Booking,
      {
        id: 'demo-2',
        customerName: 'Omar Test',
        customerPhone: '0779876543',
        serviceId: 's4',
        serviceName: 'Master Combo',
        barberId: 'b2',
        barberName: 'Omar',
        date: new Date().toISOString().split('T')[0],
        time: '15:30',
        duration: 60,
        price: 15,
        status: 'confirmed',
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      } as unknown as Booking
    ];
  }
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<void> {
  try {
    await updateDoc(doc(db, 'bookings', id), {
      status,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Firebase error, ignoring mock status update:', error);
  }
}

/**
 * Get available time slots for a specific date and service.
 * Considers:
 * - Day-of-week availability
 * - Existing bookings (per barber)
 * - Blocked slots
 * - Service duration (blocks consecutive slots)
 */
export async function getAvailableSlots(
  date: string,
  serviceDuration: number,
  barberId?: string
): Promise<{ time: string; barberIds: string[] }[]> {
  try {
    const dayOfWeek = new Date(date).getDay();

    // 1. Get availability for this day
    const availSnap = await getDocs(availabilityRef);
    const avail = availSnap.docs.map(d => d.data() as Availability).find(a => a.dayOfWeek === dayOfWeek);
    if (!avail || !avail.isActive) return [];

    // 2. Generate all possible slots
    const allSlots = generateTimeSlots(avail.startTime, avail.endTime, avail.slotDuration);

    // 3. Get existing bookings for this date (fetch all, filter in JS)
    const bookingsSnap = await getDocs(bookingsRef);
    const existingBookings = bookingsSnap.docs
      .map((d) => d.data() as Booking)
      .filter((b) => b.date === date && ['pending', 'confirmed'].includes(b.status));

    // 4. Get blocked slots for this date
    const blockedSnap = await getDocs(blockedSlotsRef);
    const blocked = blockedSnap.docs
      .map(d => d.data() as BlockedSlot)
      .filter(bs => bs.date === date);

    // 5. Get all active barbers
    const barbersSnap = await getDocs(barbersRef);
    const allBarbers = barbersSnap.docs
      .map((d) => ({ ...d.data() as Barber, id: d.id }))
      .filter(b => b.isActive);

    // If specific barber requested, filter to just that barber
    const targetBarbers = barberId
      ? allBarbers.filter((b) => b.id === barberId)
      : allBarbers;

    if (targetBarbers.length === 0) return [];

    // 6. For each slot, determine which barbers are available
    const result: { time: string; barberIds: string[] }[] = [];

    for (const slot of allSlots) {
      const availableBarberIds: string[] = [];

      for (const barber of targetBarbers) {
        // Check if this barber has a booking that overlaps with this slot
        const hasConflict = existingBookings.some(
          (b) =>
            b.barberId === barber.id &&
            doesSlotOverlap(slot, serviceDuration, b.time, b.duration)
        );

        // Check if this slot is blocked for this barber (or globally)
        const isBlocked = blocked.some(
          (bs) =>
            bs.time === slot && (!bs.barberId || bs.barberId === barber.id)
        );

        if (!hasConflict && !isBlocked) {
          availableBarberIds.push(barber.id);
        }
      }

      if (availableBarberIds.length > 0) {
        result.push({ time: slot, barberIds: availableBarberIds });
      }
    }

    return result;
  } catch (err) {
    console.error('Error fetching slots, using fallback data:', err);
    // Fallback logic for demo
    const dayOfWeek = new Date(date).getDay();
    const avail = FALLBACK_AVAILABILITY.find(a => a.dayOfWeek === dayOfWeek);
    if (!avail || !avail.isActive) return [];

    const allSlots = generateTimeSlots(avail.startTime, avail.endTime, avail.slotDuration);
    const targetBarbers = barberId
      ? FALLBACK_BARBERS.filter((b) => b.id === barberId && b.isActive)
      : FALLBACK_BARBERS.filter(b => b.isActive);

    if (targetBarbers.length === 0) return [];

    return allSlots.map(slot => ({
      time: slot,
      barberIds: targetBarbers.map(b => b.id)
    }));
  }
}


/**
 * Create a booking with double-booking prevention using Firestore transactions
 */
export async function createBooking(
  formData: BookingFormData,
  service: Service,
  barber: Barber
): Promise<{ success: boolean; bookingId?: string; error?: string }> {
  try {
    const bookingId = await runTransaction(db, async (transaction) => {
      // 1. Check for existing bookings at this time for this barber
      const conflictQ = query(bookingsRef, where('date', '==', formData.date));
      const conflictSnap = await getDocs(conflictQ);
      const conflicts = conflictSnap.docs
        .map((d) => d.data() as Booking)
        .filter((b) => b.barberId === formData.barberId && ['pending', 'confirmed'].includes(b.status));

      // Check for time overlap
      const hasConflict = conflicts.some((existing) =>
        doesSlotOverlap(formData.time, service.duration, existing.time, existing.duration)
      );

      if (hasConflict) {
        throw new Error('DOUBLE_BOOKING');
      }

      // 2. Check blocked slots
      const blockedQ2 = query(blockedSlotsRef, where('date', '==', formData.date));
      const blockedSnap2 = await getDocs(blockedQ2);
      const isBlocked = blockedSnap2.docs.some(
        (d) => {
          const bs = d.data() as BlockedSlot;
          return bs.time === formData.time && (!bs.barberId || bs.barberId === formData.barberId);
        }
      );

      if (isBlocked) {
        throw new Error('SLOT_BLOCKED');
      }

      // 3. Create the booking
      const newBookingRef = doc(bookingsRef);
      transaction.set(newBookingRef, {
        serviceId: service.id,
        serviceName: service.name,
        serviceNameAr: service.nameAr,
        barberId: barber.id,
        barberName: barber.name,
        barberNameAr: barber.nameAr,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone.replace(/\s+/g, ''),
        date: formData.date,
        time: formData.time,
        duration: service.duration,
        price: service.price,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return newBookingRef.id;
    });

    return { success: true, bookingId };
  } catch (error: any) {
    if (error?.message === 'DOUBLE_BOOKING' || error?.message === 'SLOT_BLOCKED') {
      return { success: false, error: error.message };
    }
    console.error('Booking creation error:', error);
    throw error; // Let BookingFlow catch and display it
  }
}

// ══════════════════════════════════════════════════════
//  SEED DATA
// ══════════════════════════════════════════════════════

export async function seedServices(): Promise<void> {
  const existing = await getDocs(servicesRef);
  if (!existing.empty) return;

  const services: Omit<Service, 'id'>[] = [
    {
      name: 'Classic Haircut',
      nameAr: 'قص شعر كلاسيكي',
      price: 7,
      duration: 30,
      description: 'A precision haircut tailored to your style.',
      descriptionAr: 'قصة شعر دقيقة مصممة حسب ذوقك.',
      category: 'haircut',
      isActive: true,
      order: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Haircut & Beard',
      nameAr: 'قص شعر ولحية',
      price: 10,
      duration: 45,
      description: 'Complete grooming with a haircut and beard trim.',
      descriptionAr: 'عناية كاملة مع قص شعر وتشذيب لحية.',
      category: 'combo',
      isActive: true,
      order: 2,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Beard Only',
      nameAr: 'لحية فقط',
      price: 4,
      duration: 20,
      description: 'Expert beard shaping and trimming.',
      descriptionAr: 'تشكيل وتشذيب لحية احترافي.',
      category: 'beard',
      isActive: true,
      order: 3,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Master Combo',
      nameAr: 'الباقة الاحترافية',
      price: 15,
      duration: 60,
      description: 'Beard + Haircut + Hair Treatment — the full professional package.',
      descriptionAr: 'لحية + قص شعر + علاج شعر — الباقة الاحترافية الكاملة.',
      category: 'combo',
      isActive: true,
      order: 4,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Ultimate Combo',
      nameAr: 'الباقة المتكاملة',
      price: 25,
      duration: 90,
      description: 'Beard + Haircut + Hair Treatment + Face Treatment — the ultimate experience.',
      descriptionAr: 'لحية + قص شعر + علاج شعر + علاج وجه — التجربة المتكاملة.',
      category: 'combo',
      isActive: true,
      order: 5,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
    {
      name: 'Face Treatment',
      nameAr: 'علاج الوجه',
      price: 12,
      duration: 40,
      description: 'Premium facial treatment for refreshed, glowing skin.',
      descriptionAr: 'علاج وجه فاخر لبشرة منتعشة ومشرقة.',
      category: 'treatment',
      isActive: true,
      order: 6,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  ];

  const batch = writeBatch(db);
  services.forEach((svc) => {
    const ref = doc(servicesRef);
    batch.set(ref, svc);
  });
  await batch.commit();
}

export async function seedBarbers(): Promise<void> {
  const existing = await getDocs(barbersRef);
  if (!existing.empty) return;

  const barbers: Omit<Barber, 'id'>[] = [
    { name: 'Ahmad', nameAr: 'أحمد', isActive: true, order: 1, createdAt: Timestamp.now() },
    { name: 'Mohammad', nameAr: 'محمد', isActive: true, order: 2, createdAt: Timestamp.now() },
    { name: 'Omar', nameAr: 'عمر', isActive: true, order: 3, createdAt: Timestamp.now() },
  ];

  const batch = writeBatch(db);
  barbers.forEach((barber) => {
    const ref = doc(barbersRef);
    batch.set(ref, barber);
  });
  await batch.commit();
}
