'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Scissors, Sparkles, Clock, ArrowRight } from 'lucide-react';

const services = [
  { nameKey: 'service.classicHaircut', price: 7, duration: 30, category: 'haircut', descKey: '' },
  { nameKey: 'service.haircutAndBeard', price: 10, duration: 45, category: 'combo', descKey: '' },
  { nameKey: 'service.beardOnly', price: 4, duration: 20, category: 'beard', descKey: '' },
  { nameKey: 'service.masterCombo', price: 15, duration: 60, category: 'combo', descKey: 'service.masterComboDesc' },
  { nameKey: 'service.ultimateCombo', price: 25, duration: 90, category: 'combo', descKey: 'service.ultimateComboDesc' },
  { nameKey: 'service.faceTreatment', price: 12, duration: 40, category: 'treatment', descKey: '' },
];

const categoryIcons: Record<string, React.ReactNode> = {
  haircut: <Scissors size={20} />,
  beard: <Scissors size={20} className="rotate-45" />,
  combo: <Sparkles size={20} />,
  treatment: <Sparkles size={20} />,
};

export default function Services() {
  const { t } = useLanguage();

  return (
    <section id="services" className="section-padding bg-bg relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
            {t('services.subtitle')}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
            {t('services.title')}
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => (
            <motion.div
              key={service.nameKey}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card-surface p-6 group"
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center text-text-muted group-hover:text-gold group-hover:bg-gold/10 transition-all duration-300 mb-4">
                {categoryIcons[service.category]}
              </div>

              {/* Name */}
              <h3 className="font-display text-lg font-semibold text-text-primary group-hover:text-gold transition-colors mb-2">
                {t(service.nameKey as any)}
              </h3>

              {/* Description */}
              {service.descKey && (
                <p className="text-text-muted text-sm mb-3">{t(service.descKey as any)}</p>
              )}

              {/* Price & Duration */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                <span className="text-2xl font-bold text-gold">
                  {service.price}
                  <span className="text-xs text-text-muted font-normal ml-1">{t('services.currency')}</span>
                </span>
                <div className="flex items-center gap-1 text-text-muted text-sm">
                  <Clock size={14} />
                  {service.duration} {t('services.duration')}
                </div>
              </div>

              {/* Book Link */}
              <Link
                href="/booking"
                className="mt-4 flex items-center justify-center gap-2 text-sm text-gold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:text-gold-light"
              >
                {t('services.bookThis')} <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
