
import React, { useState } from 'react';
import { CopyIcon, Check, Code, Share, ExternalLink } from 'lucide-react';
import { ModernModal } from '@/components/ui/modern-modal';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DeploymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: {
    id: string;
    name: string;
  };
}

const DeploymentDialog = ({ open, onOpenChange, agent }: DeploymentDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('shareable');
  const [selectedIframeMode, setSelectedIframeMode] = useState('fullscreen');

  // Build the links and code based on the agent ID using the new route format
  const shareableLink = `${window.location.origin}/chat/preview/${agent.id}`;
  
  const embedScript = `<script>
  (function () {
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.setAttribute("data-agent-id", "${agent.id}");
    script.setAttribute("data-type", "bubble");
    
    script.src = "https://api.7en.ai/static/agent.js";
    document.body.appendChild(script);
  })();
</script>`; 

  const iframeEmbedded = `<iframe
  src="${window.location.origin}/chat/assistant/${agent.id}?mode=embedded"
  width="400"
  height="600"
  frameborder="0"
  allow="microphone"
  style="position: fixed; bottom: 20px; right: 20px; z-index: 1000; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
></iframe>`;

  const iframePopup = `<iframe
  src="${window.location.origin}/chat/assistant/${agent.id}?type=popup"
  width="400"
  height="600"
  frameborder="0"
  allow="microphone"
  style="border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);"
></iframe>`;

  const iframeInline = `<iframe
  src="${window.location.origin}/chat/assistant/${agent.id}"
  width="100%"
  height="600"
  frameborder="0"
  allow="microphone"
></iframe>`;

  const iframeFullscreen = `<iframe
  src="${shareableLink}"
  width="100%"
  height="600"
  frameborder="0"
  allow="microphone"
></iframe>`;

  const handleCopy = (text: string, id: string, successMessage: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({
      title: "Copied to clipboard",
      description: successMessage,
    });
    setTimeout(() => setCopied(null), 2000);
  };

  const tabs = [
    { id: 'shareable', label: 'Shareable Link' },
    { id: 'iframe', label: 'Embed Iframe' },
    { id: 'script', label: 'Embed Script' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'shareable':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Share className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Shareable Link</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Share this link to give direct access to your chatbot:
            </p>
            
            <Card className="relative mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <div className="p-4 text-xs overflow-x-auto break-all font-mono text-slate-700 dark:text-slate-300">
                {shareableLink}
              </div>
              <div className="absolute right-2 top-2 flex gap-1">
                <ModernButton 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-2 hover:bg-slate-100 dark:hover:bg-gray-600"
                  onClick={() => window.open(shareableLink, '_blank')}
                  iconOnly
                >
                  <ExternalLink className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                </ModernButton>
                <ModernButton 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-2 hover:bg-slate-100 dark:hover:bg-gray-600"
                  onClick={() => handleCopy(shareableLink, 'link', "Link copied to clipboard")}
                  iconOnly
                >
                  {copied === 'link' ? <Check className="h-4 w-4 text-slate-500 dark:text-slate-400" /> : <CopyIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
                </ModernButton>
              </div>
            </Card>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-medium mb-2 text-blue-900 dark:text-blue-100">Instructions</h4>
              <ol className="text-sm space-y-2 text-blue-700 dark:text-blue-300 list-decimal pl-4">
                <li>Copy the link above or click on the external link icon to open it directly.</li>
                <li>Share this link with users who need to interact with your chatbot.</li>
                <li>The link opens a full-page chatbot interface.</li>
              </ol>
            </div>
          </div>
        );

      case 'iframe':
        const iframeModes = [
          { id: 'fullscreen', label: 'Fullscreen', code: iframeFullscreen, description: 'Full page chatbot interface' },
          { id: 'inline', label: 'Inline', code: iframeInline, description: 'Embedded directly in your page content' },
          { id: 'popup', label: 'Popup', code: iframePopup, description: 'Popup modal style interface' },
          { id: 'embedded', label: 'Floating Widget', code: iframeEmbedded, description: 'Fixed floating chat widget' }
        ];
        
        const currentMode = iframeModes.find(mode => mode.id === selectedIframeMode) || iframeModes[0];
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Embed as Iframe</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Choose a view mode and copy the code to embed the chatbot on your website:
            </p>
            
            {/* Mode Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {iframeModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedIframeMode(mode.id)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    selectedIframeMode === mode.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-600'
                  }`}
                >
                  <div className="font-medium text-sm">{mode.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{mode.description}</div>
                </button>
              ))}
            </div>
            
            <Card className="relative mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <pre className="p-4 text-xs overflow-x-auto font-mono text-slate-700 dark:text-slate-300">
                {currentMode.code}
              </pre>
              <ModernButton 
                variant="ghost" 
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-2 hover:bg-slate-100 dark:hover:bg-gray-600"
                onClick={() => handleCopy(currentMode.code, 'iframe', `${currentMode.label} iframe code copied to clipboard`)}
                iconOnly
              >
                {copied === 'iframe' ? <Check className="h-4 w-4 text-slate-500 dark:text-slate-400" /> : <CopyIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
              </ModernButton>
            </Card>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-medium mb-2 text-green-900 dark:text-green-100">Instructions</h4>
              <ol className="text-sm space-y-2 text-green-700 dark:text-green-300 list-decimal pl-4">
                <li>Select your preferred view mode above.</li>
                <li>Copy the generated code snippet.</li>
                <li>Paste it into your website's HTML where you want the chatbot to appear.</li>
                <li>Adjust dimensions and styling as needed for your layout.</li>
              </ol>
            </div>
          </div>
        );

      case 'script':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Embed Script</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Add this script to your website to show a chat bubble:
            </p>
            
            <Card className="relative mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <pre className="p-4 text-xs overflow-x-auto font-mono text-slate-700 dark:text-slate-300">
                {embedScript}
              </pre>
              <ModernButton 
                variant="ghost" 
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-2 hover:bg-slate-100 dark:hover:bg-gray-600"
                onClick={() => handleCopy(embedScript, 'script', "Script code copied to clipboard")}
                iconOnly
              >
                {copied === 'script' ? <Check className="h-4 w-4 text-slate-500 dark:text-slate-400" /> : <CopyIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
              </ModernButton>
            </Card>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
              <h4 className="text-sm font-medium mb-2 text-purple-900 dark:text-purple-100">Instructions</h4>
              <ol className="text-sm space-y-2 text-purple-700 dark:text-purple-300 list-decimal pl-4">
                <li>Copy the script snippet above.</li>
                <li>Paste it before the closing &lt;/body&gt; tag in your website's HTML.</li>
                <li>A chat bubble will appear in the bottom right corner of your website.</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ModernModal
      open={open}
      onOpenChange={onOpenChange}
      title={`Deploy "${agent.name}"`}
      description="Choose how to deploy your agent."
      size="2xl"
      fixedFooter
      footer={
        <ModernButton variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </ModernButton>
      }
    >
      <div className="space-y-6">
        <div className="flex justify-center">
          <ModernTabNavigation
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
        
        <div className="min-h-[400px]">
          {renderTabContent()}
        </div>
      </div>
    </ModernModal>
  );
};

export default DeploymentDialog;
