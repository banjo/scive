import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["src/index.ts", "src/bin.ts"],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    format: ["esm"],
    minify: true,
    target: "es2022",
});
