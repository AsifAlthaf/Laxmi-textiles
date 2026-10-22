import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { formatCurrency, formatDate, getStockStatus } from '../data/mockData';
import { ProductThumb, StockBadge, ConfirmModal } from '../components/UI';
import { ArrowLeft, Edit2, Package, TrendingUp, AlertTriangle, PlusCircle } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { products, transactions, toggleProductStatus, showToast, lang, user } = useApp();
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState(false);

  const product = products.find(p => p.id === id);
  if (!product) return (
    <div className="page-content">
      <div className="empty-state"><p>Product not found.</p></div>
    </div>
  );

  const prodTxns = transactions.filter(t => t.productId === id).slice(0, 8);
  const status = getStockStatus(product.stock, product.minStock);

  return (
    <div className="page-content">
      {/* Back bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 0' }}>
        <button className="icon-btn btn-outline" onClick={() => navigate(-1)} id="back-btn"><ArrowLeft size={20} /></button>
        <div style={{ flex: 1, fontSize: 17, fontWeight: 700 }}>Product Details</div>
        {user?.role === 'OWNER' && (
          <button className="btn btn-outline btn-sm" onClick={() => navigate(`/products/edit/${id}`)} id="edit-product-btn">
            <Edit2 size={14} /> Edit
          </button>
        )}
      </div>

      {/* Product card */}
      <div className="card" style={{ margin: '16px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <ProductThumb product={product} size={72} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{product.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', margin: '3px 0' }}>Code: {product.sku} | {product.category}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Colour: {product.colour} | Size: {product.size}</div>
          <div style={{ marginTop: 8 }}>
            <StockBadge stock={product.stock} minStock={product.minStock} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, padding: '0 16px 12px' }}>
        <MiniStat label="Selling Price" value={formatCurrency(product.sellingPrice)} color="var(--brand-primary)" />
        <MiniStat label="Cost Price"    value={formatCurrency(product.costPrice)}    color="var(--text-secondary)" />
        <MiniStat label="Current Stock" value={`${product.stock} ${product.unit}`}  color={status === 'out' ? 'var(--red)' : status === 'low' ? 'var(--orange)' : 'var(--green)'} />
      </div>

      {/* More details */}
      <div className="card" style={{ margin: '0 16px 12px' }}>
        <DetailRow label="Supplier" value={product.supplier || '—'} />
        <DetailRow label="Min Stock" value={`${product.minStock} ${product.unit}`} />
        <DetailRow label="Unit" value={product.unit} />
        <DetailRow label="Status" value={product.active ? 'Active' : 'Inactive'} valueColor={product.active ? 'var(--green)' : 'var(--red)'} />
        <DetailRow label="Added" value={formatDate(product.createdAt)} last />
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 16px' }}>
        <button className="btn btn-primary" onClick={() => navigate('/inventory/add-stock', { state: { productId: id } })} id="add-stock-from-detail">
          <PlusCircle size={16} /> Add Stock
        </button>
        <button className="btn btn-success" onClick={() => navigate('/sales/new', { state: { productId: id } })} id="record-sale-from-detail">
          <TrendingUp size={16} /> Record Sale
        </button>
      </div>

      {/* Transaction history */}
      <div className="section-header">
        <span className="section-title">Transaction History</span>
      </div>
      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {prodTxns.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}><p>No transactions yet</p></div>
        ) : prodTxns.map(txn => (
          <div key={txn.id} className="txn-item">
            <div className={`txn-icon ${txn.type === 'receipt' ? 'receipt' : txn.type === 'sale' ? 'sale' : 'adjust'}`}>
              <Package size={16} />
            </div>
            <div className="txn-info">
              <div className="txn-product" style={{ textTransform: 'capitalize' }}>{txn.type}</div>
              <div className="txn-meta">{txn.ref} · {formatDate(txn.date)}</div>
            </div>
            <div className={`txn-qty ${txn.qty >= 0 ? 'positive' : 'negative'}`}>
              {txn.qty >= 0 ? '+' : ''}{txn.qty} pcs
            </div>
          </div>
        ))}
      </div>

      {user?.role === 'OWNER' && (
        <div style={{ padding: '16px' }}>
          <button className={`btn ${product.active ? 'btn-danger' : 'btn-outline'} w-full`} onClick={() => setConfirm(true)} id="toggle-status-btn">
            {product.active ? 'Deactivate Product' : 'Activate Product'}
          </button>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title={product.active ? 'Deactivate Product?' : 'Activate Product?'}
          message={`Are you sure you want to ${product.active ? 'deactivate' : 'activate'} "${product.name}"?`}
          onConfirm={() => { toggleProductStatus(id); showToast('Product status updated', 'success'); setConfirm(false); }}
          onCancel={() => setConfirm(false)}
          danger={product.active}
        />
      )}
      <div style={{ height: 16 }} />
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg-white)', borderRadius: 10, border: '1px solid var(--border)', padding: '10px 12px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value, valueColor, last }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: last ? 0 : 10, marginBottom: last ? 0 : 10, borderBottom: last ? 'none' : '1px solid var(--border)' }}>
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: valueColor || 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}
