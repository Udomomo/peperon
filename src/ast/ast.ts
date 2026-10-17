import { ParserError } from "../parser/errors.js";
import { isInInt32, toInt32 } from "../utils/isInInt32.js";
import { AstError } from "./errors.js";

export class Program {
  statements: Statement[] = [];
}

export type Statement = NodeStatement | EdgeExpression;

export type NodeType = "input" | "output" | "helper";

export type NodeStatement = InputNodeStatement | OutputNodeStatement | HelperNodeStatement;

export interface NodePriority {
  __brandId: "NodePriority";
  value: number;
}

const UPPERCASE_REGEX = /^[A-Z]$/;

export class InputNodeStatement {
  type = "input";
  line: number;
  name: string;
  initValue: number;
  priority: NodePriority;

  constructor(name: string, initValue: string | number, priorityValue: number | undefined, line: number) {
    if (!UPPERCASE_REGEX.test(name)) {
      throw new AstError("INVALID_NODE_NAME");
    }

    const parsedInitValue = typeof initValue === "string" ? toInt32(initValue) : initValue;
    if (parsedInitValue === undefined || !isInInt32(parsedInitValue)) {
      throw new AstError("VALUE_OUT_OF_RANGE");
    }

    if (priorityValue === undefined) {
      throw new AstError("MISSING_PRIORITY_VALUE");
    }
    const priority: NodePriority = { __brandId: "NodePriority", value: priorityValue };

    this.line = line;
    this.name = name;
    this.initValue = parsedInitValue;
    this.priority = priority;
  }
}

export class OutputNodeStatement {
  type = "output";
  line: number;
  name: string;
  priority: NodePriority;

  constructor(name: string, priorityValue: number | undefined, line: number) {
    if (!UPPERCASE_REGEX.test(name)) {
      throw new AstError("INVALID_NODE_NAME");
    }

    if (priorityValue === undefined) {
      throw new AstError("MISSING_PRIORITY_VALUE");
    }
    const priority: NodePriority = { __brandId: "NodePriority", value: priorityValue };

    this.line = line;
    this.name = name;
    this.priority = priority;
  }
}

export class HelperNodeStatement {
  type = "helper";
  line: number;
  name: string;
  initValue: number = 0;
  priority: NodePriority;

  constructor(name: string, initValue: string | number | undefined, priorityValue: number | undefined, line: number) {
    if (!UPPERCASE_REGEX.test(name)) {
      throw new AstError("INVALID_NODE_NAME");
    }

    if (priorityValue === undefined) {
      throw new AstError("MISSING_PRIORITY_VALUE");
    }
    const priority: NodePriority = { __brandId: "NodePriority", value: priorityValue };

    this.line = line;
    this.name = name;
    this.priority = priority;

    if (initValue !== undefined) {
      const parsedInitValue = typeof initValue === "string" ? toInt32(initValue) : initValue;
      if (parsedInitValue === undefined || !isInInt32(parsedInitValue)) {
        throw new AstError("VALUE_OUT_OF_RANGE");
      }
      this.initValue = parsedInitValue;
    }
  }
}

export type EdgeExpression = EdgeAddExpression | EdgeSubExpression;

export class EdgeAddExpression {
  type = "edge_add";
  line: number;
  from: string;
  to: string;

  constructor(from: string, to: string, line: number) {
    if (!UPPERCASE_REGEX.test(from) || !UPPERCASE_REGEX.test(to)) {
      throw new AstError("INVALID_NODE_NAME");
    }
    this.line = line;
    this.from = from;
    this.to = to;
  }
}

export class EdgeSubExpression {
  type = "edge_sub";
  line: number;
  from: string;
  to: string;

  constructor(from: string, to: string, line: number) {
    if (!UPPERCASE_REGEX.test(from) || !UPPERCASE_REGEX.test(to)) {
      throw new AstError("INVALID_NODE_NAME");
    }
    this.line = line;
    this.from = from;
    this.to = to;
  }
}
