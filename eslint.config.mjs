import { createRequire } from 'module';

const require = createRequire(import.meta.url);

const eslintConfig = [
  ...require('eslint-config-next/core-web-vitals'),
  ...require('eslint-config-next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      '.source/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'convex/_generated/**'
    ],
  },
];

export default eslintConfig;
