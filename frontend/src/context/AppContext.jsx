import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  USE_MOCK, FIREBASE_CONFIGURED,
  auth,
} from '../lib/firebase';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';

// Firestore service
import * as FS from '../lib/firestoreService';

// Mock data fallback
import {
  MOCK_USER, MOCK_PRODUCTS, MOCK_TRANSACTIONS, MOCK_SALES, MOCK_SUPPLIERS,
} from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  /* ---- Auth ---- */
  // Restore mock session from localStorage on mount
  const savedUser = USE_MOCK ? (() => { try { return JSON.parse(localStorage.getItem('lt_user') || 'null'); } catch { return null; } })() : null;
  const [user, setUser]               = useState(savedUser);
  const [authLoading, setAuthLoading] = useState(USE_MOCK ? false : true); // Firebase needs a tick to restore session

  /* ---- Data ---- */
  const [products,     setProducts]     = useState(USE_MOCK ? MOCK_PRODUCTS : []);
  const [transactions, setTransactions] = useState(USE_MOCK ? MOCK_TRANSACTIONS : []);
  const [sales,        setSales]        = useState(USE_MOCK ? MOCK_SALES : []);
  const [suppliers,    setSuppliers]    = useState(USE_MOCK ? MOCK_SUPPLIERS : []);
  const [dataLoading,  setDataLoading]  = useState(false);

  /* ---- UI ---- */
  const [toasts,      setToasts]      = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lang,        setLang]        = useState(localStorage.getItem('lt_lang') || 'en');

  /* ---- Unsubscribe refs ---- */
  const unsubs = useRef([]);

  /* ---- Firebase auth listener ---- */
  useEffect(() => {
    if (USE_MOCK) return;

    const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Load user profile (role, displayName)
        const profile = await FS.fetchUserProfile(firebaseUser.uid);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: profile?.displayName || firebaseUser.displayName || firebaseUser.email,
          role: profile?.role || 'STAFF',
        });
        // Subscribe to live data after auth
        startListeners();
      } else {
        setUser(null);
        stopListeners();
        setSales([]);
        setProducts([]);
        setTransactions([]);
        setSuppliers([]);
      }
      setAuthLoading(false);
    });

    return () => { unsubAuth(); stopListeners(); };
  }, []);

  function startListeners() {
    // Real-time products
    const u1 = FS.subscribeProducts(data => {
      setProducts(data.map(p => ({ ...p, stock: p.stock ?? 0 })));
    });

    // Real-time inventory balances → merge into products.stock
    const u2 = FS.subscribeInventory(balances => {
      setProducts(prev => prev.map(p => {
        const bal = balances.find(b => b.id === p.id || b.productId === p.id);
        return bal ? { ...p, stock: bal.quantityOnHand ?? 0 } : p;
      }));
    });

    // Real-time transactions
    const u3 = FS.subscribeTransactions(data => {
      setTransactions(data.map(t => ({
        ...t,
        date: t.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })));
    });

    // Real-time sales
    const u4 = FS.subscribeSales(data => setSales(data));

    // Load suppliers once
    FS.fetchSuppliers().then(setSuppliers).catch(console.error);

    unsubs.current = [u1, u2, u3, u4];
  }

  function stopListeners() {
    unsubs.current.forEach(u => u && u());
    unsubs.current = [];
  }

  /* ============================================================
     AUTH
  ============================================================ */
  const login = useCallback(async (email, password) => {
    if (USE_MOCK) {
      setAuthLoading(true);
      await new Promise(r => setTimeout(r, 800));
      if (email === 'owner@laxmitextiles.com' && password === 'password123') {
        const u = MOCK_USER;
        setUser(u);
        localStorage.setItem('lt_user', JSON.stringify(u));
        setProducts(MOCK_PRODUCTS);
        setTransactions(MOCK_TRANSACTIONS);
        setSales(MOCK_SALES);
        setSuppliers(MOCK_SUPPLIERS);
        setAuthLoading(false);
        return { success: true };
      }
      if (email === 'staff@laxmitextiles.com' && password === 'staff123') {
        const u = { ...MOCK_USER, uid: 'staff-001', email, displayName: 'Priya Staff', role: 'STAFF' };
        setUser(u);
        localStorage.setItem('lt_user', JSON.stringify(u));
        setProducts(MOCK_PRODUCTS);
        setTransactions(MOCK_TRANSACTIONS);
        setSales(MOCK_SALES);
        setSuppliers(MOCK_SUPPLIERS);
        setAuthLoading(false);
        return { success: true };
      }
      setAuthLoading(false);
      return { success: false, error: 'Invalid email or password' };
    }

    // Real Firebase login
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      const msg =
        err.code === 'auth/user-not-found'  ? 'No account with this email.' :
        err.code === 'auth/wrong-password'  ? 'Incorrect password.' :
        err.code === 'auth/invalid-email'   ? 'Invalid email address.' :
        err.code === 'auth/too-many-requests' ? 'Too many attempts. Try later.' :
        'Login failed. Check credentials.';
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    if (USE_MOCK) {
      setUser(null);
      localStorage.removeItem('lt_user');
      return;
    }
    await signOut(auth);
  }, []);

  /* ============================================================
     PRODUCTS
  ============================================================ */
  const addProduct = useCallback(async (data) => {
    if (USE_MOCK) {
      const newProd = {
        ...data, id: `p${Date.now()}`,
        stock: parseInt(data.initialStock) || 0,
        createdAt: new Date().toISOString().slice(0, 10),
        active: true,
      };
      setProducts(prev => [newProd, ...prev]);
      if (newProd.stock > 0) {
        setTransactions(prev => [{
          id: `t${Date.now()}`, type: 'receipt',
          productId: newProd.id, productName: newProd.name,
          qty: newProd.stock, date: new Date().toISOString(),
          actor: user?.displayName, ref: 'INITIAL-STOCK',
        }, ...prev]);
      }
      return newProd;
    }
    const id = await FS.createProduct({ ...data, costPrice: +data.costPrice, sellingPrice: +data.sellingPrice }, user.uid);
    return { id };
  }, [user]);

  const updateProduct = useCallback(async (id, data) => {
    if (USE_MOCK) { setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p)); return; }
    await FS.updateProduct(id, data);
  }, []);

  const toggleProductStatus = useCallback(async (id) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return;
    if (USE_MOCK) { setProducts(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p)); return; }
    await FS.toggleProductStatus(id, prod.active);
  }, [products]);

  /* ============================================================
     STOCK
  ============================================================ */
  const addStock = useCallback(async (productId, qty, meta = {}) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return { success: false, error: 'Product not found' };

    if (USE_MOCK) {
      const q = parseInt(qty);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: p.stock + q } : p));
      setTransactions(prev => [{
        id: `t${Date.now()}`, type: 'receipt',
        productId, productName: prod.name, qty: q,
        date: new Date().toISOString(), actor: user?.displayName,
        ref: meta.ref || 'RECEIPT',
      }, ...prev]);
      return { success: true };
    }

    try {
      await FS.addStock(productId, qty, { ...meta, productName: prod.name }, user.uid);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [products, user]);

  /* ============================================================
     SALES
  ============================================================ */
  const recordSale = useCallback(async (items, discount = 0) => {
    if (USE_MOCK) {
      for (const item of items) {
        const prod = products.find(p => p.id === item.productId);
        if (!prod || prod.stock < item.qty) {
          return { success: false, error: `Insufficient stock for ${prod?.name || 'product'}` };
        }
      }
      const subtotal = items.reduce((s, i) => s + i.total, 0);
      const grandTotal = subtotal - discount;
      const invNo = `INV-${new Date().getFullYear()}-${String(sales.length + 1).padStart(4, '0')}`;
      const newSale = {
        id: `sale-${Date.now()}`, invoiceNo: invNo,
        date: new Date().toISOString(), cashier: user?.displayName,
        items, subtotal, discount, grandTotal,
      };
      setSales(prev => [newSale, ...prev]);
      setProducts(prev => prev.map(p => {
        const item = items.find(i => i.productId === p.id);
        return item ? { ...p, stock: p.stock - item.qty } : p;
      }));
      setTransactions(prev => [
        ...items.map(item => ({
          id: `t${Date.now()}-${item.productId}`, type: 'sale',
          productId: item.productId, productName: item.name,
          qty: -item.qty, date: new Date().toISOString(),
          actor: user?.displayName, ref: invNo,
        })),
        ...prev,
      ]);
      return { success: true, sale: newSale };
    }

    try {
      const sale = await FS.recordSale(items, discount, user.displayName, user.uid);
      return { success: true, sale };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [products, sales, user]);

  /* ============================================================
     ADJUSTMENTS
  ============================================================ */
  const recordAdjustment = useCallback(async (type, productId, qty, reason) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return { success: false, error: 'Product not found' };

    if (USE_MOCK) {
      const q = parseInt(qty);
      const signed = type === 'return' ? +q : -q;
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock + signed) } : p));
      setTransactions(prev => [{
        id: `t${Date.now()}`, type,
        productId, productName: prod.name, qty: signed,
        date: new Date().toISOString(), actor: user?.displayName, ref: reason,
      }, ...prev]);
      return { success: true };
    }

    try {
      await FS.recordAdjustment(type, productId, qty, reason, user.uid, prod.name);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [products, user]);

  /* ============================================================
     SUPPLIERS
  ============================================================ */
  const addSupplier = useCallback(async (data) => {
    if (USE_MOCK) {
      const s = { ...data, id: `s${Date.now()}` };
      setSuppliers(prev => [s, ...prev]);
      return s;
    }
    const id = await FS.createSupplier(data, user.uid);
    const s = { ...data, id };
    setSuppliers(prev => [s, ...prev]);
    return s;
  }, [user]);

  /* ============================================================
     LANGUAGE
  ============================================================ */
  const updateLanguage = useCallback((l) => {
    setLang(l);
    localStorage.setItem('lt_lang', l);
  }, []);

  /* ============================================================
     TOAST
  ============================================================ */
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  /* ============================================================
     DERIVED
  ============================================================ */
  const lowStockProducts    = products.filter(p => p.active && p.stock > 0 && p.stock <= (p.minStock || 10));
  const outOfStockProducts  = products.filter(p => p.active && p.stock === 0);
  const todaySales          = sales.filter(s => new Date(s.date).toDateString() === new Date().toDateString());
  const todayRevenue        = todaySales.reduce((s, sale) => s + (sale.grandTotal || 0), 0);
  const totalStock          = products.filter(p => p.active).reduce((s, p) => s + (p.stock || 0), 0);

  return (
    <AppContext.Provider value={{
      // Auth
      user, authLoading, login, logout,
      // Config
      USE_MOCK, FIREBASE_CONFIGURED,
      // Data
      products, dataLoading, addProduct, updateProduct, toggleProductStatus,
      transactions, addStock, recordAdjustment,
      sales, recordSale,
      suppliers, addSupplier,
      // UI
      toasts, showToast,
      sidebarOpen, setSidebarOpen,
      lang, updateLanguage,
      // Derived
      lowStockProducts, outOfStockProducts, todaySales, todayRevenue, totalStock,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
