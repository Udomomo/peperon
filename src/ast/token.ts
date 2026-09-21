export const tokenType = {
  NODE: "NODE", // ノードを表すトークン。

  EDGE_ADD: "EDGE_ADD",
  EDGE_SUB: "EDGE_SUB",

  PRIORITY: "PRIORITY", // 優先度を表す

  // キーワード
  INPUT: "input",
  OUTPUT: "output",
  HELPER: "node",

  INVALID: "INVALID",
} as const;

export type TokenType = (typeof tokenType)[keyof typeof tokenType];

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export const keywords: Map<string, TokenType> = new Map([
  ["input", tokenType.INPUT],
  ["output", tokenType.OUTPUT],
  ["node", tokenType.HELPER],
]);

export const edges: Map<string, TokenType> = new Map([
  ["->+", tokenType.EDGE_ADD],
  ["->-", tokenType.EDGE_SUB],
]);