import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  const bookingsSnap = await getDocs(collection(db, 'bookings'));
  const bookings = bookingsSnap.docs.map(d => d.data());
  return NextResponse.json({ count: bookings.length, bookings });
}
