/**
 * @fileoverview Additional eslint rules about relay best practices
 * @author Sean Nicolay
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require("requireindex");

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports = {
  configs: {
    recommended: {
      plugins: ["@kejistan/relay"],
      rules: {
        "@kejistan/relay/no-external-imports": "error",
      },
    },
  },
  rules: requireIndex(__dirname + "/rules"),
};
