const INT32_MAX = 2147483647;
const INT32_MIN = -2147483648;

export function isInInt32(value: number): boolean {
  return value >= INT32_MIN && value <= INT32_MAX;
}
