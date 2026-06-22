import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVariableStore } from "../store/useVariableStore";
import type { VariableRow, DataType } from "../types/variable";

// ─── Mock the API layer ────────────────────────────────────────────
vi.mock("../api/variableApi", () => ({
  fetchVariables: vi.fn(),
  addVariable: vi.fn(),
  deleteVariables: vi.fn(),
  updateVariable: vi.fn(),
  resetVariables: vi.fn(),
}));

// ─── 每次测试前重置 store ──────────────────────────────────────────
beforeEach(() => {
  useVariableStore.getState().clearError();
  useVariableStore.setState({
    rows: [],
    loading: false,
    error: null,
    updatingIds: [],
  });
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const mockRow = (
  id: string,
  index: number,
  name: string,
  dataType: DataType | "" = "BOOL",
  defaultValue: string = "TRUE",
): VariableRow => ({
  id,
  index,
  name,
  dataType,
  defaultValue,
  comment: "",
});

describe("useVariableStore — async API integration", () => {
  it("loadRows sets rows on success", async () => {
    const { fetchVariables } = await import("../api/variableApi");
    (fetchVariables as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: [mockRow("abc1", 1, "Start")],
    });

    await useVariableStore.getState().loadRows();

    expect(useVariableStore.getState().rows).toHaveLength(1);
    expect(useVariableStore.getState().rows[0].name).toBe("Start");
    expect(useVariableStore.getState().rows[0].id).toBe("abc1");
    expect(useVariableStore.getState().loading).toBe(false);
  });

  it("loadRows sets error on failure", async () => {
    const { fetchVariables } = await import("../api/variableApi");
    (fetchVariables as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Network error",
    });

    await useVariableStore.getState().loadRows();

    expect(useVariableStore.getState().error).toBe("Network error");
    expect(useVariableStore.getState().loading).toBe(false);
  });

  it("insertEmptyRow calls addVariable and pushes returned row", async () => {
    const { addVariable } = await import("../api/variableApi");
    (addVariable as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockRow("abc1", 1, ""),
    });

    await useVariableStore.getState().insertEmptyRow();

    expect(addVariable).toHaveBeenCalledWith({
      name: "",
      dataType: "",
      defaultValue: "",
      comment: "",
    });
    expect(useVariableStore.getState().rows).toHaveLength(1);
    expect(useVariableStore.getState().rows[0].id).toBe("abc1");
  });

  it("insertEmptyRow sets error when API fails", async () => {
    const { addVariable } = await import("../api/variableApi");
    (addVariable as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Failed to add row",
    });

    await useVariableStore.getState().insertEmptyRow();

    expect(useVariableStore.getState().error).toBe("Failed to add row");
  });

  it("deleteRows calls deleteVariables and removes rows with reindex", async () => {
    useVariableStore.setState({
      rows: [
        mockRow("abc1", 1, "X"),
        mockRow("abc2", 2, "Y"),
      ],
    });

    const { deleteVariables } = await import("../api/variableApi");
    (deleteVariables as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: null,
    });

    await useVariableStore.getState().deleteRows(["abc1"]);

    expect(deleteVariables).toHaveBeenCalledWith(["abc1"]);
    expect(useVariableStore.getState().rows).toHaveLength(1);
    expect(useVariableStore.getState().rows[0].id).toBe("abc2");
    expect(useVariableStore.getState().rows[0].index).toBe(1); // reindex 成功
  });

  it("updateCell does optimistic update then confirms", async () => {
    useVariableStore.setState({
      rows: [mockRow("abc1", 1, "old")],
    });

    const { updateVariable } = await import("../api/variableApi");
    // Mock: API 返回更新后的单行
    (updateVariable as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      data: mockRow("abc1", 1, "new", "BOOL", "TRUE"),
    });

    await useVariableStore.getState().updateCell("abc1", "name", "new");

    expect(updateVariable).toHaveBeenCalledWith("abc1", "name", "new");
    // 成功后用 API 返回的数据 merge 到本地 state
    expect(useVariableStore.getState().rows[0].name).toBe("new");
    expect(useVariableStore.getState().updatingIds).not.toContain("abc1");
  });

  it("updateCell rolls back on API failure", async () => {
    useVariableStore.setState({
      rows: [mockRow("abc1", 1, "old")],
    });

    const { updateVariable } = await import("../api/variableApi");
    (updateVariable as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Update failed",
    });

    await useVariableStore.getState().updateCell("abc1", "name", "new");

    expect(useVariableStore.getState().rows[0].name).toBe("old");
    expect(useVariableStore.getState().error).toBe("Update failed");
  });

  it("clearError resets error state", () => {
    useVariableStore.setState({ error: "some error" });
    useVariableStore.getState().clearError();
    expect(useVariableStore.getState().error).toBeNull();
  });
});
