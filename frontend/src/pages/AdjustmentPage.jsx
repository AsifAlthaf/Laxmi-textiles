import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { formatCurrency, formatDate, formatDateTime } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';

export default function AdjustmentPage({ type }) {
  const { products, recordAdjustment, showToast, lang } = useApp();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState('');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const labels = {
    return:  { title: 'Customer Return',     emoji: '↩️', btn: 'Record Return',   color: 'var(--orange)' },
    damage:  { title: 'Damaged Goods',       emoji: '⚠️', btn: 'Record Damage',   color: 'var(--red)' },
    adjust:  { title: 'Stock Adjustment',    emoji: '🔧', btn: 'Save Adjustment', color: 'var(--blue)' },
  };

  const meta = labels[type] || labels.adjust;

  const validate = () => {
    const e = {};
    if (!selectedId) e.product = 'Please select a product';
    if (!qty || isNaN(qty) || +qty <= 0) e.qty = 'Enter a valid quantity';
    if (!reason.trim()) e.reason = 'Reason is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const result = await recordAdjustment(type, selectedId, qty, reason);
      if (result && result.success === false) {
        showToast(result.error || 'Operation failed', 'error');
        setSaving(false);
        return;
      }
      showToast(`${meta.title} recorded successfully`, 'success');
      navigate('/inventory');
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 0' }}>
        <button className="icon-btn btn-outline" onClick={() => navigate(-1)} id="back-btn"><ArrowLeft size={20} /></button>
        <div style={{ fontSize: 22 }}>{meta.emoji}</div>
        <div className="page-title" style={{ padding: 0 }}>{meta.title}</div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '16px 16px 32px' }} id="adjustment-form">
        <div className="form-group">
          <label className="form-label" htmlFor="adj-product">Product <span className="req">*</span></label>
          <select
            id="adj-product"
            className={`form-control form-select ${errors.product ? 'error' : ''}`}
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">— Select a Product —</option>
            {products.filter(p => p.active).map(p => (
              <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
            ))}
          </select>
          {errors.product && <p className="form-error">{errors.product}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="adj-qty">Quantity <span className="req">*</span></label>
          <input
            id="adj-qty"
            type="number"
            min="1"
            className={`form-control ${errors.qty ? 'error' : ''}`}
            value={qty}
            onChange={e => setQty(e.target.value)}
            placeholder="e.g. 5"
          />
          {errors.qty && <p className="form-error">{errors.qty}</p>}
        </div>

        {type === 'return' && (
          <div className="alert info">
            ℹ️ Returned items will be added back to stock after inspection.
          </div>
        )}
        {type === 'damage' && (
          <div className="alert warning">
            ⚠️ Damaged items will be deducted from sellable stock permanently.
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="adj-reason">Reason <span className="req">*</span></label>
          <textarea
            id="adj-reason"
            className={`form-control ${errors.reason ? 'error' : ''}`}
            rows={3}
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Enter reason for this adjustment..."
            style={{ resize: 'none' }}
          />
          {errors.reason && <p className="form-error">{errors.reason}</p>}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className="btn btn-outline flex-1" onClick={() => navigate(-1)} id="cancel-adj">Cancel</button>
          <button type="submit" className="btn btn-primary flex-1" disabled={saving} id="submit-adj"
            style={{ background: meta.color }}>
            {saving ? 'Saving...' : meta.btn}
          </button>
        </div>
      </form>
    </div>
  );
}

// Transaction History page
export function HistoryPage() {
  const { transactions, lang } = useApp();
  const navigate = useNavigate();

  const txnColors = {
    sale:    { bg: 'var(--red-bg)',    fg: 'var(--red)',    label: 'Sale',     sign: '-' },
    receipt: { bg: 'var(--green-bg)', fg: 'var(--green)',  label: 'Receipt',  sign: '+' },
    adjust:  { bg: 'var(--blue-bg)',  fg: 'var(--blue)',   label: 'Adjust',   sign: '±' },
    return:  { bg: 'var(--orange-bg)',fg: 'var(--orange)', label: 'Return',   sign: '+' },
    damage:  { bg: 'var(--yellow-bg)',fg: '#a16207',        label: 'Damage',   sign: '-' },
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 8px' }}>
        <button className="icon-btn btn-outline" onClick={() => navigate(-1)} id="back-btn"><ArrowLeft size={20} /></button>
        <div className="page-title" style={{ padding: 0 }}>Transaction History</div>
      </div>

      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {transactions.length === 0 ? (
          <div className="empty-state"><p>No transactions yet</p></div>
        ) : transactions.map(txn => {
          const meta = txnColors[txn.type] || txnColors.adjust;
          return (
            <div key={txn.id} className="txn-item">
              <div style={{ width: 38, height: 38, borderRadius: 10, background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, fontWeight: 800, color: meta.fg }}>
                {meta.sign}
              </div>
              <div className="txn-info">
                <div className="txn-product">{txn.productName}</div>
                <div className="txn-meta" style={{ textTransform: 'capitalize' }}>{meta.label} · {txn.ref} · {formatDateTime(txn.date)}</div>
              </div>
              <div className={`txn-qty ${txn.qty >= 0 ? 'positive' : 'negative'}`}>
                {txn.qty > 0 ? '+' : ''}{txn.qty} pcs
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ height: 16 }} />
    </div>
  );
}
