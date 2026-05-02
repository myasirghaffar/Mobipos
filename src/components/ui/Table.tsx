import * as React from 'react';
import { cn } from '../../utils/utils';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
  className?: string;
}

export const Table = ({ headers, children, className }: TableProps) => {
  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm scrollbar-thin', className)}>
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/50">
            {headers.map((header) => (
              <th key={header} className="px-6 py-4 font-serif italic text-xs uppercase tracking-widest text-zinc-500 font-semibold whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string; key?: React.Key }) => (
  <tr 
    onClick={onClick} 
    className={cn(
      'transition-all duration-200 group', 
      onClick ? 'cursor-pointer hover:bg-zinc-900 hover:text-white' : 'hover:bg-zinc-50/50',
      className
    )}
  >
    {children}
  </tr>
);

export const TableCell = ({ children, className, colSpan }: { children: React.ReactNode; className?: string; colSpan?: number }) => (
  <td 
    colSpan={colSpan}
    className={cn('px-6 py-4 font-mono text-zinc-700 tracking-tight group-hover:text-inherit whitespace-nowrap', className)}
  >
    {children}
  </td>
);
