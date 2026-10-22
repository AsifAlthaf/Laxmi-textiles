// ============================================================
// Firestore database service layer
// All reads/writes go through here — clean separation
// ============================================================
import {
  db,
  collection, doc,
  getDocs, getDoc, addDoc, setDoc, updateDoc,
  query, where, orderBy, limit, onSnapshot,
  serverTimestamp, runTransaction, writeBatch, increment,
} from './firebase';

// ── PRODUCTS ──────────────────────────────────────────────────

export async function fetchProducts() {
  const snap = await getDocs(collection(db, 'products'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeProducts(callback) {
  return onSnapshot(collection(db, 'products'), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function createProduct(data, userId) {
  const productRef = await addDoc(collection(db, 'products'), {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    active: true,
  });

  // Create inventory balance document
  await setDoc(doc(db, 'inventoryBalances', productRef.id), {
    productId: productRef.id,
    productName: data.name,
    quantityOnHand: parseInt(data.initialStock) || 0,
    unit: data.unit,
    updatedAt: serverTimestamp(),
  });

  // If initial stock > 0, create a receipt transaction
  if (parseInt(data.initialStock) > 0) {
    await addDoc(collection(db, 'inventoryTransactions'), {
      productId: productRef.id,
      productName: data.name,
      type: 'receipt',
      qty: parseInt(data.initialStock),
      reason: 'Initial stock',
      ref: 'INITIAL-STOCK',
      actorId: userId,
      createdAt: serverTimestamp(),
    });
  }

  return productRef.id;
}

export async function updateProduct(productId, data) {
  await updateDoc(doc(db, 'products', productId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function toggleProductStatus(productId, currentStatus) {
  await updateDoc(doc(db, 'products', productId), {
    active: !currentStatus,
    updatedAt: serverTimestamp(),
  });
}

// ── INVENTORY / STOCK ─────────────────────────────────────────

export async function fetchInventoryBalances() {
  const snap = await getDocs(collection(db, 'inventoryBalances'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeInventory(callback) {
  return onSnapshot(collection(db, 'inventoryBalances'), snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addStock(productId, qty, meta, userId) {
  const q = parseInt(qty);
  const balanceRef = doc(db, 'inventoryBalances', productId);
  const productRef = doc(db, 'products', productId);

  await runTransaction(db, async (txn) => {
    const balSnap = await txn.get(balanceRef);
    const prodSnap = await txn.get(productRef);
    if (!balSnap.exists() || !prodSnap.exists()) throw new Error('Product not found');

    const current = balSnap.data().quantityOnHand || 0;
    txn.update(balanceRef, {
      quantityOnHand: current + q,
      updatedAt: serverTimestamp(),
    });
    txn.update(productRef, { updatedAt: serverTimestamp() });
  });

  // Record transaction
  await addDoc(collection(db, 'inventoryTransactions'), {
    productId,
    productName: meta.productName,
    type: 'receipt',
    qty: q,
    reason: meta.notes || 'Stock receipt',
    ref: meta.ref || 'RECEIPT',
    supplier: meta.supplier || '',
    purchasePrice: meta.purchasePrice ? parseFloat(meta.purchasePrice) : null,
    actorId: userId,
    createdAt: serverTimestamp(),
  });
}

export async function fetchTransactions(limitCount = 50) {
  const q = query(
    collection(db, 'inventoryTransactions'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export function subscribeTransactions(callback, limitCount = 20) {
  const q = query(
    collection(db, 'inventoryTransactions'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function recordAdjustment(type, productId, qty, reason, userId, productName) {
  const q = parseInt(qty);
  const signed = type === 'return' ? +q : -q;
  const balanceRef = doc(db, 'inventoryBalances', productId);

  await runTransaction(db, async (txn) => {
    const balSnap = await txn.get(balanceRef);
    if (!balSnap.exists()) throw new Error('Balance not found');
    const current = balSnap.data().quantityOnHand || 0;
    const newQty = Math.max(0, current + signed);
    txn.update(balanceRef, { quantityOnHand: newQty, updatedAt: serverTimestamp() });
  });

  await addDoc(collection(db, 'inventoryTransactions'), {
    productId,
    productName,
    type,
    qty: signed,
    reason,
    ref: `${type.toUpperCase()}-${Date.now()}`,
    actorId: userId,
    createdAt: serverTimestamp(),
  });
}

// ── SALES ──────────────────────────────────────────────────────

export async function recordSale(items, discount = 0, cashierName, userId) {
  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const grandTotal = subtotal - discount;

  // Generate invoice number
  const salesSnap = await getDocs(collection(db, 'sales'));
  const invoiceNo = `INV-${new Date().getFullYear()}-${String(salesSnap.size + 1).padStart(4, '0')}`;

  const saleRef = doc(collection(db, 'sales'));

  // Validate stock in a transaction first
  await runTransaction(db, async (txn) => {
    const balanceUpdates = [];

    for (const item of items) {
      const balRef = doc(db, 'inventoryBalances', item.productId);
      const balSnap = await txn.get(balRef);
      if (!balSnap.exists()) throw new Error(`Balance missing for ${item.name}`);

      const available = balSnap.data().quantityOnHand || 0;
      if (available < item.qty) {
        throw new Error(`Only ${available} pcs available for "${item.name}"`);
      }
      balanceUpdates.push({ ref: balRef, current: available, qty: item.qty });
    }

    // Write sale
    txn.set(saleRef, {
      invoiceNo,
      items,
      subtotal,
      discount,
      grandTotal,
      cashier: cashierName,
      actorId: userId,
      createdAt: serverTimestamp(),
    });

    // Deduct balances
    for (const u of balanceUpdates) {
      txn.update(u.ref, {
        quantityOnHand: u.current - u.qty,
        updatedAt: serverTimestamp(),
      });
    }
  });

  // Record transactions for each line item (outside transaction — non-critical audit trail)
  for (const item of items) {
    await addDoc(collection(db, 'inventoryTransactions'), {
      productId: item.productId,
      productName: item.name,
      type: 'sale',
      qty: -item.qty,
      reason: 'Sale',
      ref: invoiceNo,
      saleId: saleRef.id,
      actorId: userId,
      createdAt: serverTimestamp(),
    });
  }

  const saleSnap = await getDoc(saleRef);
  return { id: saleRef.id, invoiceNo, ...saleSnap.data(), date: new Date().toISOString() };
}

export async function fetchSales(limitCount = 50) {
  const q = query(
    collection(db, 'sales'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
    date: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  }));
}

export function subscribeSales(callback, limitCount = 20) {
  const q = query(
    collection(db, 'sales'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      date: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    })));
  });
}

// ── SUPPLIERS ──────────────────────────────────────────────────

export async function fetchSuppliers() {
  const snap = await getDocs(collection(db, 'suppliers'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function createSupplier(data, userId) {
  const ref = await addDoc(collection(db, 'suppliers'), {
    ...data,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// ── USERS ──────────────────────────────────────────────────────

export async function fetchUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createUserProfile(uid, data) {
  await setDoc(doc(db, 'users', uid), {
    ...data,
    createdAt: serverTimestamp(),
  });
}
