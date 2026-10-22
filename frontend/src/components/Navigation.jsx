import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { LayoutDashboard, Package, ShoppingCart, BarChart2, Truck, Menu, Bell, Globe, X, AlertTriangle, XCircle } from 'lucide-react';

// ── App Header ─────────────────────────────────────────────────
export function AppHeader() {
  const { setSidebarOpen, lang, updateLanguage, lowStockProducts, outOfStockProducts } = useApp();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);

  const totalAlerts = lowStockProducts.length + outOfStockProducts.length;

  return (
    <>
      <header className="app-header">
        <button className="app-header__menu-btn" onClick={() => setSidebarOpen(true)} id="menu-btn" aria-label="Open menu">
          <Menu size={22} />
        </button>
        <div className="app-header__logo">
          <div className="app-header__logo-icon">
            <span style={{ fontSize: 18 }}>🧵</span>
          </div>
          <div>
            <div className="app-header__logo-text">{t(lang, 'appName')}</div>
            <div className="app-header__logo-sub">{t(lang, 'appSub')}</div>
          </div>
        </div>
        <div className="app-header__actions">
          <button className="icon-btn" id="lang-btn" onClick={() => updateLanguage(lang === 'en' ? 'te' : 'en')} aria-label="Switch language" title={lang === 'en' ? 'Switch to Telugu' : 'Switch to English'}>
            <Globe size={20} />
          </button>
          <button
            className="icon-btn"
            id="notif-btn"
            aria-label="Notifications"
            onClick={() => setShowNotifs(prev => !prev)}
            style={{ position: 'relative' }}
          >
            <Bell size={20} />
            {totalAlerts > 0 && (
              <span className="badge" style={{ position: 'absolute', top: -4, right: -4 }}>{totalAlerts}</span>
            )}
          </button>
        </div>
      </header>

      {/* Notification Panel */}
      {showNotifs && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 998, background: 'transparent' }}
            onClick={() => setShowNotifs(false)}
          />
          <div style={{
            position: 'fixed', top: 60, right: 16, left: 16,
            zIndex: 999,
            background: 'var(--bg-white)',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            maxHeight: '70vh',
            overflowY: 'auto',
          }} id="notif-panel">
            {/* Panel header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 16px', borderBottom: '1px solid var(--border)',
              background: 'var(--bg-page)', position: 'sticky', top: 0, zIndex: 1,
            }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>🔔 Notifications</div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }} onClick={() => setShowNotifs(false)} id="close-notif">
                <X size={18} />
              </button>
            </div>

            {totalAlerts === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                <div style={{ fontWeight: 600 }}>All good! No alerts.</div>
              </div>
            ) : (
              <div>
                {/* Out of stock */}
                {outOfStockProducts.length > 0 && (
                  <div>
                    <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: 'var(--red)', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#FEF2F2' }}>
                      🚨 Out of Stock ({outOfStockProducts.length})
                    </div>
                    {outOfStockProducts.map(p => (
                      <div
                        key={p.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                        onClick={() => { navigate(`/products/${p.id}`); setShowNotifs(false); }}
                        id={`notif-out-${p.id}`}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <XCircle size={18} color="#EF4444" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>OUT OF STOCK · {p.sku}</div>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ fontSize: 11, padding: '4px 10px' }}
                          onClick={e => { e.stopPropagation(); navigate('/inventory/add-stock', { state: { productId: p.id } }); setShowNotifs(false); }}
                          id={`notif-restock-${p.id}`}
                        >
                          Restock
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Low stock */}
                {lowStockProducts.length > 0 && (
                  <div>
                    <div style={{ padding: '8px 16px 4px', fontSize: 11, fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px', background: '#FFFBEB' }}>
                      ⚠️ Low Stock ({lowStockProducts.length})
                    </div>
                    {lowStockProducts.map(p => (
                      <div
                        key={p.id}
                        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                        onClick={() => { navigate(`/products/${p.id}`); setShowNotifs(false); }}
                        id={`notif-low-${p.id}`}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFEDD5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <AlertTriangle size={18} color="#F97316" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--orange)', fontWeight: 600 }}>
                            Only {p.stock} {p.unit} left (min: {p.minStock})
                          </div>
                        </div>
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: 11, padding: '4px 10px', borderColor: '#F97316', color: '#F97316' }}
                          onClick={e => { e.stopPropagation(); navigate('/inventory/add-stock', { state: { productId: p.id } }); setShowNotifs(false); }}
                          id={`notif-addstock-${p.id}`}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer action */}
                <div style={{ padding: '12px 16px', background: 'var(--bg-page)' }}>
                  <button
                    className="btn btn-outline w-full"
                    onClick={() => { navigate('/inventory'); setShowNotifs(false); }}
                    id="notif-view-all"
                    style={{ fontSize: 13 }}
                  >
                    View All Inventory →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

// ── Bottom Nav ─────────────────────────────────────────────────
export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useApp();
  const path = location.pathname;

  const items = [
    { icon: LayoutDashboard, label: t(lang, 'dashboard'), path: '/dashboard' },
    { icon: Package,         label: t(lang, 'products'),  path: '/products' },
    { icon: ShoppingCart,    label: t(lang, 'sales'),     path: '/sales' },
    { icon: BarChart2,       label: t(lang, 'inventory'), path: '/inventory' },
    { icon: Truck,           label: t(lang, 'suppliers'), path: '/suppliers' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {items.map(item => {
        const Icon = item.icon;
        const active = path === item.path || (item.path !== '/dashboard' && path.startsWith(item.path));
        return (
          <button key={item.path} className={`nav-item ${active ? 'active' : ''}`} onClick={() => navigate(item.path)} id={`nav-${item.label.toLowerCase().replace(/\s/g,'')}`}>
            <Icon size={22} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Sidebar ────────────────────────────────────────────────────
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen, user, logout, lang } = useApp();
  const path = location.pathname;

  const items = [
    { icon: LayoutDashboard, label: t(lang, 'dashboard'), path: '/dashboard' },
    { icon: Package,         label: t(lang, 'products'),  path: '/products' },
    { icon: ShoppingCart,    label: t(lang, 'sales'),     path: '/sales' },
    { icon: BarChart2,       label: t(lang, 'inventory'), path: '/inventory' },
    { icon: BarChart2,       label: t(lang, 'reports'),   path: '/reports' },
    { icon: Truck,           label: t(lang, 'suppliers'), path: '/suppliers' },
  ];

  const go = (p) => { navigate(p); setSidebarOpen(false); };

  if (!sidebarOpen) return null;

  return (
    <>
      <div className="overlay" onClick={() => setSidebarOpen(false)} id="sidebar-overlay" />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
        <div className="sidebar-header">
          <div style={{ fontSize: 28, marginBottom: 8 }}>🧵</div>
          <div className="sidebar-logo">{t(lang, 'appName')}</div>
          <div className="sidebar-sub">{t(lang, 'appSub')}</div>
        </div>
        <nav className="sidebar-nav">
          {items.map(item => {
            const Icon = item.icon;
            const active = path === item.path;
            return (
              <button key={item.path} className={`sidebar-item ${active ? 'active' : ''}`} onClick={() => go(item.path)} id={`sidebar-${item.path.slice(1)}`}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
          <div className="sidebar-divider" />
          <button className="sidebar-item" onClick={() => go('/settings')} id="sidebar-settings">
            <span>⚙️</span> {t(lang, 'settings')}
          </button>
          <button className="sidebar-item" onClick={() => { logout(); setSidebarOpen(false); }} id="sidebar-logout" style={{ color: '#EF4444' }}>
            <span>🚪</span> Logout
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{user?.displayName?.[0] || 'U'}</div>
            <div>
              <div className="sidebar-user-name">{user?.displayName}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
