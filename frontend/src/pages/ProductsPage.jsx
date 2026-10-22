import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { CATEGORIES, formatCurrency, getStockStatus } from '../data/mockData';
import { ProductThumb, StockBadge, ConfirmModal } from '../components/UI';
import { Search, Plus, ChevronRight, ToggleLeft, ToggleRight } from 'lucide-react';

export default function ProductsPage() {
  const { products, toggleProductStatus, showToast, lang, user } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [confirmToggle, setConfirmToggle] = useState(null);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleToggle = (product) => {
    toggleProductStatus(product.id);
    showToast(`${product.name} ${product.active ? 'deactivated' : 'activated'}`, 'success');
    setConfirmToggle(null);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <div>
          <div className="page-title" style={{ padding: 0 }}>{t(lang, 'products')}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{filtered.length} items</div>
        </div>
        {user?.role === 'OWNER' && (
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/products/add')} id="add-product-btn" style={{ gap: 4 }}>
            <Plus size={16} />
            {t(lang, 'addProduct')}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="search-bar">
        <Search size={18} />
        <input
          id="product-search"
          placeholder="Search by name, category, or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category chips */}
      <div className="filter-chips">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`chip ${catFilter === cat ? 'active' : ''}`}
            onClick={() => setCatFilter(cat)}
            id={`cat-${cat.toLowerCase().replace(/\s/g,'-')}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Search size={40} />
            <p>{t(lang, 'noProducts')}</p>
          </div>
        ) : filtered.map(product => {
          const status = getStockStatus(product.stock, product.minStock);
          return (
            <div key={product.id} className="product-item" onClick={() => navigate(`/products/${product.id}`)}>
              <ProductThumb product={product} />
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-code">Code: {product.sku} | {product.category}</div>
                <div className={`product-stock ${status}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span className={`stock-dot ${status}`} />
                  Stock: {product.stock} pcs
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div className="product-price">{formatCurrency(product.sellingPrice)}</div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 16 }} />

      {confirmToggle && (
        <ConfirmModal
          title={`${confirmToggle.active ? 'Deactivate' : 'Activate'} product?`}
          message={`Are you sure you want to ${confirmToggle.active ? 'deactivate' : 'activate'} "${confirmToggle.name}"?`}
          onConfirm={() => handleToggle(confirmToggle)}
          onCancel={() => setConfirmToggle(null)}
          danger={confirmToggle.active}
        />
      )}
    </div>
  );
}
