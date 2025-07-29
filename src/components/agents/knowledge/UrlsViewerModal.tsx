
import React from 'react';
import { ModernModal } from '@/components/ui/modern-modal';
import { Globe, ExternalLink, Copy, Check } from 'lucide-react';
import ModernButton from '@/components/dashboard/ModernButton';
import { useToast } from '@/hooks/use-toast';

interface UrlsViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  urls: string[];
  title: string;
}

const UrlsViewerModal: React.FC<UrlsViewerModalProps> = ({
  open,
  onOpenChange,
  urls,
  title
}) => {
  const { toast } = useToast();
  const [copiedUrl, setCopiedUrl] = React.useState<string | null>(null);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
    toast({
      title: "URL copied",
      description: "The URL has been copied to your clipboard.",
    });
  };

  return (
    <ModernModal
      open={open}
      onOpenChange={onOpenChange}
      title={`URLs in ${title}`}
      description={`${urls.length} URL${urls.length !== 1 ? 's' : ''} found in this source`}
      size="lg"
      className="max-w-3xl"
    >
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {urls.map((url, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-900 dark:text-slate-100 truncate font-medium">
                {url}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                URL {index + 1} of {urls.length}
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={() => handleCopyUrl(url)}
                icon={copiedUrl === url ? Check : Copy}
                iconOnly
                className={`h-8 w-8 ${copiedUrl === url ? 'text-green-500' : 'hover:bg-slate-200 dark:hover:bg-slate-600'}`}
              />
              <ModernButton
                variant="ghost"
                size="sm"
                onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                icon={ExternalLink}
                iconOnly
                className="h-8 w-8 hover:bg-slate-200 dark:hover:bg-slate-600"
              />
            </div>
          </div>
        ))}
      </div>
    </ModernModal>
  );
};

export default UrlsViewerModal;
