import { useState } from "react";
import { Table, App } from "antd";
import type { TableColumnsType } from "antd";
import type { VariableRow, DataType } from "../types/variable";
import { useVariableStore } from "../store/useVariableStore";
import {
  EditableNameCell,
  EditableDataTypeCell,
  EditableDefaultValueCell,
  EditableCommentCell,
} from "./EditableCell";
import { Toolbar } from "./Toolbar";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useDebounceCallback } from "../hooks/useDebounceCallback";

export function VariableTable() {
  const rows = useVariableStore((s) => s.rows);
  const loading = useVariableStore((s) => s.loading);
  const deleteRows = useVariableStore((s) => s.deleteRows);
  const updateCell = useVariableStore((s) => s.updateCell);
  const insertEmptyRow = useVariableStore((s) => s.insertEmptyRow);
  const { message } = App.useApp();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const handleAddRow = useDebounceCallback(async () => {
    await insertEmptyRow();
    message.success("New row added");
  });

  const handleDelete = useDebounceCallback(async () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one row to delete");
      return;
    }
    const ids = selectedRowKeys as string[];
    await deleteRows(ids);
    setSelectedRowKeys([]);
    message.success(`${ids.length} row(s) deleted`);
  });

  useKeyboardShortcuts({ onDelete: handleDelete, onAdd: handleAddRow });

  const existingNames = rows.map((r) => r.name);

  const columns: TableColumnsType<VariableRow> = [
    {
      title: "Index",
      dataIndex: "index",
      key: "index",
      width: 100,
      align: "center",
      render: (value: number) => (
        <span className="text-gray-400 font-mono text-sm select-none">{value}</span>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (_: string, record: VariableRow) => (
        <EditableNameCell
          value={record.name}
          existingNames={existingNames}
          currentName={record.name}
          onSave={(val) => updateCell(record.id, "name", val)}
        />
      ),
    },
    {
      title: "DataType",
      dataIndex: "dataType",
      key: "dataType",
      width: 140,
      align: "center",
      render: (value: DataType, record: VariableRow) => (
        <EditableDataTypeCell
          value={value}
          onSave={(val) => updateCell(record.id, "dataType", val)}
        />
      ),
    },
    {
      title: "Default Value",
      dataIndex: "defaultValue",
      key: "defaultValue",
      width: 200,
      render: (value: string, record: VariableRow) => (
        <EditableDefaultValueCell
          value={value}
          dataType={record.dataType}
          onSave={(val) => updateCell(record.id, "defaultValue", val)}
        />
      ),
    },
    {
      title: "Comment",
      dataIndex: "comment",
      key: "comment",
      render: (value: string, record: VariableRow) => (
        <EditableCommentCell
          value={value}
          onSave={(val) => updateCell(record.id, "comment", val)}
        />
      ),
    },
  ];

  return (
    <>
      <Toolbar
        onAddRow={handleAddRow}
        onDeleteRow={handleDelete}
        selectedCount={selectedRowKeys.length}
        totalCount={rows.length}
      />

      <div className="rounded-lg shadow-sm overflow-hidden">
        <Table<VariableRow>
          columns={columns}
          dataSource={rows}
          rowKey="id"
          rowSelection={{
            type: "checkbox",
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          loading={loading}
          pagination={false}
          size="middle"
          bordered
          locale={{
            emptyText: (
              <div className="py-12 text-center">
                <div className="text-gray-300 text-4xl mb-3">📋</div>
                <p className="text-gray-400 text-sm">
                  No variables yet. Click <strong>Add Row</strong> to start.
                </p>
              </div>
            ),
          }}
          className="variable-table"
        />
      </div>

      {rows.length > 0 && (
        <div className="mt-3 text-center">
          <span className="text-gray-400 text-xs">
            💡 Tip: Click cells to edit · Double-click Data Type to change
            · Press Delete to remove · Ctrl+N to add
          </span>
        </div>
      )}
    </>
  );
}
