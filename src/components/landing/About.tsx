'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { Award, Users, Star } from 'lucide-react';

export default function About() {
  const { t } = useLanguage();

  const stats = [
    { icon: Award, value: '10+', label: t('about.experience') },
    { icon: Users, value: '5000+', label: t('about.clients') },
    { icon: Star, value: '4.9', label: t('about.rating') },
  ];

  return (
    <section id="about" className="section-padding bg-surface relative overflow-hidden">
      {/* Subtle gold gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-surface-elevated via-border to-surface-elevated relative">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(201,168,76,0.1) 10px, rgba(201,168,76,0.1) 11px)`,
              }} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-2 border-gold/30 flex items-center justify-center mx-auto mb-4">
                    <span className="font-display text-4xl font-bold text-gold">7</span>
                  </div>
                  <p className="font-display text-xl text-gold/60 italic">AL 7ALLAG</p>
                </div>
              </div>
            </div>
            {/* Gold accent corner */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-2 border-gold/30 rounded-xl -z-10" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
              {t('about.subtitle')}
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary mb-6">
              {t('about.title')}
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-gold to-transparent mb-6" />

            <p className="text-text-secondary leading-relaxed mb-4">{t('about.p1')}</p>
            <p className="text-text-secondary leading-relaxed mb-8">{t('about.p2')}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="text-center p-4 rounded-xl bg-bg border border-border"
                >
                  <stat.icon size={20} className="text-gold mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gold mb-1">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
