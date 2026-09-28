module.exports = {
  root: true,
  extends: [require.resolve('../../packages/eslint-config/react.cjs')],
  ignorePatterns: ['dist/', 'node_modules/', 'coverage/'],
};
