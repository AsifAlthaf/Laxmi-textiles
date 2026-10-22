import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { formatCurrency } from '../data/mockData';
import {
  BarChart2, TrendingUp, Package, ShoppingCart,
  Truck, Download, ArrowLeft, ChevronRight, DollarSign,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────
const fmtDate = iso => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
};

// ── Main Page ─────────────────────────────────────────────────
export default function ReportsPage() {
  const { lang, sales, products, transactions } = useApp();
  const [active, setActive] = useState(null);

  if (active) {
    return (
      <ReportDetail
        type={active}
        sales={sales}
        products={products}
        transactions={transactions}
        onBack={() => setActive(null)}
        lang={lang}
      />
    );
  }

  const today     = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const lastMonth = new Date(Date.now() - 30 * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 16px 8px' }}>
        <div className="page-title" style={{ padding: 0 }}>{t(lang, 'reportsTitle')}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-page)', padding: '6px 10px', borderRadius: 20, border: '1px solid var(--border)' }}>
          📅 {lastMonth} → {today}
        </div>
      </div>

      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '8px 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <ReportRow icon={TrendingUp}  iconBg="#DCFCE7" iconColor="#22C55E" title={t(lang, 'salesReport')}       sub={t(lang, 'salesReportSub')}       onClick={() => setActive('sales')}    id="rep-sales"    />
        <ReportRow icon={Package}     iconBg="#DBEAFE" iconColor="#3B82F6" title={t(lang, 'stockReport')}       sub={t(lang, 'stockReportSub')}       onClick={() => setActive('stock')}    id="rep-stock"    />
        <ReportRow icon={DollarSign}  iconBg="#F0FDF4" iconColor="#16A34A" title="Profit Margin Report"         sub="Cost vs selling price per product" onClick={() => setActive('margin')}   id="rep-margin"   />
        <ReportRow icon={ShoppingCart}iconBg="#FFEDD5" iconColor="#F97316" title={t(lang, 'purchaseReport')}    sub={t(lang, 'purchaseReportSub')}    onClick={() => setActive('purchase')} id="rep-purchase" />
        <ReportRow icon={BarChart2}   iconBg="#F3E8FF" iconColor="#A855F7" title={t(lang, 'productWiseReport')} sub={t(lang, 'productWiseSub')}       onClick={() => setActive('products')} id="rep-products" />
        <ReportRow icon={Truck}       iconBg="#FCE7F3" iconColor="#EC4899" title={t(lang, 'supplierWiseReport')} sub={t(lang, 'supplierWiseSub')}     onClick={() => setActive('supplier')} id="rep-supplier" last />
      </div>
    </div>
  );
}

function ReportRow({ icon: Icon, iconBg, iconColor, title, sub, onClick, id, last }) {
  return (
    <div className="report-item" style={{ borderBottom: last ? 'none' : undefined }} onClick={onClick} id={id}>
      <div className="report-item__icon" style={{ background: iconBg }}>
        <Icon size={22} color={iconColor} />
      </div>
      <div className="report-item__body">
        <div className="report-item__title">{title}</div>
        <div className="report-item__sub">{sub}</div>
      </div>
      <ChevronRight size={18} color="var(--text-muted)" />
    </div>
  );
}

// ── Report Detail ─────────────────────────────────────────────
function ReportDetail({ type, sales, products, transactions, onBack, lang }) {
  const totalRevenue = sales.reduce((s, sale) => s + sale.grandTotal, 0);
  const totalCost    = products.reduce((s, p)  => s + p.costPrice * p.stock, 0);

  const titles = {
    sales: 'Sales Report', stock: 'Stock Report', margin: 'Profit Margin Report',
    purchase: 'Purchase Report', products: 'Product-wise Report', supplier: 'Supplier Report',
  };

  // ── CSV export ────────────────────────────────────────────────
  const downloadCSV = () => {
    let csv = '';
    if (type === 'sales') {
      csv = 'Invoice,Date,Cashier,Items,Total\n' +
        sales.map(s => `${s.invoiceNo},${fmtDate(s.date)},${s.cashier},${s.items.length},${s.grandTotal}`).join('\n');
    } else if (type === 'stock') {
      csv = 'Product,SKU,Category,Stock,MinStock,Status\n' +
        products.map(p => `${p.name},${p.sku},${p.category},${p.stock},${p.minStock},${p.stock === 0 ? 'Out' : p.stock <= p.minStock ? 'Low' : 'OK'}`).join('\n');
    } else if (type === 'margin') {
      csv = 'Product,SKU,Cost Price,Selling Price,Margin %,Profit/Unit,Stock,Stock Value (Selling)\n' +
        [...products]
          .sort((a, b) => {
            const mA = a.costPrice ? ((a.sellingPrice - a.costPrice) / a.costPrice) * 100 : 0;
            const mB = b.costPrice ? ((b.sellingPrice - b.costPrice) / b.costPrice) * 100 : 0;
            return mB - mA;
          })
          .map(p => {
            const margin = p.costPrice ? (((p.sellingPrice - p.costPrice) / p.costPrice) * 100).toFixed(1) : 0;
            const profit = (p.sellingPrice - p.costPrice).toFixed(0);
            return `${p.name},${p.sku},${p.costPrice},${p.sellingPrice},${margin}%,${profit},${p.stock},${(p.sellingPrice * p.stock).toFixed(0)}`;
          }).join('\n');
    } else if (type === 'products') {
      csv = 'Product,Selling Price,Stock,Stock Value\n' +
        products.map(p => `${p.name},${p.sellingPrice},${p.stock},${p.sellingPrice * p.stock}`).join('\n');
    } else {
      csv = 'No data for this report type';
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${type}-report.csv`;
    a.click();
  };

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 16px 8px' }}>
        <button className="icon-btn btn-outline" onClick={onBack} id="back-rep"><ArrowLeft size={20} /></button>
        <div className="page-title" style={{ padding: 0, flex: 1 }}>{titles[type]}</div>
        <button className="btn btn-outline btn-sm" onClick={downloadCSV} id="download-csv">
          <Download size={14} /> CSV
        </button>
      </div>

      {/* ── SALES ── */}
      {type === 'sales' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 12px' }}>
            <MiniCard label="Total Revenue"   value={formatCurrency(totalRevenue)} color="var(--green)" />
            <MiniCard label="Total Bills"     value={`${sales.length} bills`}      color="var(--brand-primary)" />
          </div>
          <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '8px 16px', background: 'var(--bg-page)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              <span>Invoice</span><span style={{ textAlign: 'center' }}>Date</span><span style={{ textAlign: 'right' }}>Total</span>
            </div>
            {sales.map(s => (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '10px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{s.invoiceNo}</span>
                <span style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>{fmtDate(s.date)}</span>
                <span style={{ textAlign: 'right', fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{formatCurrency(s.grandTotal)}</span>
              </div>
            ))}
            {sales.length === 0 && <div className="empty-state"><p>No sales recorded yet</p></div>}
          </div>
        </>
      )}

      {/* ── STOCK ── */}
      {type === 'stock' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 12px' }}>
            <MiniCard label="Stock Value (Cost)" value={formatCurrency(totalCost)}                           color="var(--blue)" />
            <MiniCard label="Active Products"    value={products.filter(p => p.active).length}               color="var(--brand-primary)" />
          </div>
          <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
            {products.map(p => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.sku}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: p.stock === 0 ? 'var(--red)' : p.stock <= p.minStock ? 'var(--orange)' : 'var(--green)' }}>{p.stock} pcs</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatCurrency(p.costPrice * p.stock)}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── PROFIT MARGIN ── */}
      {type === 'margin' && (() => {
        const sorted = [...products]
          .filter(p => p.costPrice > 0)
          .sort((a, b) => {
            const mA = ((a.sellingPrice - a.costPrice) / a.costPrice) * 100;
            const mB = ((b.sellingPrice - b.costPrice) / b.costPrice) * 100;
            return mB - mA;
          });

        const totalProfit = sorted.reduce((s, p) => s + (p.sellingPrice - p.costPrice) * p.stock, 0);
        const avgMargin   = sorted.length
          ? (sorted.reduce((s, p) => s + ((p.sellingPrice - p.costPrice) / p.costPrice) * 100, 0) / sorted.length).toFixed(1)
          : 0;
        const best  = sorted[0];
        const worst = sorted[sorted.length - 1];

        return (
          <>
            {/* Summary cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 12px' }}>
              <MiniCard label="Total Potential Profit" value={formatCurrency(totalProfit)} color="var(--green)" />
              <MiniCard label="Avg Margin"             value={`${avgMargin}%`}             color="var(--brand-primary)" />
            </div>

            {/* Best / Worst */}
            {best && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 12px' }}>
                <div style={{ background: '#DCFCE7', borderRadius: 10, padding: '10px 12px', border: '1px solid #86EFAC' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#166534', marginBottom: 4 }}>🏆 BEST MARGIN</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{best.name}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#15803d' }}>
                    {(((best.sellingPrice - best.costPrice) / best.costPrice) * 100).toFixed(1)}%
                  </div>
                </div>
                {worst && worst.id !== best.id && (
                  <div style={{ background: '#FEE2E2', borderRadius: 10, padding: '10px 12px', border: '1px solid #FECACA' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#991B1B', marginBottom: 4 }}>⚠️ LOWEST MARGIN</div>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{worst.name}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: '#b91c1c' }}>
                      {(((worst.sellingPrice - worst.costPrice) / worst.costPrice) * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Per-product table */}
            <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 60px', padding: '8px 16px', background: 'var(--bg-page)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', gap: 4 }}>
                <span>Product</span>
                <span style={{ textAlign: 'right' }}>Cost</span>
                <span style={{ textAlign: 'right' }}>Sell</span>
                <span style={{ textAlign: 'right' }}>Margin</span>
              </div>

              {sorted.map(p => {
                const margin = ((p.sellingPrice - p.costPrice) / p.costPrice) * 100;
                const profit  = p.sellingPrice - p.costPrice;
                const color   = margin >= 30 ? '#15803d' : margin >= 15 ? '#a16207' : '#b91c1c';
                const bg      = margin >= 30 ? '#DCFCE7' : margin >= 15 ? '#FEF9C3' : '#FEE2E2';

                return (
                  <div key={p.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 52px 52px 60px', alignItems: 'center', gap: 4 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.sku} · Stock: {p.stock}</div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text-secondary)' }}>{formatCurrency(p.costPrice)}</div>
                      <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600 }}>{formatCurrency(p.sellingPrice)}</div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color, background: bg, borderRadius: 6, padding: '2px 6px' }}>
                          {margin.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {/* Margin progress bar */}
                    <div style={{ marginTop: 6, height: 4, borderRadius: 2, background: '#F3F4F6', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 2,
                        width: `${Math.min(margin, 100)}%`,
                        background: margin >= 30 ? '#22C55E' : margin >= 15 ? '#EAB308' : '#EF4444',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3, fontSize: 11, color: 'var(--text-muted)' }}>
                      <span>₹{profit.toFixed(0)} profit/unit</span>
                      <span>Stock value: {formatCurrency(profit * p.stock)}</span>
                    </div>
                  </div>
                );
              })}

              {sorted.length === 0 && <div className="empty-state"><p>No product price data yet</p></div>}
            </div>
          </>
        );
      })()}

      {/* ── PRODUCT-WISE ── */}
      {type === 'products' && (
        <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 16px', background: 'var(--bg-page)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>
            PRODUCT — SELLING PRICE — STOCK VALUE
          </div>
          {[...products].sort((a, b) => (b.sellingPrice * b.stock) - (a.sellingPrice * a.stock)).map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatCurrency(p.sellingPrice)} / {p.unit}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand-primary)' }}>
                {formatCurrency(p.sellingPrice * p.stock)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── PURCHASE / SUPPLIER ── */}
      {(type === 'purchase' || type === 'supplier') && (
        <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          {transactions.filter(t => t.type === 'receipt').map(txn => (
            <div key={txn.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{txn.productName}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{txn.ref} · {fmtDate(txn.date)}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>+{txn.qty} pcs</div>
            </div>
          ))}
          {transactions.filter(t => t.type === 'receipt').length === 0 && (
            <div className="empty-state"><p>No stock receipts recorded yet</p></div>
          )}
        </div>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}

function MiniCard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--bg-white)', borderRadius: 10, border: '1px solid var(--border)', padding: '12px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
