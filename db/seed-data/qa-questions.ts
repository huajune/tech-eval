import { SeedQuestion } from "./types";

export const qaQuestions: SeedQuestion[] = [
  // 简单题
  {
    content: "在软件测试的 \"V 模型\" 中，与 \"详细设计\" 对应的测试阶段是？",
    type: "single",
    options: {
      A: "单元测试",
      B: "集成测试",
      C: "系统测试",
      D: "验收测试"
    },
    correctAnswer: ["A"],
    abilityDimension: "qa_testing",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "V 模型中，详细设计对应单元测试，概要设计对应集成测试，需求分析对应验收测试。"
  },
  {
    content: "登录功能，要求密码长度 6-12 位。以下哪个属于 \"无效等价类\"？",
    type: "single",
    options: {
      A: "密码长度 6 位",
      B: "密码长度 12 位",
      C: "密码长度 8 位",
      D: "密码长度 5 位"
    },
    correctAnswer: ["D"],
    abilityDimension: "qa_testing",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "等价类划分法中，5 位在有效范围 [6, 12] 之外，属于无效等价类。"
  },
  {
    content: "在 Linux 服务器上，查看当前目录下文件大小时，使用哪个命令最直观？",
    type: "single",
    options: {
      A: "ls -l",
      B: "ls -lh",
      C: "ps -ef",
      D: "cat file"
    },
    correctAnswer: ["B"],
    abilityDimension: "qa_testing",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "-h 选项表示 \"human-readable\"，会以 K/M/G 等人类可读格式显示文件大小。"
  },
  {
    content: "测试结束需要清理脏数据，删除表中所有数据但保留表结构的 SQL 是？",
    type: "single",
    options: {
      A: "DROP TABLE table_name;",
      B: "DELETE FROM table_name;",
      C: "REMOVE ALL FROM table_name;",
      D: "ALTER TABLE table_name DROP;"
    },
    correctAnswer: ["B"],
    abilityDimension: "qa_testing",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "DELETE FROM 用于删除数据保留表结构，DROP TABLE 会连同表结构一起删除。"
  },
  {
    content: "使用 Fiddler/Charles 抓包时，想看请求的响应内容，应查看？",
    type: "single",
    options: {
      A: "Request Headers",
      B: "Response Body",
      C: "Cookies",
      D: "Protocol"
    },
    correctAnswer: ["B"],
    abilityDimension: "qa_testing",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "Response Body 包含服务器返回的具体响应内容（如 JSON、HTML）。"
  },
  {
    content: "一条高质量的 Bug 单，最核心的要素是？",
    type: "single",
    options: {
      A: "标题够长",
      B: "必现 / 偶现、复现步骤、预期结果与实际结果",
      C: "必须附带视频",
      D: "必须指名道姓是谁写的 Bug"
    },
    correctAnswer: ["B"],
    abilityDimension: "qa_testing",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "复现步骤、预期与实际结果的对比是开发人员定位和修复 Bug 的关键信息。"
  },
  {
    content: "你发现一个 Bug，但开发说 \"这不是 Bug，用户不会这么操作\"，你会？",
    type: "single",
    options: {
      A: "听开发的，关闭 Bug",
      B: "跟开发吵一架",
      C: "查看需求文档或咨询产品经理，确认产品逻辑后再决定",
      D: "偷偷把 Bug 状态改成 \"已修复\""
    },
    correctAnswer: ["C"],
    abilityDimension: "qa_testing",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "测试应以需求文档和产品定义为准，而不是开发人员的个人判断。"
  },
  {
    content: "项目马上上线，你发现了一个非核心的 UI 样式小问题，改动可能会影响其他模块，你会？",
    type: "single",
    options: {
      A: "坚决要求必须改，否则不上线",
      B: "记录 Bug，建议作为 \"遗留问题\" 放入下一个版本修复，保证按时上线",
      C: "假装没看见",
      D: "自己去改代码"
    },
    correctAnswer: ["B"],
    abilityDimension: "qa_testing",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "在上线前的紧要关头，需要评估风险与收益。非核心问题可以延后修复，避免因小失大引发回归问题。"
  },
  {
    content: "某功能测试通过上线了，结果第二天用户反馈了一个严重 Bug，这说明？",
    type: "single",
    options: {
      A: "测试人员太菜了",
      B: "测试用例覆盖不全或测试场景遗漏",
      C: "运气不好",
      D: "开发偷偷改了代码"
    },
    correctAnswer: ["B"],
    abilityDimension: "qa_testing",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "线上漏测通常归因于测试用例覆盖不足或场景考虑不周，需要复盘完善用例库。"
  },
  {
    content: "开发修复 Bug 后，直接在群里说 \"好了\"，你应该？",
    type: "single",
    options: {
      A: "相信他，直接关闭 Bug",
      B: "在测试环境进行 \"回归测试\"，验证通过后再关闭",
      C: "让产品经理去验",
      D: "要求他发誓修好了"
    },
    correctAnswer: ["B"],
    abilityDimension: "qa_testing",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "测试原则：不信任口头承诺，必须经过实际验证（回归测试）才能关闭 Bug。"
  },
  {
    content: "如果让你测试一个 \"自动贩卖机\"，除了投币出货，你还能想到什么异常场景？",
    type: "single",
    options: {
      A: "投假币",
      B: "断电后再通电",
      C: "货物卡住了",
      D: "以上都是"
    },
    correctAnswer: ["D"],
    abilityDimension: "qa_testing",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "测试需要发散思维，考虑各种异常、边界和环境干扰场景。"
  },
  {
    content: "重复性的回归测试非常耗时，作为一名有追求的测试，你应该？",
    type: "single",
    options: {
      A: "每次都手动点，加班点",
      B: "减少测试范围，凭感觉测",
      C: "尝试引入自动化测试工具（如 Selenium/JMeter）来替代部分重复劳动",
      D: "申请多招几个实习生来点"
    },
    correctAnswer: ["C"],
    abilityDimension: "qa_testing",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "自动化测试是解决重复性回归测试效率低下的最佳方案。"
  },
  {
    content: "进行接口测试时，如何验证 \"幂等性\"？",
    type: "single",
    options: {
      A: "发送一次请求，看是否成功",
      B: "并发发送 100 个请求，看服务器是否崩溃",
      C: "连续发送多次相同的请求，检查服务器端资源的状态是否只改变了一次",
      D: "检查接口响应时间是否一致"
    },
    correctAnswer: ["C"],
    abilityDimension: "qa_testing",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "幂等性的定义是多次执行产生的影响与一次执行相同。验证方法就是重复发送请求并检查状态变化。"
  },
  {
    content: "发现服务器磁盘满了，使用什么命令组合能最快找到是哪个文件占用了最大空间？",
    type: "single",
    options: {
      A: "ls -a",
      B: "find / -name \"*\"",
      C: "du -sh * | sort -rh | head",
      D: "top"
    },
    correctAnswer: ["C"],
    abilityDimension: "qa_testing",
    difficulty: "hard",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "du 查看大小，sort -rh 按人类可读格式逆序排序，head 取前几名，是排查磁盘占用的标准组合拳。"
  },
  {
    content: "两个事务同时执行，事务 A 读到了事务 B 未提交的数据，这属于哪种隔离级别的问题？",
    type: "single",
    options: {
      A: "脏读 (Dirty Read)",
      B: "不可重复读",
      C: "幻读",
      D: "串行化"
    },
    correctAnswer: ["A"],
    abilityDimension: "qa_testing",
    difficulty: "hard",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "读到未提交的数据称为脏读，通常发生在 Read Uncommitted 隔离级别。"
  }
];
