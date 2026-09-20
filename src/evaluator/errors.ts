import { InterpreterError, type Location } from "../errors/errors.js";

export class EvaluatorError extends InterpreterError {
  constructor(message: string, location: Location, reason: string, code: string) {
    super(message, location, reason, code);
    this.name = 'EvaluatorError';
  }
}
