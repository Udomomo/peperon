import { InterpreterError, type Location } from "../errors/errors.js";

export class LexerError extends InterpreterError {
  constructor(message: string, location: Location, reason: string, code: string) {
    super(message, location, reason, code);
    this.name = 'LexerError';
  }
}
