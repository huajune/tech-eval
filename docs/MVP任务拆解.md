# MVP任务拆解 - 技术能力评估系统

**项目周期：** 2-3周（10-15个工作日）
**团队配置：** 1-2名全栈工程师
**技术栈：** Next.js 15 + Supabase + Drizzle ORM + TypeScript

---

## 一、任务概览

### 1.1 功能模块拆解

```
技术能力评估系统 (TechEval)
│
├─ Phase 1: 数据库与基础设施 (3天)
│  ├─ Task 1.1: 数据库Schema设计与迁移
│  ├─ Task 1.2: 种子数据（静态题库80题）
│  └─ Task 1.3: 题目选择算法实现
│
├─ Phase 2: 考试配置与说明 (2天)
│  ├─ Task 2.1: 考试配置页面
│  ├─ Task 2.2: 考试说明页面
│  └─ Task 2.3: 路由保护与会话管理
│
├─ Phase 3: 核心答题引擎 (4天)
│  ├─ Task 3.1: 答题页面UI组件
│  ├─ Task 3.2: 倒计时器与自动提交
│  ├─ Task 3.3: 防作弊监控系统
│  └─ Task 3.4: 答案保存与提交逻辑
│
├─ Phase 4: 评估与结果展示 (3天)
│  ├─ Task 4.1: 自动评分引擎
│  ├─ Task 4.2: 结果报告页面
│  ├─ Task 4.3: 能力雷达图可视化
│  └─ Task 4.4: 答案解析页面
│
├─ Phase 5: 管理员功能 (2天)
│  ├─ Task 5.1: 陈述题评阅界面
│  └─ Task 5.2: 候选人结果列表
│
└─ Phase 6: 测试与优化 (2天)
   ├─ Task 6.1: 端到端测试
   ├─ Task 6.2: 性能优化
   └─ Task 6.3: 移动端适配
```

---

## 二、详细任务列表

### Phase 1: 数据库与基础设施（3天）

#### **Task 1.1: 数据库Schema设计与迁移**
**工作量：** 1天
**优先级：** P0（阻塞其他任务）

**子任务：**
- [ ] 创建 `db/schema.ts` 文件，定义7张核心表
  - `exams` - 考试模板
  - `questions` - 题库
  - `exam_sessions` - 考试会话
  - `answers` - 答案记录
  - `cheating_logs` - 作弊日志
  - `exam_results` - 考试结果
  - `users` - 用户表（关联Supabase Auth）
- [ ] 运行 `pnpm db:generate` 生成迁移文件
- [ ] 运行 `pnpm db:migrate` 应用到Supabase数据库
- [ ] 验证所有表和约束创建成功

**技术要点：**
```typescript
// db/schema.ts 核心字段设计
export const questionsTable = pgTable('questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'single' | 'multiple' | 'essay'
  options: jsonb('options'), // { A: "...", B: "...", C: "...", D: "..." }
  correct_answer: jsonb('correct_answer'), // ['A'] or ['A', 'C']
  ability_dimension: varchar('ability_dimension', { length: 50 }).notNull(),
  difficulty: varchar('difficulty', { length: 20 }).notNull(),
  weight: integer('weight').default(1),
  applicable_roles: jsonb('applicable_roles').notNull(),
  applicable_languages: jsonb('applicable_languages'),
  explanation: text('explanation'),
});
```

**验收标准：**
- ✅ 所有表在Drizzle Studio中可见
- ✅ 外键关系正确
- ✅ JSONB字段可正常读写

---

#### **Task 1.2: 种子数据（静态题库80题）**
**工作量：** 1.5天
**优先级：** P0

**子任务：**
- [ ] 编写代码设计题（20题）
  - 简单题：12题
  - 中等题：8题
- [ ] 编写软件架构题（20题）
  - 简单题：8题
  - 中等题：8题
  - 困难题：4题（包含1道陈述题：高并发系统设计）
- [ ] 编写数据库建模题（20题）
  - 简单题：12题
  - 中等题：6题（包含1道陈述题：数据库设计方案）
  - 困难题：2题
- [ ] 编写运维能力题（20题）
  - 简单题：12题
  - 中等题：6题
  - 困难题：2题
- [ ] 创建 `db/seed.ts` 脚本批量插入题目
- [ ] 为每道题添加详细解析

**题目模板：**
```typescript
// db/seed-data/questions.ts
export const codeDesignQuestions = [
  {
    content: "在React中，以下哪种方式最符合处理副作用的最佳实践？",
    type: "single",
    options: {
      A: "const [data, setData] = useState(fetchData())",
      B: "useEffect(() => { fetchData().then(setData) }, [])",
      C: "const data = useMemo(() => fetchData(), [])",
      D: "以上都不推荐"
    },
    correct_answer: ["B"],
    ability_dimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicable_roles: ["frontend", "fullstack"],
    applicable_languages: ["typescript"],
    explanation: "副作用（如数据获取）应该在useEffect中处理，避免在渲染过程中执行异步操作..."
  },
  // ... 更多题目
];
```

**验收标准：**
- ✅ 80题全部录入数据库
- ✅ 每个维度覆盖所有难度
- ✅ 题目与角色/语言正确关联
- ✅ 所有题目都有解析

---

#### **Task 1.3: 题目选择算法实现**
**工作量：** 0.5天
**优先级：** P1

**子任务：**
- [ ] 创建 `lib/exam-generator.ts`
- [ ] 实现题目筛选逻辑（根据角色+语言）
- [ ] 实现按难度分层抽题算法
- [ ] 实现题目随机打乱
- [ ] 单元测试覆盖

**核心算法：**
```typescript
// lib/exam-generator.ts
export async function generateExamQuestions(config: {
  role: string;
  language: string;
  framework: string;
}): Promise<Question[]> {
  // 1. 筛选适用题目（使用JSONB @> 谓词）
  const questions = await db
    .select()
    .from(questionsTable)
    .where(
      and(
        sql`${questionsTable.applicable_roles} @> ${sql.json([config.role])}`,
        or(
          isNull(questionsTable.applicable_languages),
          sql`${questionsTable.applicable_languages} @> ${sql.json([config.language])}`
        )
      )
    );

  // 2. 按维度和难度分组
  const grouped = groupBy(questions, ['ability_dimension', 'difficulty']);

  // 3. 按策略抽题（总20题）
  const selected = [
    ...selectRandomQuestions(grouped['code_design']['easy'], 3),
    ...selectRandomQuestions(grouped['code_design']['medium'], 2),
    ...selectRandomQuestions(grouped['architecture']['easy'], 2),
    ...selectRandomQuestions(grouped['architecture']['medium'], 2),
    ...selectRandomQuestions(grouped['architecture']['hard'], 1),
    ...selectRandomQuestions(grouped['database']['easy'], 3),
    ...selectRandomQuestions(grouped['database']['medium'], 2),
    ...selectRandomQuestions(grouped['devops']['easy'], 3),
    ...selectRandomQuestions(grouped['devops']['medium'], 1),
    ...selectRandomQuestions(grouped['devops']['hard'], 1),
  ];

  // 4. 随机打乱顺序
  return shuffle(selected);
}
```

**验收标准：**
- ✅ 每次生成20道题
- ✅ 题目分布符合策略
- ✅ 不会重复抽取同一题目
- ✅ 同一配置多次调用结果不同（随机性）

---

### Phase 2: 考试配置与说明（2天）

#### **Task 2.1: 考试配置页面**
**工作量：** 1天
**优先级：** P0

**文件结构：**
```
app/
└─ exam/
   └─ setup/
      └─ page.tsx          # 配置页面
components/
└─ exam/
   └─ exam-setup-form.tsx  # 配置表单组件
```

**子任务：**
- [ ] 创建 `components/exam/exam-setup-form.tsx`
- [ ] 实现角色选择（Radio按钮组）
- [ ] 实现语言选择（Radio按钮组）
- [ ] 实现框架选择（根据角色+语言动态显示）
- [ ] 表单验证（Zod Schema）
- [ ] 创建考试会话API：`app/api/exam/create-session/route.ts`
- [ ] 点击"开始考试"调用API创建会话
- [ ] 创建成功后跳转到说明页

**UI设计参考：**
```tsx
// components/exam/exam-setup-form.tsx
'use client';

export function ExamSetupForm() {
  const [role, setRole] = useState<'frontend' | 'backend' | 'fullstack'>();
  const [language, setLanguage] = useState<'typescript' | 'java' | 'python'>();
  const [framework, setFramework] = useState<string>();

  // 根据角色+语言动态显示框架选项
  const frameworkOptions = useMemo(() => {
    if (role === 'frontend' && language === 'typescript') {
      return ['nextjs', 'react'];
    }
    if (role === 'backend' && language === 'java') {
      return ['spring'];
    }
    // ...
  }, [role, language]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>考试配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 角色选择 */}
        <div>
          <Label>选择应聘岗位</Label>
          <RadioGroup value={role} onValueChange={setRole}>
            <RadioGroupItem value="frontend">前端开发工程师</RadioGroupItem>
            <RadioGroupItem value="backend">后端开发工程师</RadioGroupItem>
            <RadioGroupItem value="fullstack">全栈工程师</RadioGroupItem>
          </RadioGroup>
        </div>

        {/* 语言选择 */}
        {/* 框架选择 */}

        <Button onClick={handleStartExam}>开始考试</Button>
      </CardContent>
    </Card>
  );
}
```

**验收标准：**
- ✅ 表单交互流畅
- ✅ 框架选项正确联动
- ✅ 创建会话成功并跳转
- ✅ 移动端适配

---

#### **Task 2.2: 考试说明页面**
**工作量：** 0.5天
**优先级：** P1

**文件结构：**
```
app/
└─ exam/
   └─ [sessionId]/
      └─ instructions/
         └─ page.tsx
```

**子任务：**
- [ ] 创建说明页面组件
- [ ] 展示考试规则（时长、题量、题型）
- [ ] 展示防作弊规则
- [ ] "我已阅读并同意"复选框
- [ ] "开始答题"按钮（勾选后启用）

**内容设计：**
```markdown
## 考试规则
- ⏱️ 考试时长：10分钟（严格计时）
- 📝 题目数量：20题（18道选择题 + 2道简答题）
- 📊 考察维度：代码设计、软件架构、数据库建模、运维能力
- ✅ 提交方式：时间到自动提交，或手动提交

## 注意事项
- ⚠️ 请勿切换浏览器标签页或离开考试页面
- ⚠️ 离开页面3次将收到警告，5次将强制提交
- ⚠️ 鼠标/键盘无操作2分钟将收到提醒
- ⚠️ 答案会每30秒自动保存

## 答题建议
- 💡 不需要写出完全正确的语法，伪代码即可
- 💡 重点考察思路和设计方案
- 💡 可以先做简单题，标记难题稍后回顾
```

**验收标准：**
- ✅ 说明内容清晰易懂
- ✅ 必须勾选才能开始
- ✅ 点击开始跳转到答题页

---

#### **Task 2.3: 路由保护与会话管理**
**工作量：** 0.5天
**优先级：** P1

**子任务：**
- [ ] 创建 `lib/exam-session.ts` 会话工具函数
- [ ] 实现会话状态检查中间件
- [ ] 防止重复进入已完成的考试
- [ ] 防止未登录用户访问
- [ ] 实现会话恢复（刷新页面后继续考试）

**核心逻辑：**
```typescript
// lib/exam-session.ts
export async function validateExamSession(sessionId: string, userId: string) {
  const session = await db
    .select()
    .from(examSessionsTable)
    .where(
      and(
        eq(examSessionsTable.id, sessionId),
        eq(examSessionsTable.user_id, userId)
      )
    )
    .limit(1);

  if (!session) {
    throw new Error('会话不存在');
  }

  if (session.status === 'completed') {
    throw new Error('考试已完成，不能重复答题');
  }

  if (session.status === 'terminated') {
    throw new Error('考试已被终止（疑似作弊）');
  }

  // 检查是否超时
  const elapsed = Date.now() - session.start_time.getTime();
  if (elapsed > 10 * 60 * 1000) {
    // 超过10分钟，强制提交
    await autoSubmitExam(sessionId);
    throw new Error('考试时间已到，已自动提交');
  }

  return session;
}
```

---

### Phase 3: 核心答题引擎（4天）

#### **Task 3.1: 答题页面UI组件**
**工作量：** 1.5天
**优先级：** P0

**文件结构：**
```
app/
└─ exam/
   └─ [sessionId]/
      └─ page.tsx                # 答题主页面
components/
└─ exam/
   ├─ exam-header.tsx            # 顶部栏（计时器、题号）
   ├─ question-card.tsx          # 题目卡片
   ├─ question-navigation.tsx    # 题目导航
   ├─ answer-single-choice.tsx   # 单选题答题组件
   ├─ answer-multiple-choice.tsx # 多选题答题组件
   └─ answer-essay.tsx           # 简答题答题组件
```

**子任务：**
- [ ] 创建答题主页面布局
- [ ] 实现顶部倒计时器组件
- [ ] 实现题目卡片组件（根据题型渲染不同答题组件）
- [ ] 实现单选题答题组件（Radio Group）
- [ ] 实现多选题答题组件（Checkbox Group）
- [ ] 实现简答题答题组件（Textarea with 字数统计）
- [ ] 实现题目导航组件（显示所有题号和状态）
- [ ] 实现"上一题""下一题"按钮
- [ ] 实现"标记稍后回顾"功能
- [ ] 实现"提交全部答案"确认对话框

**UI布局：**
```tsx
// app/exam/[sessionId]/page.tsx
export default function ExamPage({ params }: { params: { sessionId: string } }) {
  const { questions, currentIndex, answers } = useExamStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部固定栏 */}
      <ExamHeader
        remainingSeconds={remainingSeconds}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
      />

      {/* 主内容区 */}
      <main className="container mx-auto py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* 左侧题目区（占8列） */}
          <div className="col-span-12 lg:col-span-8">
            <QuestionCard
              question={questions[currentIndex]}
              answer={answers[currentIndex]}
              onAnswerChange={handleAnswerChange}
            />

            {/* 操作按钮 */}
            <div className="flex justify-between mt-6">
              <Button onClick={handlePrevious} disabled={currentIndex === 0}>
                ← 上一题
              </Button>
              <Button onClick={handleNext} disabled={currentIndex === questions.length - 1}>
                下一题 →
              </Button>
            </div>
          </div>

          {/* 右侧导航区（占4列） */}
          <div className="col-span-12 lg:col-span-4">
            <QuestionNavigation
              questions={questions}
              answers={answers}
              currentIndex={currentIndex}
              onNavigate={setCurrentIndex}
            />

            <Button onClick={handleSubmit} className="w-full mt-4">
              提交全部答案
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
```

**验收标准：**
- ✅ 题目切换流畅
- ✅ 答案实时保存到状态
- ✅ 题目导航正确显示状态
- ✅ 移动端响应式适配

---

#### **Task 3.2: 倒计时器与自动提交**
**工作量：** 0.5天
**优先级：** P0

**子任务：**
- [ ] 创建 `hooks/use-countdown.ts`
- [ ] 实现倒计时逻辑（精确到秒）
- [ ] 最后1分钟红色警告
- [ ] 时间到自动触发提交
- [ ] 将剩余时间同步到后端（每30秒）

**实现代码：**
```typescript
// hooks/use-countdown.ts
export function useCountdown(initialSeconds: number, onTimeout: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      onTimeout();
      return;
    }

    const timer = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onTimeout]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const formatted = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  const isWarning = seconds <= 60;

  return { seconds, formatted, isWarning };
}
```

**验收标准：**
- ✅ 倒计时精确
- ✅ 时间到自动提交
- ✅ UI警告状态正确

---

#### **Task 3.3: 防作弊监控系统**
**工作量：** 1天
**优先级：** P1

**子任务：**
- [ ] 创建 `hooks/use-anti-cheat.ts`
- [ ] 实现页面失焦检测（visibilitychange事件）
- [ ] 实现离开时长计算
- [ ] 实现空闲超时检测
- [ ] 实现复制粘贴检测（仅记录）
- [ ] 创建作弊日志API：`app/api/exam/log-cheating/route.ts`
- [ ] 警告次数达到阈值触发提醒/强制提交

**实现代码：**
```typescript
// hooks/use-anti-cheat.ts
export function useAntiCheat(sessionId: string) {
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    let blurStartTime: number | null = null;
    let idleTimer: NodeJS.Timeout;

    // 页面失焦检测
    const handleVisibilityChange = async () => {
      if (document.hidden) {
        blurStartTime = Date.now();
        await logCheatingEvent(sessionId, 'page_blur');
      } else if (blurStartTime) {
        const duration = Math.floor((Date.now() - blurStartTime) / 1000);
        await logCheatingEvent(sessionId, 'tab_switch', duration);

        // 增加警告次数
        setWarnings(prev => {
          const newCount = prev + 1;
          if (newCount >= 3 && newCount < 5) {
            setShowWarning(true);
          }
          if (newCount >= 5) {
            // 强制提交
            window.location.href = '/exam/force-submit';
          }
          return newCount;
        });

        blurStartTime = null;
      }
    };

    // 空闲检测
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(async () => {
        await logCheatingEvent(sessionId, 'idle_timeout');
        alert('检测到长时间无操作，请继续答题');
      }, 120000); // 2分钟
    };

    // 复制粘贴检测
    const handlePaste = async (e: ClipboardEvent) => {
      await logCheatingEvent(sessionId, 'copy_paste');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', resetIdleTimer);
    document.addEventListener('keydown', resetIdleTimer);
    document.addEventListener('paste', handlePaste);

    resetIdleTimer();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousemove', resetIdleTimer);
      document.removeEventListener('keydown', resetIdleTimer);
      document.removeEventListener('paste', handlePaste);
      clearTimeout(idleTimer);
    };
  }, [sessionId]);

  return { warnings, showWarning, setShowWarning };
}
```

**验收标准：**
- ✅ 失焦行为正确记录
- ✅ 警告弹窗正确触发
- ✅ 5次失焦强制提交
- ✅ 空闲提醒正常工作

---

#### **Task 3.4: 答案保存与提交逻辑**
**工作量：** 1天
**优先级：** P0

**子任务：**
- [ ] 创建答案保存API：`app/api/exam/save-answer/route.ts`
- [ ] 创建考试提交API：`app/api/exam/submit/route.ts`
- [ ] 实现自动保存（每30秒）
- [ ] 实现切换题目时保存
- [ ] 实现提交前验证（必答题检查）
- [ ] 提交成功后跳转到结果页

**API设计：**
```typescript
// app/api/exam/save-answer/route.ts
export async function POST(request: Request) {
  const { sessionId, questionId, userAnswer } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 验证会话归属
  await validateExamSession(sessionId, user.id);

  // 保存或更新答案
  await db
    .insert(answersTable)
    .values({
      session_id: sessionId,
      question_id: questionId,
      user_answer: userAnswer,
    })
    .onConflictDoUpdate({
      target: [answersTable.session_id, answersTable.question_id],
      set: { user_answer: userAnswer, answered_at: new Date() },
    });

  return Response.json({ success: true });
}
```

```typescript
// app/api/exam/submit/route.ts
export async function POST(request: Request) {
  const { sessionId } = await request.json();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 验证会话
  await validateExamSession(sessionId, user.id);

  // 更新会话状态
  await db
    .update(examSessionsTable)
    .set({
      status: 'completed',
      end_time: new Date(),
    })
    .where(eq(examSessionsTable.id, sessionId));

  // 触发自动评分（选择题）
  await autoScoreExam(sessionId);

  return Response.json({ success: true });
}
```

**验收标准：**
- ✅ 答案保存成功
- ✅ 自动保存不影响答题体验
- ✅ 提交后状态正确更新
- ✅ 刷新页面后可恢复答案

---

### Phase 4: 评估与结果展示（3天）

#### **Task 4.1: 自动评分引擎**
**工作量：** 1天
**优先级：** P0

**子任务：**
- [ ] 创建 `lib/scoring-engine.ts`
- [ ] 实现选择题自动评分
- [ ] 实现能力维度得分计算
- [ ] 实现总分计算（加权平均）
- [ ] 实现职级映射逻辑
- [ ] 将结果写入 `exam_results` 表

**核心算法：**
```typescript
// lib/scoring-engine.ts
export async function calculateExamResult(sessionId: string) {
  // 1. 获取所有答案及对应题目
  const answers = await db
    .select({
      answer: answersTable,
      question: questionsTable,
    })
    .from(answersTable)
    .innerJoin(questionsTable, eq(answersTable.question_id, questionsTable.id))
    .where(eq(answersTable.session_id, sessionId));

  // 2. 按能力维度分组计算得分
  const abilityScores = {
    code_design: { score: 0, total: 0 },
    architecture: { score: 0, total: 0 },
    database: { score: 0, total: 0 },
    devops: { score: 0, total: 0 },
  };

  for (const { answer, question } of answers) {
    const dimension = question.ability_dimension;
    const weight = question.weight;

    // 选择题自动评分
    if (question.type !== 'essay') {
      const isCorrect = compareAnswers(
        answer.user_answer,
        question.correct_answer
      );
      abilityScores[dimension].score += isCorrect ? weight : 0;
      abilityScores[dimension].total += weight;

      // 更新is_correct字段
      await db
        .update(answersTable)
        .set({ is_correct: isCorrect })
        .where(eq(answersTable.id, answer.id));
    } else {
      // 陈述题：等待人工评分，先计入总分
      abilityScores[dimension].score += answer.manual_score ?? 0;
      abilityScores[dimension].total += 5; // 陈述题满分5分
    }
  }

  // 3. 归一化到0-100
  const normalizedScores = Object.fromEntries(
    Object.entries(abilityScores).map(([key, { score, total }]) => [
      key,
      total > 0 ? Math.round((score / total) * 100) : 0,
    ])
  );

  // 4. 加权总分
  const totalScore = Math.round(
    normalizedScores.code_design * 0.25 +
    normalizedScores.architecture * 0.30 +
    normalizedScores.database * 0.25 +
    normalizedScores.devops * 0.20
  );

  // 5. 职级映射
  const estimatedLevel = mapScoreToLevel(totalScore);

  // 6. 写入结果表
  await db.insert(examResultsTable).values({
    session_id: sessionId,
    user_id: session.user_id,
    total_score: totalScore,
    ability_scores: normalizedScores,
    estimated_level: estimatedLevel,
    pass_status: totalScore >= 60,
  });

  return { totalScore, abilityScores: normalizedScores, estimatedLevel };
}

function mapScoreToLevel(score: number): string {
  if (score >= 91) return 'P9';
  if (score >= 76) return 'P8';
  if (score >= 61) return 'P7';
  if (score >= 41) return 'P6';
  return 'P5';
}
```

**验收标准：**
- ✅ 选择题评分正确
- ✅ 各维度得分准确
- ✅ 职级映射符合规则
- ✅ 结果成功写入数据库

---

#### **Task 4.2: 结果报告页面**
**工作量：** 1天
**优先级：** P0

**文件结构：**
```
app/
└─ exam/
   └─ [sessionId]/
      └─ result/
         └─ page.tsx
components/
└─ exam/
   ├─ result-summary.tsx     # 总分与职级卡片
   ├─ ability-radar-chart.tsx # 能力雷达图
   └─ result-analysis.tsx    # 详细分析
```

**子任务：**
- [ ] 创建结果页面主布局
- [ ] 实现总分与职级展示卡片
- [ ] 实现能力雷达图（使用recharts或echarts）
- [ ] 实现详细分析（优势/劣势/答题情况）
- [ ] 实现"查看答案解析"按钮

**UI设计：**
```tsx
// app/exam/[sessionId]/result/page.tsx
export default async function ResultPage({ params }: { params: { sessionId: string } }) {
  const result = await getExamResult(params.sessionId);

  return (
    <div className="container mx-auto py-8">
      {/* 顶部总结 */}
      <ResultSummary
        totalScore={result.total_score}
        estimatedLevel={result.estimated_level}
        passStatus={result.pass_status}
      />

      {/* 能力雷达图 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>能力雷达图</CardTitle>
        </CardHeader>
        <CardContent>
          <AbilityRadarChart scores={result.ability_scores} />
        </CardContent>
      </Card>

      {/* 详细分析 */}
      <ResultAnalysis
        abilityScores={result.ability_scores}
        answers={result.answers}
      />

      {/* 操作按钮 */}
      <div className="flex gap-4 mt-6">
        <Button asChild>
          <Link href={`/exam/${params.sessionId}/answers`}>
            查看答案解析
          </Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
```

**验收标准：**
- ✅ 结果展示清晰易懂
- ✅ 雷达图正确渲染
- ✅ 分析建议有价值
- ✅ 移动端适配

---

#### **Task 4.3: 能力雷达图可视化**
**工作量：** 0.5天
**优先级：** P1

**子任务：**
- [ ] 安装图表库：`pnpm add recharts`
- [ ] 创建 `components/exam/ability-radar-chart.tsx`
- [ ] 配置雷达图样式（4个维度）
- [ ] 添加悬停提示

**实现代码：**
```typescript
// components/exam/ability-radar-chart.tsx
'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export function AbilityRadarChart({ scores }: { scores: Record<string, number> }) {
  const data = [
    { subject: '代码设计', score: scores.code_design, fullMark: 100 },
    { subject: '软件架构', score: scores.architecture, fullMark: 100 },
    { subject: '数据库建模', score: scores.database, fullMark: 100 },
    { subject: '运维能力', score: scores.devops, fullMark: 100 },
  ];

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} />
        <Radar name="能力得分" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
```

**验收标准：**
- ✅ 雷达图正确显示4个维度
- ✅ 分数映射准确
- ✅ 响应式布局

---

#### **Task 4.4: 答案解析页面**
**工作量：** 0.5天
**优先级：** P2

**子任务：**
- [ ] 创建 `app/exam/[sessionId]/answers/page.tsx`
- [ ] 展示所有题目及用户答案
- [ ] 标注正确/错误状态
- [ ] 展示详细解析
- [ ] 陈述题显示参考答案（需等待人工评阅）

**验收标准：**
- ✅ 所有题目解析可见
- ✅ 正确/错误标注清晰
- ✅ 解析内容有价值

---

### Phase 5: 管理员功能（2天）

#### **Task 5.1: 陈述题评阅界面**
**工作量：** 1天
**优先级：** P1

**文件结构：**
```
app/
└─ admin/
   └─ grading/
      └─ page.tsx
```

**子任务：**
- [ ] 创建管理员路由保护（检查用户角色）
- [ ] 创建评阅列表页（显示所有待评阅的陈述题）
- [ ] 创建评阅详情页（显示题目、参考答案、考生答案）
- [ ] 实现打分功能（0-5分滑块）
- [ ] 实现评语功能（可选）
- [ ] 创建更新评分API：`app/api/admin/grade-answer/route.ts`

**UI设计：**
```tsx
// app/admin/grading/page.tsx
export default async function GradingPage() {
  const pendingAnswers = await getPendingEssayAnswers();

  return (
    <div className="container mx-auto py-8">
      <h1>陈述题评阅</h1>

      <div className="space-y-4 mt-6">
        {pendingAnswers.map(item => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.question.content}</CardTitle>
              <p>考生：{item.user.email}</p>
            </CardHeader>
            <CardContent>
              <div>
                <Label>考生答案</Label>
                <p className="whitespace-pre-wrap">{item.user_answer}</p>
              </div>

              <div className="mt-4">
                <Label>参考答案</Label>
                <p className="whitespace-pre-wrap">{item.question.explanation}</p>
              </div>

              <div className="mt-4">
                <Label>评分（0-5分）</Label>
                <Slider
                  min={0}
                  max={5}
                  step={1}
                  value={[score]}
                  onValueChange={([val]) => setScore(val)}
                />
                <span className="text-2xl font-bold">{score}分</span>
              </div>

              <Button onClick={() => submitGrade(item.id, score)}>
                提交评分
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

**验收标准：**
- ✅ 只有管理员可访问
- ✅ 评分功能正常
- ✅ 评分后触发总分重算

---

#### **Task 5.2: 候选人结果列表**
**工作量：** 1天
**优先级：** P2

**子任务：**
- [ ] 创建 `app/admin/results/page.tsx`
- [ ] 展示所有候选人列表（表格形式）
- [ ] 支持筛选（按职级、分数区间、日期）
- [ ] 支持排序（按总分、完成时间）
- [ ] 点击查看详细结果报告

**验收标准：**
- ✅ 列表展示完整
- ✅ 筛选排序正常
- ✅ 可导出Excel（可选）

---

### Phase 6: 测试与优化（2天）

#### **Task 6.1: 端到端测试**
**工作量：** 1天
**优先级：** P1

**子任务：**
- [ ] 测试完整考试流程（配置→答题→提交→查看结果）
- [ ] 测试防作弊监控（切屏、空闲）
- [ ] 测试自动保存与会话恢复
- [ ] 测试倒计时与自动提交
- [ ] 测试管理员评阅流程
- [ ] 修复发现的Bug

---

#### **Task 6.2: 性能优化**
**工作量：** 0.5天
**优先级：** P2

**子任务：**
- [ ] 优化题目加载（SSR预渲染）
- [ ] 优化答案保存（防抖/节流）
- [ ] 优化雷达图渲染
- [ ] 添加加载状态（Skeleton）
- [ ] 压缩图片资源

---

#### **Task 6.3: 移动端适配**
**工作量：** 0.5天
**优先级：** P2

**子任务：**
- [ ] 测试所有页面在移动端的表现
- [ ] 优化答题页面布局（单列显示）
- [ ] 优化题目导航（折叠/抽屉）
- [ ] 测试触摸交互

---

## 三、技术栈清单

### 核心依赖
```json
{
  "dependencies": {
    "next": "latest",
    "react": "^19.0.0",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest",
    "drizzle-orm": "^0.44.6",
    "postgres": "^3.4.7",
    "recharts": "^2.10.0",  // 雷达图
    "zod": "^3.22.0",        // 表单验证
    "date-fns": "^3.0.0"     // 时间处理
  }
}
```

### 项目结构
```
with-supabase-app/
├─ app/
│  ├─ exam/
│  │  ├─ setup/page.tsx              # 考试配置
│  │  └─ [sessionId]/
│  │     ├─ instructions/page.tsx    # 考试说明
│  │     ├─ page.tsx                 # 答题页面
│  │     ├─ result/page.tsx          # 结果报告
│  │     └─ answers/page.tsx         # 答案解析
│  ├─ admin/
│  │  ├─ grading/page.tsx            # 陈述题评阅
│  │  └─ results/page.tsx            # 候选人列表
│  └─ api/
│     └─ exam/
│        ├─ create-session/route.ts
│        ├─ save-answer/route.ts
│        ├─ submit/route.ts
│        └─ log-cheating/route.ts
├─ components/
│  └─ exam/
│     ├─ exam-setup-form.tsx
│     ├─ exam-header.tsx
│     ├─ question-card.tsx
│     ├─ question-navigation.tsx
│     ├─ answer-single-choice.tsx
│     ├─ answer-multiple-choice.tsx
│     ├─ answer-essay.tsx
│     ├─ result-summary.tsx
│     ├─ ability-radar-chart.tsx
│     └─ result-analysis.tsx
├─ lib/
│  ├─ exam-generator.ts        # 题目选择算法
│  ├─ scoring-engine.ts        # 评分引擎
│  └─ exam-session.ts          # 会话管理
├─ hooks/
│  ├─ use-countdown.ts         # 倒计时
│  ├─ use-anti-cheat.ts        # 防作弊
│  └─ use-exam-store.ts        # 答题状态管理
├─ db/
│  ├─ schema.ts                # 数据库Schema
│  ├─ seed.ts                  # 种子数据脚本
│  └─ seed-data/
│     └─ questions.ts          # 题库数据
└─ docs/
   ├─ PRD-技术能力评估系统.md
   ├─ MVP任务拆解.md
   └─ 数据库Schema设计.md
```

---

## 四、开发排期（甘特图）

```
Week 1 (Day 1-5):
Day 1: ████ Task 1.1 数据库Schema
Day 2: ████████ Task 1.2 题库录入（上半）
Day 3: ████████ Task 1.2 题库录入（下半）
Day 4: ████ Task 1.3 题目算法 + ████ Task 2.1 配置页面
Day 5: ████ Task 2.1 配置页面 + ██ Task 2.2 说明页面 + ██ Task 2.3 路由保护

Week 2 (Day 6-10):
Day 6: ████████ Task 3.1 答题UI（上半）
Day 7: ████████ Task 3.1 答题UI（下半）
Day 8: ██ Task 3.2 倒计时 + ████ Task 3.3 防作弊
Day 9: ████ Task 3.3 防作弊 + ████ Task 3.4 答案保存
Day 10: ████ Task 3.4 答案保存 + ████ Task 4.1 评分引擎

Week 3 (Day 11-15):
Day 11: ████████ Task 4.2 结果页面 + ██ Task 4.3 雷达图
Day 12: ████ Task 4.4 答案解析 + ████ Task 5.1 评阅界面
Day 13: ████████ Task 5.2 候选人列表
Day 14: ████████ Task 6.1 端到端测试
Day 15: ████ Task 6.2 性能优化 + ████ Task 6.3 移动端适配
```

---

## 五、风险与应对

| 风险 | 影响 | 概率 | 应对策略 |
|-----|------|------|---------|
| 题库质量不达标 | 高 | 中 | 先完成20题核心题库，后续迭代补充 |
| 防作弊误报 | 中 | 中 | 设置合理阈值，提供申诉机制 |
| 陈述题评分周期长 | 中 | 高 | 选择题先出结果，陈述题异步评分 |
| 移动端体验差 | 中 | 低 | 优先PC端，移动端降级方案 |
| 并发性能瓶颈 | 高 | 低 | Supabase连接池 + Redis缓存 |

---

## 六、验收标准

### MVP最低验收标准
- ✅ 用户可完成完整考试流程
- ✅ 选择题自动评分准确率100%
- ✅ 陈述题可人工评阅
- ✅ 结果报告正确展示4维能力
- ✅ 防作弊监控正常工作
- ✅ 无阻塞性Bug

### 性能标准
- ✅ 页面加载 < 2秒
- ✅ 答案保存响应 < 500ms
- ✅ 支持并发50人同时考试

### 体验标准
- ✅ 移动端可正常答题
- ✅ 倒计时准确无误
- ✅ 警告提示友好清晰

---

**文档维护者：** Tech Team
**最后更新：** 2025-10-28
