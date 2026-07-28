import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

/**
 * Lets `node --test` load the app's TypeScript modules directly: it maps the
 * `@/…` alias from tsconfig and appends the `.ts` extension that bundler-style
 * imports leave off. Node strips the types itself.
 */
export async function resolve(specifier, context, nextResolve) {
  let target = specifier;

  if (target.startsWith("@/")) {
    target = pathToFileURL(path.join(root, target.slice(2))).href;
  }

  if (target.startsWith(".") || target.startsWith("file:")) {
    const resolved = new URL(target, context.parentURL);
    if (!path.extname(resolved.pathname)) {
      for (const candidate of [`${resolved.href}.ts`, `${resolved.href}/index.ts`]) {
        if (existsSync(fileURLToPath(candidate))) return nextResolve(candidate, context);
      }
    }
  }

  return nextResolve(target, context);
}
