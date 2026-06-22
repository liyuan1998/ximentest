import { ConfigProvider, App as AntApp, Spin } from "antd";
import { VariableTable } from "./components/VariableTable";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useVariableStore } from "./store/useVariableStore";

export default function App() {
  const loading = useVariableStore((s) => s.loading);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#2563eb",
          borderRadius: 6,
        },
      }}
    >
      <AntApp>
        <ErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                  T
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-800">Variable Table Editor</h1>
                  <p className="text-xs text-gray-400">TIA Portal — Simplified</p>
                </div>
                {loading && <Spin size="small" className="ml-4" />}
              </div>
            </header>

            <main className="py-6 px-4 max-w-6xl mx-auto">
              <VariableTable />
            </main>
          </div>
        </ErrorBoundary>
      </AntApp>
    </ConfigProvider>
  );
}
