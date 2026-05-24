'use client';

import React, { useState, useEffect } from 'react';
import { getAvailability, setAvailability, initializeAvailability, getBlockedSlots, blockSlot, unblockSlot } from '@/lib/firestore';
import { getDayName } from '@/lib/utils';
import type { Availability, BlockedSlot } from '@/types';
import { Loader2, Clock, Ban, Trash2, Plus } from 'lucide-react';

export default function AdminAvailabilityPage() {
  const [availability, setAvailabilityState] = useState<Availability[]>([]);
  const [blocked, setBlocked] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      await initializeAvailability();
      const [avail, blockedSlots] = await Promise.all([
        getAvailability(),
        getBlockedSlots(),
      ]);
      setAvailabilityState(avail);
      setBlocked(blockedSlots);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleUpdate = async (id: string, field: string, value: string | boolean) => {
    setSaving(id);
    try {
      await setAvailability(id, { [field]: value });
      setAvailabilityState((prev) =>
        prev.map((a) => (a.id === id ? { ...a, [field]: value } : a))
      );
    } catch (err) { console.error(err); }
    finally { setSaving(null); }
  };

  const handleBlock = async () => {
    if (!blockDate || !blockTime) return;
    setBlocking(true);
    try {
      await blockSlot({ date: blockDate, time: blockTime, reason: blockReason });
      setBlockDate(''); setBlockTime(''); setBlockReason('');
      const blockedSlots = await getBlockedSlots();
      setBlocked(blockedSlots);
    } catch (err) { console.error(err); }
    finally { setBlocking(false); }
  };

  const handleUnblock = async (id: string) => {
    try {
      await unblockSlot(id);
      setBlocked((prev) => prev.filter((b) => b.id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={32} /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Availability</h1>
      <p className="text-sm text-text-muted mb-8">Set working hours and block specific time slots</p>

      {/* Weekly Schedule */}
      <div className="card-elevated p-6 mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Clock size={18} className="text-gold" /> Working Hours
        </h2>
        <div className="space-y-3">
          {availability.map((a) => (
            <div key={a.id} className="flex items-center gap-4 flex-wrap py-2 border-b border-border/50 last:border-0">
              <div className="w-28 text-text-secondary font-medium">{getDayName(a.dayOfWeek)}</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={a.isActive}
                  onChange={(e) => handleUpdate(a.id, 'isActive', e.target.checked)}
                  className="w-4 h-4 accent-[#C9A84C]"
                />
                <span className="text-xs text-text-muted">{a.isActive ? 'Open' : 'Closed'}</span>
              </label>
              {a.isActive && (
                <>
                  <input
                    type="time"
                    value={a.startTime}
                    onChange={(e) => handleUpdate(a.id, 'startTime', e.target.value)}
                    className="input-dark text-sm !py-1 !w-auto"
                  />
                  <span className="text-text-muted">to</span>
                  <input
                    type="time"
                    value={a.endTime}
                    onChange={(e) => handleUpdate(a.id, 'endTime', e.target.value)}
                    className="input-dark text-sm !py-1 !w-auto"
                  />
                </>
              )}
              {saving === a.id && <Loader2 size={14} className="animate-spin text-gold" />}
            </div>
          ))}
        </div>
      </div>

      {/* Block Slots */}
      <div className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
          <Ban size={18} className="text-gold" /> Block Time Slots
        </h2>
        <div className="flex flex-wrap gap-3 items-end mb-6">
          <div>
            <label className="block text-xs text-text-muted mb-1">Date</label>
            <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} className="input-dark text-sm !py-2" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Time</label>
            <input type="time" value={blockTime} onChange={(e) => setBlockTime(e.target.value)} className="input-dark text-sm !py-2" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1">Reason (optional)</label>
            <input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} className="input-dark text-sm !py-2" placeholder="e.g., Personal break" />
          </div>
          <button onClick={handleBlock} disabled={!blockDate || !blockTime || blocking} className="btn-gold text-sm flex items-center gap-1">
            {blocking ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Block
          </button>
        </div>

        {blocked.length === 0 ? (
          <p className="text-text-muted text-sm">No blocked slots</p>
        ) : (
          <div className="space-y-2">
            {blocked.map((b) => (
              <div key={b.id} className="flex items-center justify-between py-2 px-3 bg-surface rounded-lg">
                <div className="text-sm">
                  <span className="text-text-primary">{b.date}</span>
                  <span className="text-text-muted mx-2">at</span>
                  <span className="text-gold">{b.time}</span>
                  {b.reason && <span className="text-text-muted ml-3">— {b.reason}</span>}
                </div>
                <button onClick={() => handleUnblock(b.id)} className="text-error hover:text-red-300 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
