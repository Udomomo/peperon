/**
 * インタプリタ内の全てのエラーの基底となるクラス。
 */
export class InterpreterError extends Error {
  location: Location;
  reason: string;
  code: string;

  constructor(message: string, location: Location, reason: string, code: string) {
    const fullMessage = `${message} at ${location.filePath}:${location.line} (${reason})`;
    super(fullMessage);

    this.name = 'InterpreterError';
    this.location = location;
    this.reason = reason;
    this.code = code;
  }
}

export type Location = {
  filePath: string;
  line: number;
}
