import * as React from 'react';
import { cn } from '../../utils/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-black text-white hover:bg-zinc-800 shadow-xl shadow-zinc-200 transition-all duration-200 active:scale-95',
      secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:scale-95',
      danger: 'bg-red-500 text-white hover:bg-red-600 shadow-xl shadow-red-100 active:scale-95',
      outline: 'border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 active:scale-95 shadow-sm',
      ghost: 'hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 active:scale-95',
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm rounded-xl',
      md: 'px-6 py-3 rounded-2xl',
      lg: 'px-8 py-4 text-lg rounded-[20px]',
      icon: 'p-3 rounded-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] transition-transform duration-100',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
