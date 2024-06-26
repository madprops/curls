import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,

  {languageOptions: {globals: globals.browser}},

  {
    rules: {
      "semi": "off",
      "no-unused-vars": "off",
      "indent": ["error", 4],
      "linebreak-style": ["error", "unix"],
      "quotes": ["error", "backtick"],
      "no-console": "error",
    },
    languageOptions: {
      globals: {
        App: "writable",
        DOM: "writable",
        Combo: "writable",
        Addlist: "writable",
        NiceGesture: "writable",
        NeedContext: "writable",
        Menubutton: "writable",
        ColorLib: "writable",
        AColorPicker: "writable",
        dateFormat: "writable",
        jdenticon: "writable",
        browser: "writable",
      }
    }
  }
]