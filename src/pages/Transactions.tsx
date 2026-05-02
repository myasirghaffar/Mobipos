import * as React from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  Printer,
  FileDown
} from 'lucide-react';
import { storageService } from '../services/storage';
import { Transaction } from '../types';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate } from '../utils/utils';
import { toast } from 'sonner';

export default function Transactions() {
  const [transactions, setTransactions] = React.useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedTx, setSelectedTx] = React.useState<Transaction | null>(null);

  React.useEffect(() => {
    setTransactions(storageService.getTransactions());
  }, []);

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePrint = () => {
    if (!selectedTx) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHtml = `
      <html>
        <head>
          <title>Receipt - #${selectedTx.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #18181b; }
            .header { text-align: center; border-bottom: 2px solid #f4f4f5; padding-bottom: 20px; margin-bottom: 20px; }
            .title { font-family: 'serif'; font-style: italic; font-size: 24px; font-weight: bold; text-transform: uppercase; }
            .details { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; padding: 10px 0; border-bottom: 1px solid #f4f4f5; }
            td { padding: 12px 0; border-bottom: 1px solid #f4f4f5; font-size: 14px; }
            .totals { margin-left: auto; width: 250px; }
            .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
            .grand-total { font-size: 20px; font-weight: bold; border-top: 2px solid #18181b; margin-top: 10px; padding-top: 10px; }
            .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #71717a; font-style: italic; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">MOBI POS</div>
            <p style="font-size: 12px; color: #71717a;">Official Mobile Phone Shop Invoice</p>
          </div>
          
          <div class="details">
            <div>
              <strong>Order ID:</strong> #${selectedTx.id}<br>
              <strong>Date:</strong> ${formatDate(selectedTx.timestamp)}<br>
              <strong>Processed By:</strong> ${selectedTx.staffId === '1' ? 'Administrator' : 'Shop Staff'}
            </div>
            <div style="text-align: right;">
              <strong>Customer:</strong> ${selectedTx.customerName || 'Walk-in Customer'}<br>
              ${selectedTx.customerPhone ? `<strong>Phone:</strong> ${selectedTx.customerPhone}` : ''}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${selectedTx.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.name}</strong><br>
                    <span style="font-size: 10px; color: #71717a;">${item.brand} • ${item.model}</span>
                  </td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${formatCurrency(item.price)}</td>
                  <td style="text-align: right;">${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row"><span>Subtotal:</span> <span>${formatCurrency(selectedTx.subtotal)}</span></div>
            <div class="total-row"><span>Tax (0%):</span> <span>${formatCurrency(0)}</span></div>
            <div class="total-row grand-total"><span>TOTAL:</span> <span>${formatCurrency(selectedTx.total)}</span></div>
            <div class="total-row" style="margin-top: 20px;"><span>Cash Received:</span> <span>${formatCurrency(selectedTx.cashReceived)}</span></div>
            <div class="total-row"><span>Change:</span> <span>${formatCurrency(selectedTx.change)}</span></div>
          </div>

          <div class="footer">
            Thank you for shopping at MobiPOS!<br>
            Please keep this receipt for warranty purposes.
          </div>

          <script>
            window.onload = () => { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  };

  const exportReport = () => {
    try {
      const data = filteredTransactions.map(tx => ({
        'Transaction ID': tx.id,
        'Date': new Date(tx.timestamp).toLocaleDateString(),
        'Time': new Date(tx.timestamp).toLocaleTimeString(),
        'Customer Name': tx.customerName || 'Walk-in',
        'Customer Phone': tx.customerPhone || '',
        'Subtotal': tx.subtotal,
        'Total': tx.total,
        'Cash Received': tx.cashReceived,
        'Change': tx.change,
        'Staff ID': tx.staffId,
        'Items Count': tx.items.reduce((acc, item) => acc + item.quantity, 0),
        'Items Detail': tx.items.map(item => `${item.name} (${item.quantity})`).join(', ')
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
      XLSX.writeFile(wb, `sales_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Sales report exported successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export sales report');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div>
          <h2 className="text-3xl md:text-4xl font-serif italic font-bold tracking-tighter text-zinc-900">
            Sales History
          </h2>
          <p className="text-zinc-500 font-medium">Archive of all processed transactions.</p>
        </div>
        <Button variant="outline" className="gap-2 w-full md:w-auto h-12 rounded-xl" onClick={exportReport}>
          <FileDown className="h-4 w-4" /> Export Report
        </Button>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
          <Input 
            placeholder="Search by ID, customer, or product..." 
            className="pl-12 h-12 rounded-xl border-zinc-200 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <Button variant="outline" className="h-12 gap-2 flex-1 sm:flex-none whitespace-nowrap rounded-xl">
            <Calendar className="h-4 w-4" /> Date Range
          </Button>
          <Button variant="outline" className="h-12 gap-2 flex-1 sm:flex-none whitespace-nowrap rounded-xl">
            <Filter className="h-4 w-4" /> More Filters
          </Button>
        </div>
      </div>

      <Table headers={['Transaction ID', 'Date & Time', 'Customer', 'Handled By', 'Total', 'Action']}>
        {filteredTransactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell className="font-bold">#{tx.id}</TableCell>
            <TableCell className="text-xs">{formatDate(tx.timestamp)}</TableCell>
            <TableCell className="font-serif italic text-zinc-400">
              {tx.customerName || 'Walk-in'}
            </TableCell>
            <TableCell>
              <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-zinc-500 bg-zinc-100 px-2 py-1 rounded-md">
                {tx.staffId === '1' ? 'Admin' : 'Staff'}
              </span>
            </TableCell>
            <TableCell className="font-bold text-zinc-900">
              {formatCurrency(tx.total)}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setSelectedTx(tx)}>
                <Eye className="h-4 w-4" /> Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
        {filteredTransactions.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-zinc-400 font-serif italic">
              No transactions found
            </TableCell>
          </TableRow>
        )}
      </Table>

      <Modal
        isOpen={!!selectedTx}
        onClose={() => setSelectedTx(null)}
        title={`Invoice Detail - #${selectedTx?.id}`}
        className="max-w-2xl"
      >
        {selectedTx && (
          <div className="space-y-8">
            <div className="flex justify-between items-start border-b border-dashed border-zinc-200 pb-6">
              <div className="space-y-1">
                <p className="text-xs font-serif italic text-zinc-500 uppercase tracking-widest">Customer</p>
                <p className="font-bold text-lg">{selectedTx.customerName || 'Walk-in Customer'}</p>
                {selectedTx.customerPhone && <p className="text-sm font-mono">{selectedTx.customerPhone}</p>}
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-serif italic text-zinc-500 uppercase tracking-widest">Processed By</p>
                <p className="text-sm font-bold uppercase tracking-widest text-zinc-900 animate-pulse">
                  {selectedTx.staffId === '1' ? 'ADMINISTRATOR' : 'SHOP STAFF'}
                </p>
                <p className="text-[10px] font-mono text-zinc-400">{formatDate(selectedTx.timestamp)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-serif italic text-zinc-500 uppercase tracking-widest">Line Items</p>
              <div className="space-y-2">
                {selectedTx.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm py-2 group">
                    <div className="flex-1">
                      <p className="font-bold text-zinc-900">{item.name}</p>
                      <p className="text-xs text-zinc-500 font-mono">{item.brand} • {item.model}</p>
                    </div>
                    <div className="text-right flex gap-8">
                      <div className="text-zinc-400 font-mono">
                        {item.quantity} x {formatCurrency(item.price)}
                      </div>
                      <div className="font-bold min-w-[80px] font-mono">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
              <div className="flex justify-between text-sm text-zinc-500">
                <span className="font-serif italic">Subtotal</span>
                <span className="font-mono">{formatCurrency(selectedTx.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-500">
                <span className="font-serif italic">Tax (0%)</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between text-xl font-mono font-bold tracking-tighter text-zinc-900 border-t border-zinc-200 pt-3">
                <span>TOTAL</span>
                <span>{formatCurrency(selectedTx.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-zinc-100 bg-emerald-50/30 text-emerald-700">
                <p className="text-xs font-serif italic uppercase tracking-widest mb-1">Cash Received</p>
                <p className="text-lg font-mono font-bold">{formatCurrency(selectedTx.cashReceived)}</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-100 bg-blue-50/30 text-blue-700">
                <p className="text-xs font-serif italic uppercase tracking-widest mb-1">Change Returned</p>
                <p className="text-lg font-mono font-bold">{formatCurrency(selectedTx.change)}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="flex-1 gap-2" variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4" /> Print Invoice
              </Button>
              <Button className="flex-1 gap-2">
                <FileDown className="h-4 w-4" /> Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
