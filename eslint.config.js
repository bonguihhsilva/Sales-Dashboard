const { FlatCompat } = require('@eslint/eslintrc')
const path = require('node:path')

const compat = new FlatCompat({
  baseDirectory: path.dirname(__filename),
})

module.exports = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'supabase/functions/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
]
