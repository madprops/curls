import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,

  {languageOptions: {globals: globals.browser}},

  {
    rules: {
      "semi": "off",
      "no-undef": "off",
      "no-unused-vars": "off",
      "indent": ["error", 4],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "backtick"],
      "no-console": "error",
      "space-before-function-paren": ["error", {
        "anonymous": "always",
        "named": "never",
        "asyncArrow": "always"
      }],
    },
  }
]