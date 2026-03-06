# 工作流规范 (Workflows)

```typescript
/**
 * 项目工作流与流程规范
 * Project Workflows & Process Guidelines
 */
export interface Workflows {
  /**
   * Git 提交规范
   * @standard Conventional Commits
   * @link https://www.conventionalcommits.org/
   */
  gitCommit: {
    /**
     * 提交信息格式
     * @format <type>(<scope>): <subject>
     * @example feat(auth): add login page
     */
    format: "type(scope): subject";
    
    /**
     * 允许的提交类型
     */
    types: [
      "feat",     // New feature
      "fix",      // Bug fix
      "docs",     // Documentation only
      "style",    // Formatting, missing semi colons, etc; no code change
      "refactor", // Refactoring production code
      "perf",     // Performance improvement
      "test",     // Adding tests, refactoring test; no production code change
      "chore"     // Updating build tasks, package manager configs, etc; no production code change
    ];
  };

  /**
   * 变更日志记录规范 (MANDATORY)
   * @file UPDATE_LOG.md
   * @description 所有文件变更必须同步记录到 UPDATE_LOG.md
   */
  changeLog: {
    /**
     * 记录格式
     * @format [YYYY-MM-DD HH:MM:SS] 【操作类型】 : 路径信息 - 更新简述
     * @timezone Asia/Shanghai (北京时间)
     */
    entryFormat: "[YYYY-MM-DD HH:MM:SS] 【<ActionType>】 : <RelativePath> - <Description>";

    /**
     * 操作类型枚举
     */
    actionTypes: [
      "新增文件",
      "新增文件夹",
      "删除文件",
      "删除文件夹",
      "修改文件",
      "重命名文件",
      "重命名文件夹",
      "移动文件",
      "移动文件夹"
    ];

    /**
     * 验证规则
     */
    validation: {
      timestamp: "必须是准确的北京时间";
      path: "必须是相对路径";
      completeness: "必须覆盖所有变更文件 (忽略文件除外)";
    };
  };

  /**
   * 知识引擎工作流 (Knowledge Engine Workflows)
   * @description 规范 AI 知识引擎的协作流程
   */
  knowledgeEngine: {
    /**
     * 角色分工
     */
    roles: {
      gardener: "速记员 (Knowledge-Gardener) - 负责将经验快速写入 Inbox",
      librarian: "图书管理员 (Knowledge-Librarian) - 负责定期整理 Inbox 并归档到 Rules",
      integrityCheck: "质检员 (Integrity-Check) - 负责提交代码前检查 Inbox 覆盖率",
      autoCoder: "老工匠 (Coder) - 负责查阅 Rules 和 Inbox 并生成代码"
    };

    /**
     * 存储架构
     */
    storage: {
      inbox: ".trae/rules/inbox/ - 短期记忆缓冲区 (碎片化)",
      rules: ".trae/rules/modules/ - 长期记忆存储 (结构化)"
    };

    /**
     * 最佳实践
     */
    bestPractices: [
      "所有新经验必须先进入 Inbox，禁止直接修改 Rules (除非由 Librarian 操作)",
      "提交核心代码前，必须确保 Inbox 中有对应的经验记录",
      "定期运行 Librarian 进行知识归档和 Inbox 清理"
    ];
  };

  /**
   * 发布流程
   */
  releaseProcess: {
    steps: [
      "1. 确保所有更改已提交并推送",
      "2. 验证 UPDATE_LOG.md 是否最新",
      "3. 按照 TESTING_RULES.md 运行测试",
      "4. 构建项目 (npm run build)",
      "5. 验证构建产物",
      "6. 部署 (如适用)"
    ];
  };

  /**
   * 测试流程
   * @reference f:\my_tools\MeeWoo\MeeWoo\TESTING_RULES.md
   */
  testing: {
    tool: "IDE 内置或 webapp-testing 技能";
    browserMode: "真实浏览器 (非无头模式)";
    requirement: "提交/发布前必须测试";
  };
}
```
