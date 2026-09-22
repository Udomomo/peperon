export const tokenType = {
  // ノードを表すトークン
  NODE: "NODE",

  // 辺を表すトークン
  EDGE_ADD: "EDGE_ADD",
  EDGE_SUB: "EDGE_SUB",

  // 優先度を表すトークン
  PRIORITY: "PRIORITY",

  // 数値を表すトークン。補助ノードのinitの値として使われる。
  NUMBER: "NUMBER",

  // キーワード
  INPUT: "input",
  OUTPUT: "output",
  HELPER: "helper",
  INIT: "init",

  EOL: "EOL",
  COMMENT: "COMMENT",
  INVALID: "INVALID",
} as const;

export type TokenType = (typeof tokenType)[keyof typeof tokenType];

export interface Token {
  type: TokenType;
  value: string;
  // 行内におけるトークンの開始位置。1始まり。
  column: number;
}

export const keywords: Map<string, TokenType> = new Map([
  ["input", tokenType.INPUT],
  ["output", tokenType.OUTPUT],
  ["node", tokenType.HELPER],
  ["init", tokenType.INIT],
]);
