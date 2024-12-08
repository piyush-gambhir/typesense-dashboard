import { Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProgressBarProps {
  isLoading: boolean;
  progress: number;
  title?: string;
  loadingMessage?: string;
  completeMessage?: string;
}

export function ProgressBar({
  isLoading,
  progress,
  title = 'Loading...',
  loadingMessage = 'Please wait while we process your data.',
  completeMessage = 'Processing complete! Finalizing...',
}: Readonly<ProgressBarProps>) {
  if (!isLoading) return null;

  return (
    <div className="w-full mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Badge variant="outline">{Math.round(progress)}%</Badge>
      </div>
      <Progress value={progress} className="w-full" />
      <p className="text-xs text-muted-foreground">
        {progress < 100 ? loadingMessage : completeMessage}
      </p>
    </div>
  );
}
