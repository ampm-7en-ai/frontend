# Testing Documentation

This project uses **Vitest** for unit and integration testing.

## Running Tests

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI/CD)
npm run test:run

# View test UI in browser
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
src/
├── lib/
│   ├── utils.ts
│   └── utils.test.ts          # Utility function tests
├── hooks/
│   ├── useAppTheme.ts
│   └── useAppTheme.test.ts    # Hook tests
├── services/
│   ├── WebSocketService.ts
│   └── WebSocketService.test.ts  # Service tests
├── test/
│   └── setup.ts               # Global test setup
└── utils/
    └── cacheUtils.test.ts     # Utility tests
```

## What's Tested

### ✅ Utilities (`src/lib/`, `src/utils/`)
- **utils.test.ts**: Class name merging with `cn()`
- **cacheUtils.test.ts**: Cache operations and expiration

### ✅ Custom Hooks (`src/hooks/`)
- **useAppTheme.test.ts**: Theme toggling, persistence, DOM updates

### ✅ Services (`src/services/`)
- **WebSocketService.test.ts**: Connection, messaging, reconnection
- **ChatWebSocketService.test.ts**: Chat-specific WebSocket operations

## Coverage Thresholds

- **Lines**: 60%
- **Functions**: 60%
- **Branches**: 60%
- **Statements**: 60%

## CI/CD Integration

Tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

### GitHub Actions Workflow

The `.github/workflows/test.yml` workflow:
1. Runs tests on Node.js 18.x and 20.x
2. Generates coverage reports
3. Uploads coverage to Codecov
4. Comments coverage on pull requests
5. Builds the project to verify no breaking changes

## Writing New Tests

### 1. Utility Function Test
```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myFunction';

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### 2. Hook Test
```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from './useMyHook';

describe('useMyHook', () => {
  it('should update state', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.updateValue('new');
    });
    
    expect(result.current.value).toBe('new');
  });
});
```

### 3. Service Test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyService } from './MyService';

describe('MyService', () => {
  let service: MyService;
  
  beforeEach(() => {
    service = new MyService();
  });
  
  it('should initialize', () => {
    expect(service).toBeDefined();
  });
});
```

## Best Practices

- ✅ Test behavior, not implementation
- ✅ Use descriptive test names
- ✅ Keep tests isolated and independent
- ✅ Mock external dependencies
- ✅ Clean up after tests (`afterEach`)
- ✅ Use `beforeEach` for common setup
- ❌ Don't test third-party libraries
- ❌ Don't test type definitions

## Debugging Tests

```bash
# Run specific test file
npm test -- src/lib/utils.test.ts

# Run tests matching pattern
npm test -- --grep "WebSocket"

# Run with verbose output
npm test -- --reporter=verbose
```

## Mocked Globals

The test setup (`src/test/setup.ts`) provides mocks for:
- `window.matchMedia`
- `IntersectionObserver`
- `ResizeObserver`
- `localStorage`
- `WebSocket`

## Future Improvements

- [ ] Add component tests
- [ ] Add E2E tests with Playwright
- [ ] Increase coverage to 80%+
- [ ] Add visual regression tests
- [ ] Test form validation
- [ ] Test API integrations
