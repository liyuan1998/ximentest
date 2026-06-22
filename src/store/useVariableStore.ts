import { create } from "zustand";
import type { DataType, VariableRow } from "../types/variable";
import { DATA_TYPE_CONFIG } from "../types/variable";
import type { ApiResponse } from "../api/variableApi";
import * as api from "../api/variableApi";

interface VariableStore {
  rows: VariableRow[];
  loading: boolean;
  error: string | null;

  /** 当前正在通过 API 更新的行 id 列表（行级 spinner） */
  updatingIds: string[];

  /** 新增行的 id，用于自动聚焦 Name 编辑框 */
  autoEditId: string | null;

  /** 加载全量数据 */
  loadRows: () => Promise<void>;

  /** 在表格末尾插入一行空行（AC2） */
  insertEmptyRow: () => Promise<void>;

  /** 删除选中行（按稳定 id），前端 filter + reindex */
  deleteRows: (ids: string[]) => Promise<void>;

  /** 更新单元格（按稳定 id），乐观更新 */
  updateCell: (
    id: string,
    field: "name" | "dataType" | "defaultValue" | "comment",
    value: string,
  ) => Promise<void>;

  /** 清除错误 */
  clearError: () => void;
}

/**
 * 统一 API 调用包装器：
 * - catch 异常，转换为统一 { success: false, error } 格式
 * - 所有 store 方法通过此函数调用 API，无需各自写 try/catch
 */
async function safeCall<T>(
  apiCall: Promise<ApiResponse<T>>,
): Promise<ApiResponse<T>> {
  try {
    return await apiCall;
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error",
    };
  }
}

export const useVariableStore = create<VariableStore>((set, get) => ({
  rows: [],
  loading: false,
  error: null,
  updatingIds: [],
  autoEditId: null,

  clearError: () => set({ error: null }),

  loadRows: async () => {
    set({ loading: true, error: null });
    const res = await safeCall(api.fetchVariables());
    if (res.success && res.data) {
      set({ rows: res.data, loading: false });
    } else {
      set({ error: res.error ?? "Failed to load data", loading: false });
    }
  },

  insertEmptyRow: async () => {
    set({ error: null });
    const res = await safeCall(
      api.addVariable({ name: "", dataType: "", defaultValue: "", comment: "" }),
    );
    if (res.success && res.data) {
      set((state) => ({ rows: [...state.rows, res.data!] }));
    } else {
      set({ error: res.error ?? "Failed to add row" });
    }
  },

  deleteRows: async (ids) => {
    set({ error: null });
    const res = await safeCall(api.deleteVariables(ids));
    if (res.success) {
      set((state) => ({
        rows: state.rows
          .filter((r) => !ids.includes(r.id))
          .map((r, i) => ({ ...r, index: i + 1 })),
      }));
    } else {
      set({ error: res.error ?? "Failed to delete row" });
    }
  },

  updateCell: async (id, field, value) => {
    const currentUpdating = get().updatingIds;
    set({ updatingIds: [...currentUpdating, id] });

    const prevRows = get().rows;
    // 乐观更新：前端先改
    const optimisticRows = prevRows.map((row) => {
      if (row.id !== id) return row;
      if (field === "dataType") {
        const newType = value as DataType;
        const config = DATA_TYPE_CONFIG[newType];
        return { ...row, dataType: newType, defaultValue: config.defaultValue };
      }
      return { ...row, [field]: value };
    });
    set({ rows: optimisticRows, error: null });

    const res = await safeCall(api.updateVariable(id, field, value));
    if (res.success) {
      set((state) => ({
        updatingIds: state.updatingIds.filter((uid) => uid !== id),
      }));
    } else {
      set({
        rows: prevRows,
        error: res.error ?? "Failed to update",
        updatingIds: get().updatingIds.filter((uid) => uid !== id),
      });
    }
  },
}));
