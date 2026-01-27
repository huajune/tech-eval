import { SeedQuestion } from "./types";

export const databaseQuestions: SeedQuestion[] = [
  // 简单题（1题）
  {
    content: "在 InnoDB 引擎的可重复读（Repeatable Read）隔离级别下，主要通过什么机制解决了大部分\"幻读\"问题？",
    type: "single",
    options: {
      A: "悲观锁",
      B: "Next-Key Lock（临键锁）和 MVCC",
      C: "读写分离",
      D: "序列化",
    },
    correctAnswer: ["B"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend"],
    applicableLanguages: null,
    explanation: "B对：InnoDB在RR级别下，通过MVCC（多版本并发控制）解决了快照读的幻读问题，通过Next-Key Lock（记录锁+间隙锁）解决了当前读的幻读问题。A/C/D错：它们并非InnoDB解决幻读的核心机制。",
  },

  // 中等题（2题）
  {
    content: "现有 Service A 调用 Service B。A 方法上有事务 @Transactional，B 方法上配置了不同的传播行为。下列场景描述正确的有？",
    type: "multiple",
    options: {
      A: "若 B 为 REQUIRED：A 报错回滚，B 也会回滚（因为是同一个事务）。",
      B: "若 B 为 REQUIRES_NEW：A 报错回滚，B 不会回滚（只要 B 执行成功）。",
      C: "若 B 为 NESTED：B 报错回滚，A 可以选择捕获异常不回滚（B 是 A 的子事务/保存点）。",
      D: "若 B 为 SUPPORTS：如果 A 没有事务，B 就会新建一个事务运行。",
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "database",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend"],
    applicableLanguages: ["java"],
    explanation: "A对：REQUIRED（默认）表示加入当前事务，同属一个事务单元。B对：REQUIRES_NEW会挂起A的事务，新建一个独立事务，B的事务提交后不受A回滚影响。C对：NESTED在A的事务内创建一个保存点，B回滚到此保存点，A可捕获异常决定是否继续。D错：SUPPORTS表示如果当前存在事务则加入，否则以非事务方式运行，不会新建事务。",
  },
  {
    content: "执行 Explain 查看 SQL 执行计划时，若 Extra 列出现了以下哪些关键词，通常意味着需要优化 SQL 或索引？",
    type: "multiple",
    options: {
      A: "Using index",
      B: "Using filesort",
      C: "Using temporary",
      D: "Using index condition",
    },
    correctAnswer: ["B", "C"],
    abilityDimension: "database",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend"],
    applicableLanguages: null,
    explanation: "B/C对：Using filesort表示无法利用索引完成排序，需要在内存或磁盘进行额外排序，效率低。Using temporary表示需要创建临时表来处理查询（如GROUP BY、ORDER BY），可能消耗大量资源。A错：Using index表示使用了覆盖索引，是高效的表现。D错：Using index condition表示使用了索引下推（ICP），是优化特性。",
  },
];
