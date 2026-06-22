export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // 新功能
        "fix",      // 修复bug
        "docs",     // 文档
        "style",    // 格式（不影响代码逻辑）
        "refactor", // 重构（既不是新功能也不是修复bug）
        "perf",     // 性能优化
        "test",     // 测试
        "chore",    // 构建/工具链
        "ci",       // CI/CD
        "build",    // 构建系统
      ],
    ],
    "subject-case": [0], // 不限制大小写
  },
};
