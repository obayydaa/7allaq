'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getBookings, updateBookingStatus, deleteBooking, updateBookingDetails, getBarbers, getServices } from '@/lib/firestore';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils';
import type { Booking, BookingStatus, Barber, Service } from '@/types';
import { RefreshCw, Loader2, CalendarDays, MessageCircle, Search, MoreVertical, Edit2, Trash2, X, Globe, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

const statuses: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function AdminBookingsPage() {
  const { t, lang, setLang, dir } = useLanguage();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Search
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [barberFilter, setBarberFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [updating, setUpdating] = useState<string | null>(null);
  
  // Modals / Actions
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);

  // Stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === todayStr);
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const estimatedRevenue = todayBookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((acc, curr) => acc + curr.price, 0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookingsData, barbersData, servicesData] = await Promise.all([
        getBookings(),
        getBarbers(),
        getServices()
      ]);
      setBookings(bookingsData);
      setBarbers(barbersData);
      setServices(servicesData);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.action-menu-container')) return;
      setShowDropdown(null);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    setUpdating(id);
    try {
      await updateBookingStatus(id, newStatus);
      setBookings(prev => prev.map(b => (b.id === id ? { ...b, status: newStatus } : b)));
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(null);
    }
  };

  const executeDelete = async () => {
    if (!bookingToDelete) return;
    setUpdating(bookingToDelete.id);
    try {
      await deleteBooking(bookingToDelete.id);
      setBookings(prev => prev.filter(b => b.id !== bookingToDelete.id));
      setBookingToDelete(null);
    } catch (err) {
      console.error('Error deleting:', err);
    } finally {
      setUpdating(null);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setUpdating(editingBooking.id);
    try {
      const updatedData = {
        customerName: editingBooking.customerName,
        customerPhone: editingBooking.customerPhone,
        date: editingBooking.date,
        time: editingBooking.time,
        price: Number(editingBooking.price),
      };
      await updateBookingDetails(editingBooking.id, updatedData);
      setBookings(prev => prev.map(b => b.id === editingBooking.id ? { ...b, ...updatedData } : b));
      setEditingBooking(null);
    } catch (err) {
      console.error('Error updating:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            b.customerPhone.includes(searchQuery);
      const matchesDate = dateFilter ? b.date === dateFilter : true;
      const matchesStatus = statusFilter ? b.status === statusFilter : true;
      const matchesBarber = barberFilter ? b.barberId === barberFilter : true;
      const matchesService = serviceFilter ? b.serviceId === serviceFilter : true;
      return matchesSearch && matchesDate && matchesStatus && matchesBarber && matchesService;
    });
  }, [bookings, searchQuery, dateFilter, statusFilter, barberFilter, serviceFilter]);

  const getWhatsAppLink = (booking: Booking) => {
    let phone = booking.customerPhone.replace(/\s+/g, '');
    if (phone.startsWith('07')) {
      phone = '962' + phone.substring(1);
    }
    const statusMsg = booking.status === 'confirmed' 
      ? 'تم تأكيد حجزك' 
      : booking.status === 'cancelled' 
      ? 'تم إلغاء حجزك' 
      : booking.status === 'completed'
      ? 'شكراً لزيارتك'
      : 'بانتظار تأكيد حجزك';
    const text = `مرحباً ${booking.customerName}،\n${statusMsg} في صالون الحلاق.\nالخدمة: ${booking.serviceName}\nالموعد: ${formatDate(booking.date)} - ${formatTime(booking.time)}\nالحلاق: ${booking.barberName}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div dir={dir}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">{t('admin.bookings')}</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="btn-outline text-sm flex items-center gap-2 !py-2"
          >
            <Globe size={16} />
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <button onClick={fetchData} className="btn-outline text-sm flex items-center gap-2">
            <RefreshCw size={16} />
            {t('common.retry')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card-elevated p-4 border-l-4 border-l-gold">
          <p className="text-sm text-text-muted">{t('admin.totalBookings')} ({t('admin.today')})</p>
          <p className="text-2xl font-bold text-text-primary">{todayBookings.length}</p>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-warning">
          <p className="text-sm text-text-muted">{t('admin.pendingConfirmations')}</p>
          <p className="text-2xl font-bold text-text-primary">{pendingCount}</p>
        </div>
        <div className="card-elevated p-4 border-l-4 border-l-success">
          <p className="text-sm text-text-muted">{t('admin.estimatedRevenue')} ({t('admin.today')})</p>
          <p className="text-2xl font-bold text-text-primary">{estimatedRevenue} JD</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card-elevated p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={t('admin.searchPlaceholder') as string}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-dark text-sm !py-2 !pl-9 w-full"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs text-text-muted mb-1">{t('admin.filterByDate')}</label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input-dark text-sm !py-2"
            />
            <button 
              onClick={() => setDateFilter(todayStr)}
              className="btn-outline text-xs !py-2"
            >
              {t('admin.today')}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">{t('admin.filterByStatus')}</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-dark text-sm !py-2"
          >
            <option value="">{t('admin.allStatuses')}</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{t(`admin.${s}`)}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">{t('admin.filterByBarber')}</label>
          <select
            value={barberFilter}
            onChange={(e) => setBarberFilter(e.target.value)}
            className="select-dark text-sm !py-2"
          >
            <option value="">{t('admin.allBarbers')}</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>{lang === 'ar' ? b.nameAr : b.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-text-muted mb-1">{t('admin.filterByService')}</label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="select-dark text-sm !py-2"
          >
            <option value="">{t('admin.allServices')}</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{lang === 'ar' ? s.nameAr : s.name}</option>
            ))}
          </select>
        </div>

        {(dateFilter || statusFilter || barberFilter || serviceFilter || searchQuery) && (
          <button
            onClick={() => { setDateFilter(''); setStatusFilter(''); setBarberFilter(''); setServiceFilter(''); setSearchQuery(''); }}
            className="text-sm text-gold hover:text-gold-light transition-colors"
          >
            {t('common.retry')} {/* Using common.retry as Clear roughly, could add a specific clear key */}
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gold" size={32} />
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <CalendarDays size={40} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">{t('admin.noBookings')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 px-4 text-text-muted font-medium">Customer</th>
                <th className="py-3 px-4 text-text-muted font-medium">Phone</th>
                <th className="py-3 px-4 text-text-muted font-medium">Service</th>
                <th className="py-3 px-4 text-text-muted font-medium">Barber</th>
                <th className="py-3 px-4 text-text-muted font-medium">Date</th>
                <th className="py-3 px-4 text-text-muted font-medium">Time</th>
                <th className="py-3 px-4 text-text-muted font-medium">Price</th>
                <th className="py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="py-3 px-4 text-text-muted font-medium">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="border-b border-border/50 hover:bg-surface-elevated/50 transition-colors">
                  <td className="py-3 px-4 text-text-primary font-medium">{booking.customerName}</td>
                  <td className="py-3 px-4 text-text-secondary" dir="ltr">{booking.customerPhone}</td>
                  <td className="py-3 px-4 text-text-secondary">{booking.serviceName}</td>
                  <td className="py-3 px-4 text-text-secondary">{booking.barberName}</td>
                  <td className="py-3 px-4 text-text-secondary">{formatDate(booking.date)}</td>
                  <td className="py-3 px-4 text-text-secondary">{formatTime(booking.time)}</td>
                  <td className="py-3 px-4 text-gold font-medium">{booking.price} JD</td>
                  <td className="py-3 px-4">
                    <span className={`status-badge ${getStatusColor(booking.status)}`}>
                      {t(`admin.${booking.status}`)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {updating === booking.id ? (
                        <Loader2 size={16} className="animate-spin text-gold" />
                      ) : (
                        <select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                          className="select-dark text-xs !py-1 !px-2 w-auto"
                        >
                          {statuses.map((s) => (
                            <option key={s} value={s}>{t(`admin.${s}`)}</option>
                          ))}
                        </select>
                      )}
                      
                      <a 
                        href={getWhatsAppLink(booking)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 rounded-md transition-colors"
                        title="Send WhatsApp Message"
                      >
                        <MessageCircle size={16} />
                      </a>

                      <div className="relative action-menu-container">
                        <button 
                          onClick={(e) => { e.preventDefault(); setShowDropdown(showDropdown === booking.id ? null : booking.id); }}
                          className="p-1.5 text-text-muted hover:text-text-primary rounded-md transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>
                        
                        {showDropdown === booking.id && (
                          <div className={`absolute z-10 w-40 bg-surface border border-border rounded-lg shadow-xl py-1 ${dir === 'rtl' ? 'left-0' : 'right-0'}`}>
                            <button 
                              onClick={() => { setEditingBooking(booking); setShowDropdown(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-elevated flex items-center gap-2"
                            >
                              <Edit2 size={14} /> {t('admin.editInfo')}
                            </button>
                            <button 
                              onClick={() => { setBookingToDelete(booking); setShowDropdown(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2"
                            >
                              <Trash2 size={14} /> {t('admin.deleteBooking')}
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface border border-border rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary">{t('admin.editInfo')}</h3>
              <button onClick={() => setEditingBooking(null)} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editingBooking.customerName}
                  onChange={e => setEditingBooking({...editingBooking, customerName: e.target.value})}
                  className="input-dark w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Customer Phone</label>
                <input
                  type="text"
                  value={editingBooking.customerPhone}
                  onChange={e => setEditingBooking({...editingBooking, customerPhone: e.target.value})}
                  className="input-dark w-full"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={editingBooking.date}
                    onChange={e => setEditingBooking({...editingBooking, date: e.target.value})}
                    className="input-dark w-full"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Time (HH:MM)</label>
                  <input
                    type="time"
                    value={editingBooking.time}
                    onChange={e => setEditingBooking({...editingBooking, time: e.target.value})}
                    className="input-dark w-full"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Price (JD)</label>
                <input
                  type="number"
                  value={editingBooking.price}
                  onChange={e => setEditingBooking({...editingBooking, price: Number(e.target.value)})}
                  className="input-dark w-full"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setEditingBooking(null)} className="btn-outline flex-1">
                  {t('admin.cancel')}
                </button>
                <button type="submit" disabled={updating === editingBooking.id} className="btn-gold flex-1">
                  {updating === editingBooking.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : t('admin.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bookingToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-surface border border-error rounded-xl p-6 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-4 text-error">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-text-primary mb-2">Delete Booking</h3>
              <p className="text-text-secondary text-sm mb-6">
                {t('admin.confirmDeleteBooking')}
                <br />
                <span className="font-bold text-text-primary mt-2 block">
                  {bookingToDelete.customerName} - {bookingToDelete.customerPhone}
                </span>
              </p>
              
              <div className="flex w-full gap-3">
                <button 
                  onClick={() => setBookingToDelete(null)} 
                  className="btn-outline flex-1"
                  disabled={updating === bookingToDelete.id}
                >
                  {t('admin.cancel')}
                </button>
                <button 
                  onClick={executeDelete} 
                  disabled={updating === bookingToDelete.id} 
                  className="btn-gold flex-1 !bg-error !text-white hover:!bg-red-600 !border-error"
                >
                  {updating === bookingToDelete.id ? <Loader2 size={16} className="animate-spin mx-auto" /> : t('admin.deleteBooking')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
