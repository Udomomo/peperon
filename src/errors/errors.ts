import { type Token } from "../ast/token.js";

/**
 * インタプリタ内の全てのエラーの基底となるクラス。
 */
export class InterpreterError extends Error {
  location: Location;
  reason: string;
  code: string;

  constructor(message: string, location: Location, reason: string, code: string) {
    const fullMessage = `${message} at ${location.line}:${location.column} (${reason})`;
    super(fullMessage);

    this.name = 'InterpreterError';
    this.location = location;
    this.reason = reason;
    this.code = code;
  }
}

export type Location = {
  // ソース上の行番号。1始まり。
  line: number;
  // 行内のカラム位置。tokenの先頭位置を示す。1始まり。
  column: number;
}

export function toLocation(token: Token): Location {
  return {
    line: token.line,
    column: token.column,
  };
}
