import { type EdgeExpression, type NodeStatement, type Program, type Statement } from "../ast/ast.js";
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
  readonly MAX_LOOPS = 1000000;

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

  evaluate(program: Program, stdOut: (message: string) => void): number {
    const statements = program.statements;
    this.buildGraph(statements);

    this.proceed(stdOut);
    return this.nodesByPriority.find(node => node.name === this.outputNodeName)?.value ?? 0;
  }

  /**
   * statementを解釈してグラフを作る。
   */
  private buildGraph(statements: Statement[]): void {
    const nodes: Node[] = [];

    // interpretNodeStatement内で、priorityの重複チェック用途のみに使う配列。
    const priorities: number[] = [];

    for (const statement of statements) {
      if (statement.type === "input" || statement.type === "output" || statement.type === "helper") {
        const node = this.interpretNodeStatement(statement, priorities);
        nodes.push(node);
        priorities.push(node.priority);
      } else {
        this.interpretEdgeExpression(statement);
      }
    }

    // 作ったノードを優先度が高い順に並べて記録する。
    this.nodesByPriority = nodes.sort((a, b) => b.priority - a.priority);
  }

  /**
   * node定義のstatementを1行ずつ解釈する。
   */
  private interpretNodeStatement(statement: NodeStatement, existingPriorities: number[]): Node {
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
    const node = {
      name: statement.name,
      value: statement.initValue,
      priority: statement.priority.value,
    };
    this.graph.set(statement.name, []);
    return node;
  }

  /**
   * operationのstatementを1行ずつ解釈する。
   */
  private interpretEdgeExpression(expression: EdgeExpression): void {
    if (!this.graph.has(expression.from)) {
      throw new EvaluatorError(
        `Node ${expression.from} is not defined.`,
        {line: expression.line, column: 1},
        "undefined node",
        "UNDEFINED_NODE",
      );
    }
    if (!this.graph.has(expression.to)) {
      throw new EvaluatorError(
        `Node ${expression.to} is not defined.`,
        {line: expression.line, column: 1},
        "undefined node",
        "UNDEFINED_NODE",
      );
    }

    const existingDestinations = this.graph.get(expression.from) || [];
    if (existingDestinations.some(dest => dest.nodeName === expression.to)) {
      throw new EvaluatorError(
        `Edge from ${expression.from} to ${expression.to} is already defined.`,
        {line: expression.line, column: 1},
        "duplicate edge definition",
        "DUPLICATE_EDGE",
      );
    }

    const weight = expression.type === "edge_add" ? 1 : -1;
    const newDestination: Destination = { nodeName: expression.to, weight };
    this.graph.set(expression.from, [...existingDestinations, newDestination]);
  }

  /**
   * グラフに基づき、計算を1ステップ進める。
   */
  proceed(stdOut: (message: string) => void): void {
    let counter = 0;

    while (true) {
      if (counter > this.MAX_LOOPS) {
        throw new EvaluatorError(
          `Exceeded maximum number of steps (${this.MAX_LOOPS}). Possible infinite loop.`,
          {line: 1, column: 1},
          "infinite loop detected",
          "INFINITE_LOOP",
        );
      }

      // 優先度が高いノードから順に確認。
      // ノードの値が正の数であり、graph上にdestを持っている場合、そのnodeが次の操作対象となる。もしそのようなnodeがなければ終了する。
      const actorNode = this.nodesByPriority.find(node => node.value > 0 && (this.graph.get(node.name)?.length ?? 0) > 0);
      if (!actorNode) {
        break;
      }

      // graphに従って、destのnodeの値を更新する。
      const destinations = this.graph.get(actorNode.name) ?? [];
      for (const dest of destinations) {
        const destNode = this.nodesByPriority.find(node => node.name === dest.nodeName);
        if (destNode) {
          destNode.value = destNode.value + dest.weight;
        }
      }
      // actorNodeの値を1減らす。
      actorNode.value--;

      // 各ノードの値を、stdOutを使って1行で出力する。
      stdOut(this.nodesByPriority.map(node => `${node.name}: ${node.value}`).join(" "));

      counter++;
    }
  }
}
