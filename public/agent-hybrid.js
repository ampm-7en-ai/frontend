
(function() {
  'use strict';

  // Configuration fetcher
  async function fetchConfig() {
    const script = document.currentScript || document.querySelector('script[data-agent-id]');
    const agentId = script?.getAttribute('data-agent-id') || '';
    
    if (!agentId) {
      console.error('ChatWidget: data-agent-id is required');
      return null;
    }

    try {
      const response = await fetch(`https://api-staging.7en.ai/api/chatbot-config?agentId=${agentId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const config = {
        agentId: data.agentId || agentId,
        primaryColor: data.primaryColor || '#1e52f1',
        secondaryColor: data.secondaryColor || '#ffffff',
        fontFamily: data.fontFamily || 'Inter, system-ui, sans-serif',
        chatbotName: data.chatbotName || 'Help Center',
        buttonText: data.buttonText || '',
        position: data.position || 'bottom-right',
        avatarUrl: data.avatarUrl || '',
        previewUrl: `https://staging.7en.ai/chat/preview/${agentId}`
      };
      
      console.log('Fetched config:', config);
      return config;
    } catch (error) {
      console.error('ChatWidget: Failed to fetch config:', error);
      return null;
    }
  }

  // Utility functions
  function createElement(tag, className, attributes = {}) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'innerHTML') {
        element.innerHTML = value;
      } else if (key.startsWith('on')) {
        element.addEventListener(key.substring(2), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    return element;
  }

  // CSS Styles for the shell
  const styles = `
    .chat-widget-container {
      position: fixed;
      z-index: 10000;
      font-family: Inter, system-ui, -apple-system, sans-serif;
    }
    
    .chat-widget-container.bottom-right {
      bottom: 20px;
      right: 20px;
    }
    
    .chat-widget-container.bottom-left {
      bottom: 20px;
      left: 20px;
    }
    
    .chat-button {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      transition: all 0.2s ease;
      color: white;
      font-size: 24px;
      background: var(--primary-color);
      position: relative;
      outline: none;
    }
    
    .chat-button:hover {
      transform: scale(1.05);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }
    
    .chat-button:active {
      transform: scale(0.95);
    }
    
    .chat-button.with-text {
      width: auto;
      min-width: 140px;
      height: 56px;
      padding: 0 24px;
      border-radius: 28px;
      gap: 8px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .chat-button-icon {
      width: 24px;
      height: 24px;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    .chat-popup {
      width: 380px;
      height: 600px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      position: absolute;
      bottom: 80px;
      right: 0;
      transform-origin: bottom right;
      animation: chatPopupOpen 0.3s ease-out;
      overflow: hidden;
    }
    
    .chat-popup.bottom-left {
      right: auto;
      left: 0;
      transform-origin: bottom left;
    }
    
    @keyframes chatPopupOpen {
      from {
        transform: scale(0.95);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .chat-iframe-container {
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
      border-radius: 16px;
    }
    
    .chat-iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 16px;
      background: #f8fafc;
    }
    
    .chat-loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #64748b;
    }
    
    .chat-loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e2e8f0;
      border-top: 3px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 12px;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .hidden {
      display: none !important;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 480px) {
      .chat-popup {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        bottom: 80px;
        right: 20px;
        left: 20px;
      }
      
      .chat-popup.bottom-left {
        left: 20px;
        right: 20px;
      }
    }
  `;

  // Chat Widget Shell Class
  class ChatWidgetShell {
    constructor(config) {
      this.config = config;
      this.isOpen = false;
      this.isIframeLoaded = false;
      
      this.init();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.preloadIframe();
    }

    injectStyles() {
      const styleElement = createElement('style', null, {
        innerHTML: styles.replace(/var\(--primary-color\)/g, this.config.primaryColor)
      });
      document.head.appendChild(styleElement);
    }

    createWidget() {
      this.container = createElement('div', 'chat-widget-container ' + this.config.position);
      
      this.createButton();
      this.createPopup();
      
      document.body.appendChild(this.container);
    }

    createButton() {
      const hasText = this.config.buttonText && this.config.buttonText.trim();
      const buttonClass = hasText ? 'chat-button with-text' : 'chat-button';
      
      this.button = createElement('button', buttonClass, {
        onclick: () => this.toggleChat()
      });

      // Chat icon SVG
      const chatIcon = createElement('svg', 'chat-button-icon', {
        innerHTML: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12H5a2.5 2.5 0 0 0-2.5 2.5V20a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-7.5a.5.5 0 0 0-.5-.5Z"/><path d="M16 12h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2v4l-4-4H8a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4Z"/>',
        viewBox: '0 0 24 24'
      });
      
      this.button.appendChild(chatIcon);

      if (hasText) {
        const text = createElement('span', null, {
          innerHTML: this.config.buttonText
        });
        this.button.appendChild(text);
      }

      this.container.appendChild(this.button);
    }

    createPopup() {
      this.popup = createElement('div', 'chat-popup ' + this.config.position + ' hidden');
      this.createIframeContainer();
      this.container.appendChild(this.popup);
    }

    createIframeContainer() {
      this.iframeContainer = createElement('div', 'chat-iframe-container');
      
      // Loading state
      this.loadingElement = createElement('div', 'chat-loading', {
        innerHTML: `
          <div class="chat-loading-spinner"></div>
          <p>Loading chat...</p>
        `
      });
      this.iframeContainer.appendChild(this.loadingElement);
      
      // Iframe
      this.iframe = createElement('iframe', 'chat-iframe hidden', {
        src: this.config.previewUrl,
        title: 'Chat Widget',
        onload: () => this.handleIframeLoad()
      });
      this.iframeContainer.appendChild(this.iframe);
      
      this.popup.appendChild(this.iframeContainer);
    }

    preloadIframe() {
      // Preload iframe on button hover for faster response
      this.button.addEventListener('mouseenter', () => {
        if (!this.isIframeLoaded && this.iframe.src !== this.config.previewUrl) {
          this.iframe.src = this.config.previewUrl;
        }
      });
    }

    handleIframeLoad() {
      this.isIframeLoaded = true;
      this.loadingElement.classList.add('hidden');
      this.iframe.classList.remove('hidden');
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.popup.classList.remove('hidden');
        
        // Ensure iframe is loaded when opening
        if (!this.isIframeLoaded && this.iframe.src !== this.config.previewUrl) {
          this.iframe.src = this.config.previewUrl;
        }
      } else {
        this.popup.classList.add('hidden');
      }
    }
  }

  // Initialize widget when DOM is ready
  async function initWidget() {
    const config = await fetchConfig();
    if (config) {
      new ChatWidgetShell(config);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
