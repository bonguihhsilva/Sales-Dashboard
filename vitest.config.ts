import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    // Default excludes miss .claude/ — without this, vitest crawls into any
    // nested worktree under .claude/worktrees/ and double-counts every test.
    exclude: ['**/node_modules/**', '**/.claude/**', '**/.git/**'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
