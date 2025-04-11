import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import eslintPlugin from "eslint-plugin-eslint-plugin";

export default defineConfig({
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
