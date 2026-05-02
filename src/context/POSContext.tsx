import * as React from 'react';
import { Product, Transaction, TransactionItem, Category } from '../types';
import { storageService } from '../services/storage';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface POSContextType {
  products: Product[];
  categories: Category[];
  refreshProducts: () => void;
  refreshCategories: () => void;
  saveProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  saveCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  cart: TransactionItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (details: { cashReceived: number; customerName?: string; customerPhone?: string }) => Transaction | null;
}

const POSContext = React.createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [cart, setCart] = React.useState<TransactionItem[]>([]);
  const { user } = useAuth();

  const refreshProducts = React.useCallback(() => {
    setProducts(storageService.getProducts());
  }, []);

  const refreshCategories = React.useCallback(() => {
    setCategories(storageService.getCategories());
  }, []);

  const saveProduct = React.useCallback((product: Product) => {
    storageService.saveProduct(product);
    setProducts(prev => {
      const index = prev.findIndex(p => p.id === product.id);
      if (index > -1) {
        const next = [...prev];
        next[index] = product;
        return next;
      }
      return [...prev, product];
    });
  }, []);

  const deleteProduct = React.useCallback((id: string) => {
    storageService.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const saveCategory = React.useCallback((category: Category) => {
    storageService.saveCategory(category);
    setCategories(prev => {
      const index = prev.findIndex(c => c.id === category.id);
      if (index > -1) {
        const next = [...prev];
        next[index] = category;
        return next;
      }
      return [...prev, category];
    });
  }, []);

  const deleteCategory = React.useCallback((id: string) => {
    storageService.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  React.useEffect(() => {
    refreshProducts();
    refreshCategories();
  }, [refreshProducts, refreshCategories]);

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      const totalRequested = (existing ? existing.quantity : 0) + quantity;

      if (totalRequested > product.stockQuantity) {
        toast.error(`Only ${product.stockQuantity} items available in stock`);
        return prev;
      }

      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
            : item
        );
      }

      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          model: product.model,
          quantity: quantity,
          price: product.salePrice,
          total: product.salePrice * quantity,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (quantity > product.stockQuantity) {
      toast.error(`Only ${product.stockQuantity} items available in stock`);
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity, total: quantity * item.price }
          : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const checkout = (details: { cashReceived: number; customerName?: string; customerPhone?: string }) => {
    if (cart.length === 0 || !user) return null;

    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    const tax = 0; // Tax logic if needed
    const total = subtotal + tax;
    const change = details.cashReceived - total;

    const transaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      items: [...cart],
      subtotal,
      tax,
      total,
      cashReceived: details.cashReceived,
      change,
      customerName: details.customerName,
      customerPhone: details.customerPhone,
      timestamp: Date.now(),
      staffId: user.id,
    };

    storageService.saveTransaction(transaction);
    refreshProducts();
    clearCart();
    return transaction;
  };

  return (
    <POSContext.Provider
      value={{
        products,
        categories,
        refreshProducts,
        refreshCategories,
        saveProduct,
        deleteProduct,
        saveCategory,
        deleteCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        checkout,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = React.useContext(POSContext);
  if (!context) throw new Error('usePOS must be used within a POSProvider');
  return context;
};
