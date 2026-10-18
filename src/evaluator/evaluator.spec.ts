import { describe, expect, test } from "vitest";
import { Lexer } from "../lexer/lexer.js";
import { Parser } from "../parser/parser.js";
import { Evaluator } from "./evaluator.js";

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
});
