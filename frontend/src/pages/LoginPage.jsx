import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { t } from '../i18n/translations';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, authLoading, lang, updateLanguage } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) navigate('/dashboard');
    else setError(res.error || t(lang, 'loginError'));
  };

  return (
    <div className="login-page">
      <div className="login-hero" style={{ width: '100%', maxWidth: 420 }}>
        {/* Hero banner */}
        <div className="login-hero-banner">
          <div className="login-logo-circle">
            <span style={{ fontSize: 36 }}>🧵</span>
          </div>
          <div className="login-brand-name">{t(lang, 'appName')}</div>
          <div className="login-brand-sub">{t(lang, 'appSub')}</div>
        </div>

        {/* Form */}
        <div className="login-form-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ margin: 0 }}>{t(lang, 'loginTitle')}</h2>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => updateLanguage(lang === 'en' ? 'te' : 'en')}
              id="lang-toggle"
              type="button"
            >
              {lang === 'en' ? 'తెలుగు' : 'English'}
            </button>
          </div>

          {error && (
            <div className="alert error" style={{ margin: '0 0 16px' }}>
              <Lock size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">{t(lang, 'loginEmail')}</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: 38 }}
                  placeholder="owner@laxmitextiles.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">{t(lang, 'loginPassword')}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-control"
                  style={{ paddingLeft: 38, paddingRight: 42 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                  id="toggle-pass"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280', marginBottom: 20, cursor: 'pointer' }}>
              <input type="checkbox" id="remember-me" />
              {t(lang, 'loginRemember')}
            </label>

            <button className="btn btn-primary btn-lg" type="submit" disabled={authLoading} id="login-submit">
              {authLoading ? 'Signing in...' : t(lang, 'loginBtn')}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div style={{ marginTop: 16, padding: 12, background: '#F5F6FA', borderRadius: 8, fontSize: 12, color: '#6B7280' }}>
            <strong>Demo credentials:</strong><br />
            Owner: owner@laxmitextiles.com / password123<br />
            Staff: staff@laxmitextiles.com / staff123
          </div>
        </div>
      </div>
    </div>
  );
}
