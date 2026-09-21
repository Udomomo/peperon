export const tokenType = {
  NODE: "NODE", // ノードを表すトークン。

  EDGE_ADD: "->+",
  EDGE_SUB: "->-",

  PRIORITY: "PRIORITY", // 優先度を表す

  // キーワード
  INPUT: "input",
  OUTPUT: "output",
  HELPER: "node",
} as const;

export interface Token {
  type: (typeof tokenType)[keyof typeof tokenType];
  value: string;
  line: number;
  column: number;
}
