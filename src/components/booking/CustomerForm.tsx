'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, UserCheck } from 'lucide-react';
import type { Barber, Language } from '@/types';
import { validateJordanianPhone } from '@/lib/utils';

interface CustomerFormProps {
  name: string;
  phone: string;
  barbers: Barber[];
  selectedBarber: Barber | null;
  onNameChange: (name: string) => void;
  onPhoneChange: (phone: string) => void;
  onBarberSelect: (barber: Barber | null) => void;
  lang: Language;
}

export default function CustomerForm({
  name,
  phone,
  barbers,
  selectedBarber,
  onNameChange,
  onPhoneChange,
  onBarberSelect,
  lang,
}: CustomerFormProps) {
  const isPhoneValid = phone.length === 0 || validateJordanianPhone(phone);

  const labels = {
    name: lang === 'ar' ? 'اسمك' : 'Your Name',
    namePlaceholder: lang === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name',
    phone: lang === 'ar' ? 'رقم الهاتف' : 'Phone Number',
    phonePlaceholder: '07XX XXX XXXX',
    phoneHint: lang === 'ar' ? 'صيغة أردنية: يبدأ بـ 07' : 'Jordanian format: starts with 07',
    barber: lang === 'ar' ? 'اختر الحلّاق' : 'Choose Your Barber',
    anyBarber: lang === 'ar' ? 'أي حلّاق متاح' : 'Any Available Barber',
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Barber Selection */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0 }}
      >
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-3">
          <UserCheck size={16} className="text-gold" />
          {labels.barber}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Any barber option */}
          <button
            onClick={() => onBarberSelect(null)}
            className={`p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
              !selectedBarber
                ? 'bg-gold/10 border-gold text-gold'
                : 'bg-surface border-border text-text-secondary hover:border-gold/50'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-surface-elevated mx-auto mb-2 flex items-center justify-center">
              <User size={18} className={!selectedBarber ? 'text-gold' : 'text-text-muted'} />
            </div>
            <span className="text-sm font-medium">{labels.anyBarber}</span>
          </button>

          {/* Individual barbers */}
          {barbers.map((barber) => {
            const isSelected = selectedBarber?.id === barber.id;
            const displayName = lang === 'ar' ? barber.nameAr : barber.name;

            return (
              <button
                key={barber.id}
                onClick={() => onBarberSelect(barber)}
                className={`p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-gold/10 border-gold text-gold'
                    : 'bg-surface border-border text-text-secondary hover:border-gold/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-surface-elevated mx-auto mb-2 flex items-center justify-center">
                  <span className={`text-lg font-display font-bold ${isSelected ? 'text-gold' : 'text-text-muted'}`}>
                    {displayName.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium">{displayName}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Name Field */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
          <User size={16} className="text-gold" />
          {labels.name}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={labels.namePlaceholder}
          className="input-dark"
          autoComplete="name"
        />
      </motion.div>

      {/* Phone Field */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-2">
          <Phone size={16} className="text-gold" />
          {labels.phone}
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => {
            const val = e.target.value.replace(/[^\d\s]/g, '');
            onPhoneChange(val);
          }}
          placeholder={labels.phonePlaceholder}
          className={`input-dark ${
            !isPhoneValid ? 'border-error focus:border-error focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]' : ''
          }`}
          autoComplete="tel"
          maxLength={13}
          dir="ltr"
        />
        <p className={`mt-1.5 text-xs ${!isPhoneValid ? 'text-error' : 'text-text-muted'}`}>
          {labels.phoneHint}
        </p>
      </motion.div>
    </div>
  );
}
