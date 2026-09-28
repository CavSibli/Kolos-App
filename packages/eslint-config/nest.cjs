/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [require.resolve('./base.cjs')],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
};
