import { BookingForm } from '@/components/scheduling/BookingForm';

export default function PatientBookingPage({ params }: { params: { clinicId: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <BookingForm clinicId={params.clinicId} />
    </div>
  );
}
