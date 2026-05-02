import { Product, Transaction, User, Category } from '../types';

const KEYS = {
  PRODUCTS: 'mobipos_products',
  TRANSACTIONS: 'mobipos_transactions',
  USERS: 'mobipos_users',
  CURRENT_USER: 'mobipos_current_user',
  CATEGORIES: 'mobipos_categories',
};

const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Phone', createdAt: Date.now() },
  { id: '2', name: 'Accessories', createdAt: Date.now() },
  { id: '3', name: 'Tablet', createdAt: Date.now() },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    model: '128GB Titanium',
    category: 'Phone',
    purchasePrice: 250000,
    salePrice: 280000,
    stockQuantity: 10,
    lowStockThreshold: 3,
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    model: '256GB Black',
    category: 'Phone',
    purchasePrice: 300000,
    salePrice: 340000,
    stockQuantity: 2,
    lowStockThreshold: 5,
    createdAt: Date.now(),
  },
  {
    id: '3',
    name: 'AirPods Pro 2',
    brand: 'Apple',
    model: 'USB-C',
    category: 'Accessories',
    purchasePrice: 45000,
    salePrice: 55000,
    stockQuantity: 15,
    lowStockThreshold: 5,
    createdAt: Date.now(),
  },
];

export const storageService = {
  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(KEYS.CATEGORIES);
    if (data === null) {
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    return JSON.parse(data);
  },

  saveCategory: (category: Category) => {
    const categories = storageService.getCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index > -1) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  },

  deleteCategory: (id: string) => {
    const categories = storageService.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(filtered));
  },

  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(KEYS.PRODUCTS);
    if (data === null) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    return JSON.parse(data);
  },

  saveProduct: (product: Product) => {
    const products = storageService.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  deleteProduct: (id: string) => {
    const products = storageService.getProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered));
  },

  // Transactions
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },

  saveTransaction: (transaction: Transaction) => {
    const transactions = storageService.getTransactions();
    transactions.unshift(transaction); // Most recent first
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));

    // Update stock
    const products = storageService.getProducts();
    transaction.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        product.stockQuantity -= item.quantity;
      }
    });
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  // Auth
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  }
};
