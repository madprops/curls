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
        Msg: "writable",
        Combo: "writable",
        Block: "writable",
        Peek: "writable",
        Curlist: "writable",
        Addlist: "writable",
        More: "writable",
        Curls: "writable",
        Items: "writable",
        Container: "writable",
        Update: "writable",
        Change: "writable",
        Picker: "writable",
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