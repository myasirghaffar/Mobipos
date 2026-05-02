import * as React from 'react';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { storageService } from '../services/storage';
import { formatCurrency, formatDate } from '../utils/utils';
import { Table, TableRow, TableCell } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const products = storageService.getProducts();
  const transactions = storageService.getTransactions();

  const today = new Date().setHours(0, 0, 0, 0);
  const todaysSales = transactions
    .filter(t => t.timestamp >= today)
    .reduce((acc, t) => acc + t.total, 0);
  
  const lowStockItems = products.filter(p => p.stockQuantity <= p.lowStockThreshold);
  const recentTransactions = transactions.slice(0, 5);

  const stats = [
    { 
      label: "Today's Sales", 
      value: formatCurrency(todaysSales), 
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    { 
      label: "Total Products", 
      value: products.length, 
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    { 
      label: "Low Stock Items", 
      value: lowStockItems.length, 
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    { 
      label: "Monthly Transactions", 
      value: transactions.length, 
      icon: Clock,
      color: "text-zinc-600",
      bg: "bg-zinc-50"
    }
  ];

  return (
    <div className="space-y-12">
      <header className="pb-6 border-b border-zinc-100">
        <h2 className="text-3xl md:text-5xl font-serif italic font-bold tracking-tighter text-zinc-900">
          Executive Summary
        </h2>
        <p className="text-zinc-500 font-medium mt-1">Real-time performance metrics</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-2xl border border-zinc-100 shadow-xl shadow-zinc-200/40 transition-all duration-300 hover:shadow-2xl hover:shadow-zinc-300/50 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-6">
              <div className={`${stat.bg} ${stat.color} p-4 rounded-2xl ring-1 ring-inset ring-black/5`}>
                <stat.icon className="h-7 w-7" />
              </div>
            </div>
            <p className="text-[10px] font-serif italic text-zinc-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-4xl font-mono font-bold tracking-tighter text-zinc-900">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-2xl font-serif italic font-bold tracking-tight text-zinc-900">Recent Transactions</h3>
            <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')} className="hover:bg-zinc-100 rounded-xl px-4">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <Table headers={['ID', 'Date', 'Amount', 'Staff']}>
            {recentTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="font-bold text-black border-l-4 border-transparent group-hover:border-white">#{tx.id}</TableCell>
                <TableCell className="text-xs">{formatDate(tx.timestamp)}</TableCell>
                <TableCell className="font-bold text-zinc-900">{formatCurrency(tx.total)}</TableCell>
                <TableCell className="opacity-50 text-[10px] uppercase tracking-widest">{tx.staffId === '1' ? 'Admin' : 'Staff'}</TableCell>
              </TableRow>
            ))}
            {recentTransactions.length === 0 && (
              <TableRow>
                <TableCell className="text-center font-serif italic py-12 text-zinc-400" colSpan={4}>
                  No transactions processed today.
                </TableCell>
              </TableRow>
            )}
          </Table>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-2xl font-serif italic font-bold tracking-tight text-zinc-900">Stock Alerts</h3>
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-zinc-100 shadow-sm flex items-center justify-between group hover:border-amber-200 hover:bg-amber-50/50 transition-all duration-300">
                <div className="min-w-0">
                  <h4 className="font-bold text-zinc-900 truncate">{item.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono tracking-tight uppercase">{item.brand} • {item.model}</p>
                </div>
                <div className="ml-4 flex flex-col items-end">
                  <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-100/50 px-3 py-1 rounded-full ring-1 ring-inset ring-amber-600/10">
                    {item.stockQuantity} LEFT
                  </span>
                </div>
              </div>
            ))}
            {lowStockItems.length === 0 && (
              <div className="bg-emerald-50/50 border border-emerald-100 p-10 rounded-2xl text-center shadow-inner">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
                  <Package className="h-6 w-6" />
                </div>
                <p className="text-zinc-600 font-serif italic">Inventory levels look healthy.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
