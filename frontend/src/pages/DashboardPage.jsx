import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { formatCurrency, formatDateTime, getStockStatus } from '../data/mockData';
import { Package, TrendingUp, AlertTriangle, XCircle, PlusCircle, ShoppingCart, BarChart2, Truck, ArrowRight, TrendingDown } from 'lucide-react';

const txnIcons = {
  sale:    { icon: ShoppingCart, cls: 'sale',    sign: '−' },
  receipt: { icon: PlusCircle,   cls: 'receipt', sign: '+' },
  adjust:  { icon: BarChart2,    cls: 'adjust',  sign: '±' },
  return:  { icon: ArrowRight,   cls: 'return',  sign: '+' },
  damage:  { icon: AlertTriangle,cls: 'damage',  sign: '−' },
};

export default function DashboardPage() {
  const { products, transactions, lang, lowStockProducts, outOfStockProducts, todaySales, todayRevenue, totalStock } = useApp();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });
  const recentTxns = transactions.slice(0, 5);

  return (
    <div className="page-content">
      {/* Page title */}
      <div style={{ padding: '18px 16px 6px' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{t(lang, 'dashboard')}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
          {t(lang, 'today')}: {today}
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '12px 16px' }}>
        <StatCard
          icon={Package}
          cls="blue"
          label={t(lang, 'totalProducts')}
          value={products.filter(p => p.active).length.toLocaleString()}
          sub="Active products"
        />
        <StatCard
          icon={TrendingUp}
          cls="green"
          label={t(lang, 'totalStock')}
          value={totalStock.toLocaleString()}
          sub="Pieces"
        />
        <StatCard
          icon={ShoppingCart}
          cls="orange"
          label={t(lang, 'todaySales')}
          value={formatCurrency(todayRevenue)}
          sub={`${todaySales.length} bills`}
        />
        <StatCard
          icon={AlertTriangle}
          cls="pink"
          label={t(lang, 'lowStock')}
          value={lowStockProducts.length}
          sub={`${outOfStockProducts.length} out of stock`}
        />
      </div>

      {/* Quick actions */}
      <div className="quick-actions" style={{ padding: '0 16px 16px' }}>
        <button
          className="quick-action-btn add-stock"
          onClick={() => navigate('/inventory/add-stock')}
          id="dash-add-stock"
        >
          <PlusCircle size={20} />
          {t(lang, 'addStock')}
        </button>
        <button
          className="quick-action-btn record-sale"
          onClick={() => navigate('/sales/new')}
          id="dash-record-sale"
        >
          <ShoppingCart size={20} />
          {t(lang, 'recordSale')}
        </button>
      </div>

      {/* Icon quick links */}
      <div className="icon-links">
        <button className="icon-link" onClick={() => navigate('/products')} id="dash-link-products">
          <div className="icon-link__icon" style={{ background: '#DBEAFE' }}>
            <Package size={24} color="#3B82F6" />
          </div>
          <span className="icon-link__label">{t(lang, 'products')}</span>
        </button>
        <button className="icon-link" onClick={() => navigate('/reports')} id="dash-link-reports">
          <div className="icon-link__icon" style={{ background: '#DCFCE7' }}>
            <BarChart2 size={24} color="#22C55E" />
          </div>
          <span className="icon-link__label">{t(lang, 'reports')}</span>
        </button>
        <button className="icon-link" onClick={() => navigate('/suppliers')} id="dash-link-suppliers">
          <div className="icon-link__icon" style={{ background: '#FFEDD5' }}>
            <Truck size={24} color="#F97316" />
          </div>
          <span className="icon-link__label">{t(lang, 'suppliers')}</span>
        </button>
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          <div className="alert warning">
            <AlertTriangle size={16} />
            <div>
              <strong>{lowStockProducts.length} items need restocking.</strong>
              {' '}
              <button className="section-link" style={{ color: '#92400e', fontWeight: 700 }} onClick={() => navigate('/inventory')}>View →</button>
            </div>
          </div>
        </div>
      )}

      {/* Recent movements */}
      <div className="section-header">
        <span className="section-title">{t(lang, 'recentMovements')}</span>
        <button className="section-link" onClick={() => navigate('/inventory')} id="view-all-txns">{t(lang, 'viewAll')}</button>
      </div>

      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {recentTxns.length === 0 ? (
          <div className="empty-state"><p>No recent movements</p></div>
        ) : recentTxns.map(txn => {
          const meta = txnIcons[txn.type] || txnIcons.adjust;
          const Icon = meta.icon;
          const positive = txn.qty > 0;
          return (
            <div key={txn.id} className="txn-item">
              <div className={`txn-icon ${meta.cls}`}>
                <Icon size={17} />
              </div>
              <div className="txn-info">
                <div className="txn-product">{txn.productName}</div>
                <div className="txn-meta">{txn.type} · {formatDateTime(txn.date)}</div>
              </div>
              <div className={`txn-qty ${positive ? 'positive' : 'negative'}`}>
                {positive ? '+' : ''}{txn.qty} pcs
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ height: 16 }} />
    </div>
  );
}

function StatCard({ icon: Icon, cls, label, value, sub }) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon ${cls}`}>
        <Icon size={22} />
      </div>
      <div className="stat-card__body">
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__sub">{sub}</div>
      </div>
    </div>
  );
}
