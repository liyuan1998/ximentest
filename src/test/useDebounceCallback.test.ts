import { describe, expect, it, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounceCallback } from "../hooks/useDebounceCallback";

describe("useDebounceCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers(); // 启用假定时器
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers(); // 恢复真实定时器
  });

  it("should call callback immediately on first trigger", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceCallback(fn, 200));

    act(() => { result.current(); });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should NOT call callback again within delay period", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceCallback(fn, 200));

    act(() => { result.current(); });
    act(() => { result.current(); });
    act(() => { result.current(); });

    expect(fn).toHaveBeenCalledTimes(1); // 后续触发被防抖拦截
  });

  it("should call callback again after delay period", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceCallback(fn, 200));

    act(() => { result.current(); });
    expect(fn).toHaveBeenCalledTimes(1);

    // 快进时间
    act(() => {
      vi.advanceTimersByTime(201);
    });

    act(() => { result.current(); });
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should use latest callback reference (no stale closure)", () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ cb }) => useDebounceCallback(cb, 200),
      { initialProps: { cb: fn1 } },
    );

    act(() => { result.current(); });
    expect(fn1).toHaveBeenCalledTimes(1);

    // 更新回调
    rerender({ cb: fn2 });

    act(() => {
      vi.advanceTimersByTime(201);
    });

    act(() => { result.current(); });
    expect(fn2).toHaveBeenCalledTimes(1); // 应该调用最新回调
    expect(fn1).toHaveBeenCalledTimes(1); // 旧回调不应再被调用
  });

  it("should default to 200ms delay", () => {
    const fn = vi.fn();
    const { result } = renderHook(() => useDebounceCallback(fn));

    act(() => { result.current(); });
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
