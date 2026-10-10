import { describe, expect, test } from "vitest";
import { Lexer } from "../lexer/lexer.js";
import { ParserError } from "./errors.js";
import { Parser } from "./parser.js";
import type { HelperNodeStatement, InputNodeStatement, OutputNodeStatement } from "../ast/ast.js";

function expectParserError(parser: Parser, location: { line: number; offset: number }, code: string) {
  let error: unknown;
  try {
    parser.parseProgram();
  } catch (caughtError) {
    error = caughtError;
  }

  expect(error).toBeInstanceOf(ParserError);
  if (!(error instanceof ParserError)) {
    return;
  }
  expect(error.location).toEqual(location);
  expect(error.code).toBe(code);
}

describe("ノード宣言", () => {
  test("inputノードの宣言を抽出できること", () => {
    const lexer = new Lexer("input A init 0 @123");
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    expect(program.statements).toHaveLength(1);

    const statement = program.statements[0] as InputNodeStatement;
    expect(statement?.type).toBe("input");
    expect(statement?.name).toBe("A");
    expect(statement?.initValue).toBe(0);
    expect(statement?.priority.value).toBe(123);
  });

  test("outputノードの宣言を抽出できること", () => {
    const lexer = new Lexer("output B @456");
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    expect(program.statements).toHaveLength(1);

    const statement = program.statements[0] as OutputNodeStatement;
    expect(statement?.type).toBe("output");
    expect(statement?.name).toBe("B");
    expect(statement?.priority.value).toBe(456);
  });

  test("補助ノードの宣言を抽出できること", () => {
    const lexer = new Lexer("node C init 4 @789");
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    expect(program.statements).toHaveLength(1);

    const statement = program.statements[0] as HelperNodeStatement;
    expect(statement?.type).toBe("helper");
    expect(statement?.name).toBe("C");
    expect(statement?.initValue).toBe(4);
    expect(statement?.priority.value).toBe(789);
  });

  test("補助ノードでinit valueを省略してもパースできること", () => {
    const lexer = new Lexer("node C @789");
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    expect(program.statements).toHaveLength(1);

    const statement = program.statements[0] as HelperNodeStatement;
    expect(statement?.type).toBe("helper");
    expect(statement?.name).toBe("C");
    expect(statement?.initValue).toBe(0);
    expect(statement?.priority.value).toBe(789);
  });

  test("優先度のないノード宣言はエラーになること", () => {
    const lexer = new Lexer("node C");
    const parser = new Parser(lexer);

    expectParserError(parser, { line: 1, offset: 7 }, "PRIORITY_EXPECTED");
  });

  test("Outputノードでinit valueを宣言するとエラーになること", () => {
    const lexer = new Lexer("output B init 1 @456");
    const parser = new Parser(lexer);

    expectParserError(parser, { line: 1, offset: 10 }, "PRIORITY_EXPECTED");
  });
});
