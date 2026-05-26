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

const servicesRef = collection(db, 'services');

export async function GET() {
  try {
    const q = query(servicesRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const services = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return NextResponse.json({ services });
  } catch (error) {
    console.error('GET /api/services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameAr, price, duration, description, descriptionAr, category, isActive, order } = body;

    if (!name || !price || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const docRef = await addDoc(servicesRef, {
      name,
      nameAr: nameAr || '',
      price: Number(price),
      duration: Number(duration),
      description: description || '',
      descriptionAr: descriptionAr || '',
      category: category || 'haircut',
      isActive: isActive !== false,
      order: order || 99,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/services error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing service id' }, { status: 400 });
    }

    await updateDoc(doc(db, 'services', id), {
      ...data,
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/services error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing service id' }, { status: 400 });
    }

    await deleteDoc(doc(db, 'services', id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/services error:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}
