import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
  const snap = await getDocs(collection(db, 'blockedSlots'));
  const docs = snap.docs.map(d => d.data());
  return NextResponse.json({ count: docs.length, docs });
}
