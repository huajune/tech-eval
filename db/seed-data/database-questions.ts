export const databaseQuestions = [
  // 简单题（12题）
  {
    content: "在关系型数据库中，以下哪个约束可以确保列值的唯一性？",
    type: "single",
    options: {
      A: "PRIMARY KEY",
      B: "UNIQUE",
      C: "FOREIGN KEY",
      D: "CHECK"
    },
    correctAnswer: ["B"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "UNIQUE约束确保列值唯一但允许NULL。PRIMARY KEY也保证唯一性但不允许NULL。题目问的是唯一性约束，UNIQUE是最直接的答案。"
  },
  {
    content: "SQL中的LEFT JOIN和INNER JOIN的主要区别是什么？",
    type: "single",
    options: {
      A: "LEFT JOIN返回左表的所有记录，INNER JOIN只返回匹配的记录",
      B: "LEFT JOIN比INNER JOIN快",
      C: "LEFT JOIN不能使用WHERE子句",
      D: "没有区别"
    },
    correctAnswer: ["A"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "LEFT JOIN返回左表所有记录，即使右表没有匹配也会返回（右表字段为NULL）。INNER JOIN只返回两表都匹配的记录。"
  },
  {
    content: "数据库索引的主要作用是什么？",
    type: "single",
    options: {
      A: "加快数据插入速度",
      B: "加快数据查询速度",
      C: "减少存储空间",
      D: "保证数据一致性"
    },
    correctAnswer: ["B"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "索引通过创建数据结构（如B+树）加快查询速度，但会增加存储空间，降低插入/更新性能。"
  },
  {
    content: "在PostgreSQL中，JSONB类型相比JSON类型的主要优势是什么？",
    type: "single",
    options: {
      A: "占用更少的存储空间",
      B: "支持索引和更快的查询",
      C: "保留JSON的格式和空格",
      D: "插入速度更快"
    },
    correctAnswer: ["B"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "JSONB是二进制格式，支持索引（GIN索引）和高效查询，但插入时需要转换，略慢于JSON。JSON保留格式，JSONB不保留。"
  },
  {
    content: "数据库事务的ACID特性中，I代表什么？",
    type: "single",
    options: {
      A: "Integrity（完整性）",
      B: "Isolation（隔离性）",
      C: "Identity（标识性）",
      D: "Index（索引）"
    },
    correctAnswer: ["B"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "ACID分别代表：Atomicity（原子性）、Consistency（一致性）、Isolation（隔离性）、Durability（持久性）。"
  },
  {
    content: "以下哪种SQL语句用于删除表中的所有数据但保留表结构？",
    type: "single",
    options: {
      A: "DROP TABLE",
      B: "DELETE FROM",
      C: "TRUNCATE TABLE",
      D: "ALTER TABLE"
    },
    correctAnswer: ["C"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "TRUNCATE TABLE快速删除所有数据但保留表结构，比DELETE FROM快且不记录每行删除日志。DROP TABLE会删除整个表。"
  },
  {
    content: "在数据库设计中，范式化（Normalization）的主要目的是什么？",
    type: "single",
    options: {
      A: "提高查询速度",
      B: "减少数据冗余",
      C: "增加存储空间",
      D: "简化SQL语句"
    },
    correctAnswer: ["B"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "范式化通过消除冗余和异常来减少数据冗余，提高数据一致性。但过度范式化可能影响查询性能，需要权衡。"
  },
  {
    content: "SQL中的GROUP BY子句的主要作用是什么？",
    type: "single",
    options: {
      A: "排序查询结果",
      B: "过滤查询结果",
      C: "对数据进行分组统计",
      D: "连接多个表"
    },
    correctAnswer: ["C"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "GROUP BY用于将数据分组，通常与聚合函数（COUNT、SUM、AVG等）一起使用进行统计分析。"
  },
  {
    content: "数据库中的外键（Foreign Key）主要用于什么？",
    type: "single",
    options: {
      A: "加快查询速度",
      B: "保证数据的参照完整性",
      C: "减少存储空间",
      D: "支持全文检索"
    },
    correctAnswer: ["B"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "外键约束确保子表的值必须在父表中存在，维护表间的参照完整性。可以防止插入无效数据和删除被引用的数据。"
  },
  {
    content: "在MySQL中，CHAR和VARCHAR类型的主要区别是什么？",
    type: "single",
    options: {
      A: "CHAR是定长，VARCHAR是变长",
      B: "CHAR不能存储中文，VARCHAR可以",
      C: "CHAR更快，VARCHAR更慢",
      D: "没有区别"
    },
    correctAnswer: ["A"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "CHAR是定长字符类型，不足部分用空格填充。VARCHAR是变长类型，根据实际内容长度存储。短字符串用CHAR效率高，长度不定用VARCHAR节省空间。"
  },
  {
    content: "SQL注入攻击的主要防御措施是什么？",
    type: "single",
    options: {
      A: "使用复杂密码",
      B: "使用参数化查询",
      C: "增加服务器防火墙",
      D: "使用HTTPS协议"
    },
    correctAnswer: ["B"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "参数化查询（预编译语句）是防止SQL注入的最有效方法，将SQL语句和参数分离，避免拼接SQL字符串。"
  },
  {
    content: "数据库连接池的主要作用是什么？",
    type: "single",
    options: {
      A: "加密数据库连接",
      B: "复用数据库连接，提高性能",
      C: "备份数据库数据",
      D: "监控数据库性能"
    },
    correctAnswer: ["B"],
    abilityDimension: "database",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "连接池预先创建和管理一定数量的数据库连接，避免频繁创建和关闭连接的开销，提高应用性能。"
  },

  // 中等题（6题，包含1道陈述题）
  {
    content: "以下关于数据库索引的说法，哪些是正确的？（多选）",
    type: "multiple",
    options: {
      A: "在高频查询的列上创建索引可以显著提升查询性能",
      B: "索引越多越好，应该给所有列都加上索引",
      C: "联合索引(a, b, c)可以用于查询条件 WHERE a=1 AND b=2",
      D: "WHERE子句中使用函数会导致索引失效（如 WHERE YEAR(date)=2024）"
    },
    correctAnswer: ["A", "C", "D"],
    abilityDimension: "database",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "A正确：高频查询列应该建索引。B错误：索引会增加写入开销和存储空间。C正确：满足最左前缀原则。D正确：函数会导致索引失效。"
  },
  {
    content: "关于数据库事务的隔离级别，以下哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "READ UNCOMMITTED会产生脏读",
      B: "READ COMMITTED可以避免脏读",
      C: "REPEATABLE READ可以避免幻读",
      D: "SERIALIZABLE隔离级别最高但性能最差"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "database",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "READ UNCOMMITTED会产生脏读、不可重复读、幻读。READ COMMITTED避免脏读。REPEATABLE READ在标准SQL中不能完全避免幻读（MySQL InnoDB通过间隙锁解决）。SERIALIZABLE性能最差但隔离级别最高。"
  },
  {
    content: "在设计用户表时，以下哪些字段适合建立索引？（多选）",
    type: "multiple",
    options: {
      A: "user_id（主键）",
      B: "email（唯一且常用于查询）",
      C: "password（密码哈希）",
      D: "created_at（创建时间，常用于排序）"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "database",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "主键自动建立索引。email常用于登录查询且唯一，应建索引。created_at常用于排序和范围查询，应建索引。password不用于查询条件，不应建索引。"
  },
  {
    content: "关于数据库的分库分表，以下哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "垂直分表是按照字段拆分表",
      B: "水平分表是按照行数据拆分表",
      C: "分库分表后可以解决所有性能问题",
      D: "跨库JOIN查询会变得复杂"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "database",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "垂直分表按字段拆分（如用户基本信息表和扩展信息表）。水平分表按行拆分（如按用户ID哈希）。分库分表可以解决容量和性能问题，但不是万能的，且会增加系统复杂度。"
  },
  {
    content: "以下关于NoSQL数据库的说法，哪些是正确的？（多选）",
    type: "multiple",
    options: {
      A: "MongoDB适合存储文档型数据",
      B: "Redis适合做持久化的主数据库",
      C: "NoSQL数据库都不支持事务",
      D: "NoSQL通常采用最终一致性模型"
    },
    correctAnswer: ["A", "D"],
    abilityDimension: "database",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "MongoDB是文档数据库，适合存储JSON格式数据。Redis是内存数据库，不适合做主数据库。现代NoSQL（如MongoDB）支持事务。NoSQL通常采用最终一致性模型以提高性能和可用性。"
  },
  {
    content: "你需要为一个在线教育平台设计数据库，核心业务包括：\\n- 用户系统（学生、教师）\\n- 课程系统（课程、章节、视频）\\n- 订单系统（购买记录、支付状态）\\n\\n请用150字以内描述你的数据库设计方案，至少包括：\\n1. 核心表结构及关系\\n2. 关键字段设计\\n3. 索引设计\\n4. 数据一致性保障",
    type: "essay",
    options: null,
    correctAnswer: null,
    abilityDimension: "database",
    difficulty: "medium",
    weight: 5,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "评分标准（总分5分）：\\n- 核心表结构设计合理（users、courses、chapters、videos、orders等）：1分\\n- 关键字段考虑周全（外键、状态字段、时间戳、软删除等）：1分\\n- 索引设计合理（主键、外键、查询条件字段）：1分\\n- 数据一致性考虑（事务、外键约束、状态机）：1分\\n- 方案整体合理性：1分",
    referenceAnswer: "参考方案要点：\\n1. 核心表：users(id, role, email)、courses(id, teacher_id, title)、chapters(id, course_id, title, order)、videos(id, chapter_id, url)、orders(id, user_id, course_id, status, amount)\\n2. 关键字段：外键关联(teacher_id→users.id)、枚举状态(role: student/teacher, order.status: pending/paid/refunded)、时间戳(created_at, updated_at)、软删除(deleted_at)\\n3. 索引：主键索引、外键索引(teacher_id, course_id, user_id)、唯一索引(users.email)、联合索引(orders.user_id, orders.status)\\n4. 一致性：订单创建使用事务、外键约束保证数据完整性、订单状态使用状态机防止非法转换"
  },

  // 困难题（2题）
  {
    content: "在数据库性能优化中，以下哪些措施是有效的？（多选）",
    type: "multiple",
    options: {
      A: "使用EXPLAIN分析查询计划",
      B: "给所有列都建立索引",
      C: "避免SELECT *，只查询需要的列",
      D: "使用分页查询代替一次性加载所有数据"
    },
    correctAnswer: ["A", "C", "D"],
    abilityDimension: "database",
    difficulty: "hard",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "EXPLAIN可以分析查询计划找出性能瓶颈。给所有列建索引会严重影响写入性能。SELECT *会查询不需要的数据，浪费资源。分页查询可以减少内存占用和网络传输。"
  },
  {
    content: "关于数据库的MVCC（多版本并发控制），以下哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "MVCC通过保存数据的多个版本来实现并发控制",
      B: "MVCC可以实现读写不阻塞",
      C: "PostgreSQL和MySQL InnoDB都使用MVCC",
      D: "MVCC完全不需要锁机制"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "database",
    difficulty: "hard",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "MVCC通过保存数据的多个版本实现快照读，使读写不阻塞。PostgreSQL和MySQL InnoDB都实现了MVCC。但MVCC不能完全替代锁，写写操作仍需要锁来避免冲突。"
  }
];
