import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success';
}

const variantClasses: Record<string, string> = {
  default: 'bg-gold-500/20 text-gold-400 border-gold-800',
  secondary: 'bg-pitch-800 text-gray-400 border-pitch-700',
  outline: 'bg-transparent text-gray-400 border-pitch-600',
  success: 'bg-emerald-900/40 text-emerald-400 border-emerald-800',
};

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
