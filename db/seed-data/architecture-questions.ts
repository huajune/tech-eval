export const architectureQuestions = [
  // 简单题（8题）
  {
    content: "在微服务架构中，以下哪种通信方式最适合服务间的同步调用？",
    type: "single",
    options: {
      A: "消息队列",
      B: "HTTP/REST API",
      C: "数据库共享",
      D: "文件共享"
    },
    correctAnswer: ["B"],
    abilityDimension: "architecture",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "HTTP/REST API是微服务间同步通信的标准方式，简单直观。消息队列适合异步通信，数据库和文件共享会造成耦合，不推荐。"
  },
  {
    content: "以下哪种缓存策略适合读多写少的场景？",
    type: "single",
    options: {
      A: "Cache-Aside（旁路缓存）",
      B: "Write-Through（写穿透）",
      C: "Write-Behind（写后）",
      D: "不使用缓存"
    },
    correctAnswer: ["A"],
    abilityDimension: "architecture",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "Cache-Aside模式下，应用先查缓存，缓存未命中时查数据库并更新缓存。适合读多写少场景，实现简单且灵活。"
  },
  {
    content: "在分布式系统中，CAP定理的C代表什么？",
    type: "single",
    options: {
      A: "一致性（Consistency）",
      B: "并发性（Concurrency）",
      C: "容量（Capacity）",
      D: "缓存（Cache）"
    },
    correctAnswer: ["A"],
    abilityDimension: "architecture",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "CAP定理指出分布式系统最多只能同时满足一致性（Consistency）、可用性（Availability）、分区容错性（Partition tolerance）中的两个。"
  },
  {
    content: "以下哪种设计模式最适合创建对象的不同表示？",
    type: "single",
    options: {
      A: "单例模式",
      B: "工厂模式",
      C: "建造者模式",
      D: "观察者模式"
    },
    correctAnswer: ["C"],
    abilityDimension: "architecture",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "建造者模式（Builder Pattern）用于构造复杂对象，可以创建对象的不同表示，特别适合有多个可选参数的场景。"
  },
  {
    content: "负载均衡器的轮询（Round Robin）算法的主要特点是什么？",
    type: "single",
    options: {
      A: "根据服务器性能分配请求",
      B: "顺序依次分配请求到每个服务器",
      C: "随机选择服务器",
      D: "根据响应时间选择服务器"
    },
    correctAnswer: ["B"],
    abilityDimension: "architecture",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "轮询算法按照顺序依次将请求分配给每个服务器，简单公平但不考虑服务器的负载和性能差异。"
  },
  {
    content: "在RESTful API设计中，PUT和PATCH的主要区别是什么？",
    type: "single",
    options: {
      A: "PUT用于创建，PATCH用于更新",
      B: "PUT是全量更新，PATCH是部分更新",
      C: "PUT是幂等的，PATCH不是",
      D: "没有本质区别"
    },
    correctAnswer: ["B"],
    abilityDimension: "architecture",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "PUT用于全量更新资源（替换整个资源），PATCH用于部分更新（只修改指定字段）。两者都是幂等的。"
  },
  {
    content: "以下哪个不是消息队列的主要优势？",
    type: "single",
    options: {
      A: "异步处理",
      B: "削峰填谷",
      C: "系统解耦",
      D: "提高响应速度"
    },
    correctAnswer: ["D"],
    abilityDimension: "architecture",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "消息队列提供异步处理、削峰填谷、系统解耦等优势，但会增加系统复杂度，不会提高同步请求的响应速度。"
  },
  {
    content: "在微服务架构中，服务发现（Service Discovery）的主要作用是什么？",
    type: "single",
    options: {
      A: "监控服务的健康状态",
      B: "动态获取服务的网络位置",
      C: "负载均衡",
      D: "服务限流"
    },
    correctAnswer: ["B"],
    abilityDimension: "architecture",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "服务发现用于在微服务架构中动态获取服务实例的网络位置（IP和端口），支持服务的动态扩缩容。"
  },

  // 中等题（8题）
  {
    content: "以下关于Redis的使用场景，哪些是合适的？（多选）",
    type: "multiple",
    options: {
      A: "会话缓存",
      B: "分布式锁",
      C: "主数据库",
      D: "消息队列"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "architecture",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "Redis适合做缓存、分布式锁、简单的消息队列（Pub/Sub、Stream）。但Redis是内存数据库，不适合作为主数据库存储重要业务数据。"
  },
  {
    content: "在设计高可用系统时，以下哪些措施是有效的？（多选）",
    type: "multiple",
    options: {
      A: "服务冗余部署",
      B: "实现熔断机制",
      C: "使用单体架构",
      D: "数据备份和容灾"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "architecture",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "高可用系统需要服务冗余（避免单点故障）、熔断机制（防止雪崩）、数据备份和容灾（数据安全）。单体架构不利于高可用。"
  },
  {
    content: "关于数据库读写分离，以下哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "可以提高数据库的读性能",
      B: "主库负责写操作，从库负责读操作",
      C: "不会存在主从延迟问题",
      D: "需要解决主从数据一致性问题"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "architecture",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "读写分离通过将读操作分散到从库来提高性能。但存在主从复制延迟，需要处理数据一致性问题，如强制读主库或延迟容忍。"
  },
  {
    content: "以下关于API网关的功能，哪些是常见的？（多选）",
    type: "multiple",
    options: {
      A: "路由转发",
      B: "身份认证",
      C: "限流熔断",
      D: "数据库访问"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "architecture",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "API网关的主要功能包括路由转发、身份认证、限流熔断、协议转换、日志监控等。数据库访问应该由后端服务处理，不属于网关职责。"
  },
  {
    content: "在分布式事务中，以下哪些是常见的解决方案？（多选）",
    type: "multiple",
    options: {
      A: "两阶段提交（2PC）",
      B: "TCC（Try-Confirm-Cancel）",
      C: "本地事务",
      D: "Saga模式"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "architecture",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "分布式事务的常见方案包括2PC（强一致性但性能差）、TCC（业务侵入性强）、Saga（最终一致性）。本地事务只能处理单数据库的事务。"
  },
  {
    content: "关于单例模式的实现，以下哪些方式在Java中是线程安全的？（多选）",
    type: "multiple",
    options: {
      A: "饿汉式（静态常量）",
      B: "懒汉式（synchronized方法）",
      C: "双重检查锁（DCL）",
      D: "枚举单例"
    },
    correctAnswer: ["A", "B", "C", "D"],
    abilityDimension: "architecture",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: ["java"],
    explanation: "所有选项都是线程安全的单例实现方式。饿汉式和枚举最简单安全，DCL性能好但实现复杂，synchronized方法安全但性能较差。"
  },
  {
    content: "以下关于微服务的缺点，哪些是正确的？（多选）",
    type: "multiple",
    options: {
      A: "增加了系统的复杂度",
      B: "分布式事务处理困难",
      C: "服务间调用的网络开销",
      D: "不支持水平扩展"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "architecture",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "微服务架构的缺点包括系统复杂度高、分布式事务难处理、网络调用开销大、运维成本高等。微服务支持独立部署和水平扩展，这是其优势。"
  },
  {
    content: "关于缓存穿透、缓存击穿、缓存雪崩，以下说法哪些是正确的？（多选）",
    type: "multiple",
    options: {
      A: "缓存穿透是指查询不存在的数据",
      B: "缓存击穿是指热点数据过期导致大量请求打到数据库",
      C: "缓存雪崩是指大量缓存同时失效",
      D: "布隆过滤器可以解决缓存雪崩问题"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "architecture",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "缓存穿透（查询不存在的key）、缓存击穿（热点key过期）、缓存雪崩（大量key同时过期）是三个不同的问题。布隆过滤器用于解决缓存穿透，不是雪崩。"
  },

  // 困难题（4题，包含1道陈述题）
  {
    content: "在分布式系统中实现最终一致性时，以下哪些是关键考虑因素？（多选）",
    type: "multiple",
    options: {
      A: "幂等性设计",
      B: "补偿机制",
      C: "强一致性保证",
      D: "事件溯源"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "architecture",
    difficulty: "hard",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "最终一致性需要幂等性设计（防止重复执行）、补偿机制（失败回滚）、事件溯源（记录状态变更）。强一致性与最终一致性是不同的一致性级别。"
  },
  {
    content: "关于分库分表的设计，以下哪些策略是合理的？（多选）",
    type: "multiple",
    options: {
      A: "根据用户ID进行水平分片",
      B: "使用全局唯一ID生成器",
      C: "跨分片查询应该尽量避免",
      D: "分片键应该经常变更以均衡负载"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "architecture",
    difficulty: "hard",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "分库分表需要选择合适的分片键（如用户ID）、使用全局ID生成器（如雪花算法）、避免跨分片查询。分片键应该保持稳定，不应频繁变更。"
  },
  {
    content: "在设计秒杀系统时，以下哪些优化措施是有效的？（多选）",
    type: "multiple",
    options: {
      A: "使用Redis预减库存",
      B: "消息队列异步处理订单",
      C: "数据库悲观锁防止超卖",
      D: "CDN缓存静态资源"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "architecture",
    difficulty: "hard",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "秒杀系统优化包括Redis预减库存（减少数据库压力）、消息队列削峰（异步处理）、CDN缓存（减轻服务器压力）。数据库悲观锁会严重影响性能，应该使用乐观锁或Redis分布式锁。"
  },
  {
    content: "你需要设计一个电商系统的订单服务，需求如下：\\n- 预计QPS 10,000+\\n- 需要支持秒杀场景（瞬时QPS可达50,000）\\n- 保证订单不重复、不丢失\\n\\n请用150字以内描述你的架构设计方案，至少包括：\\n1. 缓存策略\\n2. 数据库设计（分库分表/读写分离）\\n3. 消息队列使用场景\\n4. 如何保证幂等性",
    type: "essay",
    options: null,
    correctAnswer: null,
    abilityDimension: "architecture",
    difficulty: "hard",
    weight: 5,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "评分标准（总分5分）：\\n- 提到Redis/Memcached缓存热点数据（库存、商品信息）：1分\\n- 提到数据库分片或读写分离：1分\\n- 提到消息队列削峰/异步处理：1分\\n- 提到幂等性设计（唯一订单号/分布式锁/token机制）：1分\\n- 方案整体合理性与可行性：1分",
    referenceAnswer: "参考方案要点：\\n1. 缓存策略：Redis缓存库存、商品信息、用户信息，设置合理过期时间\\n2. 数据库设计：订单表按用户ID哈希分片，配置读写分离，主库写从库读\\n3. 消息队列：Kafka/RabbitMQ异步处理订单状态变更、通知、日志，削峰限流\\n4. 幂等性保证：使用雪花算法生成全局唯一订单号，Redis分布式锁防止重复下单，接口使用Token机制防止重复提交"
  }
];
