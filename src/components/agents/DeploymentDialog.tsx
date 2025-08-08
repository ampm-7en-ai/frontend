
import React, { useState } from 'react';
import { CopyIcon, Check, Code, Share, ExternalLink } from 'lucide-react';
import { ModernModal } from '@/components/ui/modern-modal';
import ModernButton from '@/components/dashboard/ModernButton';
import ModernTabNavigation from '@/components/dashboard/ModernTabNavigation';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from "@/config/env";

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
  const [selectedInlineStyle, setSelectedInlineStyle] = useState('style1');

  // Build the links and code based on the agent ID using the new route format
  const shareableLink = `${window.location.origin}/chat/preview/${agent.id}`;
  
  const embedScript = `<script>
  (function () {
    var script = document.createElement('script');
    script.type = "text/javascript";
    script.setAttribute("data-agent-id", "${agent.id}");
    script.setAttribute("data-type", "bubble");
    script.setAttribute("data-config","${API_BASE_URL}");
    script.setAttribute("data-preview","${window.location.origin}");
    
    script.src = "${window.location.origin}/agent-hybrid.js";
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
    { id: 'widget', label: 'Widget' },
    { id: 'popup', label: 'Popup' },
    { id: 'inline', label: 'Inline' }
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

      case 'widget':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Embed Widget Script</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Add this script to your website to show a chat bubble widget:
            </p>
            
            <Card className="relative mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <pre className="p-4 text-xs overflow-x-auto font-mono text-slate-700 dark:text-slate-300">
                {embedScript}
              </pre>
              <ModernButton 
                variant="ghost" 
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-2 hover:bg-slate-100 dark:hover:bg-gray-600"
                onClick={() => handleCopy(embedScript, 'script', "Widget script copied to clipboard")}
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
                <li>A chat widget will appear in the bottom corner of your website.</li>
              </ol>
            </div>
          </div>
        );

      case 'popup':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-green-600 dark:text-green-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Popup Iframe</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Embed the chatbot as a popup modal on your website:
            </p>
            
            <Card className="relative mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <pre className="p-4 text-xs overflow-x-auto font-mono text-slate-700 dark:text-slate-300">
                {iframePopup}
              </pre>
              <ModernButton 
                variant="ghost" 
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-2 hover:bg-slate-100 dark:hover:bg-gray-600"
                onClick={() => handleCopy(iframePopup, 'popup', "Popup iframe code copied to clipboard")}
                iconOnly
              >
                {copied === 'popup' ? <Check className="h-4 w-4 text-slate-500 dark:text-slate-400" /> : <CopyIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
              </ModernButton>
            </Card>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-medium mb-2 text-green-900 dark:text-green-100">Instructions</h4>
              <ol className="text-sm space-y-2 text-green-700 dark:text-green-300 list-decimal pl-4">
                <li>Copy the iframe code above.</li>
                <li>Paste it into your website's HTML where you want the popup to appear.</li>
                <li>The chatbot will display as a popup modal interface.</li>
              </ol>
            </div>
          </div>
        );

      case 'inline':
        const inlineStyle1Code = `<iframe
  src="${window.location.origin}/chat/assistant/${agent.id}"
  width="100%"
  height="600"
  frameborder="0"
  allow="microphone"
></iframe>`;

        const inlineStyle2Code = `<iframe
  src="${window.location.origin}/chat/preview/${agent.id}"
  width="100%"
  height="600"
  frameborder="0"
  allow="microphone"
></iframe>`;

        const currentInlineCode = selectedInlineStyle === 'style1' ? inlineStyle1Code : inlineStyle2Code;
        const currentStyleLabel = selectedInlineStyle === 'style1' ? 'Assistant Interface' : 'Preview Interface';
        
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Code className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">Inline Iframe</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Embed the chatbot directly in your page content with different styles:
            </p>
            
            {/* Style Selection */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setSelectedInlineStyle('style1')}
                className={`p-3 text-left rounded-lg border transition-all ${
                  selectedInlineStyle === 'style1'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100'
                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
                }`}
              >
                <div className="font-medium text-sm">Style 1</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assistant Interface</div>
              </button>
              <button
                onClick={() => setSelectedInlineStyle('style2')}
                className={`p-3 text-left rounded-lg border transition-all ${
                  selectedInlineStyle === 'style2'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-900 dark:text-orange-100'
                    : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600'
                }`}
              >
                <div className="font-medium text-sm">Style 2</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Preview Interface</div>
              </button>
            </div>
            
            <Card className="relative mb-4 overflow-hidden bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <pre className="p-4 text-xs overflow-x-auto font-mono text-slate-700 dark:text-slate-300">
                {currentInlineCode}
              </pre>
              <ModernButton 
                variant="ghost" 
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-2 hover:bg-slate-100 dark:hover:bg-gray-600"
                onClick={() => handleCopy(currentInlineCode, 'inline', `${currentStyleLabel} code copied to clipboard`)}
                iconOnly
              >
                {copied === 'inline' ? <Check className="h-4 w-4 text-slate-500 dark:text-slate-400" /> : <CopyIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />}
              </ModernButton>
            </Card>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
              <h4 className="text-sm font-medium mb-2 text-orange-900 dark:text-orange-100">Instructions</h4>
              <ol className="text-sm space-y-2 text-orange-700 dark:text-orange-300 list-decimal pl-4">
                <li>Select your preferred style above.</li>
                <li>Copy the generated iframe code.</li>
                <li>Paste it into your website's HTML where you want the chatbot to appear.</li>
                <li>The chatbot will be embedded directly in your page content.</li>
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
