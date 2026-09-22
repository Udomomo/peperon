import { keywords, tokenType, type Token } from "../ast/token.js";

export class Lexer {
  input: string;
  // 今いる位置。実際に解析が終わった位置。
  position: number = 0;
  // 次に読む位置。
  readPosition: number = 0;
  // 今いる位置の文字。
  char: string = "";

  static readonly SPACE_CHARS: Set<string> = new Set([" ", "\t", "\n", "\r"]);
  static readonly DIGIT_REGEX = /^[0-9]$/;
  static readonly UPPERCASE_REGEX = /^[A-Z]$/;
  static readonly LOWERCASE_REGEX = /^[a-z]$/;
  static readonly EOL = "EOL";

  constructor(input: string) {
    this.input = input;
  }

  /**
   * 次の位置の文字を読み、charとpositionを更新する。readPositionはさらにその次にしておく。
   */
  readChar() {
    if (this.readPosition >= this.input.length) {
      this.position = this.readPosition;
      this.char = Lexer.EOL;
    } else {
      this.char = this.getChar(this.input, this.readPosition);
      this.position = this.readPosition;
      this.readPosition++;
    }
  }

  /**
   * 次の位置の文字を取得するだけで、charとpositionは更新しない。
   */
  peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return Lexer.EOL;
    }
    return this.getChar(this.input, this.readPosition);
  }

  private getChar(input: string, index: number): string {
    return input[index] ?? (() => { throw new Error(`Index out of bounds: input=${input}, index=${index}`); })();
  }

  /**
   * 次のtokenを返す。parserからの利用を想定している。
   */
  nextToken(): Token {
    do {
      this.readChar();
    } while (Lexer.SPACE_CHARS.has(this.char));

    // tokenの開始位置をoffsetとして返すため、記録しておく。
    const offset = this.position;

    switch (this.char) {
      case Lexer.EOL:
        return { type: tokenType.EOL, value: "", offset };
      case "-": {
        return this.readEdgeToken(offset);
      }
      case "@": {
        return this.readPriorityToken(offset);
      }
      default: {
        if (Lexer.UPPERCASE_REGEX.test(this.char)) {
          return { type: tokenType.NODE, value: this.char, offset };
        }
        else if (Lexer.LOWERCASE_REGEX.test(this.char)) {
          return this.readKeywordToken(this.char, offset);
        }
        else if (Lexer.DIGIT_REGEX.test(this.char)) {
          return this.readNumberToken(offset);
        }
        else {
          return { type: tokenType.INVALID, value: this.char, offset };
        }
      }
    }
  }

  private readEdgeToken(offset: number): Token {
    if (this.peekChar() === ">") {
      this.readChar();

      switch (this.peekChar()) {
        case "+":
          this.readChar();
          return { type: tokenType.EDGE_ADD, value: "->+", offset };
        case "-":
          this.readChar();
          return { type: tokenType.EDGE_SUB, value: "->-", offset };
        default:
          return { type: tokenType.EDGE_ADD, value: `->${this.peekChar()}`, offset };
      }
    }
    return { type: tokenType.INVALID, value: this.peekChar(), offset: this.readPosition };
  }

  private readPriorityToken(offset: number): Token {
    let value = "";
    while (Lexer.DIGIT_REGEX.test(this.peekChar())) {
      this.readChar();
      value += this.char;
    }

    if (value.length > 0) {
      return { type: tokenType.PRIORITY, value, offset };
    }
    return { type: tokenType.INVALID, value: `@${this.peekChar()}`, offset };
  }

  private readKeywordToken(firstLetter: string, offset: number): Token {
    let value = firstLetter;
    while (Lexer.LOWERCASE_REGEX.test(this.peekChar())) {
      this.readChar();
      value += this.char;
    }

    const keywordType = keywords.get(value);
    if (keywordType !== undefined) {
      return { type: keywordType, value, offset };
    } else {
      return { type: tokenType.INVALID, value, offset };
    }
  }

  private readNumberToken(offset: number): Token {
    let value = this.char;
    while (Lexer.DIGIT_REGEX.test(this.peekChar())) {
      this.readChar();
      value += this.char;
    }

    return { type: tokenType.NUMBER, value, offset };
  }
}
