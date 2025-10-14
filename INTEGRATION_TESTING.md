# Integration Testing Guide

## 🚀 Quick Start

### Running Tests

Since `package.json` is read-only in this project, you'll need to run integration tests using Vitest directly:

```bash
# Watch mode (auto-reruns on changes)
npx vitest -c vitest.integration.config.ts

# Run once
npx vitest run -c vitest.integration.config.ts

# With coverage
npx vitest run -c vitest.integration.config.ts --coverage

# With UI
npx vitest -c vitest.integration.config.ts --ui
```

**Note:** If you have access to modify `package.json`, add these scripts:

```json
{
  "scripts": {
    "test:integration": "vitest -c vitest.integration.config.ts",
    "test:integration:run": "vitest run -c vitest.integration.config.ts",
    "test:integration:coverage": "vitest run -c vitest.integration.config.ts --coverage",
    "test:integration:ui": "vitest -c vitest.integration.config.ts --ui"
  }
}
```

## 📁 Test Structure

```
src/
├── test/
│   ├── integration-setup.ts          # Global setup for integration tests
│   ├── helpers/
│   │   └── integration-helpers.tsx    # Reusable test utilities
│   ├── flows/
│   │   └── auth-flow.integration.test.tsx
│   ├── api/
│   │   └── agents-api.integration.test.tsx
│   └── routing/
│       └── protected-routes.integration.test.tsx
└── components/
    └── layout/
        └── TestPageLayout.integration.test.tsx
```

## 📝 Example Tests Included

### 1. Authentication Flow (`src/test/flows/auth-flow.integration.test.tsx`)

Tests the complete authentication workflow:
- ✅ Successful login with valid credentials
- ✅ Error handling for invalid credentials
- ✅ Loading states during authentication
- ✅ Network error handling
- ✅ Form validation

**Usage Example:**
```typescript
it('should successfully login with valid credentials', async () => {
  const user = userEvent.setup();
  
  mockApiSuccess('/api/auth/login', {
    user: { id: '123', email: 'test@example.com' },
    token: 'mock-jwt-token',
  });

  renderWithProviders(<MockLoginPage />);

  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /login/i }));

  await waitFor(() => {
    expect(window.location.href).toBe('/dashboard');
  });
});
```

### 2. API Integration (`src/test/api/agents-api.integration.test.tsx`)

Tests React Query hooks with API calls:
- ✅ Fetching data with useQuery
- ✅ Creating resources with useMutation
- ✅ Updating resources
- ✅ Deleting resources
- ✅ Error handling
- ✅ Concurrent requests and caching

**Usage Example:**
```typescript
it('should fetch agents list successfully', async () => {
  const mockAgents = [
    { id: '1', name: 'Agent 1' },
    { id: '2', name: 'Agent 2' },
  ];

  mockApiSuccess('/api/agents', { agents: mockAgents });

  const { result } = renderHook(() => useAgents(), { wrapper });

  await waitFor(() => {
    expect(result.current.isSuccess).toBe(true);
  });

  expect(result.current.data).toEqual({ agents: mockAgents });
});
```

### 3. Protected Routes (`src/test/routing/protected-routes.integration.test.tsx`)

Tests route protection and role-based access:
- ✅ Public route access
- ✅ Protected route redirects
- ✅ Role-based access control (USER vs SUPERADMIN)
- ✅ Navigation flows
- ✅ Edge cases

**Usage Example:**
```typescript
it('should redirect to login when accessing protected route without authentication', () => {
  renderWithRouter('/dashboard', false);
  
  expect(screen.getByText('Login Page')).toBeInTheDocument();
  expect(screen.queryByText('Dashboard Page')).not.toBeInTheDocument();
});
```

### 4. Component Integration (`src/components/layout/TestPageLayout.integration.test.tsx`)

Tests component behavior with authentication context:
- ✅ Loading states
- ✅ Conditional rendering based on auth
- ✅ State changes and re-rendering

## 🛠️ Helper Functions

### Rendering Helpers

#### `renderWithProviders(component, options?)`
Renders a component with React Query and Router providers.

```typescript
import { renderWithProviders } from '@/test/helpers/integration-helpers';

renderWithProviders(<MyComponent />);
```

#### `renderWithAuth(component, user?, options?)`
Renders a component with authentication context.

```typescript
const mockUser = createMockUser({ role: 'SUPERADMIN' });
renderWithAuth(<MyComponent />, mockUser);
```

### Mock Data Helpers

#### `createMockUser(overrides?)`
Creates a mock user object.

```typescript
const user = createMockUser({ role: 'SUPERADMIN', email: 'admin@test.com' });
```

#### `mockAuthenticatedUser(role?)`
Creates a mock authenticated user with specific role.

```typescript
const admin = mockAuthenticatedUser('SUPERADMIN');
const regularUser = mockAuthenticatedUser('USER');
```

#### `mockUnauthenticatedState()`
Creates a mock unauthenticated auth context.

```typescript
const authContext = mockUnauthenticatedState();
```

### API Mock Helpers

#### `mockApiSuccess(endpoint, data)`
Mocks a successful API response.

```typescript
mockApiSuccess('/api/agents', { agents: [] });
```

#### `mockApiError(endpoint, error, status?)`
Mocks an API error response.

```typescript
mockApiError('/api/agents', 'Failed to fetch', 500);
```

#### `setupApiMocks()`
Sets up common API endpoint mocks.

```typescript
beforeEach(() => {
  setupApiMocks();
});
```

### User Interaction Helpers

#### `fillForm(fields)`
Fills form fields programmatically.

```typescript
await fillForm({
  'Email': 'test@example.com',
  'Password': 'password123'
});
```

#### `submitForm(formName?)`
Submits a form.

```typescript
await submitForm('Login');
```

#### `clickButton(buttonText)`
Clicks a button by text.

```typescript
await clickButton('Submit');
```

#### `waitForLoadingToFinish()`
Waits for loading indicators to disappear.

```typescript
await waitForLoadingToFinish();
```

## 📊 Viewing Test Results

### Terminal Output
Tests will show results in the terminal with:
- ✓ Passed tests (green)
- ✗ Failed tests (red)
- Test execution time
- Coverage summary

### Coverage Report
After running tests with coverage, open the HTML report:

```bash
npx vitest run -c vitest.integration.config.ts --coverage
# Then open coverage/index.html in your browser
```

The report shows:
- Line coverage percentage
- Branch coverage
- Function coverage
- Uncovered lines highlighted

### Vitest UI
For visual debugging, use the Vitest UI:

```bash
npx vitest -c vitest.integration.config.ts --ui
```

This opens a browser interface showing:
- Test tree structure
- Individual test results
- Execution time
- Console logs
- Error stack traces

## 🎯 Best Practices

### 1. Test User Workflows, Not Implementation
✅ **Good:**
```typescript
it('should allow user to login and see dashboard', async () => {
  // Test the complete user journey
});
```

❌ **Bad:**
```typescript
it('should call setIsAuthenticated with true', async () => {
  // Testing implementation details
});
```

### 2. Mock External Dependencies
Always mock API calls, WebSockets, and third-party services:

```typescript
beforeEach(() => {
  mockApiSuccess('/api/data', { data: [] });
});
```

### 3. Keep Tests Independent
Each test should be able to run in isolation:

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});
```

### 4. Use Descriptive Test Names
```typescript
it('should redirect to login when accessing protected route without authentication', () => {
  // Clear what this test does
});
```

### 5. Test Error States
Don't just test the happy path:

```typescript
it('should show error message when API fails', async () => {
  mockApiError('/api/data', 'Server error', 500);
  // Test error handling
});
```

### 6. Use Semantic Queries
Prefer queries that match how users interact:

```typescript
// Good
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText(/email/i);

// Avoid
screen.getByTestId('submit-button');
```

### 7. Wait for Async Operations
Always wait for async operations to complete:

```typescript
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## 🐛 Debugging Tests

### View Console Logs
Add console logs in your tests or components - they'll appear in test output.

### Use screen.debug()
```typescript
import { screen } from '@testing-library/react';

it('should render correctly', () => {
  renderWithProviders(<MyComponent />);
  screen.debug(); // Prints current DOM
});
```

### Use Vitest UI
Run tests with `--ui` flag for visual debugging with breakpoints.

### Check Query Failures
If elements aren't found, use:
```typescript
screen.logTestingPlaygroundURL(); // Suggests better queries
```

## 🔄 CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/integration-tests.yml`:

```yaml
name: Integration Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run integration tests
        run: npx vitest run -c vitest.integration.config.ts --coverage
        
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/coverage-final.json
```

## 📈 Coverage Thresholds

Current thresholds (configured in `vitest.integration.config.ts`):
- Lines: 50%
- Functions: 50%
- Branches: 50%
- Statements: 50%

To adjust thresholds, modify `vitest.integration.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 60,
    functions: 60,
    branches: 60,
    statements: 60,
  },
}
```

## 🆘 Troubleshooting

### Tests timing out
Increase timeout in specific tests:
```typescript
it('should handle slow operation', async () => {
  // Test code
}, 10000); // 10 second timeout
```

### Mock not working
Ensure mocks are set before component renders:
```typescript
beforeEach(() => {
  mockApiSuccess('/api/data', { data: [] });
});
```

### React Query cache issues
Clear cache between tests:
```typescript
afterEach(() => {
  queryClient.clear();
});
```

### Element not found
Use `findBy` queries for async elements:
```typescript
const element = await screen.findByText('Loaded data');
```

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about)
- [React Query Testing](https://tanstack.com/query/latest/docs/react/guides/testing)
- [Common Testing Patterns](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

**Need help?** Check existing tests for examples or refer to this guide!
