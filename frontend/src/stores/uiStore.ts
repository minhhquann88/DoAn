/**
 * UI Store - Quản lý trạng thái UI
 */
import { create } from 'zustand';

interface Toast {
  id: string;
  title?: string;
  description: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface UIState {
  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Theme
  theme: 'light' | 'dark';
  
  // Loading states
  globalLoading: boolean;
  
  // Toasts
  toasts: Toast[];
  
  // Modals
  activeModal: string | null;
  
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapse: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setGlobalLoading: (loading: boolean) => void;
  
  // Toast actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  
  // Modal actions
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'light',
  globalLoading: false,
  toasts: [],
  activeModal: null,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  toggleSidebarCollapse: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },
  
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(newTheme);
  },
  
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    
    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  
  removeToast: (id) => {
    set((state) => ({ 
      toasts: state.toasts.filter((t) => t.id !== id) 
    }));
  },
  
  clearToasts: () => set({ toasts: [] }),
  
  openModal: (modalId) => set({ activeModal: modalId }),
  
  closeModal: () => set({ activeModal: null }),
}));

// Initialize theme from localStorage on client side
if (typeof window !== 'undefined') {
  const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  if (storedTheme) {
    useUIStore.getState().setTheme(storedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    useUIStore.getState().setTheme(prefersDark ? 'dark' : 'light');
  }
}

