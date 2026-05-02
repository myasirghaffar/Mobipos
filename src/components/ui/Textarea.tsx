import * as React from 'react';
import { cn } from '../../utils/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-xs font-serif italic text-zinc-500 ml-1 uppercase tracking-widest font-bold">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'flex min-h-[100px] w-full rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm ring-offset-white placeholder:text-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-zinc-300 shadow-sm resize-none',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="text-[10px] text-red-500 ml-1 font-mono">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
