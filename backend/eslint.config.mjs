import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";


export default defineConfig(
  {
    ignores: [
      "dist/**",
      "generated/**",
    ],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    rules: {
      "quotes": ["error", "double"],
      "import/no-unresolved": "off",
      "indent": ["error", 2],
    },
  }
);