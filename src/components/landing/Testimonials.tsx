'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  {
    nameEn: 'Ahmad K.', nameAr: 'أحمد ك.',
    textEn: 'Best barbershop in Jordan. The attention to detail is incredible. My haircut has never looked this good.',
    textAr: 'أفضل صالون حلاقة في الأردن. الاهتمام بالتفاصيل مذهل. لم تبدو قصة شعري بهذا الجمال من قبل.',
    rating: 5,
  },
  {
    nameEn: 'Omar S.', nameAr: 'عمر س.',
    textEn: 'The Master Combo is worth every dinar. Left feeling like a completely new person. Highly recommended!',
    textAr: 'الباقة الاحترافية تستحق كل دينار. خرجت وأنا أشعر بأنني شخص جديد تماماً. أنصح بها بشدة!',
    rating: 5,
  },
  {
    nameEn: 'Khaled M.', nameAr: 'خالد م.',
    textEn: 'Professional service and amazing atmosphere. The booking system makes it so easy. No more waiting!',
    textAr: 'خدمة احترافية وأجواء رائعة. نظام الحجز يجعل الأمر سهلاً جداً. لا مزيد من الانتظار!',
    rating: 5,
  },
  {
    nameEn: 'Yazan R.', nameAr: 'يزن ر.',
    textEn: 'I\'ve been coming here for 2 years now. Consistently excellent quality and the staff is always friendly.',
    textAr: 'أزور هذا المكان منذ سنتين. جودة ممتازة دائماً والموظفون ودودون.',
    rating: 4,
  },
  {
    nameEn: 'Faris A.', nameAr: 'فارس أ.',
    textEn: 'The face treatment was amazing — my skin has never felt this refreshed. Premium experience all around.',
    textAr: 'علاج الوجه كان مذهلاً — بشرتي لم تشعر بهذا الانتعاش من قبل. تجربة فاخرة بالكامل.',
    rating: 5,
  },
];

export default function Testimonials() {
  const { t, lang } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 340;
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section id="testimonials" className="section-padding bg-surface relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-gold text-xs tracking-[0.3em] uppercase font-medium mb-3">
            {t('testimonials.subtitle')}
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
            {t('testimonials.title')}
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-4" />
        </motion.div>

        {/* Scroll Controls */}
        <div className="flex justify-end gap-2 mb-6">
          <button onClick={() => scroll('left')} className="p-2 rounded-lg border border-border hover:border-gold text-text-muted hover:text-gold transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll('right')} className="p-2 rounded-lg border border-border hover:border-gold text-text-muted hover:text-gold transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Cards */}
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto scrollbar-hide pb-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
          {testimonials.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="min-w-[300px] max-w-[320px] flex-shrink-0 card-elevated p-6 snap-start"
            >
              <Quote size={24} className="text-gold/30 mb-4" />
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                {lang === 'ar' ? item.textAr : item.textEn}
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-primary font-semibold text-sm">
                    {lang === 'ar' ? item.nameAr : item.nameEn}
                  </p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < item.rating ? 'text-gold fill-gold' : 'text-border'}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
