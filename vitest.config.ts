import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Run tests in Node environment (no browser DOM needed for pure logic tests)
    environment: 'node',
    // Include all .test.ts files under the test/ folder
    include: ['test/**/*.test.ts'],
  },
});
