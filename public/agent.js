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
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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

  // WebSocket Service
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
    }

    connect() {
      if (this.isConnecting || (this.socket && this.socket.readyState === WebSocket.OPEN)) {
        return;
      }

      this.isConnecting = true;
      const url = `${this.wsUrl}/ws/chat/${this.agentId}`;
      
      try {
        this.socket = new WebSocket(url);
        
        this.socket.onopen = () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connectionChange', true);
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const messageId = data.id || `${data.type}-${Date.now()}`;
            
            if (this.processedMessages.has(messageId)) {
              return;
            }
            
            this.processedMessages.add(messageId);
            
            if (this.processedMessages.size > 50) {
              this.processedMessages = new Set(Array.from(this.processedMessages).slice(-25));
            }
            
            // Handle email request from bot
            if (data.type === 'email_request') {
              this.emit('emailRequest', data.message || 'Please provide your email address:');
            } else if (data.type === 'system_message') {
              this.emit('typingStart', data.content);
            } else {
              this.emit('typingEnd');
              this.emit('message', data);
            }
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
        
        this.socket.onclose = () => {
          this.isConnecting = false;
          this.emit('connectionChange', false);
          this.handleReconnect();
        };
        
        this.socket.onerror = (error) => {
          this.isConnecting = false;
          this.emit('error', 'Connection error');
        };
      } catch (error) {
        this.isConnecting = false;
        this.emit('error', 'Failed to create connection');
      }
    }

    handleReconnect() {
      if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isConnecting) {
        this.reconnectAttempts++;
        const timeout = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
        
        setTimeout(() => {
          this.connect();
        }, timeout);
      }
    }

    sendMessage(content, isEmail = false) {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          type: isEmail ? 'email_message' : 'user_message',
          content: content,
          timestamp: new Date().toISOString()
        }));
      }
    }

    on(eventName, callback) {
      if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
      }
      this.listeners[eventName].push(callback);
    }

    emit(eventName, data) {
      if (this.listeners[eventName]) {
        this.listeners[eventName].forEach(callback => callback(data));
      }
    }

    disconnect() {
      if (this.socket) {
        this.socket.close();
        this.socket = null;
      }
    }
  }

  // CSS Styles
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
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }
    
    .chat-button:hover {
      transform: scale(1.1);
    }
    
    .chat-button.with-text {
      width: auto;
      padding: 12px 20px;
      border-radius: 25px;
      gap: 8px;
    }
    
    .chat-window {
      width: 380px;
      height: 500px;
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
        transform: scale(0);
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
    }
    
    .chat-header-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .chat-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
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
      opacity: 0.8;
    }
    
    .chat-close {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 4px;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    
    .chat-close:hover {
      opacity: 1;
    }
    
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      background: #f9fafb;
    }
    
    .message {
      margin-bottom: 16px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
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
    }
    
    .message.bot .message-content {
      background: white;
      border: 1px solid #e5e7eb;
      color: #374151;
    }
    
    .message.user .message-content {
      color: white;
      margin-left: auto;
    }
    
    .welcome-message {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
      font-size: 13px;
      color: #1f2937;
      font-style: italic;
    }
    
    .suggestions {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .suggestion-label {
      font-size: 12px;
      color: #6b7280;
      font-weight: 500;
      margin-bottom: 8px;
    }
    
    .suggestion-button {
      background: white;
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 8px;
      padding: 12px;
      text-align: left;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }
    
    .suggestion-button:hover {
      background: #f3f4f6;
      transform: translateY(-1px);
    }
    
    .email-input-container {
      background: #f3f4f6;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }
    
    .email-input-form {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .email-input {
      flex: 1;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 14px;
      outline: none;
    }
    
    .email-input:focus {
      border-color: #3b82f6;
    }
    
    .email-submit-button {
      background: #3b82f6;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      color: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .email-submit-button:hover:not(:disabled) {
      background: #2563eb;
    }
    
    .email-submit-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .typing-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #e5e7eb;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
    }
    
    .typing-dots {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 8px 12px;
      display: flex;
      gap: 4px;
    }
    
    .typing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #9ca3af;
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
        transform: translateY(-8px);
        opacity: 1;
      }
    }
    
    .chat-input-container {
      padding: 16px;
      background: white;
      border-top: 1px solid #e5e7eb;
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
      padding: 8px 16px;
      font-size: 14px;
      resize: none;
      outline: none;
      max-height: 100px;
      min-height: 36px;
    }
    
    .chat-input:focus {
      border-color: #3b82f6;
    }
    
    .chat-send-button {
      background: #3b82f6;
      border: none;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
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

  // Chat Widget Class
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
      this.container = createElement('div', `chat-widget-container ${this.config.position}`);
      
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

      if (this.config.avatarUrl) {
        const avatar = createElement('img', null, {
          src: this.config.avatarUrl,
          alt: this.config.chatbotName,
          style: 'width: 24px; height: 24px; border-radius: 50%;'
        });
        this.button.appendChild(avatar);
      } else {
        this.button.innerHTML = hasText ? `💬 ${this.config.buttonText}` : '💬';
      }

      this.container.appendChild(this.button);
    }

    createChatWindow() {
      this.chatWindow = createElement('div', `chat-window ${this.config.position} hidden`);
      
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
        avatar.innerHTML = `<img src="${this.config.avatarUrl}" alt="${this.config.chatbotName}">`;
      } else {
        avatar.innerHTML = '🤖';
      }
      
      const headerText = createElement('div', 'chat-header-text', {
        innerHTML: `
          <h3>${this.config.chatbotName}</h3>
          <p>${this.isConnected ? 'Online' : 'Connecting...'}</p>
        `
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

      // Add suggestions if present and no messages
      if (this.config.suggestions.length > 0) {
        this.createSuggestions();
      }

      this.chatWindow.appendChild(this.messagesContainer);
    }

    createSuggestions() {
      const suggestionsDiv = createElement('div', 'suggestions');
      
      const label = createElement('div', 'suggestion-label', {
        innerHTML: 'Suggested questions:'
      });
      suggestionsDiv.appendChild(label);

      this.config.suggestions.forEach(suggestion => {
        const button = createElement('button', 'suggestion-button', {
          innerHTML: suggestion,
          onclick: () => this.sendMessage(suggestion)
        });
        suggestionsDiv.appendChild(button);
      });

      this.messagesContainer.appendChild(suggestionsDiv);
      this.suggestionsElement = suggestionsDiv;
    }

    createEmailInput() {
      const emailContainer = createElement('div', 'email-input-container');
      
      const form = createElement('form', 'email-input-form', {
        onsubmit: (e) => this.handleEmailSubmit(e)
      });

      this.emailInput = createElement('input', 'email-input', {
        type: 'email',
        placeholder: 'Enter your email address...',
        value: this.emailValue,
        oninput: (e) => this.emailValue = e.target.value,
        required: true
      });

      const submitButton = createElement('button', 'email-submit-button', {
        type: 'submit',
        innerHTML: 'Send'
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

    createInput() {
      const inputContainer = createElement('div', 'chat-input-container');
      
      const form = createElement('form', 'chat-input-form', {
        onsubmit: (e) => this.handleSubmit(e)
      });

      this.input = createElement('textarea', 'chat-input', {
        placeholder: 'Type your message...',
        rows: 1,
        oninput: () => this.adjustTextareaHeight()
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
      });

      this.chatService.on('message', (message) => {
        this.addMessage(message.content, 'bot');
        this.setTyping(false);
      });

      this.chatService.on('emailRequest', (message) => {
        this.addMessage(message, 'bot');
        this.isEmailRequested = true;
        this.createEmailInput();
        this.setTyping(false);
      });

      this.chatService.on('typingStart', (systemMessage) => {
        this.setTyping(true, systemMessage);
      });

      this.chatService.on('typingEnd', () => {
        this.setTyping(false);
      });

      this.chatService.on('error', (error) => {
        console.error('Chat error:', error);
      });

      this.chatService.connect();
    }

    updateConnectionStatus() {
      const statusText = this.chatWindow.querySelector('.chat-header-text p');
      if (statusText) {
        statusText.textContent = this.isConnected ? 'Online' : 'Connecting...';
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
      this.addMessage(content, 'user');
      this.chatService.sendMessage(content, isEmail);
      this.setTyping(true);
      
      // Hide suggestions after first message
      if (this.suggestionsElement) {
        this.suggestionsElement.classList.add('hidden');
      }
    }

    addMessage(content, type) {
      const messageDiv = createElement('div', `message ${type}`);
      
      const messageContent = createElement('div', 'message-content', {
        innerHTML: content
      });

      if (type === 'user') {
        messageContent.style.background = `linear-gradient(135deg, ${this.config.primaryColor}, ${adjustColor(this.config.primaryColor, -30)})`;
      }

      messageDiv.appendChild(messageContent);
      this.messagesContainer.appendChild(messageDiv);
      
      this.scrollToBottom();
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
        
        const avatar = createElement('div', 'typing-avatar', {
          style: `background: ${this.config.primaryColor}`,
          innerHTML: '🤖'
        });
        
        const dotsContainer = createElement('div', 'typing-dots');
        for (let i = 0; i < 3; i++) {
          const dot = createElement('div', 'typing-dot');
          dotsContainer.appendChild(dot);
        }
        
        if (systemMessage) {
          const messageSpan = createElement('span', null, {
            innerHTML: systemMessage,
            style: 'font-size: 12px; color: #6b7280; margin-left: 8px;'
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
