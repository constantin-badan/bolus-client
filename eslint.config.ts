import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import { importX } from "eslint-plugin-import-x";
import reactHooksExtra from "eslint-plugin-react-hooks-extra";
import react from "eslint-plugin-react-x";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import globals from "globals";

const config = [
  {
    ignores: [
      "node_modules",
      "**/*.test.*",
      "test-results",
      "lefthook",
      "src/api/http-client.ts",
      "src/api/Api.ts",
      "src/api/data-contracts.ts",
      "**/*.gen.ts",
      ".next/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.builtin,
        ...globals.serviceworker,
        ...globals.browser,
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      effect: reactYouMightNotNeedAnEffect,
      "react-hooks-extra": reactHooksExtra,
      "react-x": react,
      "import-x": importX,
    },
    rules: {
      "@typescript-eslint/consistent-type-assertions": [
        "error",
        { assertionStyle: "never" },
      ],
      "@typescript-eslint/no-unnecessary-condition": "off", //useeffect bug
      "@typescript-eslint/no-invalid-void-type": "error",
      "@typescript-eslint/no-unnecessary-type-parameters": "error",

      "effect/no-adjust-state-on-prop-change": "error",
      "effect/no-chain-state-updates": "error",
      "effect/no-derived-state": "error",
      "effect/no-empty-effect": "error",
      "effect/no-initialize-state": "error",
      "effect/no-pass-ref-to-parent": "error",
      "effect/no-pass-data-to-parent": "error",
      "effect/no-pass-live-state-to-parent": "error",
      "import-x/order": [
        "error",
        {
          alphabetize: {
            caseInsensitive: true,
            order: "asc",
          },
          groups: [
            "type",
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
          ],
          "newlines-between": "never",
          pathGroupsExcludedImportTypes: ["type"],
          warnOnUnassignedImports: false,
        },
      ],

      "react-hooks-extra/no-direct-set-state-in-use-effect": "error",

      "react-x/no-forward-ref": "error",
      "react-x/no-leaked-conditional-rendering": "error",
      "react-x/no-unnecessary-use-callback": "error",
      "react-x/no-unnecessary-use-memo": "error",
      "react-x/no-unnecessary-use-prefix": "error",
      "react-x/no-unstable-context-value": "error",
      "react-x/no-unstable-default-props": "error",
      "react-x/prefer-use-state-lazy-initialization": "error",
    },
    settings: {
      "import-x/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      react: {
        version: "detect",
      },
    },
  },
];

export default config;
