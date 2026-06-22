import { Button, Space, Popconfirm, Typography } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface ToolbarProps {
  onAddRow: () => void;
  onDeleteRow: () => void;
  selectedCount: number;
  totalCount: number;
}

export function Toolbar({ onAddRow, onDeleteRow, selectedCount, totalCount }: ToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <Space size="middle">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onAddRow}
          className="!bg-blue-600 hover:!bg-blue-700"
        >
          Add Row
        </Button>

        <Popconfirm
          title="Delete selected row?"
          description={`Delete ${selectedCount} selected row(s)?`}
          onConfirm={onDeleteRow}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
          disabled={selectedCount === 0}
        >
          <Button danger icon={<DeleteOutlined />} disabled={selectedCount === 0}>
            Delete Row
          </Button>
        </Popconfirm>
      </Space>

      <Text type="secondary" className="text-sm whitespace-nowrap">
        {totalCount} row{totalCount !== 1 ? "s" : ""}
        {selectedCount > 0 && ` · ${selectedCount} selected`}
      </Text>
    </div>
  );
}
