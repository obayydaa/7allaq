'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, Scissors, User, ArrowLeft, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatTime } from '@/lib/utils';
import type { Service, Barber, Language } from '@/types';

interface BookingConfirmationProps {
  service: Service;
  barber: Barber;
  date: string;
  time: string;
  customerName: string;
  bookingId: string;
  onReset: () => void;
  lang: Language;
}

export default function BookingConfirmation({
  service,
  barber,
  date,
  time,
  customerName,
  bookingId,
  onReset,
  lang,
}: BookingConfirmationProps) {
  const labels = {
    title: lang === 'ar' ? 'تم تأكيد الحجز!' : 'Booking Confirmed!',
    message: lang === 'ar' ? 'تم حجز موعدك بنجاح.' : 'Your appointment has been booked successfully.',
    details: lang === 'ar' ? 'تفاصيل الحجز' : 'Booking Details',
    service: lang === 'ar' ? 'الخدمة' : 'Service',
    barber: lang === 'ar' ? 'الحلّاق' : 'Barber',
    date: lang === 'ar' ? 'التاريخ' : 'Date',
    time: lang === 'ar' ? 'الوقت' : 'Time',
    price: lang === 'ar' ? 'السعر' : 'Price',
    status: lang === 'ar' ? 'الحالة' : 'Status',
    pending: lang === 'ar' ? 'بانتظار التأكيد' : 'Pending Confirmation',
    home: lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home',
    another: lang === 'ar' ? 'حجز آخر' : 'Book Another',
    bookingRef: lang === 'ar' ? 'رقم الحجز' : 'Booking Ref',
  };

  const serviceName = lang === 'ar' ? service.nameAr : service.name;
  const barberName = lang === 'ar' ? barber.nameAr : barber.name;

  return (
    <div className="max-w-md mx-auto text-center">
      {/* Success Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="w-20 h-20 mx-auto mb-6 relative"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4 }}
          className="absolute inset-0 bg-gold/20 rounded-full animate-pulse-gold"
        />
        <div className="relative w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center border-2 border-gold">
          <CheckCircle size={40} className="text-gold" />
        </div>
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-display text-2xl md:text-3xl font-bold text-text-primary mb-2"
      >
        {labels.title}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-text-muted mb-8"
      >
        {labels.message}
      </motion.p>

      {/* Booking Details Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card-elevated p-6 text-left mb-8"
      >
        <h3 className="text-sm text-text-muted uppercase tracking-wider mb-4">
          {labels.details}
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scissors size={16} className="text-gold" />
              <span className="text-text-muted text-sm">{labels.service}</span>
            </div>
            <span className="text-text-primary font-medium">{serviceName}</span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User size={16} className="text-gold" />
              <span className="text-text-muted text-sm">{labels.barber}</span>
            </div>
            <span className="text-text-primary font-medium">{barberName}</span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-gold" />
              <span className="text-text-muted text-sm">{labels.date}</span>
            </div>
            <span className="text-text-primary font-medium">
              {formatDate(date, lang)}
            </span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-gold" />
              <span className="text-text-muted text-sm">{labels.time}</span>
            </div>
            <span className="text-text-primary font-medium">{formatTime(time)}</span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-text-muted text-sm">{labels.price}</span>
            <span className="text-gold font-bold text-lg">
              {service.price} {lang === 'ar' ? 'دينار' : 'JD'}
            </span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between">
            <span className="text-text-muted text-sm">{labels.status}</span>
            <span className="status-badge text-yellow-400 bg-yellow-400/10 border-yellow-400/30">
              {labels.pending}
            </span>
          </div>
        </div>

        {/* Booking Reference */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-text-muted">
            {labels.bookingRef}: <span className="text-text-secondary font-mono">{bookingId.slice(0, 8).toUpperCase()}</span>
          </p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-3 justify-center"
      >
        <Link href="/" className="btn-outline flex items-center justify-center gap-2">
          <ArrowLeft size={18} />
          {labels.home}
        </Link>
        <button onClick={onReset} className="btn-gold flex items-center justify-center gap-2">
          <RotateCcw size={18} />
          {labels.another}
        </button>
      </motion.div>
    </div>
  );
}
