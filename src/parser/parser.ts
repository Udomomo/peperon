import { InputNodeStatement, OutputNodeStatement, HelperNodeStatement, EdgeSubExpression, EdgeAddExpression, Program } from "../ast/ast.js";
import { tokenType, type Token, type TokenType } from "../ast/token.js";
import { toLocation } from "../errors/errors.js";
import type { Lexer } from "../lexer/lexer.js";
import { ParserError } from "./errors.js";

export class Parser {
  lexer: Lexer;

  // 今いる位置のトークン。
  token: Token = { type: tokenType.EOF, value: "", line: 1, column: 0 };

  // 次のトークン。
  peekToken: Token = { type: tokenType.EOF, value: "", line: 1, column: 0 };

  constructor(lexer: Lexer) {
    this.lexer = lexer;

    this.readToken();
    this.readToken();
  }

  readToken() {
    this.token = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  parseProgram() {
    const program = new Program();

    while (this.token.type != tokenType.EOF) {
      switch (this.token.type) {
        case tokenType.INPUT:
        case tokenType.OUTPUT:
        case tokenType.HELPER:
          program.statements.push(this.parseDeclarationStatement());
          break;
        case tokenType.NODE:
          program.statements.push(this.parseExpressionStatement());
          break;
        default:
          throw new ParserError(
            "Failed to parse program",
            toLocation(this.token),
            "invalid token",
            "INVALID_TOKEN",
          );
      }
      this.readToken();
    }

    return program;
  }

  parseDeclarationStatement() {
    const keyword = this.token;
    const nodeExpectedToken = this.peekToken;

    if (nodeExpectedToken.type != tokenType.NODE) {
      throw new ParserError(
        "Failed to parse program",
        toLocation(nodeExpectedToken),
        "node name expected after 'input'",
        "NODE_EXPECTED",
      );
    }
    this.readToken();
    const node = this.token;

    const initValueToken = this.parseInitValueToken(keyword);

    const priorityExpectedToken = this.peekToken;

    if (priorityExpectedToken.type != tokenType.PRIORITY) {
      throw new ParserError(
        "Failed to parse program",
        toLocation(priorityExpectedToken),
        "priority expected after node name",
        "PRIORITY_EXPECTED",
      );
    }
    this.readToken();
    const priority = this.token;

    switch (keyword.type) {
      case tokenType.INPUT:
        return new InputNodeStatement(node.value, initValueToken?.value ?? "", Number(priority.value));
      case tokenType.OUTPUT:
        return new OutputNodeStatement(node.value, Number(priority.value));
      case tokenType.HELPER:
        return new HelperNodeStatement(node.value, initValueToken?.value, Number(priority.value));
      default: {
        throw new ParserError(
          "Failed to parse program",
          toLocation(keyword),
          "invalid node type",
          "INVALID_NODE_TYPE",
        );
      }
    }
  }

  parseInitValueToken(keyword: Token) {
    // 出力ノードの場合はinit valueは指定できないので何もしない。
    if (keyword.type == tokenType.OUTPUT) {
      return undefined;
    }

    const initKeywordExpectedToken = this.peekToken;

    if (initKeywordExpectedToken.type != tokenType.INIT) {
      if (keyword.type == tokenType.INPUT) {
        throw new ParserError(
          "Failed to parse program",
          toLocation(initKeywordExpectedToken),
          "init value expected after input node",
          "INIT_VALUE_EXPECTED",
        );
      }
      // ヘルパーノードの場合、init valueは任意なので、なければ何もしない。
      return undefined;
    }
    this.readToken();
    const initValueExpectToken = this.peekToken;
    
    if (initValueExpectToken.type != tokenType.INITVALUE) {
      throw new ParserError(
        "Failed to parse program",
        toLocation(initValueExpectToken),
        "invalid init value after 'init'",
        "INIT_VALUE_EXPECTED",
      );
    }
    this.readToken();
    const initValueToken = this.token;

    return initValueToken;
  }

  parseExpressionStatement() {
    const node = this.token;
    const operatorExpectedToken = this.peekToken;

    if (operatorExpectedToken.type != tokenType.EDGE_ADD && operatorExpectedToken.type != tokenType.EDGE_SUB) {
      throw new ParserError(
        "Failed to parse program",
        toLocation(operatorExpectedToken),
        "edge operator expected after node name",
        "EDGE_OPERATOR_EXPECTED",
      );
    }
    this.readToken();

    const nodeExpectedToken = this.peekToken;

    if (nodeExpectedToken.type != tokenType.NODE) {
      throw new ParserError(
        "Failed to parse program",
        toLocation(nodeExpectedToken),
        "node name expected after edge operator",
        "MISSING_OPERATION_TARGET_NODE",
      );
    }

    this.readToken();
    const targetNode = this.token;

    switch (operatorExpectedToken.type) {
      case tokenType.EDGE_ADD:
        return new EdgeAddExpression(node.value, targetNode.value);
      case tokenType.EDGE_SUB:
        return new EdgeSubExpression(node.value, targetNode.value);
    }
  }
}
