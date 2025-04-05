module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    webextensions: true
  },
  extends: ['plugin:react/recommended', 'airbnb', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['react', 'prettier'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'react/prop-types': 'off',
    'no-undef': 'error',
    'react/react-in-jsx-scope': 'off',
    'react/jsx-no-constructed-context-values': 'warn',
    'jsx-a11y/control-has-associated-label': 'warn',
    'jsx-a11y/anchor-is-valid': 'warn',
    'no-restricted-syntax': [
      'error',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.'
      }
    ],
    'array-callback-return': 'warn',
    'consistent-return': 'warn',
    'no-loss-of-precision': 'warn',
    'eqeqeq': ['error', 'always'],
    'import/prefer-default-export': 'off',
    'import/no-default-export': 'error'
  }
};
