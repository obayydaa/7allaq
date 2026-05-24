'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Menu, X, Globe } from 'lucide-react';

const navLinks = [
  { key: 'nav.home', href: '#home' },
  { key: 'nav.services', href: '#services' },
  { key: 'nav.about', href: '#about' },
  { key: 'nav.gallery', href: '#gallery' },
  { key: 'nav.testimonials', href: '#testimonials' },
] as const;

export default function Navbar() {
  const { t, lang, setLang } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLang = () => setLang(lang === 'en' ? 'ar' : 'en');

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg/95 backdrop-blur-md border-b border-border shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="font-display text-xl lg:text-2xl font-bold text-gold tracking-wide">
            AL 7ALLAG
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                className="text-sm text-text-secondary hover:text-gold transition-colors duration-200 font-medium"
              >
                {t(link.key)}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-sm text-text-muted hover:text-gold transition-colors px-3 py-1.5 rounded-lg border border-border hover:border-gold/30"
            >
              <Globe size={14} />
              {t('common.language')}
            </button>
            <Link href="/booking" className="btn-gold text-sm !px-6 !py-2.5">
              {t('nav.bookNow')}
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-text-primary p-2"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-surface border-t border-border animate-slide-down">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block text-text-secondary hover:text-gold transition-colors py-2 text-lg"
              >
                {t(link.key)}
              </a>
            ))}
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <button onClick={toggleLang} className="btn-outline text-sm w-full flex items-center justify-center gap-2">
                <Globe size={14} /> {t('common.language')}
              </button>
              <Link href="/booking" onClick={() => setMobileOpen(false)} className="btn-gold text-center">
                {t('nav.bookNow')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
