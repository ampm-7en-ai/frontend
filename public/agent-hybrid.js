(function() {
  'use strict';

  // Load sanitizer for XSS protection
  const currentScript = document.currentScript || document.querySelector('script[src*="agent-hybrid.js"]');
  const scriptSrc = currentScript?.src || '';
  const baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/') + 1);
  
  const sanitizerScript = document.createElement('script');
  sanitizerScript.src = baseUrl + 'sanitizer.js';
  sanitizerScript.async = true;
  document.head.appendChild(sanitizerScript);

  // Utility to wait for sanitizer to load
  function waitForSanitizer(callback) {
    if (window.chatSanitize && window.chatParseMarkdown) {
      callback();
    } else {
      setTimeout(() => waitForSanitizer(callback), 50);
    }
  }

  // Configuration fetcher
  async function fetchConfig() {
    const script = document.currentScript || document.querySelector('script[data-agent-id]');
    const agentId = script?.getAttribute('data-agent-id') || '';
    const previewUrl = script?.getAttribute('data-preview') || 'https://app.7en.ai';
    const configUrl = script?.getAttribute('data-config') || 'https://api.7en.ai/api/';
    
    if (!agentId) {
      console.error('ChatWidget: data-agent-id is required');
      return null;
    }

    try {
      const response = await fetch(`${configUrl}chatbot-config?agentId=${agentId}`);
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
        previewUrl: `${previewUrl}/chat/preview/${agentId}`
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

  // Helper function to adjust color brightness
  function adjustColor(color, amount) {
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

  // Helper function to convert hex to rgba
  function hexToRgba(hex, alpha = 1) {
    try {
      const cleanHex = hex.replace('#', '');
      const r = parseInt(cleanHex.substring(0, 2), 16);
      const g = parseInt(cleanHex.substring(2, 4), 16);
      const b = parseInt(cleanHex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    } catch (e) {
      return 'rgba(59, 130, 246, 0.5)';
    }
  }

  // CSS Styles for the shell
  const styles = `

    *,.chat-popup{
    box-shadow: initial !important;
    }
    
    .chat-widget-container {
      position: fixed;
      z-index: 10000;
      font-family: var(--font-family);
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
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      color: white;
      font-weight: 500;
      position: relative;
      outline: none;
      overflow: hidden;
      border: 4px solid rgba(255, 255, 255, 0.3);
    }
    
    .chat-button.with-text {
      border-radius: 40px;
      padding: 16px 24px;
      height: auto;
      gap: 8px;
      font-size: 14px;
    }
    
    .chat-button.icon-only {
      border-radius: 50%;
      width: 64px;
      height: 64px;
      padding: 0;
    }
    
    .chat-button:hover {
      transform: scale(1.1);
    }
    
    .chat-button:active {
      transform: scale(0.95);
    }
    
    .chat-button-gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.2), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    .chat-button:hover .chat-button-gradient-overlay {
      opacity: 1;
    }
    
    .chat-button-content {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .chat-button-icon {
      width: 24px;
      height: 24px;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    
    .chat-button.icon-only .chat-button-icon {
      width: 24px;
      height: 24px;
    }
    
    .chat-avatar {
      border-radius: 50%;
      object-fit: cover;
    }
    
    .chat-popup {
      width: 384px;
      height: 85vh;
      background: #ffffff;
      border-radius: 20px 20px 20px 20px;
      box-shadow: 10px 20px 30px rgba(0,0,0,0.3) !important;
      position: absolute;
      bottom: 84px;
      right: 0;
      transform-origin: bottom right;
      animation: chatPopupOpen 0.3s ease-out;
      overflow: visible;
      padding: 0;
      border: none;
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
      border-radius: 20px 20px 20px 20px;
      border: none;
    }
    
    .chat-iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 20px 20px 20px 20px;
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
        bottom: 84px;
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
      const primaryColorRgba = hexToRgba(this.config.primaryColor, 0.3);
      const primaryColorRgbaLight = hexToRgba(this.config.primaryColor, 0.15);
      const adjustedPrimaryColor = adjustColor(this.config.primaryColor, -30);
      
      const styleElement = createElement('style', null, {
        innerHTML: styles
          .replace(/var\(--primary-color\)/g, this.config.primaryColor)
          .replace(/var\(--font-family\)/g, this.config.fontFamily)
      });
      
      // Add dynamic styles for button - completely removed all shadows
      const dynamicStyle = createElement('style', null, {
        innerHTML: `
          .chat-button {
            background: linear-gradient(135deg, ${this.config.primaryColor}, ${adjustedPrimaryColor}) !important;
            font-family: ${this.config.fontFamily} !important;
           
          }
          .chat-popup {
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          }
        `
      });
      
      document.head.appendChild(styleElement);
      document.head.appendChild(dynamicStyle);
    }

    createWidget() {
      this.container = createElement('div', 'chat-widget-container ' + this.config.position);
      
      this.createButton();
      this.createPopup();
      
      document.body.appendChild(this.container);
    }

    createButton() {
      const hasText = this.config.buttonText && this.config.buttonText.trim();
      const buttonClass = hasText ? 'chat-button with-text' : 'chat-button icon-only';
      
      this.button = createElement('button', buttonClass, {
        onclick: () => this.toggleChat(),
        type: 'button'
      });

      // Create gradient overlay
      const gradientOverlay = createElement('div', 'chat-button-gradient-overlay');
      this.button.appendChild(gradientOverlay);

      // Create content container
      const contentContainer = createElement('div', 'chat-button-content');

      // Add avatar or MessageSquare icon
      if (this.config.avatarUrl) {
        const avatar = createElement('img', 'chat-avatar', {
          src: this.config.avatarUrl,
          alt: this.config.chatbotName,
          style: hasText ? 'width: 24px; height: 24px;' : 'width: 56px; height: 56px;'
        });
        contentContainer.appendChild(avatar);
      } else {
        // MessageSquare icon as SVG (converted from Lucide)
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('class','chat-button-icon');
        iconSvg.setAttribute('viewBox', '0 0 508.81 443.74');
        iconSvg.setAttribute('fill', `${this.config.secondaryColor}`);

        // Create path element
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M434.56,65.24C386.48,23.17,322.49,0,254.4,0,186.31,0,122.32,23.17,74.23,65.24,26.36,107.12,0,162.75,0,221.87c0,45.86,15.92,89.87,46.03,127.28l1.75,2.17-.65,2.71c-5.98,25.07-10.25,50.72-12.68,76.23-.15,1.62,.79,2.6,1.2,2.95,.51,.43,1.57,1.08,3.08,.68l83.43-22.46,1.97,1.02c39.27,20.47,84.32,31.29,130.27,31.29,68.09,0,132.08-23.17,180.16-65.24,47.87-41.89,74.24-97.52,74.24-156.63s-26.37-114.74-74.24-156.63ZM254.4,248.7c-14.79,0-26.83-12.04-26.83-26.83s12.04-26.83,26.83-26.83c14.79,0,26.83,12.04,26.83,26.83s-12.04,26.83-26.83,26.83Zm-122.27,0c-14.79,0-26.83-12.04-26.83-26.83s12.04-26.83,26.83-26.83,26.83,12.04,26.83,26.83-12.04,26.83-26.83,26.83Zm244.54,0c-14.79,0-26.83-12.04-26.83-26.83s12.04-26.83,26.83-26.83c14.79,0,26.83,12.04,26.83,26.83s-12.04,26.83-26.83,26.83Z');
        // Append path to SVG
        iconSvg.appendChild(path);
        contentContainer.appendChild(iconSvg);
      }

      // Add text if provided
      if (hasText) {
        const sanitizedText = window.chatSanitize ? window.chatSanitize(this.config.buttonText) : this.config.buttonText;
        const text = createElement('span', null, {
          innerHTML: sanitizedText
        });
        contentContainer.appendChild(text);
      }

      this.button.appendChild(contentContainer);
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
      
      // Send stored session ID to iframe if it exists
      const storedSessionId = localStorage.getItem(`chat_session_${this.config.agentId}`);
      if (storedSessionId) {
        console.log('📤 Sending stored session ID to iframe:', storedSessionId);
        this.iframe.contentWindow.postMessage({
          type: 'init-session',
          sessionId: storedSessionId,
          agentId: this.config.agentId
        }, '*');
      }
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
    // Wait for sanitizer to load before initializing widget
    waitForSanitizer(async () => {
      const config = await fetchConfig();
      if (config) {
        new ChatWidgetShell(config);
      }
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
