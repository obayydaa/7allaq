'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { Clock, Loader2 } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import type { Language } from '@/types';

interface DateTimePickerProps {
  selectedDate: string;
  selectedTime: string;
  availableSlots: { time: string; barberIds: string[] }[];
  slotsLoading: boolean;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  lang: Language;
}

export default function DateTimePicker({
  selectedDate,
  selectedTime,
  availableSlots,
  slotsLoading,
  onDateSelect,
  onTimeSelect,
  lang,
}: DateTimePickerProps) {
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 30);

  const selectedDayObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : undefined;

  const handleDaySelect = (day: Date | undefined) => {
    if (!day) return;
    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');
    onDateSelect(`${year}-${month}-${date}`);
  };

  // Group slots by morning/afternoon/evening
  const groupedSlots = useMemo(() => {
    const morning: typeof availableSlots = [];
    const afternoon: typeof availableSlots = [];
    const evening: typeof availableSlots = [];

    availableSlots.forEach((slot) => {
      const hour = parseInt(slot.time.split(':')[0]);
      if (hour < 12) morning.push(slot);
      else if (hour < 17) afternoon.push(slot);
      else evening.push(slot);
    });

    return { morning, afternoon, evening };
  }, [availableSlots]);

  const periodLabels = lang === 'ar'
    ? { morning: 'صباحاً', afternoon: 'ظهراً', evening: 'مساءً' }
    : { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Calendar */}
        <div className="flex justify-center">
          <div className="card-elevated p-4 inline-block">
            <DayPicker
              mode="single"
              selected={selectedDayObj}
              onSelect={handleDaySelect}
              disabled={[
                { before: today },
                { after: maxDate },
              ]}
              classNames={{
                root: 'text-text-primary',
                month_caption: 'font-display text-lg text-text-primary mb-2',
                weekday: 'text-text-muted text-xs font-medium w-10',
                day: 'text-text-secondary rounded-lg w-10 h-10 text-sm hover:bg-surface-hover transition-colors',
                day_button: 'w-full h-full flex items-center justify-center rounded-lg cursor-pointer',
                selected: 'bg-gold text-bg font-bold',
                today: 'font-bold text-gold',
                disabled: 'opacity-30 cursor-not-allowed',
                nav: 'flex items-center justify-between mb-2',
                button_next: 'text-gold hover:text-gold-light p-1 cursor-pointer',
                button_previous: 'text-gold hover:text-gold-light p-1 cursor-pointer',
                chevron: 'fill-gold w-5 h-5',
              }}
            />
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-gold" />
            <h3 className="font-display text-lg text-text-primary">
              {lang === 'ar' ? 'اختر الوقت' : 'Select Time'}
            </h3>
          </div>

          {!selectedDate ? (
            <div className="card-elevated p-8 text-center">
              <p className="text-text-muted text-sm">
                {lang === 'ar' ? 'اختر تاريخاً أولاً' : 'Select a date first'}
              </p>
            </div>
          ) : slotsLoading ? (
            <div className="card-elevated p-8 flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin text-gold" />
              <p className="text-text-muted text-sm">
                {lang === 'ar' ? 'جاري التحميل...' : 'Loading slots...'}
              </p>
            </div>
          ) : availableSlots.length === 0 ? (
            <div className="card-elevated p-8 text-center">
              <p className="text-text-muted text-sm">
                {lang === 'ar' ? 'لا توجد مواعيد متاحة' : 'No available slots for this date'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
              {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                const slots = groupedSlots[period];
                if (slots.length === 0) return null;

                return (
                  <div key={period}>
                    <p className="text-xs text-text-muted uppercase tracking-wider mb-2">
                      {periodLabels[period]}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot, i) => (
                        <motion.button
                          key={slot.time}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          onClick={() => onTimeSelect(slot.time)}
                          className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                            selectedTime === slot.time
                              ? 'bg-gold text-bg font-bold shadow-lg shadow-gold/20'
                              : 'bg-surface border border-border hover:border-gold/50 text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {formatTime(slot.time)}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
