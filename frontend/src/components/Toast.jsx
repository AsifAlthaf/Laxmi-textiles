import { useApp } from '../context/AppContext';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = { success: CheckCircle, error: AlertCircle, warning: AlertTriangle, info: Info };
const colors = { success: '#22C55E', error: '#EF4444', warning: '#EAB308', info: '#3B82F6' };

export default function ToastContainer() {
  const { toasts } = useApp();
  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = icons[t.type] || CheckCircle;
        return (
          <div key={t.id} className={`toast ${t.type}`}>
            <Icon size={16} color={colors[t.type]} />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
