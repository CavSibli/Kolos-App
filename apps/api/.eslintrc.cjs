module.exports = {
  root: true,
  extends: [require.resolve('../../packages/eslint-config/nest.cjs')],
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/', 'jest.config.*'],
};
