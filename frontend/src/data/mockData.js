// ============================================================
// MOCK DATA — replaces Firebase in the local demo
// ============================================================

export const MOCK_USER = {
  uid: 'owner-001',
  email: 'owner@laxmitextiles.com',
  displayName: 'Rajesh Kumar',
  role: 'OWNER',
};

export const MOCK_PRODUCTS = [
  {
    id: 'p001',
    name: 'Cotton Saree',
    sku: 'S001',
    category: 'Sarees',
    colour: 'Red',
    size: 'Free Size',
    unit: 'pcs',
    costPrice: 300,
    sellingPrice: 450,
    minStock: 20,
    stock: 120,
    imageColor: '#EF4444',
    active: true,
    supplier: 'Shree Textiles',
    createdAt: '2025-01-10',
  },
  {
    id: 'p002',
    name: 'Silk Saree',
    sku: 'S002',
    category: 'Sarees',
    colour: 'Blue',
    size: 'Free Size',
    unit: 'pcs',
    costPrice: 900,
    sellingPrice: 1250,
    minStock: 10,
    stock: 45,
    imageColor: '#3B82F6',
    active: true,
    supplier: 'Kumar Fabrics',
    createdAt: '2025-01-12',
  },
  {
    id: 'p003',
    name: 'Mens Shirt',
    sku: 'M001',
    category: 'Shirts',
    colour: 'Blue',
    size: 'M',
    unit: 'pcs',
    costPrice: 450,
    sellingPrice: 650,
    minStock: 30,
    stock: 200,
    imageColor: '#6366F1',
    active: true,
    supplier: 'Ravi Textiles',
    createdAt: '2025-01-15',
  },
  {
    id: 'p004',
    name: 'Mens Trouser',
    sku: 'M002',
    category: 'Trousers',
    colour: 'Black',
    size: 'L',
    unit: 'pcs',
    costPrice: 550,
    sellingPrice: 780,
    minStock: 25,
    stock: 85,
    imageColor: '#374151',
    active: true,
    supplier: 'Sri Lakshmi Fabrics',
    createdAt: '2025-01-18',
  },
  {
    id: 'p005',
    name: 'Dress Material',
    sku: 'D001',
    category: 'Dress Material',
    colour: 'Green',
    size: 'Free Size',
    unit: 'pcs',
    costPrice: 350,
    sellingPrice: 520,
    minStock: 40,
    stock: 150,
    imageColor: '#22C55E',
    active: true,
    supplier: 'Shree Textiles',
    createdAt: '2025-01-20',
  },
  {
    id: 'p006',
    name: 'Kids Shirt',
    sku: 'K001',
    category: 'Shirts',
    colour: 'Yellow',
    size: 'S',
    unit: 'pcs',
    costPrice: 200,
    sellingPrice: 320,
    minStock: 15,
    stock: 8,
    imageColor: '#EAB308',
    active: true,
    supplier: 'Kumar Fabrics',
    createdAt: '2025-02-01',
  },
  {
    id: 'p007',
    name: 'Bedsheet',
    sku: 'B001',
    category: 'Home',
    colour: 'White',
    size: 'King',
    unit: 'pcs',
    costPrice: 400,
    sellingPrice: 620,
    minStock: 20,
    stock: 12,
    imageColor: '#A855F7',
    active: true,
    supplier: 'Ravi Textiles',
    createdAt: '2025-02-05',
  },
  {
    id: 'p008',
    name: 'Lehenga',
    sku: 'L001',
    category: 'Sarees',
    colour: 'Pink',
    size: 'M',
    unit: 'pcs',
    costPrice: 1200,
    sellingPrice: 1800,
    minStock: 5,
    stock: 0,
    imageColor: '#EC4899',
    active: true,
    supplier: 'Sri Lakshmi Fabrics',
    createdAt: '2025-02-10',
  },
];

export const MOCK_TRANSACTIONS = [
  { id: 't001', type: 'sale',    productId: 'p001', productName: 'Cotton Saree',  qty: -2,  date: '2025-05-12T10:30:00Z', actor: 'Rajesh', ref: 'INV-2025-0015' },
  { id: 't002', type: 'receipt', productId: 'p003', productName: 'Mens Shirt',    qty: +50, date: '2025-05-12T09:00:00Z', actor: 'Rajesh', ref: 'PO-2025-003' },
  { id: 't003', type: 'sale',    productId: 'p002', productName: 'Silk Saree',    qty: -1,  date: '2025-05-11T16:45:00Z', actor: 'Priya',  ref: 'INV-2025-0014' },
  { id: 't004', type: 'sale',    productId: 'p003', productName: 'Mens Shirt',    qty: -3,  date: '2025-05-11T14:20:00Z', actor: 'Priya',  ref: 'INV-2025-0013' },
  { id: 't005', type: 'return',  productId: 'p005', productName: 'Dress Material',qty: +1,  date: '2025-05-10T11:00:00Z', actor: 'Rajesh', ref: 'RET-001' },
  { id: 't006', type: 'damage',  productId: 'p006', productName: 'Kids Shirt',    qty: -2,  date: '2025-05-10T09:30:00Z', actor: 'Rajesh', ref: 'DMG-001' },
  { id: 't007', type: 'adjust',  productId: 'p007', productName: 'Bedsheet',      qty: -3,  date: '2025-05-09T17:00:00Z', actor: 'Rajesh', ref: 'ADJ-001' },
  { id: 't008', type: 'receipt', productId: 'p001', productName: 'Cotton Saree',  qty: +100,date: '2025-05-09T08:00:00Z', actor: 'Rajesh', ref: 'PO-2025-002' },
];

export const MOCK_SALES = [
  {
    id: 'sale-001',
    invoiceNo: 'INV-2025-0015',
    date: '2025-05-12T10:30:00Z',
    cashier: 'Rajesh',
    items: [
      { productId: 'p001', name: 'Cotton Saree', qty: 1, price: 450, total: 450 },
      { productId: 'p003', name: 'Mens Shirt',   qty: 2, price: 650, total: 1300 },
    ],
    subtotal: 1750,
    discount: 0,
    grandTotal: 1750,
  },
  {
    id: 'sale-002',
    invoiceNo: 'INV-2025-0014',
    date: '2025-05-11T16:45:00Z',
    cashier: 'Priya',
    items: [
      { productId: 'p002', name: 'Silk Saree', qty: 1, price: 1250, total: 1250 },
    ],
    subtotal: 1250,
    discount: 0,
    grandTotal: 1250,
  },
];

export const MOCK_SUPPLIERS = [
  { id: 's001', name: 'Shree Textiles',   city: 'Chennai',    phone: '98765 43210' },
  { id: 's002', name: 'Kumar Fabrics',    city: 'Coimbatore', phone: '91234 56789' },
  { id: 's003', name: 'Ravi Textiles',    city: 'Erode',      phone: '99887 76655' },
  { id: 's004', name: 'Sri Lakshmi Fabrics', city: 'Salem',   phone: '90123 45678' },
];

export const CATEGORIES = ['All', 'Sarees', 'Shirts', 'Trousers', 'Dress Material', 'Home'];

// ---- Helper functions ----
export function formatCurrency(amount) {
  return `₹ ${amount.toLocaleString('en-IN')}`;
}

export function formatDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Kolkata' });
}

export function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
}

export function getStockStatus(stock, minStock) {
  if (stock === 0) return 'out';
  if (stock <= minStock) return 'low';
  return 'ok';
}

export function getStockLabel(stock, minStock) {
  if (stock === 0) return 'Out of Stock';
  if (stock <= minStock) return `Low Stock: ${stock} pcs`;
  return `Stock: ${stock} pcs`;
}
