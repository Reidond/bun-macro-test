import {
  getOutDir,
  createApiFunctions,
} from "./macro-api-functions.ts" assert { type: "macro" };
import { rm, mkdir } from "node:fs/promises";

await rm(getOutDir(), { recursive: true, force: true });
await mkdir(getOutDir());
for (const file of createApiFunctions()) {
  Bun.write(file.filePath, file.text);
}
