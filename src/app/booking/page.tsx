import BookingFlow from '@/components/booking/BookingFlow';

export const metadata = {
  title: 'Book Appointment | AL 7ALLAG',
  description: 'Book your appointment at AL 7ALLAG barbershop. Select a service, choose your time, and confirm in under a minute.',
};

export default function BookingPage() {
  return <BookingFlow />;
}
