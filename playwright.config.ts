import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';


dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'api',
      testMatch: /.*\.spec\.ts/,
      use: {
        storageState: '.auth/ZakazUa_StorageState.json',
      },
      dependencies: ['setup'],
    },
  ],
});
