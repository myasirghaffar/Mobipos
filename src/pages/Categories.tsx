import * as React from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { storageService } from '../services/storage';
import { Category } from '../types';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/Textarea';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { toast } from 'sonner';
import { formatDate } from '../utils/utils';

export default function Categories() {
  const { categories, products, refreshCategories, saveCategory, deleteCategory } = usePOS();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  
  const [formData, setFormData] = React.useState({
    name: '',
    description: ''
  });

  const getProductCount = (categoryName: string) => {
    return products.filter(p => p.category === categoryName).length;
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Category name is required');
      return;
    }

    const category: Category = {
      id: editingCategory?.id || Math.random().toString(36).substr(2, 9),
      name: formData.name,
      description: formData.description,
      createdAt: editingCategory?.createdAt || Date.now(),
    };

    saveCategory(category);
    setIsModalOpen(false);
    toast.success(`Category ${editingCategory ? 'updated' : 'added'} successfully`);
  };

  const handleDelete = (id: string) => {
    const category = categories.find(c => c.id === id);
    const count = category ? getProductCount(category.name) : 0;
    
    if (count > 0) {
      toast.error(`Cannot delete category with ${count} active products. Reassign them first.`);
      return;
    }

    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategory(id);
      toast.success('Category deleted');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div>
          <h1 className="text-4xl font-serif italic font-bold text-zinc-900 tracking-tight">Categories</h1>
          <p className="text-zinc-500 mt-1 font-mono text-xs uppercase tracking-[0.2em]">Manage product classifications</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="h-14 px-8 rounded-2xl shadow-xl shadow-zinc-200 group">
          <Plus className="mr-2 h-5 w-5 transition-transform group-hover:rotate-90" /> 
          Add Category
        </Button>
      </header>

      <div className="relative group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-black transition-colors" />
        <Input 
          placeholder="Search categories..." 
          className="pl-14 h-16 text-lg rounded-2xl shadow-lg shadow-zinc-100/50 border-zinc-200 bg-white placeholder:text-zinc-300 font-serif italic"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-[32px] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
        <Table headers={['Category Name', 'Products', 'Description', 'Action']}>
          {filteredCategories.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-bold">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                    <Layers className="h-4 w-4 text-zinc-500" />
                  </div>
                  {c.name}
                </div>
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-zinc-100 text-zinc-900 ring-1 ring-inset ring-zinc-200">
                  {getProductCount(c.name)} Items
                </span>
              </TableCell>
              <TableCell className="text-zinc-500 max-w-xs truncate font-serif italic">
                {c.description || 'No description'}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenModal(c)} className="h-9 w-9 rounded-xl hover:bg-zinc-100">
                    <Edit2 className="h-4 w-4 text-zinc-600" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} className="h-9 w-9 rounded-xl hover:bg-red-50 text-zinc-600 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filteredCategories.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-20 text-zinc-400 font-serif italic">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-zinc-50 flex items-center justify-center">
                    <Layers className="h-8 w-8 opacity-20" />
                  </div>
                  <p>No categories found</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </Table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Category Name" 
            placeholder="e.g., Accessories, Audio, Storage"
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            required
          />
          <Textarea 
            label="Description" 
            placeholder="What products belong to this category?"
            value={formData.description} 
            onChange={e => setFormData({...formData, description: e.target.value})} 
          />
          <div className="pt-6 flex justify-end gap-3 border-t border-zinc-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl px-8 shadow-lg shadow-zinc-200">
              {editingCategory ? 'Update' : 'Save'} Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
