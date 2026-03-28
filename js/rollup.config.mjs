import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/lightener-curve-card.ts",
  output: {
    file: "../custom_components/lightener/frontend/lightener-curve-card.js",
    format: "es",
  },
  plugins: [
    resolve(),
    typescript(),
    terser({
      format: {
        comments: false,
      },
    }),
  ],
};
