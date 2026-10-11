import { expect, test } from "vitest";

test("isInInt32", async () => {
  const { isInInt32, toInt32 } = await import("./isInInt32.js");

  expect(isInInt32(0)).toBe(true);
  expect(isInInt32(2147483647)).toBe(true);
  expect(isInInt32(-2147483648)).toBe(true);
  expect(isInInt32(2147483648)).toBe(false);
  expect(isInInt32(-2147483649)).toBe(false);
  expect(isInInt32(1.5)).toBe(false);
  expect(isInInt32(NaN)).toBe(false);

  expect(toInt32("0")).toBe(0);
  expect(toInt32("2147483647")).toBe(2147483647);
  expect(toInt32("-2147483648")).toBe(-2147483648);
  expect(toInt32("2147483648")).toBeUndefined();
  expect(toInt32("-2147483649")).toBeUndefined();
  expect(toInt32("1.5")).toBeUndefined();
  expect(toInt32("not a number")).toBeUndefined();
  expect(toInt32("")).toBeUndefined();
  expect(toInt32("2147483647.0000000000000001")).toBeUndefined();
});
