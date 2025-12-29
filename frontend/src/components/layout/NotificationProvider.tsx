'use client';

import * as React from 'react';
import { useUIStore } from '@/stores/uiStore';
import { NotificationDialog } from '@/components/ui/notification-dialog';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { currentNotification, closeNotification } = useUIStore();

  return (
    <>
      {children}
      {currentNotification && (
        <NotificationDialog
          open={!!currentNotification}
          onOpenChange={(open) => {
            if (!open) {
              closeNotification();
            }
          }}
          type={currentNotification.type}
          title={currentNotification.title}
          description={currentNotification.description}
          autoClose={currentNotification.autoClose ?? true}
          autoCloseDelay={currentNotification.autoCloseDelay ?? 3000}
        />
      )}
    </>
  );
}

