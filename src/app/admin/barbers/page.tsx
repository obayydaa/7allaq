'use client';

import React, { useState, useEffect } from 'react';
import { getBarbers, createBarber, updateBarber, deleteBarber as deleteBarberFn } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';
import type { Barber } from '@/types';
import { Plus, Pencil, Trash2, Loader2, X, Users } from 'lucide-react';

interface FormState { name: string; nameAr: string; isActive: boolean; order: string; }
const emptyForm: FormState = { name: '', nameAr: '', isActive: true, order: '1' };

export default function AdminBarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBarbers = async () => {
    setLoading(true);
    try { setBarbers(await getBarbers()); } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBarbers(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b: Barber) => {
    setEditingId(b.id);
    setForm({ name: b.name, nameAr: b.nameAr, isActive: b.isActive, order: String(b.order) });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      const data = { name: form.name, nameAr: form.nameAr, isActive: form.isActive, order: Number(form.order) };
      if (editingId) {
        await updateBarber(editingId, data);
      } else {
        await createBarber(data);
      }
      setShowModal(false);
      await fetchBarbers();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this barber?')) return;
    try { await deleteBarberFn(id); await fetchBarbers(); } catch (err) { console.error(err); }
  };

  const toggleActive = async (b: Barber) => {
    try {
      await updateBarber(b.id, { isActive: !b.isActive });
      setBarbers((prev) => prev.map((br) => (br.id === b.id ? { ...br, isActive: !br.isActive } : br)));
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Barbers</h1>
          <p className="text-sm text-text-muted mt-1">Manage your barber team</p>
        </div>
        <button onClick={openAdd} className="btn-gold text-sm flex items-center gap-2">
          <Plus size={16} /> Add Barber
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={32} /></div>
      ) : barbers.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Users size={40} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No barbers yet. Add your first barber.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {barbers.map((b) => (
            <div key={b.id} className="card-elevated p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-surface mx-auto mb-4 flex items-center justify-center border-2 border-border">
                <span className="text-2xl font-display font-bold text-gold">{b.name.charAt(0)}</span>
              </div>
              <h3 className="text-text-primary font-semibold text-lg">{b.name}</h3>
              {b.nameAr && <p className="text-text-muted text-sm">{b.nameAr}</p>}
              <div className="mt-3 mb-4">
                <button
                  onClick={() => toggleActive(b)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    b.isActive
                      ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30'
                      : 'text-red-400 bg-red-400/10 border-red-400/30'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
              <div className="flex justify-center gap-2">
                <button onClick={() => openEdit(b)} className="p-2 text-text-muted hover:text-gold transition-colors"><Pencil size={16} /></button>
                <button onClick={() => handleDelete(b.id)} className="p-2 text-text-muted hover:text-error transition-colors"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface-elevated border border-border rounded-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-text-primary">{editingId ? 'Edit Barber' : 'Add Barber'}</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-text-muted mb-1">Name (English)*</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-dark text-sm" />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Name (Arabic)</label>
                <input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-dark text-sm" dir="rtl" />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Display Order</label>
                <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="input-dark text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-[#C9A84C]" />
                <span className="text-sm text-text-secondary">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name} className="btn-gold flex-1">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
