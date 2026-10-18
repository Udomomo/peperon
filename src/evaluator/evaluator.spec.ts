import { describe, expect, test } from "vitest";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "../parser/parser.js";
import { Evaluator } from "./evaluator.js";
import { EvaluatorError } from "./errors.js";
import type { Program } from "../ast/ast.js";

function expectEvaluatorError(evaluator: Evaluator, program: Program, code: string) {
  let error: unknown;
  try {
    evaluator.evaluate(program, () => { });
  } catch (caughtError) {
    error = caughtError;
  }

  expect(error).toBeInstanceOf(EvaluatorError);
  expect((error as EvaluatorError).code).toBe(code);
}

describe("グラフの評価", () => {
  test("グラフを構築して評価できること", () => {
    const lexer = new Lexer(`
      input A init 3 @100
      node B init 2 @10
      output C @1
      A ->+ B
      B ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    const result = evaluator.evaluate(program, console.log);
    expect(result).toBe(5);
  });

  test("inputが複数あるグラフを構築して評価できること", () => {
    const lexer = new Lexer(`
      input A init 3 @3
      input B init 2 @2
      output C @1
      A ->+ C
      B ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    const result = evaluator.evaluate(program, console.log);
    expect(result).toBe(5);
  });

  test("inputから+と-が別々のノードに出ているグラフを評価できること", () => {
    const lexer = new Lexer(`
      input A init 3 @3
      node B init 2 @2
      node C init 4 @1
      output D @0
      A ->+ B
      A ->- C
      B ->+ D
      C ->+ D
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    const result = evaluator.evaluate(program, console.log);
    expect(result).toBe(6);
  });

  test("output以外が正の数ではないグラフは実行されないこと", () => {
    const lexer = new Lexer(`
      input A init 0 @3
      node B init -1 @2
      output C @1
      A ->+ B
      A ->- C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    const result = evaluator.evaluate(program, console.log);
    expect(result).toBe(0);
  });

  test("ループが発生するグラフはエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @3
      node B init 0 @2
      output C @1
      A ->+ B
      B ->+ A
      B ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator(10);

    expectEvaluatorError(evaluator, program, "INFINITE_LOOP");
  });
});

describe("グラフ構築失敗のケース", () => {
  test("同じ優先度のノードがある場合はエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @3
      node B init 0 @3
      output C @1
      A ->+ B
      B ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    expectEvaluatorError(evaluator, program, "DUPLICATE_PRIORITY");
  });

  test("outputノードがない場合はエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @3
      node B init 0 @2
      A ->+ B
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    expectEvaluatorError(evaluator, program, "MISSING_OUTPUT_NODE");
  });

  test("outputノードが複数ある場合はエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @3
      output B @2
      output C @1
      A ->+ B
      A ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    expectEvaluatorError(evaluator, program, "DUPLICATE_OUTPUT_NODE");
  });

  test("同じ名前のノードがある場合はエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @3
      node A init 0 @2
      output C @1
      A ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    expectEvaluatorError(evaluator, program, "DUPLICATE_NODE");
  });

  test("未宣言のノードがoperationで使われている場合はエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @3
      output B @2
      A ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    expectEvaluatorError(evaluator, program, "UNDEFINED_NODE");
  });
})
