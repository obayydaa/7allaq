'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Scissors, Sparkles } from 'lucide-react';
import type { Service } from '@/types';
import type { Language } from '@/types';

interface ServiceSelectProps {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
  lang: Language;
}

const categoryIcons: Record<string, React.ReactNode> = {
  haircut: <Scissors size={20} />,
  beard: <Scissors size={20} className="rotate-45" />,
  combo: <Sparkles size={20} />,
  treatment: <Sparkles size={20} />,
};

export default function ServiceSelect({
  services,
  selectedService,
  onSelect,
  lang,
}: ServiceSelectProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((service, index) => {
          const isSelected = selectedService?.id === service.id;
          const name = lang === 'ar' ? service.nameAr : service.name;
          const desc = lang === 'ar' ? service.descriptionAr : service.description;

          return (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={() => onSelect(service)}
              className={`relative text-left p-5 rounded-xl border transition-all duration-300 cursor-pointer group ${
                isSelected
                  ? 'bg-gold/10 border-gold shadow-lg shadow-gold/10'
                  : 'bg-surface border-border hover:border-gold/50 hover:bg-surface-elevated'
              }`}
            >
              {/* Selected indicator */}
              {isSelected && (
                <motion.div
                  layoutId="selected-service"
                  className="absolute top-3 right-3 w-6 h-6 bg-gold rounded-full flex items-center justify-center"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7L6 10L11 4"
                      stroke="#0A0A0A"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Category icon */}
              <div
                className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 transition-colors ${
                  isSelected
                    ? 'bg-gold/20 text-gold'
                    : 'bg-surface-elevated text-text-muted group-hover:text-gold'
                }`}
              >
                {categoryIcons[service.category] || <Scissors size={20} />}
              </div>

              {/* Service name */}
              <h3
                className={`font-display text-lg font-semibold mb-1 ${
                  isSelected ? 'text-gold' : 'text-text-primary'
                }`}
              >
                {name}
              </h3>

              {/* Description */}
              <p className="text-text-muted text-sm mb-4 line-clamp-2">{desc}</p>

              {/* Price & Duration */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xl font-bold ${
                    isSelected ? 'text-gold-light' : 'text-gold'
                  }`}
                >
                  {service.price}{' '}
                  <span className="text-xs font-normal text-text-muted">
                    {lang === 'ar' ? 'دينار' : 'JD'}
                  </span>
                </span>
                <span className="text-sm text-text-muted">
                  {service.duration} {lang === 'ar' ? 'دقيقة' : 'min'}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
