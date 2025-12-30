'use client';

import * as React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description: string;
  showCloseButton?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconBgColors = {
  success: 'bg-green-100 dark:bg-green-900/30',
  error: 'bg-red-100 dark:bg-red-900/30',
  warning: 'bg-yellow-100 dark:bg-yellow-900/30',
  info: 'bg-blue-100 dark:bg-blue-900/30',
};

const iconColors = {
  success: 'text-green-600 dark:text-green-400',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  info: 'text-blue-600 dark:text-blue-400',
};

const borderColors = {
  success: 'border-green-200 dark:border-green-800',
  error: 'border-red-200 dark:border-red-800',
  warning: 'border-yellow-200 dark:border-yellow-800',
  info: 'border-blue-200 dark:border-blue-800',
};

export function NotificationDialog({
  open,
  onOpenChange,
  type,
  title,
  description,
  showCloseButton = true,
  autoClose = true,
  autoCloseDelay = 3000,
}: NotificationDialogProps) {
  const Icon = icons[type];
  const iconColor = iconColors[type];
  const iconBgColor = iconBgColors[type];
  const borderColor = borderColors[type];

  // Auto close after delay
  React.useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [open, autoClose, autoCloseDelay, onOpenChange]);

  // Get default title based on type
  const defaultTitle = {
    success: 'Thành công',
    error: 'Lỗi',
    warning: 'Cảnh báo',
    info: 'Thông tin',
  }[type];

  const displayTitle = title || defaultTitle;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
      <DialogContent
        className={cn(
          'sm:max-w-md z-[9999]',
          borderColor,
          'border-l-4'
        )}
        showCloseButton={showCloseButton}
      >
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn(
              'flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center',
              iconBgColor
            )}>
              <Icon className={cn('h-6 w-6', iconColor)} />
            </div>
            <div className="flex-1 pt-1">
              <DialogTitle className="text-xl font-semibold mb-2">
                {displayTitle}
              </DialogTitle>
              <DialogDescription className="text-base text-foreground/80">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex justify-end mt-6">
          <Button
            variant="default"
            onClick={() => onOpenChange(false)}
            className="min-w-[100px]"
          >
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

