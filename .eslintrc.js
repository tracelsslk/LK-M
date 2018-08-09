module.exports = {
    "env": {
        "es6": true,
        node: true,
        "jest/globals": true
    },
    "parser": "babel-eslint",
    "plugins": [
        "flowtype",
        "react",
        "jest"
    ],
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true,
            "impliedStrict": true
        }
    },
    "rules": {
        "react/prop-types":0,
        "no-inner-declarations": 0,
        "consistent-return": 1,
        "no-proto": 1,
        "no-undef-init": 1,
        "no-new-func": 1,
        "no-console": 1,
        "no-debugger": 1,
        "no-eval": 1,
        "global-require": 1,
        "no-implied-eval": 1,
        "no-extend-native": 1,
        "no-throw-literal": 1,
        "no-extra-parens": 1,
        "no-iterator": 1,
        "no-shadow": 1,
        "no-labels": 1,
        "sort-vars": 1,
        "sort-imports": 1,
        "object-shorthand": 1,
        "valid-jsdoc": 1,
        "dot-notation": 1,
        "no-loop-func": 1,
        "no-script-url": 1,
        "no-process-exit": 1,
        "accessor-pairs": 2,
        "array-callback-return": 2,
        "curly": ["error", "all"],
        "default-case": 2,
        "for-direction": 2,
        "getter-return": 2,
        "no-await-in-loop": 2,
        "no-caller": 2,
        "no-empty-function": 2,
        "no-extra-bind": 2,
        "no-extra-label": 2,
        "no-floating-decimal": 2,
        "no-var": 2,
        "no-template-curly-in-string": 2,
        "eqeqeq": ["error", "always"],
        "no-lone-blocks": 2,
        "no-new": 2,
        "no-new-wrappers": 2,
        "no-return-assign": 2,
        "no-return-await": 2,
        "no-self-compare": 2,
        "no-sequences": 2,
        "no-unmodified-loop-condition": 2,
        "no-unused-expressions": 2,
        "no-useless-call": 2,
        "no-useless-return": 2,
        "no-void": 2,
        "no-with": 2,
        "prefer-promise-reject-errors": 2,
        "require-await": 2,
        "no-shadow-restricted-names": 2,
        "no-label-var": 2,
        "no-useless-rename": 2,
        "callback-return": 2,
        "handle-callback-err": 2,
        "no-buffer-constructor": 2,
        "no-new-require": 2,
        "no-path-concat": 2,
        "no-confusing-arrow": 2,
        "no-useless-computed-key": 2,
        "no-duplicate-imports": 2,
        "radix": [2, "as-needed"],
    },
    globals: {},

};
