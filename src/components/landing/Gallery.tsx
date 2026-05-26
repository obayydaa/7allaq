'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';

const galleryItems = [
  { gradient: 'from-amber-900/40 via-stone-900 to-zinc-900', span: 'col-span-2 row-span-2' },
  { gradient: 'from-zinc-800 via-stone-800 to-amber-900/30', span: 'col-span-1 row-span-1' },
  { gradient: 'from-stone-900 via-amber-900/20 to-zinc-800', span: 'col-span-1 row-span-1' },
  { gradient: 'from-amber-900/30 via-zinc-900 to-stone-900', span: 'col-span-1 row-span-2' },
  { gradient: 'from-zinc-900 via-amber-900/30 to-stone-800', span: 'col-span-1 row-span-1' },
  { gradient: 'from-stone-800 via-zinc-900 to-amber-900/20', span: 'col-span-1 row-span-1' },
];

const overlayTexts = [
  'Precision Cuts', 'Beard Art', 'Premium Style',
  'Classic Grooming', 'Modern Fade', 'Hot Towel',
];
const overlayTextsAr = [
  'قصات دقيقة', 'فن اللحية', 'أسلوب فاخر',
  'حلاقة كلاسيكية', 'فيد عصري', 'منشفة ساخنة',
];

export default function Gallery() {
  const { t, lang } = useLanguage();

  return (
    <section id="gallery" className="section-padding bg-bg">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
            {t('gallery.subtitle')}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
            {t('gallery.title')}
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4" />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 auto-rows-[200px] md:auto-rows-[220px] gap-3">
          {galleryItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className={`${item.span} relative rounded-xl overflow-hidden cursor-pointer group`}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient}`} />

              {/* Pattern overlay */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(201,168,76,0.3) 1px, transparent 0)',
                backgroundSize: '20px 20px',
              }} />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/10 transition-all duration-500" />

              {/* Text on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="font-display text-xl font-bold text-gold">
                    {lang === 'ar' ? overlayTextsAr[index] : overlayTexts[index]}
                  </p>
                </div>
              </div>

              {/* Border on hover */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/30 rounded-xl transition-all duration-300" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
