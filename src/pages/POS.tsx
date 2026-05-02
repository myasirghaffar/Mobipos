import * as React from 'react';
import { 
  Search, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Trash2, 
  CreditCard,
  User,
  Receipt,
  Info,
  Package,
  ArrowRight
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, cn } from '../utils/utils';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import { Product } from '../types';

export default function POS() {
  const { 
    products, 
    cart, 
    addToCart, 
    removeFromCart, 
    updateCartQuantity, 
    checkout 
  } = usePOS();
  const { isAdmin } = useAuth();
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [cashReceived, setCashReceived] = React.useState<number>(0);
  const [customerName, setCustomerName] = React.useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = React.useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = React.useState(false);
  const [selectedProductForInfo, setSelectedProductForInfo] = React.useState<Product | null>(null);
  const [quantityToAdd, setQuantityToAdd] = React.useState(1);

  const cartSubtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const total = cartSubtotal;
  const change = Math.max(0, cashReceived - total);

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.brand.toLowerCase().includes(searchLower) ||
      p.model.toLowerCase().includes(searchLower) ||
      (p.description?.toLowerCase().includes(searchLower)) ||
      (p.imei?.toLowerCase().includes(searchLower))
    );
  }).filter(p => p.stockQuantity > 0);

  const handleCheckout = () => {
    if (cashReceived < total) {
      toast.error('Insufficient cash received');
      return;
    }

    const tx = checkout({ 
      cashReceived, 
      customerName: customerName || 'Walk-in Customer' 
    });

    if (tx) {
      toast.success('Transaction successful!');
      setIsCheckoutModalOpen(false);
      setCashReceived(0);
      setCustomerName('');
      setIsMobileCartOpen(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-8 relative">
      {/* Product Selection Area */}
      <div className={cn(
        "flex-1 flex flex-col gap-6 lg:gap-8",
        isMobileCartOpen && "hidden lg:flex"
      )}>
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-black transition-colors" />
          <Input 
            placeholder="Scan IMEI or Search Products..." 
            className="pl-14 h-16 text-lg md:text-xl rounded-2xl shadow-xl shadow-zinc-200/50 border-zinc-200 bg-white placeholder:text-zinc-300 font-serif italic"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6 pb-24 lg:pb-0">
          {filteredProducts.map((p) => (
            <div 
              key={p.id}
              onClick={() => setSelectedProductForInfo(p)}
              className="bg-white p-5 md:p-6 rounded-2xl border border-zinc-100 cursor-pointer transition-all duration-300 hover:border-black hover:shadow-2xl hover:-translate-y-1 active:scale-95 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3">
                <span className="bg-zinc-900 text-white px-2 py-1 rounded-bl-xl rounded-tr-lg text-[10px] font-mono font-bold">QTY: {p.stockQuantity}</span>
              </div>
              <div className="mb-4">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400 font-serif italic">{p.brand}</span>
                <h3 className="font-bold text-base md:text-lg text-zinc-900 group-hover:text-black mt-1 leading-tight">{p.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 truncate font-mono">{p.model}</p>
              </div>
              <div className="flex justify-between items-end mt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 font-serif italic uppercase">Ref Price</span>
                  <span className="text-xl md:text-2xl font-mono font-bold tracking-tighter text-zinc-900">{formatCurrency(p.salePrice)}</span>
                </div>
                <div className="h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200 group-hover:bg-zinc-800 transition-colors">
                  <Plus className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center p-12 md:p-20 text-zinc-400 border-2 border-dashed border-zinc-100 rounded-3xl bg-zinc-50/50">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white shadow-inner flex items-center justify-center mb-6">
                <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 opacity-20" />
              </div>
              <p className="font-serif italic text-lg text-center">No matching items in stock</p>
              <p className="text-xs text-zinc-300 mt-2 font-mono uppercase tracking-widest text-center">Update inventory to continue</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Area for Desktop and Mobile (Toggle-able) */}
      <div className={cn(
        "w-full lg:w-[380px] xl:w-[400px] flex flex-col bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden transition-all duration-300",
        "lg:static lg:flex",
        isMobileCartOpen ? "fixed inset-0 z-40 rounded-none sm:rounded-3xl sm:inset-4" : "hidden"
      )}>
        <div className="p-6 md:p-8 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-6 w-6 text-zinc-400" />
            <h3 className="font-serif italic font-bold text-lg md:text-xl leading-none">Current Order</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-black text-white text-[10px] font-mono px-2 py-1 rounded-full uppercase">{cart.length} items</span>
            <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden p-2 text-zinc-400 hover:text-black">
              <Plus className="h-6 w-6 rotate-45" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[300px] overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin">
          {cart.map((item) => (
            <div key={item.productId} className="flex gap-4 bg-zinc-50/30 p-4 rounded-2xl border border-zinc-100 group transition-all hover:bg-white hover:shadow-md">
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-zinc-900 truncate">{item.name}</h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-zinc-400 font-mono italic uppercase tracking-tighter">{item.brand} • {item.model}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-zinc-300" />
                  <span className="text-[10px] text-zinc-500 font-mono font-bold">{formatCurrency(item.price)}</span>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <button 
                    onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                    className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90 bg-white"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <div className="flex flex-col items-center justify-center px-2">
                    <span className="text-sm font-mono font-bold leading-none">{item.quantity}</span>
                    <span className="text-[8px] text-zinc-400 uppercase font-bold tracking-tighter mt-0.5">Qty</span>
                  </div>
                  <button 
                    onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                    className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-90 bg-white"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="text-right flex flex-col justify-between items-end">
                <p className="font-mono font-bold text-zinc-900">{formatCurrency(item.total)}</p>
                <button 
                  onClick={() => removeFromCart(item.productId)}
                  className="text-zinc-200 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-zinc-300 py-12 md:py-20">
              <div className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-zinc-50 flex items-center justify-center mb-4">
                <ShoppingCart className="h-6 w-6 md:h-8 md:w-8 opacity-40 shrink-0" />
              </div>
              <p className="text-sm font-serif italic text-center max-w-[200px]">Order is empty. Select products to begin billing.</p>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 bg-zinc-900 text-white space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
              <span>Subtotal</span>
              <span className="text-zinc-300">{formatCurrency(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-500 text-[10px] font-mono uppercase tracking-[0.2em]">
              <span>Taxes (0%)</span>
              <span className="text-zinc-300">{formatCurrency(0)}</span>
            </div>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-zinc-800">
            <span className="text-[10px] font-serif italic text-zinc-400 uppercase tracking-widest">Grand Total</span>
            <span className="text-3xl md:text-4xl font-mono font-bold tracking-tighter">{formatCurrency(total)}</span>
          </div>
          <Button 
            className="w-full h-14 md:h-16 bg-white text-black hover:bg-zinc-200 font-bold text-base md:text-lg rounded-2xl shadow-xl active:scale-95 transition-transform"
            disabled={cart.length === 0}
            onClick={() => setIsCheckoutModalOpen(true)}
          >
            ORDER CHECKOUT
          </Button>
        </div>
      </div>

      {/* Floating Cart Button for Mobile */}
      <button 
        onClick={() => setIsMobileCartOpen(true)}
        className={cn(
          "lg:hidden fixed bottom-6 right-6 h-16 w-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center transition-all active:scale-90 z-30",
          isMobileCartOpen && "hidden"
        )}
      >
        <div className="relative">
          <ShoppingCart className="h-7 w-7" />
          {cart.length > 0 && (
            <span className="absolute -top-3 -right-3 h-6 w-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-4 ring-white">
              {cart.length}
            </span>
          )}
        </div>
      </button>

      <Modal
        isOpen={!!selectedProductForInfo}
        onClose={() => {
          setSelectedProductForInfo(null);
          setQuantityToAdd(1);
        }}
        title="Product Details"
        className="max-w-lg"
      >
        {selectedProductForInfo && (
          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="h-20 w-20 rounded-2xl bg-zinc-100 flex items-center justify-center shrink-0">
                <Package className="h-10 w-10 text-zinc-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400 font-serif italic">
                    {selectedProductForInfo.brand}
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-200" />
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-zinc-400 font-mono">
                    {selectedProductForInfo.category}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 leading-tight">
                  {selectedProductForInfo.name}
                </h2>
                <p className="text-sm font-mono text-zinc-500 mt-1">{selectedProductForInfo.model}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1">Sale Price</p>
                <p className="text-2xl font-mono font-bold text-zinc-900">{formatCurrency(selectedProductForInfo.salePrice)}</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-1">Current Stock</p>
                <p className={cn(
                  "text-2xl font-mono font-bold",
                  selectedProductForInfo.stockQuantity <= selectedProductForInfo.lowStockThreshold ? "text-orange-600" : "text-zinc-900"
                )}>
                  {selectedProductForInfo.stockQuantity} <span className="text-xs font-normal text-zinc-400 ml-1">units</span>
                </p>
              </div>
            </div>

            {isAdmin && (
              <div className="p-4 rounded-2xl bg-zinc-900 text-white flex justify-between items-center group relative overflow-hidden">
                <div className="relative z-10">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Purchase Price (Cost)</p>
                  <p className="text-2xl font-mono font-bold">{formatCurrency(selectedProductForInfo.purchasePrice)}</p>
                </div>
                <div className="relative z-10 text-right">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1">Potential Margin</p>
                  <p className="text-xl font-mono font-bold text-emerald-400">
                    {formatCurrency(selectedProductForInfo.salePrice - selectedProductForInfo.purchasePrice)}
                  </p>
                </div>
                {/* Decorative background accent */}
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-zinc-800 rounded-full opacity-50 blur-2xl" />
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-xs font-serif italic font-bold uppercase tracking-widest text-zinc-400">Description</h4>
              <p className="text-sm text-zinc-600 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                {selectedProductForInfo.description || "No detailed description available for this product."}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-zinc-900">Select Quantity</span>
                <div className="flex items-center gap-3 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
                  <button 
                    onClick={() => setQuantityToAdd(Math.max(1, quantityToAdd - 1))}
                    className="h-10 w-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-mono font-bold w-12 text-center">{quantityToAdd}</span>
                  <button 
                    onClick={() => setQuantityToAdd(Math.min(selectedProductForInfo.stockQuantity, quantityToAdd + 1))}
                    className="h-10 w-10 rounded-lg bg-white border border-zinc-200 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-right text-zinc-400 font-mono">Max available: {selectedProductForInfo.stockQuantity}</p>
            </div>

            <div className="pt-4 flex gap-3">
              <Button 
                variant="ghost" 
                className="flex-1" 
                onClick={() => {
                  setSelectedProductForInfo(null);
                  setQuantityToAdd(1);
                }}
              >
                Close
              </Button>
              <Button 
                className="flex-[2] h-12 shadow-xl shadow-zinc-200" 
                onClick={() => {
                  addToCart(selectedProductForInfo, quantityToAdd);
                  toast.success(`Added ${quantityToAdd}x ${selectedProductForInfo.name} to cart`);
                  setSelectedProductForInfo(null);
                  setQuantityToAdd(1);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add to Order
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Complete Checkout"
        className="max-w-md"
      >
        <div className="space-y-6">
          <div className="p-4 bg-zinc-50 rounded-xl space-y-2">
            <div className="flex justify-between font-mono text-zinc-500">
              <span>Payable Amount</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-2xl font-mono font-bold text-zinc-900 border-t border-zinc-200 pt-2">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <Input 
              label="Cash Received" 
              type="number" 
              placeholder="0.00"
              className="font-mono text-xl"
              autoFocus
              value={cashReceived}
              onChange={(e) => setCashReceived(Number(e.target.value))}
            />
            
            <div className="flex justify-between items-center p-4 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm ring-1 ring-inset ring-emerald-600/10">
              <span className="text-sm font-serif italic font-medium">Change to Return</span>
              <span className="text-xl font-mono font-bold tracking-tighter">{formatCurrency(change)}</span>
            </div>

            <Input 
              label="Customer Name (Optional)" 
              placeholder="e.g. John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsCheckoutModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 h-12" onClick={handleCheckout} disabled={cashReceived < total}>
              <CreditCard className="mr-2 h-4 w-4" /> Confirm & Pay
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
