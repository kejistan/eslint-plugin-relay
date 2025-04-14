const js = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const eslintPlugin = require("eslint-plugin-eslint-plugin");

module.exports = defineConfig({
  plugins: {
    "eslint-plugin": eslintPlugin,
    js,
  },
  extends: [
    "js/recommended",
    "eslint-plugin/flat/recommended",
  ],
  languageOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "eslint-plugin/prefer-message-ids": "off",
  },
});
