module.exports = {
  extends: ['airbnb', 'plugin:jsx-a11y/recommended', 'prettier', 'prettier/react'],
  plugins: ['jsx-a11y', 'prettier'],
  env: {
    browser: true,
    node: true,
    es6: true,
    jquery: true
  },
  rules: {
    'react/jsx-filename-extension': 0,
    'react/prop-types': 0,
    'function-paren-newline': 0,
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-underscore-dangle': 0,
    'react/jsx-one-expression-per-line': 0,
    'import/no-cycle': 0,
    'array-callback-return': 0,
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'react/jsx-closing-bracket-location': [2, { nonEmpty: 'after-props', selfClosing: false }],
    'semi': ['error', 'always'],
    'jsx-a11y/anchor-is-valid': 0,
    'react/jsx-props-no-spreading': [1, { html: 'ignore' }] // allows for sidekick
  },
  globals: {
    chrome: true
  }
};
