/**
 * @fileoverview Checks explicit generic annotations on relay functions to make
 * sure they match the name of the graphql template literal.
 * @author Sean Nicolay
 */

const path = require("node:path");
const { parse, visit } = require("graphql");

const RELAY_GENERIC_FUNCTIONS = new Set([
  "useQueryLoader",
  "loadQuery",
  "useLazyLoadQuery",
  "useMutation",
  "useSubscription",
  "fetchQuery",
  "commitMutation",
  "requestSubscription",
]);

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
      description:
        "Checks explicit generic annotations on relay functions to make sure they match the name of the graphql template literal.",
      url: null, // URL to the documentation page for this rule
    },
    fixable: "code",
    schema: [], // Add a schema if the rule has options
  },

  create(context) {
    // variables should be defined here
    const relayGenericFunctionNames = new Set();
    const importedGeneratedTypes = new Map();

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
      } catch {
        // Invalid syntax
        return null;
      }
    }

    // Extract the type name for the main defined operation or fragment.
    function getOperationOrFragmentRefName(ast) {
      let names = [];
      visit(ast, {
        FragmentDefinition(node) {
          names.push(`${node.name.value}$key`);
        },
        OperationDefinition(node) {
          names.push(node.name.value);
        },
      });
      return names[0];
    }

    //----------------------------------------------------------------------
    // Public
    //----------------------------------------------------------------------

    return {
      // collect the names of all the imported generic functions as well as the imported
      // generated types
      ImportDeclaration(node) {
        if (
          node.source.value === "relay-runtime" ||
          node.source.value === "react-relay"
        ) {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === "ImportSpecifier") {
              if (RELAY_GENERIC_FUNCTIONS.has(specifier.imported.name)) {
                relayGenericFunctionNames.add(specifier.local.name);
              }
            }
          });
        } else if (isRelayGeneratedFile(node.source.value)) {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === "ImportSpecifier") {
              const name = extractRelayOperationOrFragmentName(
                node.source.value,
              );
              // Only inspect imports that match the name of the operation or fragment
              if (specifier.imported.name === name) {
                importedGeneratedTypes.set(name, specifier.local.name);
              }
            }
          });
        }
      },
      CallExpression(node) {
        if (node.callee.type === "Identifier") {
          if (relayGenericFunctionNames.has(node.callee.name)) {
            const gqlTemplate = node.arguments[0];
            if (gqlTemplate.type !== "TaggedTemplateExpression") {
              return;
            }

            const document = parseGraphQLTemplate(gqlTemplate);
            let expectedTypeName;
            if (document) {
              const generatedTypeName = getOperationOrFragmentRefName(document);
              expectedTypeName =
                importedGeneratedTypes.get(generatedTypeName) ??
                generatedTypeName;
            }
            if (!expectedTypeName) {
              return;
            }

            const genericParameters = node.typeArguments;
            let specifiedTypeName;
            if (
              genericParameters &&
              genericParameters.type === "TSTypeParameterInstantiation" &&
              genericParameters.params.length === 1
            ) {
              specifiedTypeName = genericParameters.params[0].typeName.name;
            }

            if (specifiedTypeName !== expectedTypeName) {
              // No specified type or the type is incorrect
              context.report({
                node,
                message: `Expected call to ${node.callee.name} to explicitly specify generic type "${expectedTypeName}"`,
                fix(fixer) {
                  if (genericParameters) {
                    return fixer.replaceText(
                      genericParameters,
                      `<${expectedTypeName}>`,
                    );
                  } else {
                    return fixer.insertTextAfter(
                      node.callee,
                      `<${expectedTypeName}>`,
                    );
                  }
                },
              });
            }
          }
        }
      },
    };
  },
};
