#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { Evaluator } from "./evaluator/evaluator.js";
import { Lexer } from "./lexer/lexer.js";
import { Parser } from "./parser/parser.js";

const HELP_MESSAGE = `使い方: peperon [オプション] <filename>.pprn

オプション:
  -x        計算途中の過程を標準出力に出力します。
  --help    このヘルプを表示します。`;

type CliOptions = {
  filename: string | undefined;
  showProgress: boolean;
  showHelp: boolean;
};

async function main(argv: string[] = process.argv.slice(2)): Promise<void> {
  const options = parseArguments(argv);

  if (options.showHelp) {
    console.log(HELP_MESSAGE);
    return;
  }

  if (!options.filename) {
    throw new Error(`入力ファイルを指定してください。\n\n${HELP_MESSAGE}`);
  }
  if (extname(options.filename) !== ".pprn") {
    throw new Error(`入力ファイルの拡張子は .pprn である必要があります: ${options.filename}`);
  }

  const input = await readFile(options.filename, "utf8");
  const lexer = new Lexer(input);
  const parser = new Parser(lexer);
  const program = parser.parseProgram();
  const evaluator = new Evaluator();
  const stdOut = options.showProgress ? console.log : () => {};
  const result = evaluator.evaluate(program, stdOut);

  console.log(result);
}

function parseArguments(argv: string[]): CliOptions {
  let filename: string | undefined;
  let showProgress = false;
  let showHelp = false;

  for (const argument of argv) {
    switch (argument) {
      case "--":
        break;
      case "-x":
        showProgress = true;
        break;
      case "--help":
        showHelp = true;
        break;
      default:
        if (argument.startsWith("-")) {
          throw new Error(`不明なオプションです: ${argument}\n\n${HELP_MESSAGE}`);
        }
        if (filename !== undefined) {
          throw new Error(`入力ファイルを複数指定することはできません: ${argument}\n\n${HELP_MESSAGE}`);
        }
        filename = argument;
    }
  }

  return { filename, showProgress, showHelp };
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
