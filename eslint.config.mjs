import js from "@eslint/js";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.ts", "src/**/*.tsx", "netlify/functions/**/*.js"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: false,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      "no-unused-vars": ["warn", {
        ignoreRestSiblings: true,
        argsIgnorePattern: "^(_|event|context)",
        varsIgnorePattern: "^_",
        caughtErrors: "none"
      }],
      "max-lines": ["warn", { max: 100, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["warn", { max: 50, skipBlankLines: true, skipComments: true }],
      "max-params": ["warn", 4],
      complexity: ["warn", 6]
    }
  }
];
