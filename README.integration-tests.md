# Integration Testing Guide

This project uses **Vitest** for integration testing with React Testing Library.

## Running Integration Tests

```bash
# Run integration tests in watch mode
npm run test:integration

# Run integration tests once
npm run test:integration:run

# Run with coverage
npm run test:integration:coverage
```

## Test Structure

```
src/
├── test/
│   ├── integration-setup.ts           # Integration test setup
│   └── helpers/
│       └── integration-helpers.tsx    # Shared test helpers
├── components/
│   └── layout/
│       └── TestPageLayout.integration.test.tsx
└── services/
    └── *.integration.test.ts
```

## Writing Integration Tests

### 1. Component Integration Test

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/helpers/integration-helpers';
import { MyComponent } from './MyComponent';

describe('MyComponent Integration', () => {
  it('should render and interact correctly', async () => {
    renderWithProviders(<MyComponent />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

### 2. API Integration Test

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { mockFetchResponse } from '@/test/helpers/integration-helpers';

describe('API Integration', () => {
  beforeEach(() => {
    mockFetchResponse({ data: 'test' });
  });

  it('should fetch data correctly', async () => {
    const response = await fetch('/api/test');
    const data = await response.json();
    
    expect(data).toEqual({ data: 'test' });
  });
});
```

### 3. Router Integration Test

```typescript
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/helpers/integration-helpers';

it('should navigate between routes', async () => {
  renderWithProviders(<App />);
  
  const link = screen.getByRole('link', { name: /home/i });
  await userEvent.click(link);
  
  expect(screen.getByText(/welcome/i)).toBeInTheDocument();
});
```

## Helper Functions

### renderWithProviders
Renders components with React Router and React Query providers.

```typescript
const { queryClient } = renderWithProviders(<MyComponent />);
```

### mockFetchResponse
Mocks successful fetch responses.

```typescript
mockFetchResponse({ id: 1, name: 'Test' });
```

### mockFetchError
Mocks fetch errors.

```typescript
mockFetchError('Network error');
```

### waitForLoadingToFinish
Waits for loading indicators to disappear.

```typescript
await waitForLoadingToFinish();
```

## Best Practices

- ✅ Test user workflows end-to-end
- ✅ Use real providers (Router, Query Client)
- ✅ Mock external API calls
- ✅ Test error scenarios
- ✅ Verify loading and success states
- ✅ Test navigation and routing
- ❌ Don't test implementation details
- ❌ Don't mock internal components

## NPM Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:integration:run": "vitest run --config vitest.integration.config.ts",
    "test:integration:coverage": "vitest run --coverage --config vitest.integration.config.ts"
  }
}
```

## CI/CD Integration

Integration tests run automatically in CI/CD alongside unit tests.

## Coverage Thresholds

- **Lines**: 50%
- **Functions**: 50%
- **Branches**: 50%
- **Statements**: 50%

## Common Patterns

### Testing Protected Routes
```typescript
const { useAuth } = require('@/context/AuthContext');
useAuth.mockReturnValue({
  isAuthenticated: true,
  user: mockUser,
});
```

### Testing Form Submission
```typescript
await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
await userEvent.click(screen.getByRole('button', { name: /submit/i }));
```

### Testing Async Data Loading
```typescript
mockFetchResponse({ items: [] });
renderWithProviders(<DataList />);
await waitForLoadingToFinish();
expect(screen.getByText(/no items/i)).toBeInTheDocument();
```
