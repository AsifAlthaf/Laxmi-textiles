import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { formatCurrency, formatDate } from '../data/mockData';
import { InvoiceView } from './RecordSalePage';

export default function SalesHistoryPage() {
  const { sales, products, lang } = useApp();
  const [selected, setSelected] = useState(null);

  // Show GST invoice view for selected sale
  if (selected) {
    return (
      <InvoiceView
        sale={selected}
        lang={lang}
        products={products}
        onNew={null} // no "New Sale" button from history view
      />
    );
  }

  const totalRevenue = sales.reduce((s, sale) => s + sale.grandTotal, 0);

  return (
    <div className="page-content">
      <div style={{ padding: '16px 16px 8px' }}>
        <div className="page-title" style={{ padding: 0 }}>Sales History</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{sales.length} records</div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px 12px' }}>
        <div style={{ background: 'var(--green-bg)', borderRadius: 12, padding: '12px 14px', border: '1px solid #bbf7d0' }}>
          <div style={{ fontSize: 11, color: '#166534', fontWeight: 600 }}>Total Revenue</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d' }}>{formatCurrency(totalRevenue)}</div>
        </div>
        <div style={{ background: 'var(--blue-bg)', borderRadius: 12, padding: '12px 14px', border: '1px solid #bfdbfe' }}>
          <div style={{ fontSize: 11, color: '#1e40af', fontWeight: 600 }}>Total Bills</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1d4ed8' }}>{sales.length}</div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {sales.length === 0 ? (
          <div className="empty-state"><p>{t(lang, 'noSales')}</p></div>
        ) : sales.map((sale, i) => (
          <div
            key={sale.id}
            style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: i === sales.length - 1 ? 'none' : '1px solid var(--border)', cursor: 'pointer', gap: 12 }}
            onClick={() => setSelected(sale)}
            id={`sale-row-${sale.id}`}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 18 }}>🧾</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{sale.invoiceNo}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(sale.date)} · {sale.cashier} · {sale.items.length} items</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--green)' }}>{formatCurrency(sale.grandTotal)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap for bill</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ height: 16 }} />
    </div>
  );
}
