const INT32_MAX = 2147483647;
const INT32_MIN = -2147483648;

/**
 * 数値が32bit整数の範囲内に収まるかどうかを判定する。評価時に利用する想定。
 */
// 入力された値を数値にパースする処理はlexerで実施。
export function isInInt32(value: number): boolean {
  return Number.isInteger(value) && value >= INT32_MIN && value <= INT32_MAX;
}
