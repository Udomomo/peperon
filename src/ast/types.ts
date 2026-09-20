/**
 * 全種類のノード型の共通部分。
 */
export interface NodeBase {
  name: string;
  priority: number;
  value: number;
};

/**
 * ノードの種類ごとの詳細情報。kindプロパティがdiscriminated unionの識別子として機能する。
 */
type NodeDetail = 
  | { kind: "input"} // 入力ノード
  | { kind: "output" } // 出力ノード
  | { kind: "helper", init?: number} // 補助ノード。初期値を持つ場合がある。

type Node = NodeBase & NodeDetail;

const Operation = [
  'add',
  'subtract',
] as const;

export type Operation = (typeof Operation)[number];

export interface Edge {
  from: Node;
  to: Node;
  operation: Operation;
}
