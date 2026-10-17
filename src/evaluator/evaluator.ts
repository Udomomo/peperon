import { type NodeStatement, type Program, type Statement } from "../ast/ast.js";
import { EvaluatorError } from "./errors.js";

type Node = {
  name: string;
  value: number;  
  priority: number;
}

type Destination = {
  nodeName: string;
  weight: number;
}

export class Evaluator {
  /**
   * ノードを優先度が高い順に保持する配列。
   */
  nodesByPriority: Node[] = [];

  /**
   * ノードの関係を隣接グラフとして保持する配列。
   * ノードの名前をキーとし、そこから矢印が伸びる先のノードの名前と重みの配列を値として保持する。
   * 例: A ->+ B, A ->- C の場合、graph.get("A") は [{ name: "B", weight: 1 }, { name: "C", weight: -1 }] となる。
   */
  graph: Map<string, Destination[]> = new Map();

  outputNodeName: string = "";

  evaluate(program: Program): void {
    const statements = program.statements;
  }

  /**
   * statementを解釈してグラフを作る。
   */
  buildGraph(statements: Statement[]): void {
    const nodes: Node[] = [];
    const priorities: number[] = [];

    for (const statement of statements) {
      if (statement.type === "input" || statement.type === "output" || statement.type === "helper") {
        const node = this.interpretNodeStatement(statement, priorities);
        nodes.push(node);
        priorities.push(node.priority);
      } else {

      }
    }
  }

  /**
   * node定義のstatementを1行ずつ解釈する。
   */
  interpretNodeStatement(statement: NodeStatement, existingPriorities: number[]): Node {
    if (this.graph.has(statement.name)) {
      throw new EvaluatorError(
        `Node ${statement.name} is already defined.`,
        {line: statement.line, column: 1},
        "duplicate node definition",
        "DUPLICATE_NODE",
      );
    }

    if (existingPriorities.includes(statement.priority.value)) {
      throw new EvaluatorError(
        `Node ${statement.name} has a priority value that is already used by another node.`,
        {line: statement.line, column: 1},
        "duplicate priority value",
        "DUPLICATE_PRIORITY_VALUE",
      );
    }

    if (statement.type === "output") {
      if (this.outputNodeName) {
        throw new EvaluatorError(
          `Output node is already defined as ${this.outputNodeName}.`,
          {line: statement.line, column: 1},
          "duplicate output node definition",
          "DUPLICATE_OUTPUT_NODE",
        );
      }
      this.outputNodeName = statement.name;
    }
    return {
      name: statement.name,
      value: statement.priority.value,
      priority: statement.priority.value,
    };
  }
}