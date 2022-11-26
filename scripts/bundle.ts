#!/usr/bin/env tnode
import { rmSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { build } from "esbuild";

import * as packageJSON from "../package.json";

const dev = process.argv.includes("--dev");

rmSync("dist", { force: true, recursive: true });

Promise.all([
  build({
    entryPoints: ["src/refresh-runtime.js"],
    outdir: "dist",
    platform: "browser",
    format: "esm",
    target: "safari13",
    legalComments: "inline",
    watch: dev,
  }),
  build({
    bundle: true,
    entryPoints: ["src/index.ts"],
    outdir: "dist",
    platform: "node",
    target: "node14",
    legalComments: "inline",
    external: Object.keys(packageJSON.peerDependencies).concat(
      Object.keys(packageJSON.dependencies),
    ),
    watch: dev,
  }),
]).then(() => {
  execSync("cp LICENSE README.md dist/");

  writeFileSync(
    "dist/index.d.ts",
    `import { PluginOption } from "vite";
export declare const swcReactRefresh: () => PluginOption;
`,
  );

  writeFileSync(
    "dist/package.json",
    JSON.stringify(
      {
        name: packageJSON.name,
        description:
          "Use the versatility of SWC for development and the maturity of esbuild for production",
        version: packageJSON.version,
        author: "Arnaud Barré (https://github.com/ArnaudBarre)",
        license: packageJSON.license,
        repository: "github:vitejs/plugin-react-swc",
        main: "index.js",
        keywords: [
          "vite",
          "vite-plugin",
          "react",
          "swc",
          "react-refresh",
          "fast refresh",
        ],
        peerDependencies: packageJSON.peerDependencies,
        dependencies: packageJSON.dependencies,
      },
      null,
      2,
    ),
  );
});