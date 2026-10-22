import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { formatCurrency } from '../data/mockData';
import { ProductThumb, QtyStepper } from '../components/UI';
import { Search, ShoppingCart, Printer, RefreshCw, CheckCircle, Tag } from 'lucide-react';

// ── GST invoice helper ────────────────────────────────────────
function calcGST(items, products) {
  // Group by GST rate
  const rates = {};
  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    const rate = prod?.gstRate ?? 5;
    if (!rates[rate]) rates[rate] = { taxable: 0, cgst: 0, sgst: 0, total: 0 };
    // Price is inclusive of GST — extract taxable
    const taxable = item.total / (1 + rate / 100);
    const gst     = item.total - taxable;
    rates[rate].taxable += taxable;
    rates[rate].cgst    += gst / 2;
    rates[rate].sgst    += gst / 2;
    rates[rate].total   += item.total;
  }
  return rates;
}

// ── GST Slab Table ────────────────────────────────────────────
function GSTTable({ gstBreakdown }) {
  const slabs = Object.entries(gstBreakdown).filter(([, v]) => v.taxable > 0);
  if (slabs.length === 0 || slabs.every(([r]) => +r === 0)) return null;

  return (
    <div style={{ marginTop: 12, borderTop: '1px dashed #CBD5E1', paddingTop: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        GST Breakup
      </div>
      <table className="invoice-table" style={{ fontSize: 11 }}>
        <thead>
          <tr>
            <th>GST %</th>
            <th style={{ textAlign: 'right' }}>Taxable</th>
            <th style={{ textAlign: 'right' }}>CGST</th>
            <th style={{ textAlign: 'right' }}>SGST</th>
          </tr>
        </thead>
        <tbody>
          {slabs.map(([rate, v]) => (
            <tr key={rate}>
              <td>{rate}%</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(v.taxable)}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(v.cgst)}</td>
              <td style={{ textAlign: 'right' }}>{formatCurrency(v.sgst)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginTop: 6, paddingTop: 6, borderTop: '1px solid var(--border)' }}>
        <span>Total GST</span>
        <span>{formatCurrency(slabs.reduce((s, [, v]) => s + v.cgst + v.sgst, 0))}</span>
      </div>
    </div>
  );
}

// ── Invoice view (shared) ─────────────────────────────────────
export function InvoiceView({ sale, lang, onNew, products }) {
  const formatDT = iso => new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  });

  const gstBreakdown = products ? calcGST(sale.items, products) : {};
  const totalGST = Object.values(gstBreakdown).reduce((s, v) => s + v.cgst + v.sgst, 0);

  return (
    <div className="page-content">
      {onNew && (
        <div className="alert success" style={{ margin: '16px 16px 0', borderRadius: 10 }}>
          <CheckCircle size={18} />
          <strong>{t(lang, 'saleSuccess')}</strong>
        </div>
      )}

      <div className="invoice-card">
        {/* Shop header */}
        <div className="invoice-header">
          <div className="invoice-title">Laxmi Textiles</div>
          <div className="invoice-sub">Main Road, Your Town</div>
          <div className="invoice-sub">Ph: 98765 43210 &nbsp;|&nbsp; GSTIN: 37XXXXX0000X1ZX</div>
          <div style={{ marginTop: 12, fontSize: 18, fontWeight: 800 }}>TAX INVOICE</div>
        </div>

        {/* Invoice meta */}
        <div className="invoice-meta">
          <div><strong>{t(lang, 'invoiceNo')}:</strong> {sale.invoiceNo}</div>
          <div><strong>{t(lang, 'date')}:</strong> {formatDT(sale.date)}</div>
          <div><strong>{t(lang, 'cashier')}:</strong> {sale.cashier}</div>
        </div>

        {/* Items table */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th style={{ textAlign: 'center' }}>GST</th>
              <th style={{ textAlign: 'right' }}>Rate</th>
              <th style={{ textAlign: 'right' }}>Amt</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item, i) => {
              const prod = products?.find(p => p.id === item.productId);
              const rate = prod?.gstRate ?? 5;
              return (
                <tr key={i}>
                  <td>{item.name}</td>
                  <td style={{ textAlign: 'center' }}>{item.qty}</td>
                  <td style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>{rate}%</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.price)}</td>
                  <td style={{ textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals */}
        <div className="invoice-totals">
          <div className="invoice-total-row">
            <span>Subtotal ({sale.items.reduce((s, i) => s + i.qty, 0)} items)</span>
            <span>{formatCurrency(sale.subtotal)}</span>
          </div>
          {sale.discount > 0 && (
            <div className="invoice-total-row">
              <span>Discount</span>
              <span style={{ color: 'var(--green)' }}>− {formatCurrency(sale.discount)}</span>
            </div>
          )}
          {totalGST > 0 && (
            <div className="invoice-total-row">
              <span>Total GST (incl.)</span>
              <span style={{ color: 'var(--text-muted)' }}>{formatCurrency(totalGST)}</span>
            </div>
          )}
          <div className="invoice-total-row grand">
            <span>Grand Total</span>
            <span>{formatCurrency(sale.grandTotal)}</span>
          </div>
        </div>

        {/* GST Slab table */}
        <GSTTable gstBreakdown={gstBreakdown} />

        {/* Footer note */}
        <div style={{ marginTop: 14, fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', borderTop: '1px dashed #CBD5E1', paddingTop: 10 }}>
          All prices inclusive of GST &nbsp;·&nbsp; Thank you for shopping with us!
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 16px 32px' }}>
        <button className="btn btn-outline" onClick={() => window.print()} id="print-bill-btn">
          <Printer size={16} /> {t(lang, 'printBill')}
        </button>
        {onNew && (
          <button className="btn btn-primary" onClick={onNew} id="new-sale-btn">
            <RefreshCw size={16} /> {t(lang, 'newSale')}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Record Sale Page ──────────────────────────────────────────
export default function RecordSalePage() {
  const { products, recordSale, showToast, lang } = useApp();
  const navigate = useNavigate();

  const [search,     setSearch]     = useState('');
  const [cart,       setCart]       = useState({});
  const [discount,   setDiscount]   = useState('');
  const [saleResult, setSaleResult] = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  const filtered = products.filter(p =>
    p.active && p.stock > 0 &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()))
  );

  const setQty = (id, qty) => {
    if (qty === 0) {
      const next = { ...cart }; delete next[id]; setCart(next);
    } else {
      setCart(prev => ({ ...prev, [id]: qty }));
    }
  };

  const cartItems = Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const p = products.find(pr => pr.id === id);
      return { productId: id, name: p.name, qty, price: p.sellingPrice, total: qty * p.sellingPrice, stock: p.stock };
    });

  const subtotal   = cartItems.reduce((s, i) => s + i.total, 0);
  const disc       = Math.min(+discount || 0, subtotal);
  const grandTotal = subtotal - disc;
  const totalItems = cartItems.reduce((s, i) => s + i.qty, 0);

  const handleComplete = async () => {
    if (cartItems.length === 0) { setError('Add at least one item to the cart'); return; }
    setSaving(true); setError('');
    const result = await recordSale(cartItems, disc);
    setSaving(false);
    if (result.success) {
      setSaleResult(result.sale);
      showToast('Sale recorded successfully!', 'success');
    } else {
      setError(result.error || 'Failed to record sale');
    }
  };

  if (saleResult) {
    return <InvoiceView sale={saleResult} lang={lang} onNew={() => { setSaleResult(null); setCart({}); setDiscount(''); }} products={products} />;
  }

  return (
    <div className="page-content">
      <div className="page-title">{t(lang, 'recordSalePage')}</div>

      <div className="search-bar">
        <Search size={18} />
        <input id="sale-search" placeholder={t(lang, 'searchByName')} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {error && <div className="alert error" style={{ marginTop: 0 }}>{error}</div>}

      {/* Product list */}
      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {filtered.length === 0 ? (
          <div className="empty-state"><p>No products available</p></div>
        ) : filtered.map(product => {
          const qty  = cart[product.id] || 0;
          const rate = product.gstRate ?? 5;
          return (
            <div key={product.id} className="sale-item">
              <ProductThumb product={product} size={44} />
              <div className="sale-item__info">
                <div className="sale-item__name">{product.name}</div>
                <div className="sale-item__sub">
                  {product.sku} | Stock: {product.stock}
                  {rate > 0 && <span style={{ marginLeft: 6, fontSize: 10, background: '#EEF2FF', color: '#4338CA', borderRadius: 4, padding: '1px 5px', fontWeight: 600 }}>GST {rate}%</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div className="sale-item__price">{formatCurrency(product.sellingPrice)}</div>
                <QtyStepper value={qty} onChange={v => setQty(product.id, Math.min(v, product.stock))} max={product.stock} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Discount input — shows when cart has items */}
      {cartItems.length > 0 && (
        <div style={{ padding: '12px 16px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Tag size={16} color="var(--text-muted)" />
          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Discount (₹)</label>
          <input
            type="number" min="0" max={subtotal}
            className="form-control"
            style={{ flex: 1 }}
            value={discount}
            onChange={e => setDiscount(e.target.value)}
            placeholder="0"
            id="sale-discount-input"
          />
        </div>
      )}

      {/* Floating footer */}
      {cartItems.length > 0 && (
        <div className="sale-footer">
          <div className="sale-footer-totals">
            <div>
              <div className="sale-footer-label">{t(lang, 'totalItems')}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{totalItems} items</div>
            </div>
            {disc > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div className="sale-footer-label">Discount</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>−{formatCurrency(disc)}</div>
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <div className="sale-footer-label">{t(lang, 'totalAmount')}</div>
              <div className="sale-footer-value">{formatCurrency(grandTotal)}</div>
            </div>
          </div>
          <button className="btn btn-success btn-lg" onClick={handleComplete} disabled={saving} id="complete-sale-btn">
            <ShoppingCart size={20} />
            {saving ? 'Processing...' : t(lang, 'completeSale')}
          </button>
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}
