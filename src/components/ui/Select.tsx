import * as React from 'react';
import { cn } from '../../utils/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-400 italic font-serif ml-1">
            {label}
          </label>
        )}
        <div className="relative group">
          <select
            ref={ref}
            className={cn(
              'flex h-14 w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-5 py-3 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-zinc-300 shadow-sm cursor-pointer',
              error && 'border-red-500 focus-visible:ring-red-500',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-hover:text-black transition-colors">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        {error && <p className="text-[10px] text-red-500 font-mono tracking-tighter uppercase ml-1 animate-pulse">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
