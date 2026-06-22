import { useEffect, useRef } from "react";

interface ShortcutHandlers {
  onDelete?: () => void;
  onAdd?: () => void;
}

/**
 * Global keyboard shortcuts for the variable table editor
 * - Delete: delete selected row
 * - Ctrl/Cmd + N: add new row
 * 内置 500ms 防抖，防止长按重复触发
 */
export function useKeyboardShortcuts({ onDelete, onAdd }: ShortcutHandlers) {
  // 防抖标记，防止长按/重复触发
  const deletingRef = useRef(false);
  const addingRef = useRef(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when editing text
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      if (e.key === "Delete" && onDelete) {
        if (deletingRef.current) return;
        deletingRef.current = true;
        e.preventDefault();
        onDelete();
        setTimeout(() => { deletingRef.current = false; }, 200);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "n" && onAdd) {
        if (addingRef.current) return;
        addingRef.current = true;
        e.preventDefault();
        onAdd();
        setTimeout(() => { addingRef.current = false; }, 200);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDelete, onAdd]);
}
