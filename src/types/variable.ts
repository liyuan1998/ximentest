/** Supported data types for variable table */
export const DATA_TYPES = ["BOOL", "INT"] as const;
export type DataType = (typeof DATA_TYPES)[number];
/** Allow empty string for newly added rows (AC2: all fields default to empty) */
export type DataTypeOrEmpty = DataType | "";

/** A single variable row in the table */
export interface VariableRow {
  id: string;
  index: number;
  name: string;
  dataType: DataTypeOrEmpty;
  defaultValue: string;
  comment: string;
}

/** Input shape when adding a new row (no id / index — assigned by the API) */
export type AddRowInput = Omit<VariableRow, "id" | "index">;

/** Data type configuration — adding a new type = add one entry here */
export interface DataTypeConfig {
  defaultValue: string;
  displayDefault: string;
  range?: { min: number; max: number };
}

export const DATA_TYPE_CONFIG: Record<DataType, DataTypeConfig> = {
  BOOL: {
    defaultValue: "TRUE",
    displayDefault: "TRUE",
  },
  INT: {
    defaultValue: "0",
    displayDefault: "0",
    range: { min: -2_147_483_648, max: 2_147_483_647 },
  },
};

/** Error returned by validators */
export interface ValidationError {
  field: "name" | "defaultValue";
  message: string;
}

/**
 * Safe accessor for DATA_TYPE_CONFIG.
 * Returns undefined when dataType is empty (newly added row, AC2).
 */
export function getDataTypeConfig(dt: DataTypeOrEmpty): DataTypeConfig | undefined {
  if (dt === "") return undefined;
  return DATA_TYPE_CONFIG[dt];
}
