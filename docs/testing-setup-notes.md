# Testing Setup Notes

**Date:** 2025-11-08
**Status:** ⚠️ Test infrastructure NOT YET CONFIGURED

---

## Current Status

### ✅ Test Files Created:
- `src/game/Data/__tests__/CenterData.test.js` - Backward compatibility test suite (~100+ tests)

### ❌ Test Infrastructure Missing:
- No test runner installed (Jest/Vitest)
- No test script in package.json
- No test configuration files

---

## Recommended Setup: Vitest

**Why Vitest?**
- Native Vite integration (project already uses Vite)
- Fast and modern
- Jest-compatible API
- ESM support out of the box
- Better for Vite projects than Jest

### Installation Steps:

```bash
# Install Vitest and related packages
npm install -D vitest @vitest/ui jsdom

# Optional: For React component testing
npm install -D @testing-library/react @testing-library/jest-dom
```

### Add to package.json:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Create vitest.config.js:

```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### Create src/setupTests.js:

```javascript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

---

## Alternative: Jest Setup

If team prefers Jest:

```bash
npm install -D jest @types/jest jest-environment-jsdom
npm install -D @testing-library/react @testing-library/jest-dom
```

Add jest.config.js:

```javascript
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
```

---

## Running Tests (After Setup)

Once test infrastructure is configured:

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test CenterData.test.js
```

---

## Test Coverage Goals

### Phase 2 (Current):
- ✅ Backward compatibility tests created
- ⏳ Test runner setup (pending)
- ⏳ Run tests (pending)

### Phase 3-8 (Future):
- Add tests for each new module
- Unit tests for service classes
- Integration tests
- Target: 80%+ coverage

---

## For Now: Manual Testing

Until test infrastructure is setup:

### Manual Test Checklist:
- [ ] App starts without errors
- [ ] Login works (Telegram/Email/Google)
- [ ] User info displays correctly
- [ ] Character list loads
- [ ] Inventory works
- [ ] Battle system works
- [ ] Market accessible
- [ ] No console errors
- [ ] Hot reload works

---

## Next Steps

### Option A: Setup Now (Recommended)
1. Install Vitest
2. Configure vitest.config.js
3. Run tests to verify current state
4. Use tests during refactoring

### Option B: Setup Later
1. Continue refactoring
2. Test manually after each step
3. Setup tests before final integration
4. Run full test suite before merge

**Recommendation:** Option A - Setup Vitest now to catch issues early

---

## Notes

- Test files already created with Jest/Vitest compatible syntax
- Tests are ready to run once infrastructure is setup
- 100+ backward compatibility tests cover main APIs
- Manual testing is acceptable for now but automated tests are better
- Consider setting up tests before continuing with Phase 3+

---

**Decision needed:** Should we setup Vitest now or continue with manual testing?
