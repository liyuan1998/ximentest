/**
 * Validate variable name
 * - must be non-empty
 * - must be unique (case-insensitive) among existing names
 */
export function validateName(
  name: string,
  existingNames: string[],
  currentName?: string,
): string | null {
  const trimmed = name.trim();

  if (!trimmed) {
    return "Name cannot be empty";
  }

  // If editing an existing row, exclude its own name from uniqueness check
  const isDuplicate = existingNames.some(
    (n) => n.toLowerCase() === trimmed.toLowerCase() && n !== (currentName ?? ""),
  );

  if (isDuplicate) {
    return "Name already exists";
  }

  return null;
}
