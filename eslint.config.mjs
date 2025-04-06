import { dirname } from "path";
import { fileURLToPath } from "url";
import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react"; // Import the React plugin
import reactHooksPlugin from "eslint-plugin-react-hooks"; // Import React Hooks plugin
import jsxA11yPlugin from "eslint-plugin-jsx-a11y"; // Import accessibility plugin
import vitestGlobalsPlugin from "eslint-plugin-vitest-globals"; // Import Vitest globals plugin
import globals from "globals"; // Import globals

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Note: FlatCompat might not be needed if directly using new config format
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });

// Start with recommended configs
const eslintConfig = [
  eslint.configs.recommended,
  // Correctly include TypeScript recommended config
  ...(tseslint.configs && Array.isArray(tseslint.configs.recommended) ? tseslint.configs.recommended : []), 
  // Apply Next.js plugin configuration
  {
    plugins: { 
      "@next/next": nextPlugin 
    },
    rules: { 
      ...nextPlugin.configs.recommended.rules, 
      ...nextPlugin.configs["core-web-vitals"].rules 
    },
  },
  // Apply React, Hooks, and Accessibility configurations
  {
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      // Override specific rules after applying recommended sets
      "react/react-in-jsx-scope": "off", // Not needed with Next.js/React 17+
      "react/prop-types": "off", // Handled by TypeScript
      "react/display-name": "warn", // Keep this as warn
      "jsx-a11y/anchor-is-valid": "off", // Often conflicts with Next.js Link
    },
  },
  // TypeScript specific configuration
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      curly: ["error", "all"],
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      "no-duplicate-imports": "error",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "no-console": [
        "warn",
        {
          allow: ["warn", "error"],
        },
      ],
    },
  },
  // Test file specific configuration (Vitest)
  {
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**"], // Match test files
    languageOptions: {
      globals: {
        ...vitestGlobalsPlugin.environments.env.globals, // Add Vitest globals
      }
    }
  },
  // Global ignores (Ensure test files are NOT ignored here)
  {
    ignores: [
      ".next/",
      "node_modules/",
      "public/",
      "out/",
      "build/",
      "dist/",
    ],
  },
  // Config specific overrides for CommonJS
  {
    files: ["tailwind.config.js", "postcss.config.js", "next.config.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-var-requires": "off",
    },
  },
  // Base settings applicable to all files
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        React: "readonly", // Define React globally for convenience
      }
    }
  },
];

export default eslintConfig;
