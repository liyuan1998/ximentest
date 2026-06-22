import type { DataType } from "../types/variable";

/**
 * Validate default value based on data type.
 * When dataType is "" (newly added row, AC2), returns null (no validation).
 */
export function validateDefaultValue(value: string, dataType: DataType | ""): string | null {
  if (dataType === "") {
    return null;
  }

  const trimmed = value.trim();

  if (dataType === "BOOL") {
    return validateBoolValue(trimmed);
  }

  if (dataType === "INT") {
    return validateIntValue(trimmed);
  }

  return null;
}

/** Validate BOOL: accept true/false (case-insensitive) */
export function validateBoolValue(value: string): string | null {
  const lower = value.toLowerCase();
  if (lower === "true" || lower === "false") {
    return null;
  }
  return "BOOL value must be TRUE or FALSE";
}

/** Normalize BOOL display: uppercase */
export function normalizeBool(value: string): string {
  const lower = value.trim().toLowerCase();
  if (lower === "true") return "TRUE";
  if (lower === "false") return "FALSE";
  return value;
}

/** Validate INT: integer in [-2147483648, 2147483647] */
export function validateIntValue(value: string): string | null {
  // Must be a valid integer (no decimals, no scientific notation)
  if (!/^-?\d+$/.test(value)) {
    return "INT value must be an integer";
  }

  const num = Number(value);

  // Check for overflow beyond safe integer (JS safe integer is larger but spec defines INT range)
  if (num < -2_147_483_648) {
    return "INT value out of range (min: -2147483648)";
  }

  if (num > 2_147_483_647) {
    return "INT value out of range (max: 2147483647)";
  }

  return null;
}
