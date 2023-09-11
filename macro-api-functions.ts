import { Project, getCompilerOptionsFromTsConfig } from "ts-morph";

const OUT_DIR = Bun.fileURLToPath(new URL("./gen", import.meta.url));
export const getOutDir = () => OUT_DIR

const TSCONFIG_PATH = Bun.fileURLToPath(
  new URL("./tsconfig.json", import.meta.url)
);

export function createApiFunctions() {
  const { options } = getCompilerOptionsFromTsConfig(TSCONFIG_PATH);
  const project = new Project({
    compilerOptions: {
      ...options,
      noEmit: false,
      outDir: OUT_DIR,
    },
  });
  project.createSourceFile("api-functions.ts", "export const num = 1;");
  const result = project.emitToMemory();
  return result.getFiles();
}
