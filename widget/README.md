# Chatbox Widget

A standalone JavaScript widget for embedding a chatbox in any website.

## Features

- **Standalone**: No external dependencies required
- **Customizable**: Full theming and configuration options
- **Real-time**: WebSocket-based chat communication
- **Responsive**: Works on desktop and mobile devices
- **Multiple Modes**: Floating button, inline, or fullscreen
- **Rich Text**: Markdown support for messages
- **Typing Indicators**: Real-time feedback
- **Suggestions**: Pre-defined question suggestions

## Quick Start

### 1. Basic Usage (Script Tag)

```html
<script src="https://cdn.example.com/chatbox-widget.js" 
        data-agent-id="your-agent-id"
        data-primary-color="#9b87f5"
        data-chatbot-name="My Assistant"
        data-position="bottom-right"></script>
```

### 2. JavaScript API

```html
<script src="https://cdn.example.com/chatbox-widget.js"></script>
<script>
  const widgetId = window.ChatWidget.create({
    agentId: 'your-agent-id',
    primaryColor: '#9b87f5',
    chatbotName: 'My Assistant',
    welcomeMessage: 'Hello! How can I help you today?',
    position: 'bottom-right',
    mode: 'floating'
  });
</script>
```

### 3. Inline Mode

```html
<div id="chat-container" style="width: 400px; height: 600px;"></div>
<script src="https://cdn.example.com/chatbox-widget.js"></script>
<script>
  window.ChatWidget.create({
    agentId: 'your-agent-id',
    mode: 'inline',
    containerId: 'chat-container'
  });
</script>
```

## Configuration Options

### Script Tag Data Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-agent-id` | string | **required** | Your agent ID |
| `data-primary-color` | string | `#9b87f5` | Primary theme color |
| `data-secondary-color` | string | `#ffffff` | Secondary theme color |
| `data-font-family` | string | `Inter` | Font family |
| `data-chatbot-name` | string | `Assistant` | Chatbot display name |
| `data-welcome-message` | string | `Hello! How can I help you today?` | Welcome message |
| `data-button-text` | string | `Chat with us` | Floating button text |
| `data-position` | string | `bottom-right` | Position (`bottom-right`, `bottom-left`) |
| `data-mode` | string | `floating` | Display mode (`floating`, `inline`, `fullscreen`) |
| `data-container-id` | string | | Container ID for inline mode |
| `data-avatar-url` | string | | Avatar image URL |
| `data-suggestions` | string | | JSON array of suggestion strings |
| `data-api-base-url` | string | `https://api-staging.7en.ai` | API base URL |

### JavaScript API Configuration

```javascript
const config = {
  agentId: 'your-agent-id',              // Required
  primaryColor: '#9b87f5',               // Theme color
  secondaryColor: '#ffffff',             // Secondary color
  fontFamily: 'Inter',                   // Font family
  chatbotName: 'Assistant',              // Display name
  welcomeMessage: 'Hello! How can I help you today?',
  buttonText: 'Chat with us',            // Floating button text
  position: 'bottom-right',              // Position
  mode: 'floating',                      // Display mode
  containerId: 'chat-container',         // For inline mode
  avatarUrl: 'https://example.com/avatar.png',
  suggestions: [                         // Pre-defined questions
    'What are your hours?',
    'How can I contact support?',
    'Tell me about your services'
  ],
  apiBaseUrl: 'https://api-staging.7en.ai'
};

const widgetId = window.ChatWidget.create(config);
```

## JavaScript API Methods

### Create Widget
```javascript
const widgetId = window.ChatWidget.create(config);
```

### Update Widget
```javascript
window.ChatWidget.update(widgetId, {
  primaryColor: '#ff6b6b',
  chatbotName: 'New Assistant'
});
```

### Destroy Widget
```javascript
window.ChatWidget.destroy(widgetId);
```

### Get Widget Info
```javascript
const widget = window.ChatWidget.getWidget(widgetId);
const allWidgets = window.ChatWidget.getAllWidgets();
```

## Display Modes

### Floating Mode (Default)
- Floating button in corner
- Expandable chat window
- Minimizable interface

### Inline Mode
- Embedded in specified container
- Full-size chat interface
- No floating button

### Fullscreen Mode
- Covers entire viewport
- Fixed positioning
- No minimize option

## Styling and Theming

The widget supports extensive theming through configuration:

```javascript
{
  primaryColor: '#9b87f5',     // Main brand color
  secondaryColor: '#ffffff',   // Background color
  fontFamily: 'Inter',         // Typography
  // ... other options
}
```

## Advanced Features

### Custom Suggestions
```javascript
{
  suggestions: [
    'What are your business hours?',
    'How do I create an account?',
    'Where can I find documentation?'
  ]
}
```

### Avatar Support
```javascript
{
  avatarUrl: 'https://example.com/chatbot-avatar.png'
}
```

### API Endpoint Configuration
```javascript
{
  apiBaseUrl: 'https://your-api.example.com'
}
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Build from Source

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for production
npm run build
```

## Integration Examples

### WordPress
```php
// Add to footer.php or use a plugin
wp_enqueue_script('chatbox-widget', 'https://cdn.example.com/chatbox-widget.js');
wp_add_inline_script('chatbox-widget', "
  window.ChatWidget.create({
    agentId: '" . get_option('chatbox_agent_id') . "',
    primaryColor: '" . get_theme_mod('primary_color', '#9b87f5') . "'
  });
");
```

### React
```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.example.com/chatbox-widget.js';
    script.dataset.agentId = 'your-agent-id';
    script.dataset.primaryColor = '#9b87f5';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>Your app content</div>;
}
```

### Vue.js
```vue
<template>
  <div>Your app content</div>
</template>

<script>
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://cdn.example.com/chatbox-widget.js';
    script.dataset.agentId = 'your-agent-id';
    document.body.appendChild(script);
  }
}
</script>
```

## Support

For issues and questions, please contact support or check the documentation.
