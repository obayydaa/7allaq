'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getBookings, updateBookingStatus } from '@/lib/firestore';
import { formatDate, formatTime, getStatusColor } from '@/lib/utils';
import type { Booking, BookingStatus } from '@/types';
import { RefreshCw, Loader2, CalendarDays, MessageCircle } from 'lucide-react';

const statuses: BookingStatus[] = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const filters: { date?: string; status?: string } = {};
      if (dateFilter) filters.date = dateFilter;
      if (statusFilter) filters.status = statusFilter;
      const data = await getBookings(Object.keys(filters).length > 0 ? filters : undefined);
      setBookings(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    setUpdating(id);
    try {
      await updateBookingStatus(id, newStatus);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(null);
    }
  };

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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Bookings</h1>
          <p className="text-sm text-text-muted mt-1">Manage all customer bookings</p>
        </div>
        <button onClick={fetchBookings} className="btn-outline text-sm flex items-center gap-2">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs text-text-muted mb-1">Filter by Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-dark text-sm !py-2"
          />
        </div>
        <div>
          <label className="block text-xs text-text-muted mb-1">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-dark text-sm !py-2"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        {(dateFilter || statusFilter) && (
          <button
            onClick={() => { setDateFilter(''); setStatusFilter(''); }}
            className="text-sm text-gold hover:text-gold-light transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-gold" size={32} />
        </div>
      ) : bookings.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <CalendarDays size={40} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No bookings found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-text-muted font-medium">Customer</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Phone</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Service</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Barber</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Date</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Time</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Price</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Status</th>
                <th className="text-left py-3 px-4 text-text-muted font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
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
                      {booking.status}
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
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
