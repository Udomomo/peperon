import type { Operation } from "../ast/types.js";

export interface EdgeSyntax {
  from: string;
  to: string;
  operation: Operation;
}
