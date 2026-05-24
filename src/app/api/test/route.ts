import { NextResponse } from 'next/server';
import { getAvailableSlots, createBooking } from '@/lib/firestore';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import type { Service, Barber, BookingFormData } from '@/types';

export async function GET() {
  try {
    const logs: string[] = [];
    logs.push("Starting test...");

    // 1. Fetch a service
    const servicesSnap = await getDocs(collection(db, 'services'));
    const service = servicesSnap.docs[0]?.data() as Service;
    if (!service) throw new Error("No services found");
    service.id = servicesSnap.docs[0].id;
    logs.push(`Found service: ${service.name}`);

    // 2. Fetch a barber
    const barbersSnap = await getDocs(collection(db, 'barbers'));
    const barber = barbersSnap.docs[0]?.data() as Barber;
    if (!barber) throw new Error("No barbers found");
    barber.id = barbersSnap.docs[0].id;
    logs.push(`Found barber: ${barber.name}`);

    // 3. Test getAvailableSlots
    const today = new Date();
    today.setDate(today.getDate() + 1); // Tomorrow
    const dateStr = today.toISOString().split('T')[0];
    
    const slots = await getAvailableSlots(dateStr, service.duration);
    logs.push(`Slots available for ${dateStr}: ${slots.length}`);
    if (slots.length === 0) {
       logs.push("No slots! Cannot test booking.");
       return NextResponse.json({ success: false, logs });
    }

    // 4. Test createBooking
    const formData: BookingFormData = {
      serviceId: service.id,
      barberId: barber.id,
      date: dateStr,
      time: slots[0].time,
      customerName: "Test User",
      customerPhone: "0791234567"
    };

    logs.push(`Attempting to book at ${slots[0].time}`);
    const result = await createBooking(formData, service, barber);
    logs.push(`Booking result: ${JSON.stringify(result)}`);

    return NextResponse.json({ success: true, logs, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, stack: error.stack });
  }
}
