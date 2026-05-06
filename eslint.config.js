// Flat config for ESLint v9+. Lints browser ES modules; no project deps needed.
export default [
  {
    files: ['assets/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        Element: 'readonly',
        HTMLElement: 'readonly',
        SVGElement: 'readonly',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-console': 'off',
      'prefer-const': 'warn',
      'eqeqeq': ['error', 'smart'],
    },
  },
];
