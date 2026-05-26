import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

const barbersRef = collection(db, 'barbers');

export async function GET() {
  try {
    const q = query(barbersRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const barbers = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ barbers });
  } catch (error) {
    console.error('GET /api/barbers error:', error);
    return NextResponse.json({ error: 'Failed to fetch barbers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameAr, isActive, order } = body;

    if (!name) {
      return NextResponse.json({ error: 'Missing barber name' }, { status: 400 });
    }

    const docRef = await addDoc(barbersRef, {
      name,
      nameAr: nameAr || '',
      isActive: isActive !== false,
      order: order || 99,
      createdAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/barbers error:', error);
    return NextResponse.json({ error: 'Failed to create barber' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing barber id' }, { status: 400 });
    }

    await updateDoc(doc(db, 'barbers', id), data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/barbers error:', error);
    return NextResponse.json({ error: 'Failed to update barber' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing barber id' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'barbers', id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/barbers error:', error);
    return NextResponse.json({ error: 'Failed to delete barber' }, { status: 500 });
  }
}
