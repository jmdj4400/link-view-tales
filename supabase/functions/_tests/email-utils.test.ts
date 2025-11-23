import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { validateEmail } from "../_shared/email-utils.ts";

/**
 * Basic tests for email utility functions
 * Run with: deno test --allow-env
 */

Deno.test("validateEmail - valid email passes", () => {
  const result = validateEmail("user@example.com");
  assertEquals(result.valid, true);
  assertEquals(result.error, undefined);
});

Deno.test("validateEmail - invalid format fails", () => {
  const result = validateEmail("not-an-email");
  assertEquals(result.valid, false);
  assertEquals(typeof result.error, "string");
});

Deno.test("validateEmail - empty email fails", () => {
  const result = validateEmail("");
  assertEquals(result.valid, false);
  assertEquals(result.error, "Email cannot be empty");
});

Deno.test("validateEmail - missing @ symbol fails", () => {
  const result = validateEmail("userexample.com");
  assertEquals(result.valid, false);
  assertEquals(result.error, "Invalid email format");
});

Deno.test("validateEmail - too long email fails", () => {
  const longEmail = "a".repeat(256) + "@example.com";
  const result = validateEmail(longEmail);
  assertEquals(result.valid, false);
  assertEquals(result.error, "Email is too long (max 255 characters)");
});

Deno.test("validateEmail - trims whitespace", () => {
  const result = validateEmail("  user@example.com  ");
  assertEquals(result.valid, true);
});

Deno.test("validateEmail - null/undefined fails", () => {
  // @ts-ignore - testing invalid input
  const result1 = validateEmail(null);
  assertEquals(result1.valid, false);
  
  // @ts-ignore - testing invalid input
  const result2 = validateEmail(undefined);
  assertEquals(result2.valid, false);
});
