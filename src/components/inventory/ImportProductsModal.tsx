import * as React from 'react';
import * as XLSX from 'xlsx';
import { 
  FileUp, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  Settings2,
  Eye,
  ArrowRight,
  Download
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Table, TableRow, TableCell } from '../ui/Table';
import { toast } from 'sonner';
import { Product } from '../../types';
import { usePOS } from '../../context/POSContext';

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'upload' | 'mapping' | 'preview';

interface Mapping {
  [key: string]: string;
}

const PRODUCT_FIELDS = [
  { key: 'name', label: 'Product Name', required: true },
  { key: 'brand', label: 'Brand', required: true },
  { key: 'model', label: 'Model', required: true },
  { key: 'category', label: 'Category', required: true },
  { key: 'purchasePrice', label: 'Purchase Price', required: true },
  { key: 'salePrice', label: 'Sale Price', required: true },
  { key: 'stockQuantity', label: 'Stock Quantity', required: true },
  { key: 'lowStockThreshold', label: 'Low Stock Threshold', required: true },
  { key: 'imei', label: 'IMEI', required: false },
  { key: 'description', label: 'Description', required: false },
];

export function ImportProductsModal({ isOpen, onClose }: ImportProductsModalProps) {
  const { categories, saveProduct } = usePOS();
  const [step, setStep] = React.useState<Step>('upload');
  const [file, setFile] = React.useState<File | null>(null);
  const [headers, setHeaders] = React.useState<string[]>([]);
  const [rawData, setRawData] = React.useState<any[]>([]);
  const [mapping, setMapping] = React.useState<Mapping>({});
  const [previewData, setPreviewData] = React.useState<Partial<Product>[]>([]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls') {
      toast.error('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const wb = XLSX.read(data, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      // Get all headers from the first row
      const dataArray = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (dataArray.length > 0) {
        const fileHeaders = (dataArray[0] as any[]).map(h => String(h || '').trim()).filter(h => h !== '');
        setHeaders(fileHeaders);
        const rows = XLSX.utils.sheet_to_json(ws);
        setRawData(rows);
        
        // Auto-map based on exact header match
        const initialMapping: Mapping = {};
        PRODUCT_FIELDS.forEach(field => {
          const match = fileHeaders.find(h => h.toLowerCase() === field.key.toLowerCase() || h.toLowerCase() === field.label.toLowerCase());
          if (match) initialMapping[field.key] = match;
        });
        setMapping(initialMapping);
        setStep('mapping');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleMappingChange = (fieldKey: string, excelHeader: string) => {
    setMapping(prev => ({ ...prev, [fieldKey]: excelHeader }));
  };

  const validateAndNext = () => {
    const missingRequired = PRODUCT_FIELDS.filter(f => f.required && !mapping[f.key]);
    if (missingRequired.length > 0) {
      toast.error(`Please map all required fields: ${missingRequired.map(f => f.label).join(', ')}`);
      return;
    }

    // Generate preview
    const preview = rawData.map(row => {
      const product: any = {};
      PRODUCT_FIELDS.forEach(field => {
        const excelHeader = mapping[field.key];
        let value = row[excelHeader];

        if (['purchasePrice', 'salePrice', 'stockQuantity', 'lowStockThreshold'].includes(field.key)) {
          // Handle cases where excel might have formatted numbers as strings
          if (typeof value === 'string') {
            value = Number(value.replace(/[^0-9.-]+/g, ""));
          }
          value = Number(value) || 0;
        }

        product[field.key] = value;
      });
      return product;
    });

    setPreviewData(preview);
    setStep('preview');
  };

  const handleImport = () => {
    try {
      previewData.forEach(p => {
        const product: Product = {
          ...p,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
        } as Product;
        saveProduct(product);
      });
      toast.success(`Successfully imported ${previewData.length} products`);
      handleClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to import products');
    }
  };

  const handleClose = () => {
    setStep('upload');
    setFile(null);
    setHeaders([]);
    setRawData([]);
    setMapping({});
    setPreviewData([]);
    onClose();
  };

  const downloadTemplate = () => {
    const headers = PRODUCT_FIELDS.map(f => f.label);
    const data = [headers];
    
    // Add an example row
    data.push([
      'Example Product',
      'Samsung',
      'Galaxy S24',
      'Phone',
      '150000',
      '180000',
      '10',
      '2',
      '123456789012345',
      'Latest flagship phone'
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'products_import_template.xlsx');
    toast.success('Template downloaded successfully');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Bulk Import Products"
      className="max-w-4xl"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
        {step === 'upload' && (
          <div className="flex justify-end pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadTemplate}
              className="gap-2 rounded-xl border-dashed hover:border-black hover:bg-zinc-50 h-10 px-4"
            >
              <Download className="h-4 w-4" /> Download Excel Template
            </Button>
          </div>
        )}
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8 px-4">
          {[
            { id: 'upload', icon: FileUp, label: 'Upload' },
            { id: 'mapping', icon: Settings2, label: 'Map Columns' },
            { id: 'preview', icon: Eye, label: 'Preview' }
          ].map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2 relative z-10">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  step === s.id 
                    ? 'border-black bg-black text-white shadow-lg shadow-zinc-200' 
                    : step === 'preview' || (step === 'mapping' && s.id === 'upload')
                      ? 'border-green-500 bg-green-50 text-green-500'
                      : 'border-zinc-200 bg-white text-zinc-400'
                }`}>
                  {step === 'preview' || (step === 'mapping' && s.id === 'upload') ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <s.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-widest font-bold ${
                  step === s.id ? 'text-black' : 'text-zinc-400'
                }`}>{s.label}</span>
              </div>
              {idx < 2 && (
                <div className={`flex-1 h-px transition-all duration-500 mx-4 ${
                  (idx === 0 && (step === 'mapping' || step === 'preview')) || (idx === 1 && step === 'preview')
                    ? 'bg-green-500'
                    : 'bg-zinc-100'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {step === 'upload' && (
          <div className="space-y-6 py-10">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-200 rounded-[32px] p-20 flex flex-col items-center justify-center gap-6 group cursor-pointer hover:border-black hover:bg-zinc-50/50 transition-all duration-500"
            >
              <div className="h-20 w-20 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:scale-110 group-hover:bg-white group-hover:text-black group-hover:shadow-xl transition-all duration-500">
                <FileUp className="h-10 w-10" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-serif italic font-bold">Drop your Excel file here</p>
                <p className="text-zinc-400 font-mono text-[10px] mt-2 uppercase tracking-widest">Supports .xlsx and .xls</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
            </div>
            
            <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-zinc-400 mt-0.5" />
              <div className="text-xs text-zinc-500 space-y-1">
                <p className="font-bold text-zinc-800">Pro Tip:</p>
                <p>Ensure your Excel file has headers in the first row. We'll automatically try to match them for you.</p>
              </div>
            </div>
          </div>
        )}

        {step === 'mapping' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PRODUCT_FIELDS.map(field => (
                <div key={field.key} className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] uppercase tracking-widest font-bold flex items-center gap-2">
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </span>
                  </div>
                  <Select
                    options={[
                      { label: 'Select header...', value: '' },
                      ...headers.map(h => ({ label: h, value: h }))
                    ]}
                    value={mapping[field.key] || ''}
                    onChange={e => handleMappingChange(field.key, e.target.value)}
                    className="h-12"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-8 border-t border-zinc-100">
              <Button variant="ghost" onClick={() => setStep('upload')} className="rounded-xl h-12 px-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Upload
              </Button>
              <Button onClick={validateAndNext} className="rounded-xl h-12 px-8 shadow-lg shadow-zinc-200 group">
                Preview Data <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}

        {step === 'preview' && (
          <div className="space-y-6">
            <div className="border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
              <Table headers={['Product', 'Price', 'Stock', 'Category']}>
                {previewData.slice(0, 10).map((p, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{p.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono tracking-tighter">{p.brand} {p.model}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">Sale: Rs.{p.salePrice}</span>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-tighter">Cost: Rs.{p.purchasePrice}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-zinc-900">{p.stockQuantity}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-[10px] uppercase font-bold italic font-serif text-zinc-500">{p.category}</span>
                    </TableCell>
                  </TableRow>
                ))}
                {previewData.length > 10 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-400 py-4 font-serif italic text-xs">
                      + {previewData.length - 10} more products...
                    </TableCell>
                  </TableRow>
                )}
              </Table>
            </div>
            <div className="flex justify-between items-center pt-8 border-t border-zinc-100">
              <Button variant="ghost" onClick={() => setStep('mapping')} className="rounded-xl h-12 px-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Change Mapping
              </Button>
              <Button onClick={handleImport} className="rounded-xl h-12 px-10 shadow-xl shadow-zinc-200 bg-black hover:bg-zinc-800 text-white">
                Import {previewData.length} Products <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
