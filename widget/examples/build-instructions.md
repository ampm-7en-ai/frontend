
# Building the Chat Widget

## Prerequisites

- Node.js 18+ and npm
- Git

## Build Process

1. **Install Dependencies**
   ```bash
   cd widget
   npm install
   ```

2. **Development Build**
   ```bash
   npm run dev
   ```
   This starts a development server at `http://localhost:5173`

3. **Production Build**
   ```bash
   npm run build
   ```
   This creates optimized files in the `dist/` directory:
   - `chatbox-widget.js` - Main widget script
   - `chatbox-widget.css` - Optional CSS file (embedded in JS by default)

## Output Files

The build process creates a single JavaScript file that includes:
- React runtime
- All UI components
- WebSocket services
- Styling (embedded CSS)
- Widget initialization code

## Build Configuration

The build is configured in `vite.config.ts`:

```typescript
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'ChatWidget',
      fileName: 'chatbox-widget',
      formats: ['iife'] // For script tag loading
    },
    rollupOptions: {
      external: [], // Bundle everything
      output: {
        globals: {}
      }
    }
  }
});
```

## Deployment

1. **CDN Deployment**
   Upload `dist/chatbox-widget.js` to your CDN
   
2. **Self-Hosted**
   Serve the file from your own domain
   
3. **Version Management**
   Use versioned filenames for cache busting:
   ```bash
   cp dist/chatbox-widget.js dist/chatbox-widget-v1.0.0.js
   ```

## File Size Optimization

The build process includes:
- Tree shaking to remove unused code
- Minification with Terser
- Console.log removal in production
- CSS inlining to reduce HTTP requests

Typical file sizes:
- Uncompressed: ~800KB
- Gzipped: ~200KB

## Testing the Build

1. **Local Testing**
   ```bash
   npm run build
   # Open examples/basic.html in browser
   ```

2. **Production Testing**
   ```bash
   # Serve the dist directory
   npx serve dist
   ```

## Environment Variables

Configure the default API endpoint:

```javascript
// In your build process
const apiBaseUrl = process.env.CHAT_API_BASE_URL || 'https://api-staging.7en.ai';
```

## Integration Testing

Test the widget in different environments:

1. **Static HTML** - See `examples/basic.html`
2. **React App** - See `examples/react-integration.html`
3. **WordPress** - Test with WordPress installation
4. **Mobile Devices** - Test responsive behavior

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure all dependencies are installed
   - Check import paths

2. **Build fails**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

3. **Runtime errors**
   - Verify WebSocket endpoint is accessible
   - Check browser console for errors

### Debug Build

For debugging, create a development build:

```bash
# Development build with sourcemaps
npm run build -- --mode development
```

## Monitoring

Consider adding monitoring to track:
- Widget load times
- Connection success rates
- Error rates
- Usage analytics

## Security

- The widget connects to WebSocket endpoints
- Validate all user inputs
- Use HTTPS/WSS in production
- Implement proper CORS policies
