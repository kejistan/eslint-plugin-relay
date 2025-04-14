/**
 * @fileoverview Additional eslint rules about relay best practices
 * @author Sean Nicolay
 */

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const checkGenericAnnotations = require("./rules/check-generic-annotations.js");
const noExternalImports = require("./rules/no-external-imports.js");

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

module.exports = plugin;
