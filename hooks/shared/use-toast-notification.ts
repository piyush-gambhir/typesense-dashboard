import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

type ToastVariant = 'default' | 'destructive';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

export function useToastNotification() {
  const showSuccess = useCallback((message: string, title?: string) => {
    toast({
      title: title || 'Success',
      description: message,
      variant: 'default',
    });
  }, []);

  const showError = useCallback((message: string, title?: string) => {
    toast({
      title: title || 'Error',
      description: message,
      variant: 'destructive',
    });
  }, []);

  const showNotification = useCallback((options: ToastOptions) => {
    toast({
      title: options.title,
      description: options.description,
      variant: options.variant || 'default',
    });
  }, []);

  return {
    showSuccess,
    showError,
    showNotification,
  };
}