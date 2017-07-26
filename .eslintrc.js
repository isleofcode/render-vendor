// ht ember-cli

module.exports = {
  root: true,
  extends: 'eslint:recommended',
  env: {
    browser: false,
    node: true,
  },

  globals: {
  },

  parserOptions: {
    'ecmaVersion': 8,
    'sourceType': 'module',
    'ecmaFeatures': {
      'impliedStrict': true
    }
  },

  rules: {
    /*** Possible Errors ***/

    'comma-dangle': 0,

    // JSHint "boss"
    'no-cond-assign': [2, 'except-parens'],

    'no-console': 0,

    // JSHint "debug", disabled already in .jshintrc
    'no-debugger': 0,

    // JSHint "noempty", JSCS "disallowEmptyBlocks"
    'no-empty': 2,


    /*** Best Practices ***/
    // line-break at 80
    'max-len': [2, { "ignoreUrls": true }],

    // JSHint "curly"
    'curly': 2,

    // JSHint "eqeqeq"
    'eqeqeq': 2,

    // JSHint "forin", disabled already in .jshintrc
    'guard-for-in': 0,

    // JSHint "noarg"
    'no-caller': 2,

    'no-case-declarations': 0,

    // JSHint "eqnull"
    'no-eq-null': 2,

    // JSHint "evil"
    'no-eval': 2,

    // JSHint "nonew", disabled already in .jshintrc
    'no-new': 0,

    // JSHint "expr"
    'no-unused-expressions': [2, {
      allowShortCircuit: true,
      allowTernary: true,
    }],

    // JSHint "immed", disabled already in .jshintrc
    'wrap-iife': 0,

    'yoda': 2,


    /*** Strict Mode ***/

    // JSHint "strict"
    'strict': [0, 'global'],


    /*** Variables ***/

    // JSHint "undef"
    'no-undef': 2,

    // JSHint "unused"
    'no-unused-vars': [2, { 'args': 'none' }],

    // JSHint "latedef"
    'no-use-before-define': [2, 'nofunc'],


    /*** Stylistic Issues ***/

    // JSHint "camelcase"
    'camelcase': 2,

    'eol-last': 2,

    // JSHint "indent"
    'indent': [2, 2, {
      'SwitchCase': 1,
      'VariableDeclarator': { 'var': 2, 'let': 2, 'const': 3 }
    }],

    'keyword-spacing': 2,

    // JSHint "laxbreak"
    'linebreak-style': [2, 'unix'],

    // JSHint "newcap
    'new-cap': [2, {
      properties: false,
    }],

    // JSHint "plusplus", disabled already in .jshintrc
    'no-plusplus': 0,

    // JSHint "trailing"
    'no-trailing-spaces': 2,

    'no-unneeded-ternary': 2,
    'space-before-blocks': 2,
    'space-in-parens': 2,
    'space-infix-ops': 2,
    'space-unary-ops': 2,

    // JSHint "quotmark"
    'quotes': [2, 'single'],
  }
};
