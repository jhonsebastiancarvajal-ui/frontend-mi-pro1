import React from 'react';
import { cn } from '../../lib/utils';

function Badge({ className, variant = 'default', ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80": variant === "default",
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80": variant === "secondary",
          "border-transparent bg-red-100 text-red-800 hover:bg-red-100/80": variant === "destructive",
          "text-foreground": variant === "outline",
          "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100/80": variant === "warning",
          "border-transparent bg-green-100 text-green-800 hover:bg-green-100/80": variant === "success",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
