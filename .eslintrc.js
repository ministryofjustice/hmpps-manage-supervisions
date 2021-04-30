module.exports = {
  parserOptions: {
    sourceType: 'module',
  },
  root: true,
  env: {
    node: true,
    jest: true,
  },
  overrides: [
    {
      files: ['**/*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: 'tsconfig.json',
      },
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
      ],
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
        'import/no-extraneous-dependencies': [
          'error',
          {
            devDependencies: ['**/*.test.*', '**/*.spec.*', '**/*.fake.*', '**/*.fixture.*', '**/*.mock.*'],
          },
        ],
      },
    },
    {
      files: ['integration_tests/**/*'],
      extends: ['plugin:cypress/recommended', 'plugin:prettier/recommended'],
    },
  ],
}
