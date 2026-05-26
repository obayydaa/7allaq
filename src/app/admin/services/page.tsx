'use client';

import React, { useState, useEffect } from 'react';
import { getServices, createService, updateService, deleteService as deleteServiceFn } from '@/lib/firestore';
import type { Service } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { Plus, Pencil, Trash2, Loader2, X, Scissors } from 'lucide-react';

const categories = ['haircut', 'beard', 'combo', 'treatment'] as const;

interface FormState {
  name: string; nameAr: string; price: string; duration: string;
  description: string; descriptionAr: string; category: string;
  isActive: boolean; order: string;
}

const emptyForm: FormState = {
  name: '', nameAr: '', price: '', duration: '', description: '',
  descriptionAr: '', category: 'haircut', isActive: true, order: '1',
};

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try { setServices(await getServices()); } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchServices(); }, []);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({
      name: s.name, nameAr: s.nameAr, price: String(s.price), duration: String(s.duration),
      description: s.description, descriptionAr: s.descriptionAr, category: s.category,
      isActive: s.isActive, order: String(s.order),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.duration) return;
    setSaving(true);
    try {
      const data = {
        name: form.name, nameAr: form.nameAr, price: Number(form.price),
        duration: Number(form.duration), description: form.description,
        descriptionAr: form.descriptionAr, category: form.category as Service['category'],
        isActive: form.isActive, order: Number(form.order),
      };
      if (editingId) {
        await updateService(editingId, data);
      } else {
        await createService(data);
      }
      setShowModal(false);
      await fetchServices();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try { await deleteServiceFn(id); await fetchServices(); } catch (err) { console.error(err); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Services</h1>
          <p className="text-sm text-text-muted mt-1">Manage your barbershop services</p>
        </div>
        <button onClick={openAdd} className="btn-gold text-sm flex items-center gap-2">
          <Plus size={16} />Add Service
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gold" size={32} /></div>
      ) : services.length === 0 ? (
        <div className="card-elevated p-12 text-center">
          <Scissors size={40} className="text-text-muted mx-auto mb-4" />
          <p className="text-text-muted">No services yet. Add your first service.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((s) => (
            <div key={s.id} className="card-elevated p-5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-text-primary font-semibold">{s.name}</h3>
                  {s.nameAr && <span className="text-text-muted text-sm">({s.nameAr})</span>}
                  {!s.isActive && (
                    <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full border border-error/30">Inactive</span>
                  )}
                </div>
                <p className="text-sm text-text-muted">{s.description}</p>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div><span className="text-text-muted">Price:</span> <span className="text-gold font-bold">{s.price} JD</span></div>
                <div><span className="text-text-muted">Duration:</span> <span className="text-text-secondary">{s.duration}min</span></div>
                <div><span className="text-text-muted">Category:</span> <span className="text-text-secondary capitalize">{s.category}</span></div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="p-2 text-text-muted hover:text-gold transition-colors"><Pencil size={16} /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-2 text-text-muted hover:text-error transition-colors"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-surface-elevated border border-border rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-text-primary">{editingId ? 'Edit Service' : 'Add Service'}</h2>
              <button onClick={() => setShowModal(false)} className="text-text-muted hover:text-text-primary"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Name (English)*</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-dark text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Name (Arabic)</label>
                  <input value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="input-dark text-sm" dir="rtl" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-text-muted mb-1">Price (JD)*</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-dark text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Duration (min)*</label>
                  <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-dark text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-text-muted mb-1">Order</label>
                  <input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} className="input-dark text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select-dark text-sm">
                  {categories.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Description (English)</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-dark text-sm" rows={2} />
              </div>
              <div>
                <label className="block text-xs text-text-muted mb-1">Description (Arabic)</label>
                <textarea value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} className="input-dark text-sm" rows={2} dir="rtl" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-[#C9A84C]" />
                <span className="text-sm text-text-secondary">Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving || !form.name || !form.price || !form.duration} className="btn-gold flex-1">
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
