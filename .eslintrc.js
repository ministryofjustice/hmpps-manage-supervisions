module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['*.js'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: 'tsconfig.json',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/recommended', 'plugin:prettier/recommended'],
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      1,
      {
        argsIgnorePattern: 'req|res|next|^err|_',
        ignoreRestSiblings: true,
      },
    ],
  },
  overrides: [
    {
      files: ['src/server/**/*.ts'],
      extends: ['plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript'],
      rules: {
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['**/*.test.*', '**/*.spec.*', '**/*.fake.*', '**/*.fixture.*', '**/*.mock.*'],
          },
        ],
      },
    },
    {
      files: ['cypress/**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'cypress/tsconfig.json',
      },
      extends: ['plugin:cypress/recommended'],
    },
  ],
}
