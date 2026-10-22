import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { formatCurrency } from '../data/mockData';
import { ProductThumb } from '../components/UI';
import { ArrowLeft, ChevronDown } from 'lucide-react';

export default function AddStockPage() {
  const { products, addStock, showToast, lang } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const preselect = location.state?.productId || '';
  const [selectedId, setSelectedId] = useState(preselect);
  const [qty, setQty] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [supplier, setSupplier] = useState('');
  const [ref, setRef] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const product = products.find(p => p.id === selectedId);
  const totalAmount = qty && purchasePrice ? (+qty * +purchasePrice) : 0;

  const validate = () => {
    const e = {};
    if (!selectedId) e.product = 'Please select a product';
    if (!qty || isNaN(qty) || +qty <= 0) e.qty = 'Enter a valid quantity';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 700));
    addStock(selectedId, qty, { ref: ref || 'RECEIPT', notes, purchasePrice, supplier, date });
    showToast(`Added ${qty} pcs to ${product.name}`, 'success');
    navigate('/inventory');
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 0' }}>
        <button className="icon-btn btn-outline" onClick={() => navigate(-1)} id="back-btn"><ArrowLeft size={20} /></button>
        <div className="page-title" style={{ padding: 0 }}>{t(lang, 'addStockTitle')}</div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '16px 16px 32px' }} id="add-stock-form">
        {/* Product selector */}
        <div className="form-group">
          <label className="form-label" htmlFor="stock-product">Product <span className="req">*</span></label>
          <select
            id="stock-product"
            className={`form-control form-select ${errors.product ? 'error' : ''}`}
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
          >
            <option value="">— Select a Product —</option>
            {products.filter(p => p.active).map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
            ))}
          </select>
          {errors.product && <p className="form-error">{errors.product}</p>}
        </div>

        {/* Selected product preview */}
        {product && (
          <div style={{ background: 'var(--bg-page)', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', border: '1px solid var(--border)' }}>
            <ProductThumb product={product} size={52} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{product.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Code: {product.sku}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                Current Stock: <strong style={{ color: product.stock < product.minStock ? 'var(--red)' : 'var(--green)' }}>{product.stock} {product.unit}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="stock-qty">{t(lang, 'qtyToAdd')} <span className="req">*</span></label>
            <input
              id="stock-qty"
              type="number"
              min="1"
              className={`form-control ${errors.qty ? 'error' : ''}`}
              value={qty}
              onChange={e => setQty(e.target.value)}
              placeholder="100"
            />
            {errors.qty && <p className="form-error">{errors.qty}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="stock-price">{t(lang, 'purchasePrice')}</label>
            <input
              id="stock-price"
              type="number"
              min="0"
              className="form-control"
              value={purchasePrice}
              onChange={e => setPurchasePrice(e.target.value)}
              placeholder="300"
            />
          </div>
        </div>

        {/* Total amount display */}
        {totalAmount > 0 && (
          <div style={{ background: '#EEF2FF', borderRadius: 10, padding: '12px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#4338CA', fontWeight: 600 }}>{t(lang, 'totalAmount2')}</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#3B3DE8' }}>{formatCurrency(totalAmount)}</span>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="stock-supplier">Supplier</label>
          <input id="stock-supplier" className="form-control" value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Select or type supplier" />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="stock-ref">Purchase Reference</label>
            <input id="stock-ref" className="form-control" value={ref} onChange={e => setRef(e.target.value)} placeholder="PO-2025-001" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="stock-date">{t(lang, 'purchaseDate')}</label>
            <input id="stock-date" type="date" className="form-control" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="stock-notes">{t(lang, 'notes')}</label>
          <textarea id="stock-notes" className="form-control" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any notes about this stock receipt..." style={{ resize: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-outline flex-1" onClick={() => navigate(-1)} id="cancel-add-stock">
            {t(lang, 'cancel')}
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={saving} id="submit-add-stock">
            {saving ? 'Adding...' : t(lang, 'addStock')}
          </button>
        </div>
      </form>
    </div>
  );
}
