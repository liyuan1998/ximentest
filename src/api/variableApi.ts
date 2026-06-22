import type { VariableRow, DataType, AddRowInput } from "../types/variable";
import { DATA_TYPE_CONFIG } from "../types/variable";

// ---------------------------------------------------------------------------
// Mock API layer — simulates a real backend with Promise + setTimeout
// ---------------------------------------------------------------------------

let _data: VariableRow[] = [];
let _nextId = 1;

function delay(ms = 400): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Fetch all variables (no pagination) */
export async function fetchVariables(): Promise<ApiResponse<VariableRow[]>> {
  await delay();
  return {
    success: true,
    data: [..._data],
  };
}

/** Add a new variable */
export async function addVariable(input: AddRowInput): Promise<ApiResponse<VariableRow>> {
  await delay();
  const newRow: VariableRow = {
    id: `id-${_nextId++}`,
    index: _data.length + 1,
    ...input,
  };
  _data = [..._data, newRow];
  return { success: true, data: newRow };
}

/** Delete variables by stable ids */
export async function deleteVariables(ids: string[]): Promise<ApiResponse<null>> {
  await delay();
  const idSet = new Set(ids);
  _data = _data.filter((r) => !idSet.has(r.id));
  reindex();
  return { success: true, data: null };
}

/** Update a single cell — returns the updated row only */
export async function updateVariable(
  id: string,
  field: "name" | "dataType" | "defaultValue" | "comment",
  value: string,
): Promise<ApiResponse<VariableRow>> {
  await delay();
  let updated: VariableRow | null = null;
  _data = _data.map((r) => {
    if (r.id !== id) return r;
    if (field === "dataType") {
      const dt = value as DataType;
      const config = DATA_TYPE_CONFIG[dt];
      updated = { ...r, dataType: dt, defaultValue: config.defaultValue };
      return updated;
    }
    updated = { ...r, [field]: value };
    return updated;
  });
  return { success: true, data: updated! };
}

/** Recalculate index values after delete */
function reindex() {
  _data = _data.map((r, i) => ({ ...r, index: i + 1 }));
}

/** Reset mock data (for testing) */
export function resetVariables() {
  _data = [];
  _nextId = 1;
}
