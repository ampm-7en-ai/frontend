
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatWidget } from './widget';
import './styles.css';

interface WidgetConfig {
  agentId: string;
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
  chatbotName?: string;
  welcomeMessage?: string;
  buttonText?: string;
  position?: 'bottom-right' | 'bottom-left';
  suggestions?: string[];
  avatarUrl?: string;
  mode?: 'floating' | 'inline' | 'fullscreen';
  containerId?: string;
  apiBaseUrl?: string;
}

class ChatWidgetManager {
  private widgets: Map<string, any> = new Map();
  private scriptElement: HTMLScriptElement | null = null;

  constructor() {
    this.init();
  }

  private init() {
    // Find the script tag that loaded this widget
    const scripts = document.querySelectorAll('script[src*="chatbox-widget"]');
    this.scriptElement = scripts[scripts.length - 1] as HTMLScriptElement;

    if (this.scriptElement) {
      // Auto-initialize if script has data attributes
      const config = this.getConfigFromScript(this.scriptElement);
      if (config.agentId) {
        setTimeout(() => this.create(config), 100);
      }
    }
  }

  private getConfigFromScript(script: HTMLScriptElement): WidgetConfig {
    const dataset = script.dataset;
    
    return {
      agentId: dataset.agentId || '',
      primaryColor: dataset.primaryColor || '#9b87f5',
      secondaryColor: dataset.secondaryColor || '#ffffff',
      fontFamily: dataset.fontFamily || 'Inter, system-ui, -apple-system, sans-serif',
      chatbotName: dataset.chatbotName || 'Assistant',
      welcomeMessage: dataset.welcomeMessage || 'Hello! How can I help you today?',
      buttonText: dataset.buttonText || 'Chat with us',
      position: (dataset.position as 'bottom-right' | 'bottom-left') || 'bottom-right',
      suggestions: dataset.suggestions ? JSON.parse(dataset.suggestions) : [],
      avatarUrl: dataset.avatarUrl || '',
      mode: (dataset.mode as 'floating' | 'inline' | 'fullscreen') || 'floating',
      containerId: dataset.containerId || '',
      apiBaseUrl: dataset.apiBaseUrl || 'https://api-staging.7en.ai'
    };
  }

  public create(config: WidgetConfig): string {
    const widgetId = `chat-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    let container: HTMLElement;
    
    if (config.mode === 'inline' && config.containerId) {
      container = document.getElementById(config.containerId);
      if (!container) {
        console.error(`Container with id "${config.containerId}" not found`);
        return '';
      }
    } else {
      container = document.createElement('div');
      container.id = widgetId;
      container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 2147483647;
        font-family: ${config.fontFamily};
      `;
      document.body.appendChild(container);
    }

    const root = createRoot(container);
    const widget = <ChatWidget config={config} />;
    
    root.render(widget);
    
    this.widgets.set(widgetId, { root, container, config });
    
    return widgetId;
  }

  public destroy(widgetId: string): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      widget.root.unmount();
      if (widget.container.parentNode) {
        widget.container.parentNode.removeChild(widget.container);
      }
      this.widgets.delete(widgetId);
    }
  }

  public update(widgetId: string, newConfig: Partial<WidgetConfig>): void {
    const widget = this.widgets.get(widgetId);
    if (widget) {
      const updatedConfig = { ...widget.config, ...newConfig };
      widget.root.render(<ChatWidget config={updatedConfig} />);
      this.widgets.set(widgetId, { ...widget, config: updatedConfig });
    }
  }

  public getWidget(widgetId: string) {
    return this.widgets.get(widgetId);
  }

  public getAllWidgets() {
    return Array.from(this.widgets.keys());
  }
}

// Initialize the widget manager
const widgetManager = new ChatWidgetManager();

// Expose global API
(window as any).ChatWidget = {
  create: (config: WidgetConfig) => widgetManager.create(config),
  destroy: (widgetId: string) => widgetManager.destroy(widgetId),
  update: (widgetId: string, config: Partial<WidgetConfig>) => widgetManager.update(widgetId, config),
  getWidget: (widgetId: string) => widgetManager.getWidget(widgetId),
  getAllWidgets: () => widgetManager.getAllWidgets()
};

// For debugging
(window as any).ChatWidgetManager = widgetManager;

export default widgetManager;
