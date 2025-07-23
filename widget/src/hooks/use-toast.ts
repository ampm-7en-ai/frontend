
// Simple toast implementation for the widget
interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

let toastContainer: HTMLElement | null = null;

function createToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'chat-widget-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(options: ToastOptions) {
  const container = createToastContainer();
  
  const toast = document.createElement('div');
  toast.style.cssText = `
    background: ${options.variant === 'destructive' ? '#ef4444' : '#22c55e'};
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 320px;
  `;
  
  if (options.title) {
    const title = document.createElement('div');
    title.textContent = options.title;
    title.style.fontWeight = '600';
    title.style.fontSize = '14px';
    title.style.marginBottom = '4px';
    toast.appendChild(title);
  }
  
  if (options.description) {
    const description = document.createElement('div');
    description.textContent = options.description;
    description.style.fontSize = '12px';
    description.style.opacity = '0.9';
    toast.appendChild(description);
  }
  
  container.appendChild(toast);
  
  // Animate in
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Remove after duration
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (container.contains(toast)) {
        container.removeChild(toast);
      }
    }, 300);
  }, options.duration || 3000);
}

export function useToast() {
  return {
    toast: showToast,
    toasts: [],
    dismiss: () => {}
  };
}
