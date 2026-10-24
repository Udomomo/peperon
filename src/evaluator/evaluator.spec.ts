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
      input A init 3 @10
      node B init 2 @100
      output C @1000
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
      input A init 3 @2
      input B init 2 @3
      output C @4
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
      input A init 3 @1
      node B init 2 @2
      node C init 4 @3
      output D @4
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
      input A init 0 @1
      node B init -1 @2
      output C @3
      A ->+ B
      A ->- C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    const result = evaluator.evaluate(program, console.log);
    expect(result).toBe(0);
  });

  test("優先度が正しく判定されること", () => {
    const lexer = new Lexer(`
      input A init 4 @1
      node B init 3 @2
      output C @3
      A ->- B
      B ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    const result = evaluator.evaluate(program, console.log);
    // Aが先に動くので、Bの値が0以下となり、Cの値は変化しない。
    expect(result).toBe(0);
  });

  test("ループが発生するグラフはエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @2
      node B init 0 @3
      output C @4
      A ->+ B
      B ->+ A
      B ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator(10);

    expectEvaluatorError(evaluator, program, "INFINITE_LOOP");
  });

  test("ノードの値が32bit整数の上限を超えた場合はエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @1
      input B init 2147483647 @2
      output C @3
      A ->+ B
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    expectEvaluatorError(evaluator, program, "INTEGER_OVERFLOW");
  });

  test("ノードの値が32bit整数の下限を下回った場合はエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @1
      input B init -2147483648 @2
      output C @3
      A ->- B
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    expectEvaluatorError(evaluator, program, "INTEGER_OVERFLOW");
  });
});

describe("グラフ構築失敗のケース", () => {
  test("同じ優先度のノードがある場合はエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @1
      node B init 0 @1
      output C @3
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
      input A init 1 @1
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
      input A init 1 @1
      output B @2
      output C @3
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
      input A init 1 @1
      node A init 0 @2
      output C @3
      A ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    expectEvaluatorError(evaluator, program, "DUPLICATE_NODE");
  });

  test("未宣言のノードがoperationで使われている場合はエラーになること", () => {
    const lexer = new Lexer(`
      input A init 1 @1
      output B @2
      A ->+ C
    `);
    const parser = new Parser(lexer);

    const program = parser.parseProgram();
    const evaluator = new Evaluator();

    expectEvaluatorError(evaluator, program, "UNDEFINED_NODE");
  });
})
