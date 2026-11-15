import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
export default [
  { files: ['src/snip/**/*.jsx'], languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: globals.browser, parserOptions: { ecmaFeatures: { jsx: true } } },
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules, 'no-unused-vars': ['error', { caughtErrors: 'all', varsIgnorePattern: '^[A-Z]' }] } },
];
