import { useEffect, useCallback } from "react";
import { useDebounceCallback } from "./useDebounceCallback";

interface ShortcutHandlers {
  onDelete?: () => void;
  onAdd?: () => void;
}

/**
 * Global keyboard shortcuts for the variable table editor
 * - Delete: delete selected row
 * - Ctrl/Cmd + N: add new row
 * 内置 200ms 防抖，防止长按重复触发
 */
export function useKeyboardShortcuts({ onDelete, onAdd }: ShortcutHandlers) {
  const debouncedDelete = useDebounceCallback(() => { onDelete?.(); });
  const debouncedAdd = useDebounceCallback(() => { onAdd?.(); });

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when editing text
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Delete" && onDelete) {
        e.preventDefault();
        debouncedDelete();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "n" && onAdd) {
        e.preventDefault();
        debouncedAdd();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDelete, onAdd, debouncedDelete, debouncedAdd]);
}
