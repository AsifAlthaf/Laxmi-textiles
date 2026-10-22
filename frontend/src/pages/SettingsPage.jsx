import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { Globe, LogOut, User, Bell, Info } from 'lucide-react';

export default function SettingsPage() {
  const { user, logout, lang, updateLanguage } = useApp();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="page-content">
      <div className="page-title">Settings</div>

      {/* User profile */}
      <div className="card" style={{ margin: '0 16px 16px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--blue-bg)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
          {user?.displayName?.[0] || 'U'}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.displayName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user?.email}</div>
          <div style={{ marginTop: 4 }}>
            <span className="status-badge active" style={{ fontSize: 10 }}>{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Settings items */}
      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px 12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <SettingItem
          icon={Globe}
          iconBg="#DBEAFE"
          iconColor="var(--blue)"
          label="Language"
          right={
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={`chip ${lang === 'en' ? 'active' : ''}`} onClick={() => updateLanguage('en')} style={{ padding: '4px 12px' }} id="lang-en">English</button>
              <button className={`chip ${lang === 'te' ? 'active' : ''}`} onClick={() => updateLanguage('te')} style={{ padding: '4px 12px' }} id="lang-te">తెలుగు</button>
            </div>
          }
        />
        <SettingItem
          icon={Bell}
          iconBg="#DCFCE7"
          iconColor="var(--green)"
          label="Low Stock Alerts"
          right={
            <label className="toggle" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} id="notifications-toggle" style={{ display: 'none' }} />
              <div style={{
                width: 44, height: 24, borderRadius: 12,
                background: notifications ? 'var(--brand-primary)' : 'var(--border)',
                transition: 'background .2s',
                position: 'relative',
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: 'white',
                  position: 'absolute', top: 3,
                  left: notifications ? 23 : 3,
                  transition: 'left .2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }} />
              </div>
            </label>
          }
        />
      </div>

      {/* App info */}
      <div style={{ background: 'var(--bg-white)', borderRadius: 'var(--r-lg)', margin: '0 16px 12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <div style={{ padding: '16px', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, background: '#EEF2FF', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧵</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Laxmi Textiles IMS</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Version 1.0.0 · Made with ❤️ for local stores</div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: '0 16px 32px' }}>
        <button className="btn btn-danger w-full" onClick={logout} id="logout-btn">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

function SettingItem({ icon: Icon, iconBg, iconColor, label, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', gap: 12 }}>
      <div style={{ width: 36, height: 36, background: iconBg, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={18} color={iconColor} />
      </div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{label}</div>
      {right}
    </div>
  );
}
