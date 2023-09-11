import { createApiFunctions } from "./macro-api-functions.ts" assert { type: "macro" };
import { rm } from "node:fs/promises";

const { entrypoint, files, tmpDir, bundleFilePath } =
  await createApiFunctions();

for (const file of files) {
  Bun.write(file.filePath, file.text);
}

const results = await Bun.build({
  entrypoints: [entrypoint],
});

for (const result of results.outputs) {
  Bun.write(bundleFilePath, result);
}

await rm(tmpDir, { recursive: true, force: true });
