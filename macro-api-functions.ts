import {
  Project,
  getCompilerOptionsFromTsConfig,
  type OptionalKind,
  type ExportDeclarationStructure,
} from "ts-morph";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT_DIR = "gen-api-functions";
const OUT_BUNDLE_FILE = Bun.fileURLToPath(
  new URL(`./${OUT_DIR}.js`, import.meta.url)
);
const TSCONFIG_PATH = Bun.fileURLToPath(
  new URL("./tsconfig.json", import.meta.url)
);

export async function createApiFunctions() {
  const tmpDir = await mkdtemp(join(tmpdir(), OUT_DIR));
  const { options } = getCompilerOptionsFromTsConfig(TSCONFIG_PATH);
  const project = new Project({
    compilerOptions: {
      ...options,
      noEmit: false,
      outDir: tmpDir,
    },
  });

  const files = [
    project.createSourceFile(
      "get-num.ts",
      "export function getNum() { return 1; }"
    ),
    project.createSourceFile(
      "get-num-2.ts",
      "export function getNum2() { return 2; }"
    ),
  ];

  const exportDeclarationStructure: OptionalKind<ExportDeclarationStructure>[] =
    [];
  for (const file of files) {
    const fileName = file.getBaseName().replace(".ts", "");
    for (const exportSymbolOfFile of file.getExportSymbols()) {
      exportDeclarationStructure.push({
        moduleSpecifier: `./${fileName}`,
        namedExports: [{ name: exportSymbolOfFile.getName() }],
      });
    }
  }
  const indexFile = project.createSourceFile("index.ts", undefined, {
    overwrite: true,
  });
  indexFile.addExportDeclarations(exportDeclarationStructure);

  const result = project.emitToMemory();
  const resultFiles = result.getFiles();
  const entrypoint = resultFiles.find((f) => f.filePath.includes("index"))
    ?.filePath!;

  return {
    entrypoint,
    files: resultFiles,
    bundleFilePath: OUT_BUNDLE_FILE,
    tmpDir,
  };
}
