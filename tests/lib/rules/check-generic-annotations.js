/**
 * @fileoverview Checks explicit generic annotations on relay functions to make
 * sure they match the name of the graphql template literal.
 * @author Sean Nicolay
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const { ESLintUtils } = require("@typescript-eslint/utils");
const rule = require("../../../lib/rules/check-generic-annotations");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new ESLintUtils.RuleTester({
  parser: "@typescript-eslint/parser",
  parserOptions: { ecmaVersion: 6, sourceType: "module" },
});
ruleTester.run("check-generic-annotations", rule, {
  valid: [
    `
      import {graphql, useMutation} from "react-relay";
      import {TestMutation} from "./__generated__/TestMutation.graphql";

      useMutation<TestMutation>(graphql\`
        mutation TestMutation {
          test
        }
      \`);
     `,
    `
      import {graphql, useLazyLoadQuery} from "react-relay";
      import {SomeQuery} from "./__generated__/SomeQuery.graphql";

      useLazyLoadQuery<SomeQuery>(graphql\`
        query SomeQuery {
          test
        }
      \`, {});
     `,
    `
      import {graphql, useLazyLoadQuery} from "react-relay";
      import {SomeQuery as Query} from "./__generated__/SomeQuery.graphql";
  
      useLazyLoadQuery<Query>(graphql\`
        query SomeQuery {
          test
        }
      \`, {});
     `,
    `
      import {graphql, useMutation} from "react-relay";
      import {TestMutation as Mutation} from "./__generated__/TestMutation.graphql";

      useMutation<Mutation>(graphql\`
        mutation TestMutation {
          test
        }
      \`);
   `,
  ],

  invalid: [
    {
      code: `
        import {graphql, useMutation} from "react-relay";
        useMutation(graphql\`
          mutation TestMutation {
            test
          }
        \`);
      `,
      output: `
        import {graphql, useMutation} from "react-relay";
        useMutation<TestMutation>(graphql\`
          mutation TestMutation {
            test
          }
        \`);
      `,
      errors: [
        {
          message:
            'Expected call to useMutation to explicitly specify generic type "TestMutation"',
          type: "CallExpression",
        },
      ],
    },
    {
      code: `
        import {graphql, useLazyLoadQuery} from "react-relay";
        useLazyLoadQuery(graphql\`
          query SomeQuery {
            test
          }
        \`, {});
     `,
      output: `
        import {graphql, useLazyLoadQuery} from "react-relay";
        useLazyLoadQuery<SomeQuery>(graphql\`
          query SomeQuery {
            test
          }
        \`, {});
     `,
      errors: [
        {
          message:
            'Expected call to useLazyLoadQuery to explicitly specify generic type "SomeQuery"',
          type: "CallExpression",
        },
      ],
    },
    {
      code: `
        import {graphql, useLazyLoadQuery} from "react-relay";
        import {SomeQuery as Query} from "./__generated__/SomeQuery.graphql";
    
        useLazyLoadQuery(graphql\`
          query SomeQuery {
            test
          }
        \`, {});
     `,
      output: `
        import {graphql, useLazyLoadQuery} from "react-relay";
        import {SomeQuery as Query} from "./__generated__/SomeQuery.graphql";
    
        useLazyLoadQuery<Query>(graphql\`
          query SomeQuery {
            test
          }
        \`, {});
     `,
      errors: [
        {
          message:
            'Expected call to useLazyLoadQuery to explicitly specify generic type "Query"',
          type: "CallExpression",
        },
      ],
    },
    {
      code: `
        import {graphql, useMutation} from "react-relay";
        import {TestMutation as Mutation} from "./__generated__/TestMutation.graphql";

        useMutation(graphql\`
          mutation TestMutation {
            test
          }
        \`);
     `,
      output: `
        import {graphql, useMutation} from "react-relay";
        import {TestMutation as Mutation} from "./__generated__/TestMutation.graphql";

        useMutation<Mutation>(graphql\`
          mutation TestMutation {
            test
          }
        \`);
     `,
      errors: [
        {
          message:
            'Expected call to useMutation to explicitly specify generic type "Mutation"',
          type: "CallExpression",
        },
      ],
    },
    {
      code: `
        import {graphql, useMutation} from "react-relay";
        import {SomeOtherMutation} from "./__generated__/SomeOtherMutation.graphql";
        import {TestMutation} from "./__generated__/TestMutation.graphql";

        useMutation<SomeOtherMutation>(graphql\`
          mutation TestMutation {
            test
          }
        \`);
      `,
      output: `
        import {graphql, useMutation} from "react-relay";
        import {SomeOtherMutation} from "./__generated__/SomeOtherMutation.graphql";
        import {TestMutation} from "./__generated__/TestMutation.graphql";

        useMutation<TestMutation>(graphql\`
          mutation TestMutation {
            test
          }
        \`);
      `,
      errors: [
        {
          message:
            'Expected call to useMutation to explicitly specify generic type "TestMutation"',
          type: "CallExpression",
        },
      ],
    },
  ],
});
