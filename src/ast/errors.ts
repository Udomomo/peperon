export class AstError extends Error {
  code: string;
  
  constructor(code: string) {
    super(`Ast error: ${code}`);
    this.code = code;
  }
}