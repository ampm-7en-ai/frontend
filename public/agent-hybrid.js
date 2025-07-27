
(function() {
  'use strict';

  // Session Management Configuration
  const SESSION_CONFIG = {
    VISITOR_ID_KEY: 'chat_visitor_id',
    SESSION_KEY_PREFIX: 'chat_session_',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
    STORAGE_KEY: 'chat_sessions'
  };

  // Session Management Functions
  function generateVisitorId() {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  function getVisitorId() {
    let visitorId = localStorage.getItem(SESSION_CONFIG.VISITOR_ID_KEY);
    if (!visitorId) {
      visitorId = generateVisitorId();
      localStorage.setItem(SESSION_CONFIG.VISITOR_ID_KEY, visitorId);
    }
    return visitorId;
  }

  function getSessionKey(agentId) {
    return SESSION_CONFIG.SESSION_KEY_PREFIX + agentId;
  }

  function getSessionData(agentId) {
    const key = getSessionKey(agentId);
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    try {
      const parsed = JSON.parse(data);
      if (isSessionExpired(parsed.timestamp)) {
        removeSessionData(agentId);
        return null;
      }
      return parsed;
    } catch (e) {
      console.error('Error parsing session data:', e);
      return null;
    }
  }

  function setSessionData(agentId, sessionId, timestamp = Date.now()) {
    const key = getSessionKey(agentId);
    const data = {
      sessionId,
      timestamp,
      visitorId: getVisitorId(),
      agentId
    };
    localStorage.setItem(key, JSON.stringify(data));
    
    // Notify other tabs about session update
    window.dispatchEvent(new CustomEvent('chat-session-update', {
      detail: { agentId, sessionData: data }
    }));
  }

  function removeSessionData(agentId) {
    const key = getSessionKey(agentId);
    localStorage.removeItem(key);
    
    // Notify other tabs about session removal
    window.dispatchEvent(new CustomEvent('chat-session-remove', {
      detail: { agentId }
    }));
  }

  function isSessionExpired(timestamp) {
    return (Date.now() - timestamp) > SESSION_CONFIG.SESSION_TIMEOUT;
  }

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
      const visitorId = getVisitorId();
      const sessionData = getSessionData(agentId);
      
      const config = {
        agentId: data.agentId || agentId,
        primaryColor: data.primaryColor || '#1e52f1',
        secondaryColor: data.secondaryColor || '#ffffff',
        fontFamily: data.fontFamily || 'Inter, system-ui, sans-serif',
        chatbotName: data.chatbotName || 'Help Center',
        buttonText: data.buttonText || '',
        position: data.position || 'bottom-right',
        avatarUrl: data.avatarUrl || '',
        visitorId,
        sessionData,
        previewUrl: buildPreviewUrl(agentId, visitorId, sessionData)
      };
      
      console.log('Fetched config with session data:', config);
      return config;
    } catch (error) {
      console.error('ChatWidget: Failed to fetch config:', error);
      return null;
    }
  }

  function buildPreviewUrl(agentId, visitorId, sessionData) {
    const baseUrl = `https://staging.7en.ai/chat/preview/${agentId}`;
    const params = new URLSearchParams();
    
    params.append('visitorId', visitorId);
    
    if (sessionData && sessionData.sessionId) {
      params.append('sessionId', sessionData.sessionId);
      params.append('restore', 'true');
    }
    
    return `${baseUrl}?${params.toString()}`;
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
      box-shadow: none !important;
    }
    
    .chat-button.with-text {
      border-radius: 40px;
      padding: 16px 24px;
      height: auto;
      gap: 8px;
      font-size: 14px;
      box-shadow: none !important;
    }
    
    .chat-button.icon-only {
      border-radius: 50%;
      width: 64px;
      height: 64px;
      padding: 0;
      box-shadow: none !important;
    }
    
    .chat-button:hover {
      transform: scale(1.1);
      box-shadow: none !important;
    }
    
    .chat-button:active {
      transform: scale(0.95);
      box-shadow: none !important;
    }
    
    .chat-button-gradient-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, rgba(255, 255, 255, 0.2), transparent);
      opacity: 0;
      transition: opacity 0.3s ease;
      box-shadow: none !important;
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
      fill: none;
      stroke: currentColor;
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
      height: 700px;
      background: #ffffff;
      border-radius: 20px 20px 20px 20px;
      box-shadow: none !important;
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
      box-shadow: none !important;
      border: none;
    }
    
    .chat-iframe {
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 20px 20px 20px 20px;
      background: #f8fafc;
      box-shadow: none !important;
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
        box-shadow: none !important;
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
      this.setupSessionListeners();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.preloadIframe();
    }

    setupSessionListeners() {
      // Listen for session updates from other tabs
      window.addEventListener('chat-session-update', (event) => {
        const { agentId, sessionData } = event.detail;
        if (agentId === this.config.agentId) {
          console.log('Session updated in another tab:', sessionData);
          this.updateSessionInIframe(sessionData);
        }
      });

      // Listen for session removal from other tabs
      window.addEventListener('chat-session-remove', (event) => {
        const { agentId } = event.detail;
        if (agentId === this.config.agentId) {
          console.log('Session removed in another tab');
          this.clearSessionInIframe();
        }
      });

      // Listen for messages from the iframe
      window.addEventListener('message', (event) => {
        if (event.origin !== 'https://staging.7en.ai') return;
        
        const { type, data } = event.data;
        
        switch (type) {
          case 'session-created':
            console.log('Session created in iframe:', data);
            setSessionData(this.config.agentId, data.sessionId);
            break;
          case 'session-updated':
            console.log('Session updated in iframe:', data);
            setSessionData(this.config.agentId, data.sessionId);
            break;
          case 'iframe-ready':
            console.log('Iframe ready');
            this.handleIframeLoad();
            break;
        }
      });
    }

    updateSessionInIframe(sessionData) {
      if (this.iframe && this.iframe.contentWindow) {
        this.iframe.contentWindow.postMessage({
          type: 'session-update',
          data: sessionData
        }, 'https://staging.7en.ai');
      }
    }

    clearSessionInIframe() {
      if (this.iframe && this.iframe.contentWindow) {
        this.iframe.contentWindow.postMessage({
          type: 'session-clear'
        }, 'https://staging.7en.ai');
      }
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
            box-shadow: none !important;
          }
          .chat-button:hover {
            box-shadow: none !important;
          }
          .chat-button:active {
            box-shadow: none !important;
          }
          .chat-button:focus {
            box-shadow: none !important;
          }
          .chat-popup {
            box-shadow: none !important;
          }
          .chat-iframe-container {
            box-shadow: none !important;
          }
          .chat-iframe {
            box-shadow: none !important;
          }
          * {
            box-shadow: none !important;
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
        onclick: () => this.toggleChat()
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
        const iconSvg = createElement('svg', 'chat-button-icon', {
          innerHTML: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/><path d="M15.8 11.9c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1z"/><path d="M9.8 11.9c0 .6-.4 1-1 1s-1-.4-1-1 .4-1 1-1 1 .4 1 1z"/>',
          viewBox: '0 0 24 24'
        });
        contentContainer.appendChild(iconSvg);
      }

      // Add text if provided
      if (hasText) {
        const text = createElement('span', null, {
          innerHTML: this.config.buttonText
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
      
      // Iframe - use the previewUrl from config which includes session parameters
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
