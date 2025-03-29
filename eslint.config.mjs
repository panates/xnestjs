import panatesEslint from '@panates/eslint-config-ts';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'build/**/*',
      'node_modules/**/*',
      'packages/**/node_modules/**/*',
      'packages/**/build/**/*',
      'packages/**/dist/**/*',
    ],
  },
  ...panatesEslint.configs.node,
];
