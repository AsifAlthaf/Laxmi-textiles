// Product thumbnail component with colored fallback
export function ProductThumb({ product, size = 52 }) {
  return (
    <div
      className="product-thumb"
      style={{ width: size, height: size, background: product.imageColor + '22', flexShrink: 0 }}
    >
      <span style={{ fontSize: size * 0.5 }}>
        {categoryEmoji(product.category)}
      </span>
    </div>
  );
}

function categoryEmoji(cat) {
  const map = {
    'Sarees': '👘',
    'Shirts': '👕',
    'Trousers': '👖',
    'Dress Material': '🧶',
    'Home': '🛏️',
    default: '🧵',
  };
  return map[cat] || map.default;
}

// Stock status badge
export function StockBadge({ stock, minStock }) {
  const status = stock === 0 ? 'out' : stock <= minStock ? 'low' : 'ok';
  const label = stock === 0 ? 'Out of Stock' : stock <= minStock ? 'Low Stock' : 'In Stock';
  return <span className={`status-badge ${status}`}>{label}</span>;
}

// Simple loading skeleton rows
export function SkeletonList({ count = 4 }) {
  return (
    <div style={{ padding: '0 16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div className="skeleton" style={{ height: 14, borderRadius: 6, width: '60%' }} />
            <div className="skeleton" style={{ height: 11, borderRadius: 6, width: '40%' }} />
            <div className="skeleton" style={{ height: 11, borderRadius: 6, width: '30%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// Confirmation modal
export function ConfirmModal({ title, message, onConfirm, onCancel, danger = false }) {
  return (
    <>
      <div className="overlay" onClick={onCancel} />
      <div className="modal" id="confirm-modal">
        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-outline flex-1" onClick={onCancel} id="confirm-cancel">Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'} flex-1`} onClick={onConfirm} id="confirm-ok">Confirm</button>
        </div>
      </div>
    </>
  );
}

// Quantity stepper
export function QtyStepper({ value, onChange, min = 0, max = 9999 }) {
  return (
    <div className="qty-stepper">
      <button className="qty-btn" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} id="qty-minus">−</button>
      <span className="qty-val">{value}</span>
      <button className="qty-btn" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} id="qty-plus">+</button>
    </div>
  );
}

// Page layout wrapper
export function PageLayout({ children, noPad = false }) {
  return (
    <div className="page-content" style={noPad ? {} : {}}>
      {children}
    </div>
  );
}
