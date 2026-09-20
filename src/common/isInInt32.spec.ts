import { expect, test } from "vitest";

test("isInInt32", async () => {
  const { isInInt32 } = await import("./isInInt32.js");

  expect(isInInt32(0)).toBe(true);
  expect(isInInt32(2147483647)).toBe(true);
  expect(isInInt32(-2147483648)).toBe(true);
  expect(isInInt32(2147483648)).toBe(false);
  expect(isInInt32(-2147483649)).toBe(false);
});
