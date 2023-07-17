module.exports = {
  extends: ['eslint:recommended', 'plugin:import/recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['import', '@typescript-eslint'],
  env: {
    node: true,
  },
  rules: {
    curly: ['error', 'all'],
    'max-lines-per-function': ['error', 40],
    '@typescript-eslint/explicit-function-return-type': 'error',
  },
  overrides: [
    {
      files: ['**/*.test.[jt]s'],
      rules: {
        'max-lines-per-function': 'off',
      },
    },
    {
      files: ['**/*.c?js'],
      rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  root: true,
};
