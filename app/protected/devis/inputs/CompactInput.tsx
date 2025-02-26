import React from 'react';
import { Input } from '@/components/ui/input';

export const CompactInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type={type}
        className={`py-0.5 px-1.5 h-7 text-sm border-[1px] ${type === 'number' ? '[appearance:textfield] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none' : ''
          } ${className}`}
        {...props}
      />
    );
  }
);

CompactInput.displayName = 'CompactInput';