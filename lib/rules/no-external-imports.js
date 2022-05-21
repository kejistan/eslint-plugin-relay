/**
 * @fileoverview Forbid imports of relay code generated by other files
 * @author Sean Nicolay
 */
"use strict";

const path = require("path");
const { parse, visit } = require("graphql");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/**
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: "problem", // `problem`, `suggestion`, or `layout`
    docs: {
      description: "Forbid imports of relay code generated by other files",
      category: "Fill me in",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    // variables should be defined here
    const importedFragmentsOrOperations = new Map();
    const defaultImports = new Set();
    const definedFragmentsOrOperations = new Set();

    //----------------------------------------------------------------------
    // Helpers
    //----------------------------------------------------------------------
    function isRelayGeneratedFile(filename) {
      return filename.endsWith(".graphql");
    }

    function extractRelayOperationOrFragmentName(filename) {
      return path.basename(filename, ".graphql");
    }

    function isGraphQLTemplate(node) {
      return (
        node.tag.type === "Identifier" &&
        node.tag.name === "graphql" &&
        node.quasi.quasis.length === 1
      );
    }

    function parseGraphQLTemplate(taggedTemplateExpression) {
      if (!isGraphQLTemplate(taggedTemplateExpression)) {
        return null;
      }

      const quasi = taggedTemplateExpression.quasi.quasis[0];
      try {
        return parse(quasi.value.cooked);
      } catch (error) {
        // Invalid syntax
        return null;
      }
    }

    // Extract all the defined operation or fragment names
    // there can be multiple in the case of @refetchable annotations
    function getOperationOrFragmentNames(ast) {
      let names = [];
      visit(ast, {
        FragmentDefinition(node) {
          names.push(node.name.value);
        },
        OperationDefinition(node) {
          names.push(node.name.value);
        },
        Directive(node) {
          if (node.name.value !== "refetchable") {
            return;
          }

          const queryNameArgument = node.arguments.find(
            (arg) => arg.name.value === "queryName"
          );
          if (!queryNameArgument) {
            return;
          }
          if (queryNameArgument.value.kind === "StringValue") {
            names.push(queryNameArgument.value.value);
          }
        },
      });
      return names;
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      // visitor functions for different types of nodes
      ImportDeclaration(node) {
        if (isRelayGeneratedFile(node.source.value)) {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === "ImportDefaultSpecifier") {
              const name = extractRelayOperationOrFragmentName(
                node.source.value
              );
              defaultImports.add(name);
            } else if (specifier.type === "ImportSpecifier") {
              const name = extractRelayOperationOrFragmentName(
                node.source.value
              );
              let imports = importedFragmentsOrOperations.get(name);
              if (!imports) {
                imports = [];
                importedFragmentsOrOperations.set(name, imports);
              }

              imports.push(specifier);
            }
          });
        }
      },
      TaggedTemplateExpression(node) {
        const ast = parseGraphQLTemplate(node);
        if (!ast) {
          return;
        }

        const names = getOperationOrFragmentNames(ast);
        names.forEach((name) => definedFragmentsOrOperations.add(name));
      },
      "Program:exit"() {
        // All imports are allowed for anything defined in the current file
        definedFragmentsOrOperations.forEach((name) => {
          importedFragmentsOrOperations.delete(name);
        });

        // For externally defined files only the operation and operation type
        // should be imported (i.e. for preloaded queries)
        defaultImports.forEach((name) => {
          const imports = importedFragmentsOrOperations.get(name);
          if (!imports) {
            return;
          }

          const updatedImports = imports.filter(
            (node) => node.imported.name !== name
          );
          if (updatedImports.length === 0) {
            importedFragmentsOrOperations.delete(name);
          } else {
            importedFragmentsOrOperations.set(name, updatedImports);
          }
        });

        // The remaining imports are errors
        importedFragmentsOrOperations.forEach(
          (imports, fragmentOrOperationName) => {
            imports.forEach((node) => {
              context.report({
                node,
                message:
                  `${fragmentOrOperationName} is not defined in the current module. ` +
                  "Importing types generated from other modules introduces fragile coupling.",
              });
            });
          }
        );
      },
    };
  },
};