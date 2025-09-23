
import React, { useState } from 'react';
import { useBuilder } from './BuilderContext';
import { ChatboxPreview } from '@/components/settings/ChatboxPreview';
import { AskAiModal } from './AskAiModal';
import { ConsolePanel } from './ConsolePanel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Bot, MessageCircleReplyIcon, MessageCircle, MessageSquare } from 'lucide-react';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import ModernButton from '@/components/dashboard/ModernButton';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Icon } from '@/components/icons';

interface InteractiveCanvasProps {
  isTraining?: boolean;
  onAgentDataRefresh?: () => Promise<void>;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({ isTraining = false, onAgentDataRefresh }) => {
  const { state } = useBuilder();
  const { agentData, canvasMode, isPreviewActive, isLoading } = state;
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('style1');
  const { theme } = useAppTheme();

  const currentAgentId = agentData.id ? agentData.id.toString() : null;
  const shareableLink = currentAgentId ? `${window.location.origin}/chat/preview/${currentAgentId}?theme=${theme}` : '';

  // Helper function to convert hex to rgba for glow effects
  const hexToRgba = (hex: string, alpha: number = 1): string => {
    try {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return 'rgba(59, 130, 246, 0.5)'; // fallback to blue
    }
  };

  const getCanvasContent = () => {
    if (!isPreviewActive) {
      return (
        <div className="flex items-center justify-center h-full bg-neutral-100 dark:bg-neutral-950">
          <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-white/30 dark:border-neutral-700/30 shadow-xl">
            
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Preview is disabled</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enable preview to see your agent in action</p>
          </div>
        </div>
      );
    }

    if (!currentAgentId) {
      return (
        <div className="flex items-center justify-center h-full bg-neutral-100 dark:bg-neutral-950">
          <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm border border-white/30 dark:border-neutral-700/30 shadow-xl">
            <LoadingSpinner className='h-12'/>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Loading agent...</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Please wait while we load your agent configuration</p>
          </div>
        </div>
      );
    }

    if (canvasMode === 'embedded') {
      const hasButtonText = agentData.buttonText && agentData.buttonText.trim() !== '';
      const iconSize = hasButtonText ? 24 : 36;
      const isLeftPosition = agentData.position === 'bottom-left';
      const primaryColorRgba = hexToRgba(agentData.primaryColor, 0.3);
      const primaryColorRgbaLight = hexToRgba(agentData.primaryColor, 0.15);

      return (
        <div className="h-full w-full relative bg-neutral-100 [background-image:none] dark:bg-[hsla(0,0%,0%,0.95)] text-white shadow-lg p-6 overflow-hidden">
          {/* Chat button - positioned within canvas */}
          <div className={`absolute bottom-6 ${isLeftPosition ? 'left-6' : 'right-6'} z-50`}>
            <ModernButton
              onClick={() => setIsChatMinimized(!isChatMinimized)}
              className={`${hasButtonText ? 'rounded-full px-6 py-4 h-auto' : 'rounded-full w-16 h-16 p-0'} shadow-2xl hover:scale-110 transition-all duration-300 border-4 border-white/30 group relative overflow-hidden`}
              style={{ 
                background: `linear-gradient(135deg, ${agentData.primaryColor}, ${adjustColor(agentData.primaryColor, -30)})`,
                boxShadow: `0 10px 30px ${primaryColorRgba}, 0 5px 15px ${primaryColorRgbaLight}`,
                fontFamily: agentData.fontFamily,
                borderRadius: "40px"
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 flex items-center gap-2">
                {agentData.avatar || agentData.avatarUrl ? (
                  <Avatar className={hasButtonText ? "w-6 h-6" : "w-[56px] h-[56px]"}>
                    <AvatarImage src={agentData.avatar || agentData.avatarUrl} alt={agentData.chatbotName} className="object-cover" />
                    <AvatarFallback className="text-white bg-transparent" style={{color: agentData.secondaryColor }}>
                      <Icon name={`Chat`} type='plain' color='#ffffff' className='h-8 w-8' />
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  // <div style={{width:'24px',height:'24px'}}>
                  //   <svg style={{fill: agentData.secondaryColor}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 508.81 443.74"><path d="M434.56,65.24C386.48,23.17,322.49,0,254.4,0,186.31,0,122.32,23.17,74.23,65.24,26.36,107.12,0,162.75,0,221.87c0,45.86,15.92,89.87,46.03,127.28l1.75,2.17-.65,2.71c-5.98,25.07-10.25,50.72-12.68,76.23-.15,1.62,.79,2.6,1.2,2.95,.51,.43,1.57,1.08,3.08,.68l83.43-22.46,1.97,1.02c39.27,20.47,84.32,31.29,130.27,31.29,68.09,0,132.08-23.17,180.16-65.24,47.87-41.89,74.24-97.52,74.24-156.63s-26.37-114.74-74.24-156.63ZM254.4,248.7c-14.79,0-26.83-12.04-26.83-26.83s12.04-26.83,26.83-26.83c14.79,0,26.83,12.04,26.83,26.83s-12.04,26.83-26.83,26.83Zm-122.27,0c-14.79,0-26.83-12.04-26.83-26.83s12.04-26.83,26.83-26.83,26.83,12.04,26.83,26.83-12.04,26.83-26.83,26.83Zm244.54,0c-14.79,0-26.83-12.04-26.83-26.83s12.04-26.83,26.83-26.83c14.79,0,26.83,12.04,26.83,26.83s-12.04,26.83-26.83,26.83Z"/></svg>
                  // </div>
                  <Icon name={`Chat`} type='plain' color='#ffffff' className='h-8 w-8' />
                )}
                {hasButtonText && (
                  <span className="text-white font-medium text-sm">
                    {agentData.buttonText}
                  </span>
                )}
              </div>
            </ModernButton>
          </div>

          {/* Chat window - positioned within canvas */}
          <div 
            className={`absolute ${isLeftPosition ? 'left-6 bottom-24' : 'right-6 bottom-24'} z-40 transition-all duration-300 ${
              isChatMinimized ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 pointer-events-auto scale-100'
            }`}
            style={{
              transformOrigin: isLeftPosition ? 'bottom left' : 'bottom right',
              width: '400px',
              height: '80vh',
              marginBottom: '20px',
              overflow: 'hidden'
            }}
          >
            {/* ChatboxPreview - unmount/mount based on loading state */}
            <div className={`w-full h-full overflow-hidden ${isChatMinimized ? 'hidden' : 'block'}`} style={{borderRadius:"0px 0px 12px 12px"}}>
              {!isLoading && (
                <ChatboxPreview
                  agentId={currentAgentId}
                  primaryColor={agentData.primaryColor}
                  secondaryColor={agentData.secondaryColor}
                  fontFamily={agentData.fontFamily}
                  chatbotName={agentData.chatbotName}
                  welcomeMessage={agentData.welcomeMessage || ''}
                  buttonText={agentData.buttonText}
                  position={agentData.position}
                  suggestions={agentData.suggestions.filter(Boolean)}
                  avatarSrc={agentData.avatar || agentData.avatarUrl}
                  className="w-full h-full shadow-2xl rounded-2xl"
                  onMinimize={() => setIsChatMinimized(true)}
                  showFloatingButton={false}
                />
              )}
            </div>
          </div>
        </div>
      );
    }

    if (canvasMode === 'popup') {
      const popupUrl = currentAgentId 
        ? `${window.location.origin}/chat/assistant/${currentAgentId}?type=popup`
        : null;

      return (
        <div className="h-full w-full relative overflow-hidden">
          {/* Canvas boundary container */}
          <div className="absolute inset-0 bg-neutral-50 rounded-[0px]">
            <div className="p-0 h-full relative bg-neutral-50">
              <div className="bg-neutral-50 dark:bg-neutral-900 rounded-[0px] h-full relative overflow-hidden">
                {/* Live popup preview via iframe */}
                {!isLoading && popupUrl ? (
                  <iframe
                    src={popupUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="microphone"
                    className="w-full h-full rounded-none"
                    title="Popup Assistant Preview"
                    key={`${currentAgentId}-${theme}-popup`}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center p-8 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 shadow-xl">
                      <div className="text-6xl mb-4 animate-pulse">🚀</div>
                      <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isLoading ? 'Loading popup preview...' : 'Agent not available'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isLoading ? 'Setting up your agent popup interface' : 'Configure your agent to see the popup preview'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (canvasMode === 'inline') {
      const assistantUrl = selectedStyle === 'style1' 
        ? `${window.location.origin}/chat/assistant/${currentAgentId}?header=false`
        : `${window.location.origin}/chat/preview/${currentAgentId}`;
      
      return (
        <div className="h-full w-full relative overflow-hidden bg-white dark:bg-neutral-900">
          <div className="absolute inset-4 bg-white dark:bg-[hsla(0,0%,0%,0.95)] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-700">
            <div className="h-full w-full grid grid-cols-2 rounded-2xl overflow-hidden">
              {/* Left Column - Content Area */}
              <div className="bg-white/90 dark:bg-neutral-800/50 backdrop-blur-lg p-6 border-r border-neutral-200/50 dark:border-neutral-700/50">
                <div className="space-y-6 opacity-60">
                  <div className="space-y-3">
                    <div className="h-6 bg-gradient-to-r from-neutral-200 via-neutral-200 to-neutral-200 dark:from-neutral-600 dark:to-neutral-500 rounded-lg w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-600 dark:to-neutral-500 rounded w-1/2 animate-pulse"></div>
                  </div>
                  <div className="h-40 bg-gradient-to-br from-neutral-100 via-neutral-100 to-neutral-100 dark:from-neutral-700 dark:to-neutral-600 rounded-xl relative overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-tr from-neutral-400/30 to-neutral-400/30"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-3 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-600 dark:to-neutral-500 rounded w-full animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-600 dark:to-neutral-500 rounded w-5/6 animate-pulse"></div>
                    <div className="h-3 bg-gradient-to-r from-neutral-100 to-neutral-200 dark:from-neutral-600 dark:to-neutral-500 rounded w-4/6 animate-pulse"></div>
                  </div>
                </div>
                
                {/* Style Selection Buttons */}
                <div className="mt-6 flex gap-2">
                  <ModernButton
                    size="sm"
                    variant={selectedStyle === 'style1' ? 'primary' : 'outline'}
                    onClick={() => setSelectedStyle('style1')}
                  >
                    Style 1
                  </ModernButton>
                  <ModernButton
                    size="sm"
                    variant={selectedStyle === 'style2' ? 'primary' : 'outline'}
                    onClick={() => setSelectedStyle('style2')}
                  >
                    Style 2
                  </ModernButton>
                </div>
              </div>
              
              {/* Right Column - Assistant Chat */}
              <div className="bg-neutral-50 dark:bg-neutral-900 relative">
                {!isLoading && (
                  <iframe
                    src={assistantUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="microphone"
                    className="w-full h-full"
                    title="Assistant Chat"
                    key={`${currentAgentId}-${theme}-${selectedStyle}`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full w-full relative overflow-hidden">
        <div className="absolute inset-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="h-full w-full p-6 flex items-center justify-center">
            <div className="w-full max-w-md h-full max-h-[600px]">
              {!isLoading && (
                <ChatboxPreview
                  agentId={currentAgentId}
                  primaryColor={agentData.primaryColor}
                  secondaryColor={agentData.secondaryColor}
                  fontFamily={agentData.fontFamily}
                  chatbotName={agentData.chatbotName}
                  welcomeMessage={agentData.welcomeMessage || ''}
                  buttonText={agentData.buttonText}
                  position={agentData.position}
                  suggestions={agentData.suggestions.filter(Boolean)}
                  avatarSrc={agentData.avatar || agentData.avatarUrl}
                  className="w-full h-full shadow-2xl rounded-2xl"
                  showFloatingButton={false}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Canvas container - proper positioning context */}
      <div className="relative w-full h-full bg-white dark:bg-neutral-900 flex flex-col">
        {/* Canvas content area */}
        <div className="flex-1 bg-white dark:bg-neutral-900">
          {getCanvasContent()}
        </div>
        
        {/* Console Panel positioned within the canvas */}
        <ConsolePanel isTraining={isTraining} refetchAgentData={onAgentDataRefresh}/>
      </div>

      <AskAiModal 
        isOpen={isAskAiOpen} 
        onClose={() => setIsAskAiOpen(false)}
        agentId={currentAgentId}
      />
    </>
  );
};

function adjustColor(color: string, amount: number): string {
  try {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const newR = Math.max(0, Math.min(255, r + amount));
    const newG = Math.max(0, Math.min(255, g + amount));
    const newB = Math.max(0, Math.min(255, b + amount));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  } catch (e) {
    return color;
  }
}
