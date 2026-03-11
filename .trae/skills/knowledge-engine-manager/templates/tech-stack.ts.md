# 技术栈规范 (Tech Stack)

/**
 * 项目技术栈定义
 * Tech Stack Definitions
 */
export interface TechStack {
  /**
   * 编程语言
   */
  languages: {
    // 示例: "Python": "3.9+"
    [key: string]: string;
  };

  /**
   * 核心框架
   */
  frameworks: {
    // 示例: "FastAPI": "0.68+"
    [key: string]: string;
  };

  /**
   * 关键依赖库
   */
  libraries: {
    // 示例: "Pydantic": "1.8+"
    [key: string]: string;
  };

  /**
   * 构建与工具
   */
  tools: {
    // 示例: "Poetry": "1.1+"
    [key: string]: string;
  };
}

/**
 * 示例实现
 * Example Implementation
 */
export const projectTechStack: TechStack = {
  languages: {
    "Python": "3.9+",
    "JavaScript": "ES6+"
  },
  frameworks: {
    "Vue": "2.6+",
    "Vite": "5.0+"
  },
  libraries: {
    "Konva": "9.3+",
    "FFmpeg": "6.0+"
  },
  tools: {
    "npm": "9.0+",
    "git": "2.30+"
  }
};
