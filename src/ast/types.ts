export type Node = {
  value: number;
};

const Operation = [
  'add',
  'subtract',
] as const;

export type Operation = typeof Operation[keyof typeof Operation];

export type Edge = {
  from: Node;
  to: Node;
  operation: Operation;
}
