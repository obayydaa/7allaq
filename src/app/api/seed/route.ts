import { NextResponse } from 'next/server';
import { seedServices, seedBarbers, initializeAvailability } from '@/lib/firestore';

export async function GET() {
  try {
    await seedServices();
    await seedBarbers();
    await initializeAvailability();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database seeded successfully with services, barbers, and availability.' 
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Unknown error occurred during seeding.' 
    }, { status: 500 });
  }
}
