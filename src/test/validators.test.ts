import { describe, it, expect } from "vitest";
import { validateName } from "../validators/validateName";
import {
  validateDefaultValue,
  validateBoolValue,
  validateIntValue,
  normalizeBool,
} from "../validators/validateDefaultValue";

describe("validateName", () => {
  it("should reject empty string", () => {
    expect(validateName("", [])).toBe("Name cannot be empty");
    expect(validateName("   ", [])).toBe("Name cannot be empty");
  });

  it("should accept unique name", () => {
    expect(validateName("counter", ["timer", "flag"])).toBeNull();
  });

  it("should reject duplicate name (case-insensitive)", () => {
    expect(validateName("Counter", ["counter", "flag"])).toBe("Name already exists");
    expect(validateName("COUNTER", ["counter"])).toBe("Name already exists");
  });

  it("should allow renaming to same value (editing existing row)", () => {
    expect(validateName("counter", ["counter", "flag"], "counter")).toBeNull();
    expect(validateName("Counter", ["counter", "flag"], "counter")).toBeNull();
  });
});

describe("validateBoolValue", () => {
  it("should accept true/false in any case", () => {
    expect(validateBoolValue("true")).toBeNull();
    expect(validateBoolValue("TRUE")).toBeNull();
    expect(validateBoolValue("false")).toBeNull();
    expect(validateBoolValue("FALSE")).toBeNull();
    expect(validateBoolValue("True")).toBeNull();
  });

  it("should reject invalid values", () => {
    expect(validateBoolValue("yes")).toBe("BOOL value must be TRUE or FALSE");
    expect(validateBoolValue("1")).toBe("BOOL value must be TRUE or FALSE");
    expect(validateBoolValue("")).toBe("BOOL value must be TRUE or FALSE");
  });
});

describe("normalizeBool", () => {
  it("should normalize to uppercase", () => {
    expect(normalizeBool("true")).toBe("TRUE");
    expect(normalizeBool("False")).toBe("FALSE");
    expect(normalizeBool("TRUE")).toBe("TRUE");
    expect(normalizeBool("  true  ")).toBe("TRUE");
  });
});

describe("validateIntValue", () => {
  it("should accept valid integers", () => {
    expect(validateIntValue("0")).toBeNull();
    expect(validateIntValue("42")).toBeNull();
    expect(validateIntValue("-42")).toBeNull();
  });

  it("should accept boundary values", () => {
    expect(validateIntValue("-2147483648")).toBeNull();
    expect(validateIntValue("2147483647")).toBeNull();
  });

  it("should reject non-integer values", () => {
    expect(validateIntValue("3.14")).toBe("INT value must be an integer");
    expect(validateIntValue("abc")).toBe("INT value must be an integer");
    expect(validateIntValue("")).toBe("INT value must be an integer");
    expect(validateIntValue("1e5")).toBe("INT value must be an integer");
  });

  it("should reject out-of-range values", () => {
    expect(validateIntValue("-2147483649")).toBe("INT value out of range (min: -2147483648)");
    expect(validateIntValue("2147483648")).toBe("INT value out of range (max: 2147483647)");
    expect(validateIntValue("9999999999")).toBe("INT value out of range (max: 2147483647)");
  });
});

describe("validateDefaultValue", () => {
  it("should route to BOOL validator", () => {
    expect(validateDefaultValue("TRUE", "BOOL")).toBeNull();
    expect(validateDefaultValue("yes", "BOOL")).toBe("BOOL value must be TRUE or FALSE");
  });

  it("should route to INT validator", () => {
    expect(validateDefaultValue("123", "INT")).toBeNull();
    expect(validateDefaultValue("3.14", "INT")).toBe("INT value must be an integer");
  });
});
