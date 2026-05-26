'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Camera, Phone, MessageCircle, MapPin } from 'lucide-react';

export default function Footer() {
  const { t } = useLanguage();

  const workingHours = [
    { day: t('footer.sunday'), hours: '9:00 AM - 9:00 PM' },
    { day: t('footer.monday'), hours: '9:00 AM - 9:00 PM' },
    { day: t('footer.tuesday'), hours: '9:00 AM - 9:00 PM' },
    { day: t('footer.wednesday'), hours: '9:00 AM - 9:00 PM' },
    { day: t('footer.thursday'), hours: '9:00 AM - 9:00 PM' },
    { day: t('footer.friday'), hours: t('footer.closed'), closed: true },
    { day: t('footer.saturday'), hours: '10:00 AM - 10:00 PM' },
  ];

  return (
    <footer className="bg-surface border-t border-gold/20">
      <div className="max-w-6xl mx-auto section-padding !pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-2xl font-bold text-gold mb-4">AL 7ALLAG</h3>
            <p className="text-text-muted text-sm leading-relaxed">{t('footer.tagline')}</p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center text-text-muted hover:text-gold hover:border-gold transition-all">
                <Camera size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center text-text-muted hover:text-gold hover:border-gold transition-all">
                <MessageCircle size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-bg border border-border flex items-center justify-center text-text-muted hover:text-gold hover:border-gold transition-all">
                <Phone size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t('nav.home'), href: '#home' },
                { label: t('nav.services'), href: '#services' },
                { label: t('nav.about'), href: '#about' },
                { label: t('nav.gallery'), href: '#gallery' },
                { label: t('nav.bookNow'), href: '/booking' },
              ].map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-text-muted text-sm hover:text-gold transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Working Hours */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4">{t('footer.workingHours')}</h4>
            <ul className="space-y-2">
              {workingHours.map((wh) => (
                <li key={wh.day} className="flex justify-between text-sm">
                  <span className="text-text-muted">{wh.day}</span>
                  <span className={wh.closed ? 'text-error' : 'text-text-secondary'}>
                    {wh.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-text-primary font-semibold mb-4">{t('footer.contactUs')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <Phone size={16} className="text-gold mt-0.5 shrink-0" />
                <span className="text-text-secondary" dir="ltr">+962 7X XXX XXXX</span>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="text-gold mt-0.5 shrink-0" />
                <span className="text-text-secondary">Amman, Jordan</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-border text-center">
          <p className="text-text-muted text-xs">
            © {new Date().getFullYear()} AL 7ALLAG. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
