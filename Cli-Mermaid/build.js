import { build } from "esbuild"

const shared = {
  bundle: true,
  minify: true,
  sourcemap: true,
}

// Build index (ESM + CJS)
await build({
  ...shared,
  entryPoints: ["src/index.js"],
  outfile: "dist/index.js",
  format: "esm",
  target: ["es2020"],
})
await build({
  ...shared,
  entryPoints: ["src/index.js"],
  outfile: "dist/index.cjs",
  format: "cjs",
  target: ["es2020"],
})

// Build web adapter (ESM + CJS)
await build({
  ...shared,
  entryPoints: ["src/adapters/web/html-renderer.js"],
  outfile: "dist/web.js",
  format: "esm",
  target: ["es2020"],
})
await build({
  ...shared,
  entryPoints: ["src/adapters/web/html-renderer.js"],
  outfile: "dist/web.cjs",
  format: "cjs",
  target: ["es2020"],
})

// Build Node adapter (ESM + CJS)
await build({
  ...shared,
  entryPoints: ["src/adapters/node/ansi-renderer.js"],
  outfile: "dist/node.js",
  format: "esm",
  platform: "node",
  target: ["node20"],
})
await build({
  ...shared,
  entryPoints: ["src/adapters/node/ansi-renderer.js"],
  outfile: "dist/node.cjs",
  format: "cjs",
  platform: "node",
  target: ["node20"],
})

// Build CLI (ESM only - CLI entry)
await build({
  ...shared,
  entryPoints: ["src/adapters/node/cli.js"],
  outfile: "dist/cli.js",
  format: "esm",
  platform: "node",
  target: ["node20"],
})

console.log("Build completed successfully!")
