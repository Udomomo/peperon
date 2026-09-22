import { describe, expect, it, test } from "vitest";
import { Lexer } from "./lexer.js";
import { tokenType } from "../ast/token.js";

describe("キーワード", () => {
  test.for([
    ["input", tokenType.INPUT],
    ["output", tokenType.OUTPUT],
    ["node", tokenType.HELPER],
    ["init", tokenType.INIT],
  ] as const)("%sを抽出できること", ([keyword, expectedValue]) => {
    const lexer = new Lexer(keyword);

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(expectedValue);
    expect(token1.value).toBe(keyword);
    expect(token1.column).toBe(1);
  });

  test("無効な小文字の文字列はINVALIDトークンになること", () => {
    const lexer = new Lexer("invalid");

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.INVALID);
    expect(token1.value).toBe("invalid");
    expect(token1.column).toBe(1);
  });
});

describe("ノード", () => {
  test("大文字の1文字を抽出できること", () => {
    const lexer = new Lexer("A");

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.NODE);
    expect(token1.value).toBe("A");
    expect(token1.column).toBe(1);
  });
});

describe("優先度", () => {
  test("優先度を抽出できること", () => {
    const lexer = new Lexer("@123");

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.PRIORITY);
    expect(token1.value).toBe("123");
    expect(token1.column).toBe(1);
  });

  test("優先度の後に数値がない場合はINVALIDトークンになること", () => {
    const lexer = new Lexer("@a");

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.INVALID);
    expect(token1.value).toBe("@a");
    expect(token1.column).toBe(1);
  });
});

describe("エッジ", () => {
  test("加算のエッジを抽出できること", () => {
    const lexer = new Lexer("->+");

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.EDGE_ADD);
    expect(token1.value).toBe("->+");
    expect(token1.column).toBe(1);
  });

  test("減算のエッジを抽出できること", () => {
    const lexer = new Lexer("->-");

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.EDGE_SUB);
    expect(token1.value).toBe("->-");
    expect(token1.column).toBe(1);
  });

  test("無効なエッジはINVALIDトークンになること", () => {
    const lexer = new Lexer("->*");

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.INVALID);
    expect(token1.value).toBe("->*");
    expect(token1.column).toBe(1);
  });
});

describe("数値", () => {
  test("数値を抽出できること", () => {
    const lexer = new Lexer("12345");

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.NUMBER);
    expect(token1.value).toBe("12345");
    expect(token1.column).toBe(1);
  });
});

describe("EOL", () => {
  test("入力文字列の最後にEOLを抽出できること", () => {
    const lexer = new Lexer("->+");

    lexer.nextToken();
    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.EOL);
    expect(token1.value).toBe("");
    expect(token1.column).toBe(4);
  });
});

describe("コメント", () => {
  test("コメントを抽出できること", () => {
    const lexer = new Lexer("# This is a comment");

    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.COMMENT);
    expect(token1.value).toBe("");
    expect(token1.column).toBe(1);
  });

  test("行の途中からのコメントを抽出できること", () => {
    const lexer = new Lexer("A # This is a comment");

    lexer.nextToken();
    const token1 = lexer.nextToken();
    expect(token1.type).toBe(tokenType.COMMENT);
    expect(token1.value).toBe("");
    expect(token1.column).toBe(3);
  });
});

describe("スペース", () => {
  test("トークンの区切りにスペースがある場合は無視されること", () => {
    const lexer = new Lexer("A ->+ B");

    const token1 = lexer.nextToken();
    const token2 = lexer.nextToken();
    const token3 = lexer.nextToken();

    expect(token1.type).toBe(tokenType.NODE);
    expect(token1.value).toBe("A");
    expect(token1.column).toBe(1);

    expect(token2.type).toBe(tokenType.EDGE_ADD);
    expect(token2.value).toBe("->+");
    expect(token2.column).toBe(3);

    expect(token3.type).toBe(tokenType.NODE);
    expect(token3.value).toBe("B");
    expect(token3.column).toBe(7);
  });
});

describe("複数種類のトークン", () => {
  test("複数種類のトークンを抽出できること", () => {
    const lexer = new Lexer("input A @1");

    const token1 = lexer.nextToken();
    const token2 = lexer.nextToken();
    const token3 = lexer.nextToken();
    const token4 = lexer.nextToken();

    expect(token1.type).toBe(tokenType.INPUT);
    expect(token1.value).toBe("input");
    expect(token1.column).toBe(1);

    expect(token2.type).toBe(tokenType.NODE);
    expect(token2.value).toBe("A");
    expect(token2.column).toBe(7);

    expect(token3.type).toBe(tokenType.PRIORITY);
    expect(token3.value).toBe("1");
    expect(token3.column).toBe(9);

    expect(token4.type).toBe(tokenType.EOL);
    expect(token4.value).toBe("");
    expect(token4.column).toBe(11);
  });

  test("スペースなしで複数種類のトークンを抽出できること", () => {
    const lexer = new Lexer("inputA@1");

    const token1 = lexer.nextToken();
    const token2 = lexer.nextToken();
    const token3 = lexer.nextToken();
    const token4 = lexer.nextToken();

    expect(token1.type).toBe(tokenType.INPUT);
    expect(token1.value).toBe("input");
    expect(token1.column).toBe(1);

    expect(token2.type).toBe(tokenType.NODE);
    expect(token2.value).toBe("A");
    expect(token2.column).toBe(6);

    expect(token3.type).toBe(tokenType.PRIORITY);
    expect(token3.value).toBe("1");
    expect(token3.column).toBe(7);

    expect(token4.type).toBe(tokenType.EOL);
    expect(token4.value).toBe("");
    expect(token4.column).toBe(9);
  });
});
