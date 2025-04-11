/**
 * @fileoverview Additional eslint rules about relay best practices
 * @author Sean Nicolay
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

import checkGenericAnnotations from "./rules/check-generic-annotations.js";
import noExternalImports from "./rules/no-external-imports.js";

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
const plugin = {
  meta: {
    name: "@kejistan/eslint-plugin-relay",
    version: "1.0.0",
  },
  configs: {
    recommended: {
      plugins: ["@kejistan/relay"],
      rules: {
        "@kejistan/relay/check-generic-annotations": "error",
        "@kejistan/relay/no-external-imports": "error",
      },
    },
  },
  rules: {
    "check-generic-annotations": checkGenericAnnotations,
    "no-external-imports": noExternalImports,
  },
};

Object.assign(plugin.configs, {
  "flat/recommended": [{
    plugins: {
      "@kejistan/relay": plugin,
    },
    rules: {
      "@kejistan/relay/check-generic-annotations": "error",
      "@kejistan/relay/no-external-imports": "error",
    },
  }],
});

export default plugin;

// Backwards compatibility for old eslint
const configs = plugin.configs;
const rules = plugin.rules;
export { configs, rules };