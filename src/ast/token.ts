export const tokenType = {
  // ノードを表すトークン
  NODE: "NODE", 

  // 辺を表すトークン
  EDGE_ADD: "EDGE_ADD",
  EDGE_SUB: "EDGE_SUB",

  // 優先度を表すトークン
  PRIORITY: "PRIORITY", 

  // キーワード
  INPUT: "input",
  OUTPUT: "output",
  HELPER: "node",

  EOL: "EOL",
  INVALID: "INVALID",
} as const;

export type TokenType = (typeof tokenType)[keyof typeof tokenType];

export interface Token {
  type: TokenType;
  value: string;
  offset: number;
}

export const keywords: Map<string, TokenType> = new Map([
  ["input", tokenType.INPUT],
  ["output", tokenType.OUTPUT],
  ["node", tokenType.HELPER],
]);
