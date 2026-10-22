import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { CATEGORIES } from '../data/mockData';
import { ArrowLeft } from 'lucide-react';

const UNITS   = ['pcs', 'metres', 'kg', 'dozen'];
const COLORS  = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Pink', 'Purple', 'Orange', 'Maroon', 'Navy', 'Beige'];
const GST_RATES = [0, 5, 12, 18, 28];

const EMPTY = {
  name: '', sku: '', category: 'Sarees', colour: 'Red', size: 'Free Size',
  unit: 'pcs', costPrice: '', sellingPrice: '', initialStock: '',
  minStock: '10', supplier: '', imageColor: '#EF4444', gstRate: 5,
};

export default function AddProductPage({ editMode }) {
  const { addProduct, updateProduct, showToast, lang, suppliers, products } = useApp();
  const navigate  = useNavigate();
  const { id }    = useParams();

  // ── Pre-fill for edit mode ────────────────────────────────────
  const existing = editMode && id ? products.find(p => p.id === id) : null;

  const [form, setForm] = useState(() => {
    if (existing) {
      return {
        name:         existing.name        || '',
        sku:          existing.sku         || '',
        category:     existing.category    || 'Sarees',
        colour:       existing.colour      || 'Red',
        size:         existing.size        || 'Free Size',
        unit:         existing.unit        || 'pcs',
        costPrice:    String(existing.costPrice    || ''),
        sellingPrice: String(existing.sellingPrice || ''),
        initialStock: '',           // Don't pre-fill initial stock in edit mode
        minStock:     String(existing.minStock || '10'),
        supplier:     existing.supplier    || '',
        imageColor:   existing.imageColor  || '#EF4444',
        gstRate:      existing.gstRate !== undefined ? existing.gstRate : 5,
      };
    }
    return EMPTY;
  });

  const [errors,  setErrors]  = useState({});
  const [saving,  setSaving]  = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Derived ───────────────────────────────────────────────────
  const margin = form.costPrice && form.sellingPrice
    ? (((+form.sellingPrice - +form.costPrice) / +form.costPrice) * 100).toFixed(1)
    : null;
  const gstAmt = form.sellingPrice && form.gstRate
    ? ((+form.sellingPrice * form.gstRate) / (100 + form.gstRate)).toFixed(2)
    : null;

  // ── Validation ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name = 'Product name is required';
    if (!form.sku.trim())        e.sku  = 'Product code is required';
    if (!form.costPrice || isNaN(form.costPrice) || +form.costPrice <= 0)     e.costPrice    = 'Valid cost price required';
    if (!form.sellingPrice || isNaN(form.sellingPrice) || +form.sellingPrice <= 0) e.sellingPrice = 'Valid selling price required';
    if (+form.sellingPrice < +form.costPrice) e.sellingPrice = 'Selling price must be ≥ cost price';
    if (!editMode && form.initialStock !== '' && (isNaN(form.initialStock) || +form.initialStock < 0)) e.initialStock = 'Must be 0 or more';
    return e;
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        costPrice:    +form.costPrice,
        sellingPrice: +form.sellingPrice,
        minStock:     +form.minStock || 10,
        gstRate:      +form.gstRate,
      };
      if (editMode && id) {
        // Remove initialStock for edits — stock is managed via Add Stock
        delete payload.initialStock;
        await updateProduct(id, payload);
        showToast('Product updated successfully', 'success');
        navigate(`/products/${id}`);
      } else {
        payload.initialStock = form.initialStock || '0';
        await addProduct(payload);
        showToast('Product added successfully', 'success');
        navigate('/products');
      }
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
      setSaving(false);
    }
  };

  const colorOptions = ['#EF4444','#3B82F6','#22C55E','#EAB308','#374151','#FFFFFF','#EC4899','#A855F7','#F97316','#7F1D1D','#1e3a5f','#f5f5dc'];

  // ── Not found guard ───────────────────────────────────────────
  if (editMode && id && !existing) {
    return (
      <div className="page-content">
        <div className="empty-state"><p>Product not found.</p></div>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 0' }}>
        <button className="icon-btn btn-outline" onClick={() => navigate(-1)} id="back-btn">
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="page-title" style={{ padding: 0 }}>
            {editMode ? 'Edit Product' : t(lang, 'addProduct')}
          </div>
          {editMode && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>SKU: {existing?.sku}</div>}
        </div>
      </div>

      <form onSubmit={handleSave} style={{ padding: '16px 16px 32px' }} id="product-form">
        {/* Name + preview */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
          <div style={{ flex: 1 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-name">{t(lang, 'productName')} <span className="req">*</span></label>
              <input id="prod-name" className={`form-control ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Cotton Saree" />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>
          </div>
          <div style={{ width: 80, height: 80, borderRadius: 12, background: form.imageColor + '33', border: '2px solid ' + form.imageColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: 28 }}>👘</span>
            <span style={{ fontSize: 9, color: '#9CA3AF' }}>Preview</span>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="prod-sku">{t(lang, 'sku')} <span className="req">*</span></label>
            <input id="prod-sku" className={`form-control ${errors.sku ? 'error' : ''}`} value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="S001" disabled={editMode} />
            {editMode && <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Code cannot be changed after creation</p>}
            {errors.sku && <p className="form-error">{errors.sku}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-category">{t(lang, 'category')} <span className="req">*</span></label>
            <select id="prod-category" className="form-control form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="prod-colour">{t(lang, 'colour')}</label>
            <select id="prod-colour" className="form-control form-select" value={form.colour} onChange={e => set('colour', e.target.value)}>
              {COLORS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-size">{t(lang, 'size')}</label>
            <input id="prod-size" className="form-control" value={form.size} onChange={e => set('size', e.target.value)} placeholder="Free Size" />
          </div>
        </div>

        {/* Color picker */}
        <div className="form-group">
          <label className="form-label">Product Color Tag</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {colorOptions.map(c => (
              <button key={c} type="button" onClick={() => set('imageColor', c)}
                style={{ width: 30, height: 30, borderRadius: '50%', background: c, border: form.imageColor === c ? '3px solid #3B3DE8' : '2px solid #E5E7EB', cursor: 'pointer', transition: 'border .15s' }}
                id={`color-${c.slice(1)}`}
              />
            ))}
          </div>
        </div>

        {/* Prices */}
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label" htmlFor="prod-cost">{t(lang, 'costPrice')} <span className="req">*</span></label>
            <input id="prod-cost" type="number" min="0" className={`form-control ${errors.costPrice ? 'error' : ''}`} value={form.costPrice} onChange={e => set('costPrice', e.target.value)} placeholder="300" />
            {errors.costPrice && <p className="form-error">{errors.costPrice}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="prod-sell">{t(lang, 'sellingPrice')} <span className="req">*</span></label>
            <input id="prod-sell" type="number" min="0" className={`form-control ${errors.sellingPrice ? 'error' : ''}`} value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)} placeholder="450" />
            {errors.sellingPrice && <p className="form-error">{errors.sellingPrice}</p>}
          </div>
        </div>

        {/* Live margin indicator */}
        {margin !== null && (
          <div style={{
            display: 'flex', gap: 12, marginBottom: 14,
            background: +margin >= 20 ? '#DCFCE7' : +margin >= 10 ? '#FEF9C3' : '#FEE2E2',
            borderRadius: 10, padding: '10px 14px', alignItems: 'center',
            border: `1px solid ${+margin >= 20 ? '#86EFAC' : +margin >= 10 ? '#FDE047' : '#FECACA'}`,
          }}>
            <span style={{ fontSize: 20 }}>{+margin >= 20 ? '🟢' : +margin >= 10 ? '🟡' : '🔴'}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Profit Margin</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: +margin >= 20 ? '#15803d' : +margin >= 10 ? '#a16207' : '#b91c1c' }}>
                {margin}% &nbsp;·&nbsp; ₹{(+form.sellingPrice - +form.costPrice).toFixed(0)} profit per {form.unit}
              </div>
            </div>
          </div>
        )}

        {/* GST Rate */}
        <div className="form-group">
          <label className="form-label" htmlFor="prod-gst">GST Rate (%)</label>
          <select id="prod-gst" className="form-control form-select" value={form.gstRate} onChange={e => set('gstRate', +e.target.value)}>
            {GST_RATES.map(r => <option key={r} value={r}>{r === 0 ? 'No GST (0%)' : `GST ${r}%`}</option>)}
          </select>
          {gstAmt && +form.gstRate > 0 && (
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Incl. GST in selling price: ₹{gstAmt} (taxable value: ₹{(+form.sellingPrice - +gstAmt).toFixed(2)})
            </p>
          )}
        </div>

        {/* Stock fields — only for new products */}
        {!editMode && (
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="prod-init-stock">{t(lang, 'initialStock')} <span className="req">*</span></label>
              <input id="prod-init-stock" type="number" min="0" className={`form-control ${errors.initialStock ? 'error' : ''}`} value={form.initialStock} onChange={e => set('initialStock', e.target.value)} placeholder="50" />
              {errors.initialStock && <p className="form-error">{errors.initialStock}</p>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-min-stock">{t(lang, 'minStock')}</label>
              <input id="prod-min-stock" type="number" min="0" className="form-control" value={form.minStock} onChange={e => set('minStock', e.target.value)} placeholder="10" />
            </div>
          </div>
        )}

        {editMode && (
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="prod-min-stock">{t(lang, 'minStock')}</label>
              <input id="prod-min-stock" type="number" min="0" className="form-control" value={form.minStock} onChange={e => set('minStock', e.target.value)} placeholder="10" />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-unit">{t(lang, 'unit')}</label>
              <select id="prod-unit" className="form-control form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
        )}

        {!editMode && (
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label" htmlFor="prod-unit">{t(lang, 'unit')}</label>
              <select id="prod-unit" className="form-control form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                {UNITS.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-supplier">{t(lang, 'supplier')}</label>
              <select id="prod-supplier" className="form-control form-select" value={form.supplier} onChange={e => set('supplier', e.target.value)}>
                <option value="">Select Supplier</option>
                {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {editMode && (
          <div className="form-group">
            <label className="form-label" htmlFor="prod-supplier">{t(lang, 'supplier')}</label>
            <select id="prod-supplier" className="form-control form-select" value={form.supplier} onChange={e => set('supplier', e.target.value)}>
              <option value="">Select Supplier</option>
              {suppliers.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        )}

        {editMode && (
          <div className="alert info" style={{ marginBottom: 12 }}>
            ℹ️ To change stock levels, use <strong>Add Stock</strong> or <strong>Adjustments</strong> from the Inventory page.
          </div>
        )}

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button type="button" className="btn btn-outline flex-1" onClick={() => navigate(-1)} id="cancel-btn">
            {t(lang, 'cancel')}
          </button>
          <button type="submit" className="btn btn-primary flex-1" disabled={saving} id="save-product-btn">
            {saving ? 'Saving...' : editMode ? 'Update Product' : t(lang, 'saveProduct')}
          </button>
        </div>
      </form>
    </div>
  );
}
