'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { useServices } from '@/hooks/useServices';
import { useBarbers } from '@/hooks/useBarbers';
import { getAvailableSlots, createBooking } from '@/lib/firestore';
import { validateJordanianPhone } from '@/lib/utils';
import type { Service, Barber, BookingFormData } from '@/types';
import ServiceSelect from './ServiceSelect';
import DateTimePicker from './DateTimePicker';
import CustomerForm from './CustomerForm';
import BookingConfirmation from './BookingConfirmation';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type BookingStep = 'service' | 'datetime' | 'details' | 'confirmation';

interface BookingState {
  selectedService: Service | null;
  selectedBarber: Barber | null;
  selectedDate: string;
  selectedTime: string;
  customerName: string;
  customerPhone: string;
  bookingId: string;
}

export default function BookingFlow() {
  const { t, lang, dir } = useLanguage();
  const { services, loading: servicesLoading } = useServices();
  const { barbers, loading: barbersLoading } = useBarbers();

  const [step, setStep] = useState<BookingStep>('service');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [state, setState] = useState<BookingState>({
    selectedService: null,
    selectedBarber: null,
    selectedDate: '',
    selectedTime: '',
    customerName: '',
    customerPhone: '',
    bookingId: '',
  });

  const [availableSlots, setAvailableSlots] = useState<
    { time: string; barberIds: string[] }[]
  >([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const steps: BookingStep[] = ['service', 'datetime', 'details', 'confirmation'];
  const currentIndex = steps.indexOf(step);

  const stepLabels = [t('booking.step1'), t('booking.step2'), t('booking.step3')];

  const handleServiceSelect = (service: Service) => {
    setState((prev) => ({ ...prev, selectedService: service, selectedTime: '', selectedDate: '' }));
    setAvailableSlots([]);
  };

  const handleDateSelect = async (date: string) => {
    if (!state.selectedService) return;
    setState((prev) => ({ ...prev, selectedDate: date, selectedTime: '' }));
    setSlotsLoading(true);
    try {
      const slots = await getAvailableSlots(
        date,
        state.selectedService.duration,
        state.selectedBarber?.id
      );
      setAvailableSlots(slots);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setState((prev) => ({ ...prev, selectedTime: time }));
  };

  const handleBarberSelect = (barber: Barber | null) => {
    // If we are in step 3 (details), do NOT wipe out selectedTime or selectedDate
    // because the user has already chosen a valid time slot.
    if (step === 'details') {
      setState((prev) => ({ ...prev, selectedBarber: barber }));
      return;
    }

    setState((prev) => ({ ...prev, selectedBarber: barber, selectedTime: '' }));
    // Re-fetch slots if date is already selected
    if (state.selectedDate && state.selectedService) {
      setSlotsLoading(true);
      getAvailableSlots(
        state.selectedDate,
        state.selectedService.duration,
        barber?.id
      ).then((slots) => {
        setAvailableSlots(slots);
        setSlotsLoading(false);
      }).catch(() => {
        setAvailableSlots([]);
        setSlotsLoading(false);
      });
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex]);
      setError(null);
    }
  };

  const handleBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setStep(steps[prevIndex]);
      setError(null);
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!state.customerName.trim()) {
      setError(t('booking.error.name'));
      return;
    }
    if (!validateJordanianPhone(state.customerPhone)) {
      setError(t('booking.error.phone'));
      return;
    }
    if (!state.selectedService || !state.selectedDate || !state.selectedTime) {
      setError(t('booking.error.generic'));
      return;
    }

    // If no barber selected, pick the first available one for this slot
    let barber = state.selectedBarber;
    if (!barber) {
      const slot = availableSlots.find((s) => s.time === state.selectedTime);
      if (slot && slot.barberIds.length > 0) {
        const availableBarber = barbers.find((b) => b.id === slot.barberIds[0]);
        if (availableBarber) {
          barber = availableBarber;
        } else {
          barber = { id: slot.barberIds[0], name: 'Barber', nameAr: 'حلاق', isActive: true, order: 1, createdAt: null as any };
        }
      }
    }

    if (!barber) {
      setError(t('booking.error.generic') + ' (Barber Mismatch)');
      return;
    }

    setSubmitting(true);
    setError(null);

    const formData: BookingFormData = {
      serviceId: state.selectedService.id,
      barberId: barber.id,
      date: state.selectedDate,
      time: state.selectedTime,
      customerName: state.customerName.trim(),
      customerPhone: state.customerPhone.replace(/\s+/g, ''),
    };

    let result;
    try {
      result = await createBooking(formData, state.selectedService, barber);
    } catch (err: any) {
      console.error('Unhandled booking error:', err);
      setError(t('booking.error.generic') + ' ERROR_CAUGHT: ' + (err.message || JSON.stringify(err)));
      setSubmitting(false);
      return;
    }

    setSubmitting(false);

    if (result.success && result.bookingId) {
      setState((prev) => ({
        ...prev,
        selectedBarber: barber,
        bookingId: result.bookingId!,
      }));
      setStep('confirmation');
    } else {
      if (result.error === 'DOUBLE_BOOKING') {
        setError(t('booking.error.doubleBook'));
        // Refresh available slots
        if (state.selectedDate && state.selectedService) {
          const slots = await getAvailableSlots(
            state.selectedDate,
            state.selectedService.duration,
            barber.id
          );
          setAvailableSlots(slots);
          setState((prev) => ({ ...prev, selectedTime: '' }));
          setStep('datetime');
        }
      } else {
        setError(t('booking.error.generic') + ' RESULT_FAILED: ' + JSON.stringify(result));
      }
    }
  };

  const handleReset = () => {
    setState({
      selectedService: null,
      selectedBarber: null,
      selectedDate: '',
      selectedTime: '',
      customerName: '',
      customerPhone: '',
      bookingId: '',
    });
    setAvailableSlots([]);
    setStep('service');
    setError(null);
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 'service':
        return !!state.selectedService;
      case 'datetime':
        return !!state.selectedDate && !!state.selectedTime;
      case 'details':
        return (
          !!state.customerName.trim() &&
          validateJordanianPhone(state.customerPhone)
        );
      default:
        return false;
    }
  };

  if (servicesLoading || barbersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg" dir={dir}>
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-3">
          AL 7ALLAG
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-3">
          {t('booking.title')}
        </h1>
        <p className="text-text-muted max-w-md mx-auto">
          {t('booking.subtitle')}
        </p>
      </div>

      {/* Progress Steps */}
      {step !== 'confirmation' && (
        <div className="max-w-lg mx-auto px-6 mb-10">
          <div className="flex items-center justify-between relative">
            {/* Progress bar background */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
            {/* Progress bar fill */}
            <div
              className="absolute top-4 left-0 h-0.5 bg-gold transition-all duration-500"
              style={{ width: `${(currentIndex / 2) * 100}%` }}
            />
            {stepLabels.map((label, index) => (
              <div key={label} className="relative flex flex-col items-center z-10">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    index <= currentIndex
                      ? 'bg-gold text-bg'
                      : 'bg-surface-elevated text-text-muted border border-border'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`text-xs mt-2 whitespace-nowrap ${
                    index <= currentIndex ? 'text-gold' : 'text-text-muted'
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="max-w-4xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 'service' && (
              <ServiceSelect
                services={services}
                selectedService={state.selectedService}
                onSelect={handleServiceSelect}
                lang={lang}
              />
            )}

            {step === 'datetime' && state.selectedService && (
              <DateTimePicker
                selectedDate={state.selectedDate}
                selectedTime={state.selectedTime}
                availableSlots={availableSlots}
                slotsLoading={slotsLoading}
                onDateSelect={handleDateSelect}
                onTimeSelect={handleTimeSelect}
                lang={lang}
              />
            )}

            {step === 'details' && (() => {
              const currentSlot = availableSlots.find(s => s.time === state.selectedTime);
              const availableBarbersForSlot = currentSlot 
                ? barbers.filter(b => currentSlot.barberIds.includes(b.id))
                : barbers;
                
              return (
                <CustomerForm
                  name={state.customerName}
                  phone={state.customerPhone}
                  barbers={availableBarbersForSlot}
                  selectedBarber={state.selectedBarber}
                  onNameChange={(name) =>
                    setState((prev) => ({ ...prev, customerName: name }))
                  }
                  onPhoneChange={(phone) =>
                    setState((prev) => ({ ...prev, customerPhone: phone }))
                  }
                  onBarberSelect={handleBarberSelect}
                  lang={lang}
                />
              );
            })()}

            {step === 'confirmation' && (
              <BookingConfirmation
                service={state.selectedService!}
                barber={state.selectedBarber!}
                date={state.selectedDate}
                time={state.selectedTime}
                customerName={state.customerName}
                bookingId={state.bookingId}
                onReset={handleReset}
                lang={lang}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto mt-4 p-4 bg-error/10 border border-error/30 rounded-lg text-error text-sm text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Navigation Buttons */}
        {step !== 'confirmation' && (
          <div className="max-w-lg mx-auto mt-8 flex items-center justify-between gap-4">
            {currentIndex > 0 ? (
              <button onClick={handleBack} className="btn-outline flex items-center gap-2">
                {dir === 'rtl' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
                {t('booking.back')}
              </button>
            ) : (
              <div />
            )}

            {step === 'details' ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                className="btn-gold flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                    {t('booking.processing')}
                  </>
                ) : (
                  t('booking.confirm')
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn-gold flex items-center gap-2"
              >
                {t('booking.next')}
                {dir === 'rtl' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
