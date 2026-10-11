const INT32_MAX = 2147483647;
const INT32_MIN = -2147483648;
const INT32_MAX_BIGINT = BigInt(INT32_MAX);
const INT32_MIN_BIGINT = BigInt(INT32_MIN);

/**
 * 数値が32bit整数の範囲内に収まるかどうかを判定する。評価時に利用する想定。
 */
export function isInInt32(value: number): boolean {
  return Number.isInteger(value) && value >= INT32_MIN && value <= INT32_MAX;
}

/**
 * 文字列を32bit整数に変換する。変換できない場合はundefinedを返す。
 * Numberによる丸めを避けるため、範囲判定にはBigIntを利用する。
 */
export function toInt32(value: string): number | undefined {
  if (!/^-?\d+$/.test(value)) {
    return undefined;
  }

  const parsedValue = BigInt(value);
  if (parsedValue < INT32_MIN_BIGINT || parsedValue > INT32_MAX_BIGINT) {
    return undefined;
  }

  return Number(parsedValue);
}
