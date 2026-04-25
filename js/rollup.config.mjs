import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

function makeConfig(file, outDir) {
  return {
    input: "src/lightener-curve-card.ts",
    output: {
      file,
      format: "es",
    },
    plugins: [
      resolve(),
      typescript({
        compilerOptions: {
          outDir,
        },
      }),
      terser({
        format: {
          comments: false,
        },
      }),
    ],
  };
}

export default [
  makeConfig(
    "../custom_components/lightener/frontend/lightener-curve-card.js",
    "../custom_components/lightener/frontend"
  ),
  makeConfig("../docs/lightener-curve-card.js", "../docs"),
];
