import * as React from 'react';
import * as XLSX from 'xlsx';
import { 
  Plus, 
  Search, 
  Filter, 
  Pencil, 
  Trash2, 
  MoreHorizontal,
  CloudDownload,
  FileUp
} from 'lucide-react';
import { storageService } from '../services/storage';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, cn } from '../utils/utils';
import { toast } from 'sonner';

import { usePOS } from '../context/POSContext';
import { Product, Category } from '../types';
import { ImportProductsModal } from '../components/inventory/ImportProductsModal';

export default function Inventory() {
  const { products, refreshProducts, categories, saveProduct, deleteProduct } = usePOS();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | undefined>(undefined);

  // Form states
  const [formData, setFormData] = React.useState<Partial<Product>>({
    category: '',
    purchasePrice: 0,
    salePrice: 0,
    stockQuantity: 0,
    lowStockThreshold: 5
  });

  React.useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories]);

  const filteredProducts = products.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(searchLower) ||
      p.brand.toLowerCase().includes(searchLower) ||
      p.model.toLowerCase().includes(searchLower) ||
      (p.description?.toLowerCase().includes(searchLower)) ||
      (p.imei?.toLowerCase().includes(searchLower))
    );
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(undefined);
      setFormData({
        category: categories[0]?.name || '',
        purchasePrice: 0,
        salePrice: 0,
        stockQuantity: 0,
        lowStockThreshold: 5
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const product: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name || '',
      brand: formData.brand || '',
      model: formData.model || '',
      description: formData.description,
      imei: formData.imei,
      category: formData.category || (categories[0]?.name || ''),
      purchasePrice: Number(formData.purchasePrice),
      salePrice: Number(formData.salePrice),
      stockQuantity: Number(formData.stockQuantity),
      lowStockThreshold: Number(formData.lowStockThreshold),
      createdAt: editingProduct?.createdAt || Date.now()
    };

    if (!product.name || !product.brand || !product.model) {
      toast.error('Please fill in all required fields');
      return;
    }

    saveProduct(product);
    setIsModalOpen(false);
    toast.success(editingProduct ? 'Product updated' : 'Product added');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
      toast.success('Product deleted');
    }
  };

  const exportToExcel = () => {
    try {
      const data = filteredProducts.map(p => ({
        'Name': p.name,
        'Brand': p.brand,
        'Model': p.model,
        'Category': p.category,
        'Purchase Price': p.purchasePrice,
        'Sale Price': p.salePrice,
        'Stock Quantity': p.stockQuantity,
        'Low Stock Threshold': p.lowStockThreshold,
        'IMEI': p.imei || '',
        'Description': p.description || '',
        'Created At': new Date(p.createdAt).toLocaleDateString()
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Products');
      XLSX.writeFile(wb, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Inventory exported successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export inventory');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif italic font-bold tracking-tighter text-zinc-900">
            Stock Inventory
          </h2>
          <p className="text-zinc-500 font-medium">Manage your products and stock levels.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={() => setIsImportModalOpen(true)}>
            <FileUp className="h-4 w-4" />
            <span className="hidden md:inline">Import</span>
          </Button>
          <Button variant="outline" className="gap-2 flex-1 md:flex-none" onClick={exportToExcel}>
            <CloudDownload className="h-4 w-4" />
            <span className="hidden md:inline">Export</span>
          </Button>
          <Button className="gap-2 flex-1 md:flex-none shadow-lg shadow-zinc-200" onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
          <Input 
            placeholder="Search products, brands, or models..." 
            className="pl-12 h-12 rounded-xl border-zinc-200 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 gap-2 flex-1 lg:min-w-[120px] rounded-xl">
            <Filter className="h-4 w-4" /> Filter
          </Button>
          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl border border-zinc-200">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Table headers={['Product Name', 'Category', 'Stock', 'Sale Price', 'Status', 'Actions']}>
        {filteredProducts.map((p) => (
          <TableRow key={p.id}>
            <TableCell>
              <div className="font-bold text-zinc-900">{p.name}</div>
              <div className="text-xs text-zinc-400 flex gap-2">
                <span>{p.brand}</span>
                <span>•</span>
                <span>{p.model}</span>
              </div>
            </TableCell>
            <TableCell>{p.category}</TableCell>
            <TableCell>
              <div className="font-mono font-bold">{p.stockQuantity}</div>
            </TableCell>
            <TableCell className="font-bold">{formatCurrency(p.salePrice)}</TableCell>
            <TableCell>
              {p.stockQuantity <= 0 ? (
                <span className="text-[10px] uppercase tracking-tighter font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded">Out of Stock</span>
              ) : p.stockQuantity <= p.lowStockThreshold ? (
                <span className="text-[10px] uppercase tracking-tighter font-bold bg-amber-100 text-amber-600 px-2 py-0.5 rounded">Low Stock</span>
              ) : (
                <span className="text-[10px] uppercase tracking-tighter font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded">In Stock</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {filteredProducts.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-zinc-400 font-serif italic text-lg">
              No products found matches your search.
            </TableCell>
          </TableRow>
        )}
      </Table>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Name *" 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
            <Input 
              label="Brand *" 
              value={formData.brand || ''} 
              onChange={e => setFormData({...formData, brand: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Model *" 
              value={formData.model || ''} 
              onChange={e => setFormData({...formData, model: e.target.value})} 
            />
            <Select 
              label="Category"
              options={categories.map(c => ({ label: c.name, value: c.name }))}
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Purchase Price (Cost)" 
              type="number" 
              value={formData.purchasePrice} 
              onChange={e => setFormData({...formData, purchasePrice: Number(e.target.value)})} 
            />
            <Input 
              label="Sale Price" 
              type="number" 
              value={formData.salePrice} 
              onChange={e => setFormData({...formData, salePrice: Number(e.target.value)})} 
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Stock Quantity" 
              type="number" 
              value={formData.stockQuantity} 
              onChange={e => setFormData({...formData, stockQuantity: Number(e.target.value)})} 
            />
            <Input 
              label="Low Stock Alert Threshold" 
              type="number" 
              value={formData.lowStockThreshold} 
              onChange={e => setFormData({...formData, lowStockThreshold: Number(e.target.value)})} 
            />
          </div>
          <Input 
            label="IMEI (Serial Number)" 
            placeholder="Optional"
            value={formData.imei || ''} 
            onChange={e => setFormData({...formData, imei: e.target.value})} 
          />
          <Textarea 
            label="Description" 
            placeholder="Enter product specifications, condition, or features..."
            value={formData.description || ''} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
          <div className="pt-6 flex justify-end gap-3 border-t border-zinc-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Product</Button>
          </div>
        </form>
      </Modal>

      <ImportProductsModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
    </div>
  );
}
