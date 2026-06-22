import { useRef, useCallback } from "react";

/**
 * 防抖 Hook：防止回调在指定时间内重复触发
 * @param callback 需要防抖的回调函数（无需外层 useCallback 包装）
 * @param delay 防抖延迟（ms），默认 200ms
 * @returns 防抖包装后的回调函数
 *
 * 特点：
 * - 使用 useRef 标记位，不触发 re-render
 * - 使用 ref 存储最新回调，无需外层 useCallback
 * - 适合按钮点击、键盘快捷键等场景
 * - 防止用户连点 和 脚本模拟触发
 */
export function useDebounceCallback(callback: () => void, delay = 200) {
  const disabledRef = useRef(false);
  const callbackRef = useRef(callback);
  callbackRef.current = callback; // 始终指向最新回调

  return useCallback(() => {
    if (disabledRef.current) return;
    disabledRef.current = true;
    callbackRef.current();
    setTimeout(() => { disabledRef.current = false; }, delay);
  }, [delay]);
}
