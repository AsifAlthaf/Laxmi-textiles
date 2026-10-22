import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { Plus, Building2, Phone, MapPin, ChevronRight, X, Mail, FileText, ArrowLeft } from 'lucide-react';

export default function SuppliersPage() {
  const { suppliers, addSupplier, showToast, lang } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', phone: '', email: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const filtered = suppliers.filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.city?.toLowerCase().includes(search.toLowerCase())
  );

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Supplier name is required';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    return e;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    addSupplier(form);
    showToast('Supplier added successfully', 'success');
    setShowForm(false);
    setForm({ name: '', city: '', phone: '', email: '', notes: '' });
    setSaving(false);
    setErrors({});
  };

  // ── Supplier Detail View ───────────────────────────────────────
  if (selected) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 8px' }}>
          <button className="icon-btn btn-outline" onClick={() => setSelected(null)} id="back-supplier">
            <ArrowLeft size={20} />
          </button>
          <div style={{ fontSize: 17, fontWeight: 700 }}>Supplier Details</div>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ margin: '8px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, #3B3DE8, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: 'white', fontWeight: 800, flexShrink: 0,
          }}>
            {selected.name?.[0]?.toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 800 }}>{selected.name}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <MapPin size={12} /> {selected.city || '—'}
            </div>
          </div>
        </div>

        {/* Contact details */}
        <div className="card" style={{ margin: '8px 16px' }}>
          <DetailRow icon={Phone}    label="Phone"  value={selected.phone || '—'} href={`tel:${selected.phone}`} />
          <DetailRow icon={Mail}     label="Email"  value={selected.email || '—'} href={selected.email ? `mailto:${selected.email}` : null} />
          <DetailRow icon={MapPin}   label="City"   value={selected.city || '—'} />
          <DetailRow icon={FileText} label="Notes"  value={selected.notes || 'No notes'} last />
        </div>

        {/* Call & Email quick actions */}
        {(selected.phone || selected.email) && (
          <div style={{ display: 'grid', gridTemplateColumns: selected.phone && selected.email ? '1fr 1fr' : '1fr', gap: 10, padding: '0 16px' }}>
            {selected.phone && (
              <a href={`tel:${selected.phone}`} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }} id="call-supplier-btn">
                <Phone size={16} /> Call
              </a>
            )}
            {selected.email && (
              <a href={`mailto:${selected.email}`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textDecoration: 'none' }} id="email-supplier-btn">
                <Mail size={16} /> Email
              </a>
            )}
          </div>
        )}
        <div style={{ height: 24 }} />
      </div>
    );
  }

  // ── List View ──────────────────────────────────────────────────
  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <div className="page-title" style={{ padding: 0 }}>{t(lang, 'suppliersTitle')}</div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)} id="add-supplier-btn" style={{ gap: 4 }}>
          <Plus size={15} /> {t(lang, 'addSupplier')}
        </button>
      </div>

      <div className="search-bar">
        <span>🔍</span>
        <input
          id="supplier-search"
          placeholder="Search by name or city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 40, marginBottom: 8 }}>🏭</div>
            <p>No suppliers yet. Add your first one!</p>
          </div>
        ) : filtered.map((s, i) => (
          <div
            key={s.id}
            className="supplier-card"
            style={{ borderBottom: i === filtered.length - 1 ? 'none' : undefined, cursor: 'pointer' }}
            onClick={() => setSelected(s)}
            id={`supplier-row-${s.id}`}
          >
            <div className="supplier-avatar" style={{ background: 'linear-gradient(135deg, #EEF2FF, #C7D2FE)', color: '#3B3DE8', fontWeight: 800, fontSize: 18 }}>
              {s.name?.[0]?.toUpperCase()}
            </div>
            <div className="supplier-info">
              <div className="supplier-name">{s.name}</div>
              <div className="supplier-city" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={11} /> {s.city || '—'}
              </div>
              <div className="supplier-phone" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Phone size={11} /> {s.phone || '—'}
              </div>
            </div>
            <ChevronRight size={16} color="var(--text-muted)" />
          </div>
        ))}
      </div>

      <div style={{ height: 16 }} />

      {/* Add Supplier Drawer */}
      {showForm && (
        <>
          <div className="overlay" onClick={() => setShowForm(false)} />
          <div className="drawer" id="add-supplier-drawer">
            <div className="drawer-handle" />
            <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{t(lang, 'addSupplier')}</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowForm(false)} id="close-supplier-form">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '0 16px 16px' }} id="add-supplier-form">
              <div className="form-group">
                <label className="form-label" htmlFor="sup-name">Supplier Name <span className="req">*</span></label>
                <input id="sup-name" className={`form-control ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Shree Textiles" />
                {errors.name && <p className="form-error">{errors.name}</p>}
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="sup-city">City <span className="req">*</span></label>
                  <input id="sup-city" className={`form-control ${errors.city ? 'error' : ''}`} value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="Chennai" />
                  {errors.city && <p className="form-error">{errors.city}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="sup-phone">Phone <span className="req">*</span></label>
                  <input id="sup-phone" className={`form-control ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="98765 43210" />
                  {errors.phone && <p className="form-error">{errors.phone}</p>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="sup-email">Email</label>
                <input id="sup-email" type="email" className="form-control" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="supplier@example.com" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="sup-notes">Notes</label>
                <textarea id="sup-notes" className="form-control" rows={2} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} style={{ resize: 'none' }} placeholder="Payment terms, lead time..." />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-outline flex-1" onClick={() => setShowForm(false)} id="cancel-supplier">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" disabled={saving} id="save-supplier-btn">
                  {saving ? 'Saving...' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, href, last }) {
  const content = (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      paddingBottom: last ? 0 : 12, marginBottom: last ? 0 : 12,
      borderBottom: last ? 'none' : '1px solid var(--border)',
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={15} color="var(--brand-primary)" />
      </div>
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: href ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
  return href ? <a href={href} style={{ textDecoration: 'none', display: 'block' }}>{content}</a> : content;
}
