import { useState, useRef, useEffect, useCallback } from "react";
import { Input, Select } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import type { InputRef } from "antd";
import type { DataType } from "../types/variable";
import { DATA_TYPES } from "../types/variable";
import { validateName, validateDefaultValue, normalizeBool } from "../validators";

// ---------------------------------------------------------------------------
// Shared: field-level error / saving spinner
// ---------------------------------------------------------------------------
function FieldError({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="text-red-500 text-xs mt-0.5 leading-tight truncate" title={error}>
      {error}
    </div>
  );
}

function SavingSpinner() {
  return <LoadingOutlined spin className="text-blue-500 text-xs ml-1" />;
}

// ---------------------------------------------------------------------------
// EditableNameCell
// ---------------------------------------------------------------------------
interface EditableNameCellProps {
  value: string;
  existingNames: string[];
  currentName?: string;
  onSave: (value: string) => Promise<void>;
  /** 新增行时自动进入编辑模式 */
  autoFocus?: boolean;
}

export function EditableNameCell({
  value,
  existingNames,
  currentName,
  onSave,
  autoFocus = false,
}: EditableNameCellProps) {
  const [editing, setEditing] = useState(autoFocus);
  const [saving, setSaving] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<InputRef>(null);

  // 同步外部 autoFocus 变化（新增行时触发）
  useEffect(() => {
    if (autoFocus) {
      setEditing(true);
      setError(null);
    }
  }, [autoFocus]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const commit = useCallback(async () => {
    if (saving) return;
    const trimmed = editValue.trim();
    // AC4: empty name → revert to original value + show error
    if (!trimmed) {
      setEditValue(value);
      setError("Name cannot be empty");
      return;
    }
    const err = validateName(editValue, existingNames, currentName);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(editValue.trim());
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }, [editValue, existingNames, currentName, onSave, saving, value]);

  const startEditing = () => {
    if (saving) return;
    setEditValue(value);
    setError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditValue(value);
    setError(null);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div
        className="cursor-pointer min-h-[22px] px-2 py-1 rounded hover:bg-gray-50 transition-colors"
        onClick={startEditing}
      >
        {value || <span className="text-gray-300 italic">Click to edit</span>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          size="small"
          value={editValue}
          disabled={saving}
          onChange={(e) => {
            setEditValue(e.target.value);
            setError(null);
          }}
          onBlur={commit}
          onPressEnter={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancelEditing();
          }}
          status={error ? "error" : undefined}
          variant="borderless"
          className="!px-1 flex-1"
        />
        {saving && <SavingSpinner />}
      </div>
      <FieldError error={error} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditableDataTypeCell
// ---------------------------------------------------------------------------
interface EditableDataTypeCellProps {
  value: DataType | "";
  onSave: (value: DataType) => Promise<void>;
}

export function EditableDataTypeCell({ value, onSave }: EditableDataTypeCellProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = async (val: DataType) => {
    setSaving(true);
    try {
      await onSave(val);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  };

  if (!editing) {
    if (value === "") {
      return (
        <div
          className="cursor-pointer min-h-[22px] px-2 py-1 rounded hover:bg-gray-50 transition-colors text-gray-400 italic text-xs"
          onDoubleClick={() => setEditing(true)}
        >
          Select...
        </div>
      );
    }
    return (
      <div
        className="cursor-pointer min-h-[22px] px-2 py-1 rounded hover:bg-gray-50 transition-colors"
        onDoubleClick={() => setEditing(true)}
      >
        <span
          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
            value === "BOOL" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {value}
        </span>
      </div>
    );
  }

  return (
    <Select
      autoFocus
      size="small"
      value={value}
      disabled={saving}
      loading={saving}
      onChange={(val) => handleChange(val as DataType)}
      onBlur={() => !saving && setEditing(false)}
      style={{ width: 100 }}
      variant="borderless"
      className="border-0 shadow-none"
      options={DATA_TYPES.map((dt) => ({ value: dt, label: dt }))}
    />
  );
}

// ---------------------------------------------------------------------------
// EditableDefaultValueCell
// ---------------------------------------------------------------------------
interface EditableDefaultValueCellProps {
  value: string;
  dataType: DataType | "";
  onSave: (value: string) => Promise<void>;
}

export function EditableDefaultValueCell({
  value,
  dataType,
  onSave,
}: EditableDefaultValueCellProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const commit = useCallback(async () => {
    if (saving) return;
    let finalValue = editValue;
    if (dataType === "BOOL" && editValue.trim()) {
      finalValue = normalizeBool(editValue);
    }
    const err = validateDefaultValue(finalValue, dataType);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(finalValue);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }, [editValue, dataType, onSave, saving]);

  const startEditing = () => {
    if (saving) return;
    setEditValue(value);
    setError(null);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditValue(value);
    setError(null);
    setEditing(false);
  };

  if (!editing) {
    if (dataType === "") {
      return (
        <div className="min-h-[22px] px-2 py-1 text-gray-300 italic text-xs font-mono">--</div>
      );
    }
    return (
      <div
        className="cursor-pointer min-h-[22px] px-2 py-1 rounded hover:bg-gray-50 transition-colors font-mono text-sm"
        onClick={startEditing}
      >
        {value || <span className="text-gray-300 italic font-sans">Click to edit</span>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          size="small"
          value={editValue}
          disabled={saving}
          onChange={(e) => {
            setEditValue(e.target.value);
            setError(null);
          }}
          onBlur={commit}
          onPressEnter={commit}
          onKeyDown={(e) => {
            if (e.key === "Escape") cancelEditing();
          }}
          status={error ? "error" : undefined}
          variant="borderless"
          className="!px-1 font-mono flex-1"
          placeholder={dataType === "BOOL" ? "TRUE / FALSE" : "INT (-2147483648 ~ 2147483647)"}
        />
        {saving && <SavingSpinner />}
      </div>
      <FieldError error={error} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// EditableCommentCell
// ---------------------------------------------------------------------------
interface EditableCommentCellProps {
  value: string;
  onSave: (value: string) => Promise<void>;
}

export function EditableCommentCell({ value, onSave }: EditableCommentCellProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const commit = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(editValue);
    } finally {
      setSaving(false);
      setEditing(false);
    }
  }, [editValue, onSave, saving]);

  if (!editing) {
    return (
      <div
        className="cursor-pointer min-h-[22px] px-2 py-1 rounded hover:bg-gray-50 transition-colors"
        onClick={() => {
          setEditValue(value);
          setEditing(true);
        }}
      >
        {value || <span className="text-gray-300 italic">Click to edit</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef}
        size="small"
        value={editValue}
        disabled={saving}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={commit}
        onPressEnter={commit}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEditValue(value);
            setEditing(false);
          }
        }}
        variant="borderless"
        className="!px-1 flex-1"
      />
      {saving && <SavingSpinner />}
    </div>
  );
}
