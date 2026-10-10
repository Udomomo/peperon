import { keywords, tokenType, type Token } from "../ast/token.js";

export class Lexer {
  input: string;
  // 今いる位置。実際に解析が終わった位置。
  position: number = 0;
  // 次に読む位置。
  readPosition: number = 0;
  // 今いる位置の文字。
  char: string = "";
  // 今いる行。1始まり。
  line: number = 1;

  // 現在の行の先頭位置。columnの計算に使う。
  private lineStartPosition: number = 0;

  static readonly SPACE_CHARS: Set<string> = new Set([" ", "\t", "\n", "\r"]);
  static readonly DIGIT_REGEX = /^[0-9]$/;
  static readonly UPPERCASE_REGEX = /^[A-Z]$/;
  static readonly LOWERCASE_REGEX = /^[a-z]$/;
  static readonly EOF = "EOF";

  constructor(input: string) {
    this.input = input;
  }

  /**
   * 次の位置の文字を読み、charとpositionを更新する。readPositionはさらにその次にしておく。
   */
  readChar() {
    if (this.readPosition >= this.input.length) {
      this.position = this.readPosition;
      this.char = Lexer.EOF;
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
      return Lexer.EOF;
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
    this.skipSpaces();

    // tokenの開始位置をlineとcolumnとして返す。どちらも1始まりにする。
    const line = this.line;
    const column = this.position - this.lineStartPosition + 1;

    switch (this.char) {
      case Lexer.EOF:
        return { type: tokenType.EOF, value: "", line, column };
      case "#": {
        return { type: tokenType.COMMENT, value: "", line, column };
      }
      case "-": {
        if (this.peekChar() === ">") {
          return this.readEdgeToken(line, column);
        }
        else {
          // 負の数値の可能性があるため、数値トークンとしての処理を試みる。
          return this.readNumberToken(line, column);
        }
      }
      case "@": {
        return this.readPriorityToken(line, column);
      }
      default: {
        if (Lexer.UPPERCASE_REGEX.test(this.char)) {
          return { type: tokenType.NODE, value: this.char, line, column };
        }
        else if (Lexer.LOWERCASE_REGEX.test(this.char)) {
          return this.readKeywordToken(this.char, line, column);
        }
        else if (Lexer.DIGIT_REGEX.test(this.char)) {
          return this.readNumberToken(line, column);
        }
        else {
          return { type: tokenType.INVALID, value: this.char, line, column };
        }
      }
    }
  }

  private readEdgeToken(line: number, column: number): Token {
    this.readChar(); // '>'を読み飛ばす
    switch (this.peekChar()) {
      case "+":
        this.readChar();
        return { type: tokenType.EDGE_ADD, value: "->+", line, column };
      case "-":
        this.readChar();
        return { type: tokenType.EDGE_SUB, value: "->-", line, column };
      default:
        return { type: tokenType.INVALID, value: `->${this.peekChar()}`, line, column };
    }
  }

  private readPriorityToken(line: number, column: number): Token {
    let value = "";
    while (Lexer.DIGIT_REGEX.test(this.peekChar())) {
      this.readChar();
      value += this.char;
    }

    if (value.length > 0) {
      return { type: tokenType.PRIORITY, value, line, column };
    }
    return { type: tokenType.INVALID, value: `@${this.peekChar()}`, line, column };
  }

  private readKeywordToken(firstLetter: string, line: number, column: number): Token {
    let value = firstLetter;
    while (Lexer.LOWERCASE_REGEX.test(this.peekChar())) {
      this.readChar();
      value += this.char;
    }

    const keywordType = keywords.get(value);
    if (keywordType !== undefined) {
      return { type: keywordType, value, line, column };
    } else {
      return { type: tokenType.INVALID, value, line, column };
    }
  }

  private readNumberToken(line: number, column: number): Token {
    let value = this.char;
    while (Lexer.DIGIT_REGEX.test(this.peekChar())) {
      this.readChar();
      value += this.char;
    }

    // マイナス符号の後に数値が続かない場合は不正なトークンである。
    if (value === "-") {
      return { type: tokenType.INVALID, value, line, column };
    }
    return { type: tokenType.INITVALUE, value, line, column };
  }

  private skipSpaces() {
    do {
      this.readChar();

      if (this.char === "\n") {
        this.line++;
        this.lineStartPosition = this.position + 1;
      } else if (this.char === "\r" && this.peekChar() !== "\n") {
        this.line++;
        this.lineStartPosition = this.position + 1;
      }
    } while (Lexer.SPACE_CHARS.has(this.char));
  }
}
