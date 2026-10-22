import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { CATEGORIES, formatCurrency, getStockStatus } from '../data/mockData';
import { ProductThumb, StockBadge } from '../components/UI';
import { Search, PlusCircle, AlertTriangle } from 'lucide-react';

export default function InventoryPage() {
  const { products, lowStockProducts, outOfStockProducts, lang } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [viewFilter, setViewFilter] = useState('All'); // All, Low Stock, Out of Stock

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    const matchView = viewFilter === 'All' ||
      (viewFilter === 'Low Stock' && p.stock > 0 && p.stock <= p.minStock) ||
      (viewFilter === 'Out of Stock' && p.stock === 0);
    return matchSearch && matchCat && matchView && p.active;
  });

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <div>
          <div className="page-title" style={{ padding: 0 }}>{t(lang, 'currentStock')}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{filtered.length} products</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/inventory/add-stock')} id="go-add-stock-btn" style={{ gap: 4 }}>
          <PlusCircle size={15} /> {t(lang, 'addStock')}
        </button>
      </div>

      {/* Alert row */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <div style={{ display: 'flex', gap: 10, padding: '0 16px 8px' }}>
          {lowStockProducts.length > 0 && (
            <div style={{ flex: 1, background: '#FFEDD5', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #FED7AA' }}>
              <AlertTriangle size={14} color="#F97316" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#9a3412' }}>{lowStockProducts.length} Low Stock</span>
            </div>
          )}
          {outOfStockProducts.length > 0 && (
            <div style={{ flex: 1, background: '#FEE2E2', borderRadius: 10, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #FECACA' }}>
              <AlertTriangle size={14} color="#EF4444" />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#991b1b' }}>{outOfStockProducts.length} Out of Stock</span>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="search-bar">
        <Search size={18} />
        <input
          id="inv-search"
          placeholder={t(lang, 'searchProduct')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Filter chips */}
      <div className="filter-chips">
        {['All', 'Low Stock', 'Out of Stock', ...CATEGORIES.filter(c => c !== 'All')].map(f => {
          const isStockFilter = f === 'Low Stock' || f === 'Out of Stock';
          const isActive = isStockFilter ? viewFilter === f : catFilter === f;
          return (
            <button
              key={f}
              className={`chip ${isActive ? 'active' : ''} ${f === 'Low Stock' && !isActive ? 'low-stock' : ''}`}
              onClick={() => {
                if (isStockFilter) setViewFilter(prev => prev === f ? 'All' : f);
                else setCatFilter(f);
              }}
              id={`inv-filter-${f.toLowerCase().replace(/\s/g,'-')}`}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* Inventory table */}
      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', padding: '8px 16px', background: 'var(--bg-page)', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          <span>Product</span>
          <span style={{ textAlign: 'center' }}>Code</span>
          <span style={{ textAlign: 'right' }}>Stock</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state"><p>{t(lang, 'noProducts')}</p></div>
        ) : filtered.map(product => {
          const status = getStockStatus(product.stock, product.minStock);
          const stockColors = { ok: 'var(--green)', low: 'var(--orange)', out: 'var(--red)' };
          return (
            <div
              key={product.id}
              style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
              onClick={() => navigate(`/products/${product.id}`)}
              id={`inv-row-${product.id}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <ProductThumb product={product} size={38} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{product.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{product.category}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{product.sku}</div>
              <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: stockColors[status] }}>
                {product.stock} {product.unit}
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjustments section */}
      <div className="section-header" style={{ marginTop: 16 }}>
        <span className="section-title">Adjustments</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px' }}>
        <AdjBtn label="Returns" emoji="↩️" path="/inventory/returns" navigate={navigate} id="adj-returns" />
        <AdjBtn label="Damaged" emoji="⚠️" path="/inventory/damage"  navigate={navigate} id="adj-damage"  />
        <AdjBtn label="Adjustments" emoji="🔧" path="/inventory/adjust" navigate={navigate} id="adj-adjust" />
        <AdjBtn label="History" emoji="📋" path="/inventory/history"  navigate={navigate} id="adj-history" />
      </div>
      <div style={{ height: 16 }} />
    </div>
  );
}

function AdjBtn({ label, emoji, path, navigate, id }) {
  return (
    <button
      className="card"
      style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', border: 'none', background: 'var(--bg-white)', width: '100%', textAlign: 'left', fontFamily: 'inherit' }}
      onClick={() => navigate(path)}
      id={id}
    >
      <span style={{ fontSize: 24 }}>{emoji}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </button>
  );
}
