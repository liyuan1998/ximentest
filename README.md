# TIA Portal - Variable Table Editor

A simplified variable table editor inspired by Siemens TIA Portal, built with **React + TypeScript + Ant Design + Tailwind CSS + Zustand**.

## Features

| AC | Description | Status |
|----|-------------|--------|
| AC1 | Table display with Index, Name, Data Type, Default Value, Comment columns | ✅ |
| AC2 | Add new variable row with auto-incremented index | ✅ |
| AC3 | Delete selected row with automatic index recalculation | ✅ |
| AC4 | Edit variable name with uniqueness validation (case-insensitive) | ✅ |
| AC5 | Double-click data type cell to select BOOL/INT, auto-updates default value | ✅ |
| AC6 | Edit BOOL default value: accepts true/false, displays as uppercase | ✅ |
| AC7 | Edit INT default value: integer range -2,147,483,648 ~ 2,147,483,647 | ✅ |
| AC8 | Edit comment: accepts any text, can be empty | ✅ |

### Bonus Features
- 🎨 Clean UI with Ant Design + Tailwind CSS
- ⌨️ Keyboard shortcuts: `Delete` to remove row, `Ctrl+N` to add row
- 🛡️ ErrorBoundary for runtime error handling
- 🧪 19 unit tests covering all validators and store logic
- 📱 Responsive layout

## Project Structure

```
src/
├── types/
│   └── variable.ts            # DataType, VariableRow, DataTypeConfig
├── validators/
│   ├── index.ts               # Barrel export
│   ├── validateName.ts        # Name validation (empty + uniqueness)
│   └── validateDefaultValue.ts # BOOL & INT default value validation
├── store/
│   └── useVariableStore.ts    # Zustand store (add/delete/update)
├── components/
│   ├── Toolbar.tsx            # Add Row / Delete Row buttons
│   ├── EditableCell.tsx       # 4 editable cell types (Name, DataType, DefaultValue, Comment)
│   ├── VariableTable.tsx      # Main table with antd Table
│   └── ErrorBoundary.tsx      # React error boundary
├── hooks/
│   └── useKeyboardShortcuts.ts # Global keyboard shortcuts
├── test/
│   ├── setup.ts               # Vitest setup
│   ├── validators.test.ts     # 13 validator tests
│   └── store.test.ts          # 6 store tests
├── App.tsx                    # Root component with layout
├── main.tsx                   # React entry point
└── style.css                  # Tailwind + antd custom styles
```

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | React 19 + TypeScript 6 | Modern, type-safe |
| Build | Vite 8 | Fast HMR, optimized builds |
| UI Library | Ant Design 6 | Production-grade table, built-in validation messages |
| CSS | Tailwind CSS 4 | Utility-first, rapid styling |
| State | Zustand 5 | Minimal boilerplate, perfect for medium state |
| Testing | Vitest 4 | Vite-native, fast execution |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Data Type Configuration

Adding a new data type (e.g., `STRING`) only requires adding one entry to the config registry:

```typescript
// src/types/variable.ts
export const DATA_TYPE_CONFIG: Record<DataType, DataTypeConfig> = {
  BOOL: { defaultValue: 'TRUE', displayDefault: 'TRUE' },
  INT:  { defaultValue: '0', displayDefault: '0', range: { min: -2147483648, max: 2147483647 } },
  // STRING: { defaultValue: '', displayDefault: '' },  // ← Add here
}
```

## License

MIT
