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
  Timestamp,
  runTransaction,
  addDoc,
} from 'firebase/firestore';
import { doesSlotOverlap } from '@/lib/utils';

const bookingsRef = collection(db, 'bookings');
const servicesRef = collection(db, 'services');
const barbersRef = collection(db, 'barbers');
const blockedSlotsRef = collection(db, 'blockedSlots');

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const status = searchParams.get('status');

    let q;
    let bookings: any[] = [];
    
    if (date) {
      q = query(bookingsRef, where('date', '==', date));
      const snapshot = await getDocs(q);
      bookings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      if (status) {
        bookings = bookings.filter(b => b.status === status);
      }
      bookings.sort((a, b) => a.time.localeCompare(b.time));
    } else {
      const snapshot = await getDocs(bookingsRef);
      bookings = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      if (status) {
        bookings = bookings.filter(b => b.status === status);
      }
      bookings.sort((a, b) => {
        const dateComp = b.date.localeCompare(a.date);
        if (dateComp !== 0) return dateComp;
        return a.time.localeCompare(b.time);
      });
    }

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('GET /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, barberId, date, time, customerName, customerPhone } = body;

    // Validate required fields
    if (!serviceId || !barberId || !date || !time || !customerName || !customerPhone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate phone (Jordanian format)
    const cleanPhone = customerPhone.replace(/\s+/g, '');
    if (!/^07\d{8}$/.test(cleanPhone)) {
      return NextResponse.json({ error: 'Invalid phone format' }, { status: 400 });
    }

    // Get service details
    const serviceSnap = await getDocs(
      query(servicesRef, where('__name__', '==', serviceId))
    );
    if (serviceSnap.empty) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    const service: Record<string, any> = { id: serviceSnap.docs[0].id, ...serviceSnap.docs[0].data() };

    // Get barber details
    const barberSnap = await getDocs(
      query(barbersRef, where('__name__', '==', barberId))
    );
    if (barberSnap.empty) {
      return NextResponse.json({ error: 'Barber not found' }, { status: 404 });
    }
    const barber: Record<string, any> = { id: barberSnap.docs[0].id, ...barberSnap.docs[0].data() };

    // Double-booking prevention with transaction
    const bookingId = await runTransaction(db, async (transaction) => {
      // Check existing bookings
      const conflictQ = query(bookingsRef, where('date', '==', date));
      const conflictSnap = await getDocs(conflictQ);
      const conflicts = conflictSnap.docs
        .map((d) => d.data())
        .filter((b: any) => b.barberId === barberId && ['pending', 'confirmed'].includes(b.status));

      const hasConflict = conflicts.some((existing: any) =>
        doesSlotOverlap(
          time,
          service.duration,
          existing.time,
          existing.duration
        )
      );

      if (hasConflict) {
        throw new Error('DOUBLE_BOOKING');
      }

      // Check blocked slots
      const blockedQ = query(blockedSlotsRef, where('date', '==', date));
      const blockedSnap = await getDocs(blockedQ);
      const isBlocked = blockedSnap.docs.some((d) => {
        const bs = d.data();
        return bs.time === time && (!bs.barberId || bs.barberId === barberId);
      });

      if (isBlocked) {
        throw new Error('SLOT_BLOCKED');
      }

      const newRef = doc(bookingsRef);
      transaction.set(newRef, {
        serviceId: service.id,
        serviceName: service.name,
        serviceNameAr: service.nameAr,
        barberId: barber.id,
        barberName: barber.name,
        barberNameAr: barber.nameAr,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        date,
        time,
        duration: service.duration,
        price: service.price,
        status: 'pending',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      return newRef.id;
    });

    return NextResponse.json({ success: true, bookingId }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'DOUBLE_BOOKING') {
        return NextResponse.json(
          { error: 'This time slot has already been booked' },
          { status: 409 }
        );
      }
      if (error.message === 'SLOT_BLOCKED') {
        return NextResponse.json(
          { error: 'This time slot is blocked' },
          { status: 409 }
        );
      }
    }
    console.error('POST /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await updateDoc(doc(db, 'bookings', id), {
      status,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/bookings error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}
