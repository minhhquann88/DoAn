'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  id: string;
  title?: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: (id: string) => void;
}

export function Toast({ id, title, description, type, onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [id, onClose]);
  
  const bgColor = {
    success: 'bg-accent text-accent-foreground',
    error: 'bg-destructive text-destructive-foreground',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-primary text-primary-foreground',
  }[type];
  
  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg',
        bgColor,
        'animate-in slide-in-from-top-full'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            {title && <p className="text-sm font-semibold">{title}</p>}
            <p className={cn('text-sm', title && 'mt-1')}>{description}</p>
          </div>
          <button
            onClick={() => onClose(id)}
            className="ml-4 inline-flex flex-shrink-0 rounded-md p-1.5 hover:bg-black/10 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = require('@/stores/uiStore').useUIStore();
  
  if (toasts.length === 0) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast: any) => (
        <Toast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

