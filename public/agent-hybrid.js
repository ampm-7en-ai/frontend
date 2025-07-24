
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
        previewUrl: `${window.location.origin}/chat/preview/${agentId}`
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
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      color: white;
      font-weight: 500;
      font-size: 14px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    }
    
    .chat-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
    }
    
    .chat-button.with-text {
      width: auto;
      min-width: 140px;
      padding: 12px 20px;
      border-radius: 25px;
      gap: 8px;
    }
    
    .chat-popup {
      width: 380px;
      height: 600px;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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
    
    .chat-popup.minimized {
      height: 60px;
    }
    
    @keyframes chatPopupOpen {
      from {
        transform: scale(0.9);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }
    
    .chat-header {
      padding: 16px 20px;
      color: white;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
      border-radius: 12px 12px 0 0;
      height: 60px;
      box-sizing: border-box;
    }
    
    .chat-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .chat-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      overflow: hidden;
      position: relative;
    }
    
    .chat-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .chat-avatar::after {
      content: '';
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background: #4caf50;
      border: 2px solid white;
      border-radius: 50%;
    }
    
    .chat-header-text h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: white;
    }
    
    .chat-header-text p {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
      color: rgba(255, 255, 255, 0.9);
    }
    
    .chat-header-buttons {
      display: flex;
      gap: 8px;
    }
    
    .chat-minimize,
    .chat-close {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 6px;
      opacity: 0.8;
      transition: opacity 0.2s;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
    }
    
    .chat-minimize:hover,
    .chat-close:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.1);
    }
    
    .chat-iframe-container {
      flex: 1;
      height: calc(100% - 60px);
      position: relative;
      overflow: hidden;
    }
    
    .chat-iframe-container.hidden {
      display: none;
    }
    
    .chat-iframe {
      width: 100%;
      height: 100%;
      border: none;
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
      this.isMinimized = false;
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
                         .replace(/var\(--primary-dark\)/g, this.adjustColor(this.config.primaryColor, -30))
      });
      document.head.appendChild(styleElement);
    }

    adjustColor(color, amount) {
      try {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        const newR = Math.max(0, Math.min(255, r + amount));
        const newG = Math.max(0, Math.min(255, g + amount));
        const newB = Math.max(0, Math.min(255, b + amount));
        
        return '#' + newR.toString(16).padStart(2, '0') + newG.toString(16).padStart(2, '0') + newB.toString(16).padStart(2, '0');
      } catch (e) {
        return color;
      }
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

      if (this.config.avatarUrl) {
        const avatar = createElement('img', null, {
          src: this.config.avatarUrl,
          alt: this.config.chatbotName,
          style: 'width: 24px; height: 24px; border-radius: 50%; object-fit: cover;' + (hasText ? ' margin-right: 8px;' : ''),
          onerror: function() {
            this.style.display = 'none';
            const fallback = createElement('span', null, {
              innerHTML: '🤖',
              style: hasText ? 'margin-right: 8px;' : ''
            });
            this.parentNode.appendChild(fallback);
          }
        });
        this.button.appendChild(avatar);
      } else {
        const icon = createElement('span', null, {
          innerHTML: '🤖',
          style: hasText ? 'margin-right: 8px;' : ''
        });
        this.button.appendChild(icon);
      }

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
      
      this.createHeader();
      this.createIframeContainer();
      
      this.container.appendChild(this.popup);
    }

    createHeader() {
      const header = createElement('div', 'chat-header');

      const headerInfo = createElement('div', 'chat-header-info');
      
      const avatar = createElement('div', 'chat-avatar');
      if (this.config.avatarUrl) {
        const avatarImg = createElement('img', null, {
          src: this.config.avatarUrl,
          alt: this.config.chatbotName,
          onerror: function() {
            this.parentNode.innerHTML = '🤖';
          }
        });
        avatar.appendChild(avatarImg);
      } else {
        avatar.innerHTML = '🤖';
      }
      
      const headerText = createElement('div', 'chat-header-text', {
        innerHTML: `<h3>${this.config.chatbotName}</h3><p>Online</p>`
      });

      headerInfo.appendChild(avatar);
      headerInfo.appendChild(headerText);

      const buttonsContainer = createElement('div', 'chat-header-buttons');
      
      const minimizeButton = createElement('button', 'chat-minimize', {
        innerHTML: '−',
        onclick: () => this.toggleMinimize()
      });
      
      const closeButton = createElement('button', 'chat-close', {
        innerHTML: '×',
        onclick: () => this.toggleChat()
      });

      buttonsContainer.appendChild(minimizeButton);
      buttonsContainer.appendChild(closeButton);

      header.appendChild(headerInfo);
      header.appendChild(buttonsContainer);
      this.popup.appendChild(header);
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
      this.isMinimized = false;
      
      if (this.isOpen) {
        this.popup.classList.remove('hidden');
        this.popup.classList.remove('minimized');
        this.iframeContainer.classList.remove('hidden');
        
        // Ensure iframe is loaded when opening
        if (!this.isIframeLoaded && this.iframe.src !== this.config.previewUrl) {
          this.iframe.src = this.config.previewUrl;
        }
      } else {
        this.popup.classList.add('hidden');
      }
    }

    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
      
      if (this.isMinimized) {
        this.popup.classList.add('minimized');
        this.iframeContainer.classList.add('hidden');
      } else {
        this.popup.classList.remove('minimized');
        this.iframeContainer.classList.remove('hidden');
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
