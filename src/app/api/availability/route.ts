import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';
import { generateTimeSlots, doesSlotOverlap } from '@/lib/utils';

const availabilityRef = collection(db, 'availability');
const bookingsRef = collection(db, 'bookings');
const blockedSlotsRef = collection(db, 'blockedSlots');
const barbersRef = collection(db, 'barbers');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const serviceId = searchParams.get('serviceId');
    const serviceDuration = searchParams.get('duration');
    const barberId = searchParams.get('barberId');

    // If date + duration provided, return available slots
    if (date && serviceDuration) {
      const dayOfWeek = new Date(date).getDay();
      const duration = parseInt(serviceDuration);

      // Get availability for this day
      const availQ = query(availabilityRef, where('dayOfWeek', '==', dayOfWeek));
      const availSnap = await getDocs(availQ);

      if (availSnap.empty) {
        return NextResponse.json({ slots: [], closed: true });
      }

      const avail = availSnap.docs[0].data();
      if (!avail.isActive) {
        return NextResponse.json({ slots: [], closed: true });
      }

      // Generate all possible slots
      const allSlots = generateTimeSlots(avail.startTime, avail.endTime, avail.slotDuration || 30);

      // Get existing bookings
      const bookingsQ = query(
        bookingsRef,
        where('date', '==', date),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const bookingsSnap = await getDocs(bookingsQ);
      const existingBookings = bookingsSnap.docs.map((d) => d.data());

      // Get blocked slots
      const blockedQ = query(blockedSlotsRef, where('date', '==', date));
      const blockedSnap = await getDocs(blockedQ);
      const blocked = blockedSnap.docs.map((d) => d.data());

      // Get barbers
      const barbersQ = query(barbersRef, where('isActive', '==', true));
      const barbersSnap = await getDocs(barbersQ);
      const allBarbers = barbersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const targetBarbers = barberId
        ? allBarbers.filter((b) => b.id === barberId)
        : allBarbers;

      // Build available slots
      const slots = allSlots
        .map((time) => {
          const availableBarberIds = targetBarbers
            .filter((barber) => {
              const hasConflict = existingBookings.some(
                (b) =>
                  b.barberId === barber.id &&
                  doesSlotOverlap(time, duration, b.time as string, b.duration as number)
              );
              const isBlocked = blocked.some(
                (bs) => bs.time === time && (!bs.barberId || bs.barberId === barber.id)
              );
              return !hasConflict && !isBlocked;
            })
            .map((b) => b.id);

          return { time, barberIds: availableBarberIds };
        })
        .filter((slot) => slot.barberIds.length > 0);

      return NextResponse.json({ slots, closed: false });
    }

    // Otherwise, return weekly availability config
    const q = query(availabilityRef, orderBy('dayOfWeek', 'asc'));
    const snapshot = await getDocs(q);
    const availability = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ availability });
  } catch (error) {
    console.error('GET /api/availability error:', error);
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing availability id' }, { status: 400 });
    }

    await updateDoc(doc(db, 'availability', id), data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/availability error:', error);
    return NextResponse.json({ error: 'Failed to update availability' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'block') {
      const { date, time, barberId, reason } = body;
      if (!date || !time) {
        return NextResponse.json({ error: 'Missing date or time' }, { status: 400 });
      }

      const docRef = await addDoc(blockedSlotsRef, {
        date,
        time,
        barberId: barberId || null,
        reason: reason || '',
        createdAt: Timestamp.now(),
      });

      return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
    }

    if (action === 'unblock') {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ error: 'Missing blocked slot id' }, { status: 400 });
      }
      await deleteDoc(doc(db, 'blockedSlots', id));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/availability error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
