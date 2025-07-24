
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
      
      // Transform API response to expected format
      const config = {
        agentId: data.agentId || agentId,
        primaryColor: data.primaryColor || '#9b87f5',
        secondaryColor: data.secondaryColor || '#ffffff',
        fontFamily: data.fontFamily || 'Helvetica',
        chatbotName: data.chatbotName || 'Assistant',
        welcomeMessage: data.welcomeMessage || '',
        buttonText: data.buttonText || '',
        position: data.position || 'bottom-right',
        suggestions: data.suggestions || [],
        avatarUrl: data.avatarUrl || '',
        apiUrl: 'https://api-staging.7en.ai',
        wsUrl: 'wss://api-staging.7en.ai'
      };
      
      console.log('Fetched config:', config);
      return config;
    } catch (error) {
      console.error('ChatWidget: Failed to fetch config:', error);
      return null;
    }
  }

  // Utility functions
  function adjustColor(color, amount) {
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

  // WebSocket Service - Updated to match ChatWebSocketService.ts exactly
  class ChatWebSocketService {
    constructor(agentId, wsUrl) {
      this.agentId = agentId;
      this.wsUrl = wsUrl;
      this.socket = null;
      this.listeners = {};
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 3;
      this.isConnecting = false;
      this.processedMessages = new Set();
      this.processedMessageIds = new Set();
    }

    connect() {
      if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
        return;
      }

      this.isConnecting = true;
      // Updated URL to match ChatWebSocketService.ts format
      const url = `${this.wsUrl}/ws/chat/${this.agentId}/`;
      console.log('Connecting to WebSocket:', url);
      
      try {
        this.socket = new WebSocket(url);
        
        this.socket.onopen = () => {
          console.log('WebSocket connection established');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connectionChange', true);
        };
        
        this.socket.onmessage = (event) => {
          console.log('WebSocket raw message received:', event.data);
          
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket parsed message:', data);
            
            // Handle message exactly like ChatWebSocketService.ts
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        this.socket.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.isConnecting = false;
          this.emit('connectionChange', false);
          
          // Only attempt reconnect for certain close codes
          if (event.code !== 1000 && event.code !== 1001) {
            this.handleReconnect();
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', 'Connection error');
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        this.isConnecting = false;
        this.emit('error', 'Failed to create connection');
      }
    }

    handleMessage(data) {
      console.log('=== RAW WebSocket Message ===');
      console.log('Full data:', JSON.stringify(data, null, 2));
      console.log('Data type:', data.type);
      
      // Handle UI messages (like yes_no) that don't have content
      if (data.type === 'ui' && data.ui_type) {
        const messageTimestamp = this.extractTimestamp(data);
        const messageId = `${data.type}-${data.ui_type}-${messageTimestamp}`;
        
        // Skip if we've already processed this message
        if (this.processedMessageIds.has(messageId)) {
          console.log('Skipping duplicate UI message:', messageId);
          return;
        }
        
        // Add to processed messages
        this.processedMessageIds.add(messageId);
        
        // Emit the UI message event
        this.emit('uiMessage', {
          type: data.type,
          ui_type: data.ui_type,
          timestamp: messageTimestamp,
          data: data.data || {}
        });
        
        return;
      }
      
      // Extract message content based on the response format
      const messageContent = data.content || '';
      const messageType = data.type || 'bot_response';
      const messageTimestamp = this.extractTimestamp(data);
      
      // Skip if not a valid message (except for UI messages)
      if (!messageContent && data.type !== 'ui') {
        console.log('Skipping message without content');
        return;
      }
      
      // Generate a consistent ID for deduplication
      const messageId = `${messageContent}-${messageTimestamp}`;
      
      // Skip if we've already processed this message
      if (this.processedMessageIds.has(messageId)) {
        console.log('Skipping duplicate message:', messageId);
        return;
      }
      
      // Add to processed messages
      this.processedMessageIds.add(messageId);
      
      // Limit the size of the set to prevent memory issues
      if (this.processedMessageIds.size > 100) {
        this.processedMessageIds = new Set(
          Array.from(this.processedMessageIds).slice(-50)
        );
      }
      
      // Handle different message types
      switch (data.type) {
        case 'email_request':
          this.emit('emailRequest', data.content || 'Please provide your email address:');
          break;
        case 'bot_response':
          this.emit('message', {
            content: data.content,
            type: 'bot',
            timestamp: messageTimestamp
          });
          this.emit('typingEnd');
          break;
        case 'typing_start':
          this.emit('typingStart', data.content);
          break;
        case 'typing_end':
          this.emit('typingEnd');
          break;
        default:
          // Handle generic messages
          if (data.content) {
            this.emit('message', {
              content: data.content,
              type: data.type || 'bot',
              timestamp: messageTimestamp
            });
          }
          break;
      }
    }

    extractTimestamp(data) {
      // Check multiple possible locations for timestamp
      const possibleTimestamps = [
        data.timestamp,
        data.created_at,
        data.time,
        data.datetime,
        data.sent_at,
        data.message?.timestamp,
        data.response?.timestamp,
        data.message?.created_at,
        data.response?.created_at
      ];
      
      for (const ts of possibleTimestamps) {
        if (ts) {
          try {
            const date = new Date(ts);
            if (!isNaN(date.getTime())) {
              return ts;
            }
          } catch (error) {
            // Invalid timestamp format
          }
        }
      }
      
      // Fallback to current time
      return new Date().toISOString();
    }

    handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isConnecting) {
        this.reconnectAttempts++;
        const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        
        console.log('Attempting to reconnect in ' + timeout + 'ms... (' + this.reconnectAttempts + '/' + this.maxReconnectAttempts + ')');
        
        setTimeout(() => {
          this.connect();
        }, timeout);
      }
    }

    sendMessage(content, isEmail = false) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        const message = {
          type: isEmail ? 'email_message' : 'message',
          content: content,
          timestamp: new Date().toISOString()
        };
        
        console.log('Sending message:', message);
        this.socket.send(JSON.stringify(message));
      } else {
        console.error('WebSocket not connected');
        this.emit('error', 'Connection not available');
      }
    }

    on(eventName, callback) {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push(callback);
    }

    emit(eventName, data) {
      console.log('Emitting event \'' + eventName + '\':', data);
      if (this.listeners[eventName]) {
        this.listeners[eventName].forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('Error in event callback for \'' + eventName + '\':', error);
          }
        });
      }
    }

    disconnect() {
      if (this.socket) {
        this.socket.close(1000, 'Normal closure');
        this.socket = null;
      }
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  // Updated CSS Styles to match ChatboxPreview exactly
  const styles = `
    .chat-widget-container {
      position: fixed;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    
    .chat-window {
      width: 380px;
      height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: absolute;
      bottom: 80px;
      right: 0;
      transform-origin: bottom right;
      animation: chatWindowOpen 0.3s ease-out;
    }
    
    .chat-window.bottom-left {
      right: auto;
      left: 0;
      transform-origin: bottom left;
    }
    
    @keyframes chatWindowOpen {
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
    }
    
    .chat-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .chat-header-text h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .chat-header-text p {
      margin: 0;
      font-size: 12px;
      opacity: 0.9;
    }
    
    .chat-close {
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .chat-close:hover {
      opacity: 1;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .message {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      max-width: 100%;
      animation: messageSlideIn 0.3s ease-out;
    }
    
    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .message.user {
      flex-direction: row-reverse;
    }
    
    .message-content {
      max-width: 80%;
      padding: 12px 16px;
      border-radius: 18px;
      font-size: 14px;
      line-height: 1.4;
      word-wrap: break-word;
    }
    
    .message.bot .message-content {
      background: white;
      border: 1px solid #e2e8f0;
      color: #1e293b;
    }
    
    .message.user .message-content {
      color: white;
      margin-left: auto;
    }
    
    .message-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      overflow: hidden;
      flex-shrink: 0;
    }
    
    .message-avatar img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .welcome-message {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      font-size: 14px;
      color: #1f2937;
      line-height: 1.5;
    }
    
    .suggestions-container {
      margin-bottom: 16px;
    }
    
    .suggestion-label {
      font-size: 12px;
      color: #64748b;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .suggestions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .suggestion-button {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      text-align: left;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
      color: #475569;
    }
    
    .suggestion-button:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }
    
    .restart-button {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 8px 16px;
      cursor: pointer;
      font-size: 12px;
      color: #6b7280;
      transition: all 0.2s;
      align-self: flex-start;
      margin-bottom: 16px;
    }
    
    .restart-button:hover {
      background: #e5e7eb;
      border-color: #9ca3af;
    }
    
    .email-input-container {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    
    .email-input-label {
      font-size: 14px;
      color: #374151;
      margin-bottom: 8px;
      display: block;
    }
    
    .email-input-form {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    
    .email-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    
    .email-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .email-submit-button {
      background: #3b82f6;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      color: white;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }
    
    .email-submit-button:hover:not(:disabled) {
      background: #2563eb;
    }
    
    .email-submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .yes-no-container {
      display: flex;
      gap: 8px;
      margin-top: 8px;
    }
    
    .yes-no-button {
      flex: 1;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      border: 1px solid #d1d5db;
      background: white;
      color: #374151;
    }
    
    .yes-no-button.yes {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }
    
    .yes-no-button.no {
      background: #ef4444;
      color: white;
      border-color: #ef4444;
    }
    
    .yes-no-button:hover {
      transform: translateY(-1px);
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .typing-dots {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 12px 16px;
      display: flex;
      gap: 4px;
      align-items: center;
    }
    
    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #94a3b8;
      animation: typingDot 1.4s infinite;
    }
    
    .typing-dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    
    .typing-dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    
    @keyframes typingDot {
      0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
      }
      30% {
        transform: translateY(-4px);
        opacity: 1;
      }
    }
    
    .chat-input-container {
      padding: 16px;
      background: white;
      border-top: 1px solid #e2e8f0;
    }
    
    .chat-input-form {
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }
    
    .chat-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 20px;
      padding: 10px 16px;
      font-size: 14px;
      resize: none;
      outline: none;
      max-height: 100px;
      min-height: 40px;
      transition: border-color 0.2s;
    }
    
    .chat-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    
    .chat-send-button {
      background: #3b82f6;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      font-size: 16px;
    }
    
    .chat-send-button:hover:not(:disabled) {
      background: #2563eb;
      transform: scale(1.05);
    }
    
    .chat-send-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .chat-branding {
      text-align: center;
      font-size: 11px;
      color: #9ca3af;
      margin-top: 8px;
    }
    
    .hidden {
      display: none !important;
    }
    
    /* Mobile responsiveness */
    @media (max-width: 480px) {
      .chat-window {
        width: calc(100vw - 40px);
        height: calc(100vh - 100px);
        bottom: 80px;
        right: 20px;
        left: 20px;
      }
      
      .chat-window.bottom-left {
        left: 20px;
        right: 20px;
      }
    }
  `;

  // Chat Widget Class - Updated to match ChatboxPreview exactly
  class ChatWidget {
    constructor(config) {
      this.config = config;
      this.isOpen = false;
      this.messages = [];
      this.isTyping = false;
      this.isConnected = false;
      this.chatService = null;
      this.isEmailRequested = false;
      this.emailValue = '';
      this.sessionId = null;
      this.isMinimized = false;
      
      this.init();
    }

    init() {
      this.injectStyles();
      this.createWidget();
      this.initWebSocket();
    }

    injectStyles() {
      const styleElement = createElement('style', null, {
        innerHTML: styles
      });
      document.head.appendChild(styleElement);
    }

    createWidget() {
      this.container = createElement('div', 'chat-widget-container ' + this.config.position);
      
      this.createButton();
      this.createChatWindow();
      
      document.body.appendChild(this.container);
    }

    createButton() {
      const hasText = this.config.buttonText && this.config.buttonText.trim();
      const buttonClass = hasText ? 'chat-button with-text' : 'chat-button';
      
      this.button = createElement('button', buttonClass, {
        style: `background: linear-gradient(135deg, ${this.config.primaryColor}, ${adjustColor(this.config.primaryColor, -30)})`,
        onclick: () => this.toggleChat()
      });

      // Avatar/Icon in button
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

    createChatWindow() {
      this.chatWindow = createElement('div', 'chat-window ' + this.config.position + ' hidden');
      
      this.createHeader();
      this.createMessages();
      this.createInput();
      
      this.container.appendChild(this.chatWindow);
    }

    createHeader() {
      const header = createElement('div', 'chat-header', {
        style: `background: linear-gradient(135deg, ${this.config.primaryColor}, ${adjustColor(this.config.primaryColor, -30)})`
      });

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
        innerHTML: `<h3>${this.config.chatbotName}</h3><p>${this.isConnected ? 'Online' : 'Connecting...'}</p>`
      });

      headerInfo.appendChild(avatar);
      headerInfo.appendChild(headerText);

      const closeButton = createElement('button', 'chat-close', {
        innerHTML: '×',
        onclick: () => this.toggleChat()
      });

      header.appendChild(headerInfo);
      header.appendChild(closeButton);
      this.chatWindow.appendChild(header);
    }

    createMessages() {
      this.messagesContainer = createElement('div', 'chat-messages');
      
      // Add welcome message if present
      if (this.config.welcomeMessage) {
        const welcomeDiv = createElement('div', 'welcome-message', {
          innerHTML: this.config.welcomeMessage
        });
        this.messagesContainer.appendChild(welcomeDiv);
      }

      // Add suggestions if present
      if (this.config.suggestions.length > 0) {
        this.createSuggestions();
      }

      this.chatWindow.appendChild(this.messagesContainer);
    }

    createSuggestions() {
      const suggestionsContainer = createElement('div', 'suggestions-container');
      
      const label = createElement('div', 'suggestion-label', {
        innerHTML: 'Suggested questions:'
      });
      suggestionsContainer.appendChild(label);

      const suggestionsDiv = createElement('div', 'suggestions');
      
      this.config.suggestions.forEach(suggestion => {
        const button = createElement('button', 'suggestion-button', {
          innerHTML: suggestion,
          onclick: () => this.sendMessage(suggestion)
        });
        suggestionsDiv.appendChild(button);
      });

      suggestionsContainer.appendChild(suggestionsDiv);
      this.messagesContainer.appendChild(suggestionsContainer);
      this.suggestionsElement = suggestionsContainer;
    }

    createRestartButton() {
      const restartButton = createElement('button', 'restart-button', {
        innerHTML: '🔄 Start New Conversation',
        onclick: () => this.restartConversation()
      });
      
      this.messagesContainer.insertBefore(restartButton, this.messagesContainer.firstChild);
      this.restartButtonElement = restartButton;
    }

    restartConversation() {
      // Clear messages
      this.messages = [];
      this.messagesContainer.innerHTML = '';
      
      // Reset state
      this.isEmailRequested = false;
      this.emailValue = '';
      this.setTyping(false);
      
      // Recreate welcome message and suggestions
      if (this.config.welcomeMessage) {
        const welcomeDiv = createElement('div', 'welcome-message', {
          innerHTML: this.config.welcomeMessage
        });
        this.messagesContainer.appendChild(welcomeDiv);
      }

      if (this.config.suggestions.length > 0) {
        this.createSuggestions();
      }
      
      // Send restart signal to server
      if (this.chatService && this.chatService.socket && this.chatService.socket.readyState === WebSocket.OPEN) {
        this.chatService.socket.send(JSON.stringify({
          type: 'restart',
          timestamp: new Date().toISOString()
        }));
      }
    }

    createEmailInput() {
      const emailContainer = createElement('div', 'email-input-container');
      
      const label = createElement('label', 'email-input-label', {
        innerHTML: 'Please provide your email address:'
      });
      emailContainer.appendChild(label);
      
      const form = createElement('form', 'email-input-form');
      form.addEventListener('submit', (e) => this.handleEmailSubmit(e));

      this.emailInput = createElement('input', 'email-input', {
        type: 'email',
        placeholder: 'Enter your email address...',
        value: this.emailValue,
        required: true
      });
      
      this.emailInput.addEventListener('input', (e) => {
        this.emailValue = e.target.value;
      });

      const submitButton = createElement('button', 'email-submit-button', {
        type: 'submit',
        innerHTML: 'Submit'
      });

      form.appendChild(this.emailInput);
      form.appendChild(submitButton);
      emailContainer.appendChild(form);
      
      this.messagesContainer.appendChild(emailContainer);
      this.emailContainer = emailContainer;
      
      // Focus the email input
      setTimeout(() => this.emailInput.focus(), 100);
    }

    handleEmailSubmit(e) {
      e.preventDefault();
      
      if (!this.emailValue.trim()) return;
      
      // Validate email format
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(this.emailValue)) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Send email as message
      this.sendMessage(this.emailValue, true);
      
      // Clear email input and remove container
      this.emailValue = '';
      if (this.emailContainer) {
        this.emailContainer.remove();
        this.emailContainer = null;
      }
      
      this.isEmailRequested = false;
    }

    createYesNoButtons(data) {
      const yesNoContainer = createElement('div', 'yes-no-container');
      
      const yesButton = createElement('button', 'yes-no-button yes', {
        innerHTML: 'Yes',
        onclick: () => this.handleYesNoClick('yes', data)
      });
      
      const noButton = createElement('button', 'yes-no-button no', {
        innerHTML: 'No',
        onclick: () => this.handleYesNoClick('no', data)
      });
      
      yesNoContainer.appendChild(yesButton);
      yesNoContainer.appendChild(noButton);
      
      this.messagesContainer.appendChild(yesNoContainer);
      this.yesNoContainer = yesNoContainer;
    }

    handleYesNoClick(response, data) {
      // Send response to server
      if (this.chatService && this.chatService.socket && this.chatService.socket.readyState === WebSocket.OPEN) {
        this.chatService.socket.send(JSON.stringify({
          type: 'ui_response',
          response: response,
          ui_type: 'yes_no',
          data: data,
          timestamp: new Date().toISOString()
        }));
      }
      
      // Remove yes/no buttons
      if (this.yesNoContainer) {
        this.yesNoContainer.remove();
        this.yesNoContainer = null;
      }
      
      // Add user response message
      this.addMessage(response === 'yes' ? 'Yes' : 'No', 'user');
    }

    createInput() {
      const inputContainer = createElement('div', 'chat-input-container');
      
      const form = createElement('form', 'chat-input-form');
      form.addEventListener('submit', (e) => this.handleSubmit(e));

      this.input = createElement('textarea', 'chat-input', {
        placeholder: this.isConnected ? 'Type your message...' : 'Connecting...',
        rows: 1
      });
      
      // Auto-resize textarea
      this.input.addEventListener('input', () => this.adjustTextareaHeight());
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSubmit(e);
        }
      });

      this.sendButton = createElement('button', 'chat-send-button', {
        type: 'submit',
        innerHTML: '➤',
        style: `background: ${this.config.primaryColor}`
      });

      form.appendChild(this.input);
      form.appendChild(this.sendButton);
      
      const branding = createElement('div', 'chat-branding', {
        innerHTML: 'powered by 7en.ai'
      });

      inputContainer.appendChild(form);
      inputContainer.appendChild(branding);
      this.chatWindow.appendChild(inputContainer);
    }

    adjustTextareaHeight() {
      this.input.style.height = 'auto';
      this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
    }

    toggleChat() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        this.chatWindow.classList.remove('hidden');
        if (!this.isEmailRequested) {
          this.input.focus();
        }
      } else {
        this.chatWindow.classList.add('hidden');
      }
    }

    initWebSocket() {
      this.chatService = new ChatWebSocketService(this.config.agentId, this.config.wsUrl);
      
      this.chatService.on('connectionChange', (connected) => {
        this.isConnected = connected;
        this.updateConnectionStatus();
        this.updateInputPlaceholder();
      });

      this.chatService.on('message', (message) => {
        this.addMessage(message.content, message.type || 'bot');
        this.setTyping(false);
        
        // Show restart button after first bot message
        if (!this.restartButtonElement && this.messages.length > 0) {
          this.createRestartButton();
        }
      });

      this.chatService.on('emailRequest', (message) => {
        this.addMessage(message, 'bot');
        this.isEmailRequested = true;
        this.createEmailInput();
        this.setTyping(false);
      });

      this.chatService.on('uiMessage', (data) => {
        if (data.ui_type === 'yes_no') {
          this.createYesNoButtons(data.data);
        }
      });

      this.chatService.on('typingStart', (systemMessage) => {
        this.setTyping(true, systemMessage);
      });

      this.chatService.on('typingEnd', () => {
        this.setTyping(false);
      });

      this.chatService.on('error', (error) => {
        console.error('Chat error:', error);
        this.updateConnectionStatus();
      });

      this.chatService.connect();
    }

    updateConnectionStatus() {
      const statusText = this.chatWindow.querySelector('.chat-header-text p');
      if (statusText) {
        statusText.textContent = this.isConnected ? 'Online' : 'Connecting...';
      }
    }

    updateInputPlaceholder() {
      if (this.input) {
        this.input.placeholder = this.isConnected ? 'Type your message...' : 'Connecting...';
      }
    }

    handleSubmit(e) {
      e.preventDefault();
      
      if (this.isEmailRequested) return;
      
      const message = this.input.value.trim();
      if (message && this.isConnected) {
        this.sendMessage(message);
        this.input.value = '';
        this.adjustTextareaHeight();
      }
    }

    sendMessage(content, isEmail = false) {
      // Add user message to UI
      this.addMessage(content, 'user');
      
      // Send message via WebSocket
      this.chatService.sendMessage(content, isEmail);
      
      // Show typing indicator
      this.setTyping(true);
      
      // Hide suggestions after first message
      if (this.suggestionsElement) {
        this.suggestionsElement.classList.add('hidden');
      }
    }

    addMessage(content, type) {
      const messageDiv = createElement('div', 'message ' + type);
      
      // Add avatar for bot messages
      if (type === 'bot') {
        const avatar = createElement('div', 'message-avatar');
        if (this.config.avatarUrl) {
          const avatarImg = createElement('img', null, {
            src: this.config.avatarUrl,
            alt: 'Bot',
            onerror: function() {
              this.parentNode.innerHTML = '🤖';
            }
          });
          avatar.appendChild(avatarImg);
        } else {
          avatar.innerHTML = '🤖';
        }
        messageDiv.appendChild(avatar);
      }
      
      const messageContent = createElement('div', 'message-content', {
        innerHTML: this.parseMarkdown(content)
      });

      if (type === 'user') {
        messageContent.style.background = `linear-gradient(135deg, ${this.config.primaryColor}, ${adjustColor(this.config.primaryColor, -30)})`;
      }

      messageDiv.appendChild(messageContent);
      this.messagesContainer.appendChild(messageDiv);
      
      // Store message
      this.messages.push({
        content: content,
        type: type,
        timestamp: new Date().toISOString()
      });
      
      this.scrollToBottom();
    }

    parseMarkdown(text) {
      // Basic markdown parsing
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    }

    setTyping(isTyping, systemMessage = '') {
      this.isTyping = isTyping;
      
      // Remove existing typing indicator
      const existingIndicator = this.messagesContainer.querySelector('.typing-indicator');
      if (existingIndicator) {
        existingIndicator.remove();
      }

      if (isTyping) {
        const typingDiv = createElement('div', 'typing-indicator');
        
        const avatar = createElement('div', 'message-avatar');
        if (this.config.avatarUrl) {
          const avatarImg = createElement('img', null, {
            src: this.config.avatarUrl,
            alt: 'Bot',
            onerror: function() {
              this.parentNode.innerHTML = '🤖';
            }
          });
          avatar.appendChild(avatarImg);
        } else {
          avatar.innerHTML = '🤖';
        }
        
        const dotsContainer = createElement('div', 'typing-dots');
        
        // Add typing dots
        for (let i = 0; i < 3; i++) {
          const dot = createElement('div', 'typing-dot');
          dotsContainer.appendChild(dot);
        }
        
        // Add system message if provided
        if (systemMessage) {
          const messageSpan = createElement('span', null, {
            innerHTML: systemMessage,
            style: 'font-size: 12px; color: #64748b; margin-left: 8px;'
          });
          dotsContainer.appendChild(messageSpan);
        }

        typingDiv.appendChild(avatar);
        typingDiv.appendChild(dotsContainer);
        this.messagesContainer.appendChild(typingDiv);
      }
      
      this.scrollToBottom();
    }

    scrollToBottom() {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  // Initialize widget when DOM is ready
  async function initWidget() {
    const config = await fetchConfig();
    if (config) {
      new ChatWidget(config);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
