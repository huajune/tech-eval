export const codeDesignQuestions = [
  // 简单题（12题）
  {
    content: "在React函数组件中，以下哪种方式最符合处理副作用的最佳实践？",
    type: "single",
    options: {
      A: "const [data, setData] = useState(fetchData())",
      B: "useEffect(() => { fetchData().then(setData) }, [])",
      C: "const data = useMemo(() => fetchData(), [])",
      D: "以上都不推荐"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "副作用（如数据获取）应该在useEffect中处理，避免在渲染过程中执行异步操作。选项A会在每次渲染时调用fetchData，选项C的useMemo用于计算派生值而非处理副作用。"
  },
  {
    content: "以下关于JavaScript中const声明的说法，哪个是正确的？",
    type: "single",
    options: {
      A: "const声明的对象属性不能被修改",
      B: "const声明的变量不能被重新赋值",
      C: "const声明的数组元素不能被修改",
      D: "const声明会提升到作用域顶部并初始化为undefined"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "const声明的变量不能被重新赋值，但如果是对象或数组，其内部属性/元素仍可被修改。const声明存在暂时性死区，不会像var那样提升并初始化。"
  },
  {
    content: "在TypeScript中，以下哪种方式可以正确定义一个只读数组类型？",
    type: "single",
    options: {
      A: "const arr: number[] = [1, 2, 3]",
      B: "const arr: readonly number[] = [1, 2, 3]",
      C: "const arr: Array<number> = [1, 2, 3]",
      D: "const arr: ReadonlyArray<number> = [1, 2, 3]"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "TypeScript中可以使用 readonly number[] 或 ReadonlyArray<number> 来定义只读数组。选项B和D都是正确的，但题目要求选择一个，B是更简洁的写法。"
  },
  {
    content: "以下哪个React Hook可以在组件卸载时执行清理操作？",
    type: "single",
    options: {
      A: "useEffect返回的清理函数",
      B: "useLayoutEffect",
      C: "useCallback",
      D: "useMemo"
    },
    correctAnswer: ["A"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "useEffect可以返回一个清理函数，这个函数会在组件卸载时或下次effect执行前被调用，用于清理订阅、定时器等资源。"
  },
  {
    content: "在Python中，以下哪种方式是推荐的字符串格式化方法（Python 3.6+）？",
    type: "single",
    options: {
      A: "\"Hello %s\" % name",
      B: "\"Hello {}\".format(name)",
      C: "f\"Hello {name}\"",
      D: "\"Hello \" + name"
    },
    correctAnswer: ["C"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: ["python"],
    explanation: "f-string（格式化字符串字面量）是Python 3.6+推荐的字符串格式化方式，语法简洁且性能更好。"
  },
  {
    content: "Java中，以下关于异常处理的说法哪个是正确的？",
    type: "single",
    options: {
      A: "finally块一定会执行，即使try块中有return语句",
      B: "catch块可以捕获所有类型的错误包括OutOfMemoryError",
      C: "可以在finally块中使用return语句覆盖try块的返回值",
      D: "必须捕获所有受检异常，否则程序无法编译"
    },
    correctAnswer: ["A"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: ["java"],
    explanation: "finally块会在try-catch块执行完毕后必定执行，即使有return、break或continue语句。但在finally中使用return是不推荐的做法。"
  },
  {
    content: "以下哪种情况适合使用React的useCallback Hook？",
    type: "single",
    options: {
      A: "缓存复杂的计算结果",
      B: "防止子组件不必要的重新渲染",
      C: "管理组件的状态",
      D: "执行副作用操作"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "useCallback用于缓存函数引用，避免在每次渲染时创建新的函数实例，特别是当函数作为props传递给使用React.memo优化的子组件时。"
  },
  {
    content: "在TypeScript中，interface和type的主要区别是什么？",
    type: "single",
    options: {
      A: "interface只能定义对象类型，type可以定义任何类型",
      B: "interface不支持继承，type支持",
      C: "type不能被重复声明，interface可以",
      D: "没有本质区别，完全可以互换使用"
    },
    correctAnswer: ["A"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "interface主要用于定义对象类型且支持声明合并，type可以定义联合类型、交叉类型、原始类型别名等。interface支持extends继承，type使用交叉类型(&)实现类似功能。"
  },
  {
    content: "Python中，以下哪种方式可以避免字典键不存在时抛出KeyError？",
    type: "single",
    options: {
      A: "使用dict[key]访问",
      B: "使用dict.get(key, default)访问",
      C: "使用dict.keys()检查",
      D: "使用dict.values()访问"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: ["python"],
    explanation: "dict.get(key, default)方法在键不存在时返回默认值而不会抛出异常。也可以使用 key in dict 先检查键是否存在。"
  },
  {
    content: "Java中，以下哪个集合类是线程安全的？",
    type: "single",
    options: {
      A: "ArrayList",
      B: "HashMap",
      C: "ConcurrentHashMap",
      D: "LinkedList"
    },
    correctAnswer: ["C"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: ["java"],
    explanation: "ConcurrentHashMap是线程安全的，使用分段锁机制提高并发性能。ArrayList、HashMap和LinkedList都不是线程安全的。"
  },
  {
    content: "在React中，以下哪种方式可以避免组件在props未变化时重新渲染？",
    type: "single",
    options: {
      A: "使用shouldComponentUpdate",
      B: "使用React.memo包裹函数组件",
      C: "使用PureComponent",
      D: "以上都可以"
    },
    correctAnswer: ["D"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "shouldComponentUpdate用于类组件，React.memo用于函数组件，PureComponent是内置浅比较的类组件基类。三者都可以通过比较props避免不必要的渲染。"
  },
  {
    content: "以下关于JavaScript闭包的说法，哪个是正确的？",
    type: "single",
    options: {
      A: "闭包会导致内存泄漏，应该避免使用",
      B: "闭包可以访问外部函数的变量，即使外部函数已经返回",
      C: "闭包只能在异步函数中使用",
      D: "闭包必须使用箭头函数才能创建"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "闭包是指函数可以记住并访问其词法作用域，即使函数在其词法作用域之外执行。这是JavaScript的核心特性，合理使用不会导致内存泄漏。"
  },

  // 中等题（8题）
  {
    content: "以下关于React Hooks的规则，哪些是正确的？（多选）",
    type: "multiple",
    options: {
      A: "只能在函数组件的顶层调用Hooks",
      B: "可以在条件语句中调用Hooks",
      C: "可以在循环中调用Hooks",
      D: "只能在React函数组件或自定义Hook中调用Hooks"
    },
    correctAnswer: ["A", "D"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "Hooks必须在函数顶层调用，不能在条件、循环或嵌套函数中调用，以确保每次渲染时Hooks的调用顺序一致。Hooks只能在React函数组件或自定义Hook中使用。"
  },
  {
    content: "在设计RESTful API时，以下哪些HTTP方法是幂等的？（多选）",
    type: "multiple",
    options: {
      A: "GET",
      B: "POST",
      C: "PUT",
      D: "DELETE"
    },
    correctAnswer: ["A", "C", "D"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "GET、PUT、DELETE是幂等的，即多次执行相同请求的效果与执行一次相同。POST不是幂等的，每次调用都可能创建新资源。"
  },
  {
    content: "Python中，以下哪些是正确的上下文管理器（context manager）使用场景？（多选）",
    type: "multiple",
    options: {
      A: "文件操作",
      B: "数据库连接",
      C: "锁资源管理",
      D: "数学计算"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: ["python"],
    explanation: "上下文管理器（with语句）用于资源管理，确保资源被正确获取和释放。适用于文件、数据库连接、锁等需要清理的资源，不适合简单的数学计算。"
  },
  {
    content: "Java中，以下关于Stream API的说法哪些是正确的？（多选）",
    type: "multiple",
    options: {
      A: "Stream操作分为中间操作和终止操作",
      B: "Stream可以被重复使用",
      C: "并行Stream总是比顺序Stream快",
      D: "Stream操作是惰性求值的"
    },
    correctAnswer: ["A", "D"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: ["java"],
    explanation: "Stream操作分为中间操作（返回Stream）和终止操作（返回结果）。Stream是一次性的，不能重复使用。Stream使用惰性求值，只有在终止操作时才执行。并行Stream不一定更快，取决于数据量和操作复杂度。"
  },
  {
    content: "在TypeScript中，以下哪些类型守卫（Type Guard）的方式是有效的？（多选）",
    type: "multiple",
    options: {
      A: "使用typeof检查",
      B: "使用instanceof检查",
      C: "自定义类型谓词函数",
      D: "使用in操作符检查属性"
    },
    correctAnswer: ["A", "B", "C", "D"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "TypeScript支持多种类型守卫方式：typeof用于原始类型，instanceof用于类实例，in用于检查属性，自定义类型谓词（如 is Type）用于复杂类型判断。"
  },
  {
    content: "以下关于React的受控组件和非受控组件，哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "受控组件的值由React state管理",
      B: "非受控组件使用ref访问DOM获取值",
      C: "受控组件更符合React的数据流理念",
      D: "非受控组件性能一定比受控组件好"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "受控组件的值由state管理，每次输入都会触发状态更新。非受控组件使用ref直接操作DOM。受控组件符合React单向数据流，但性能不一定比非受控组件差，取决于具体场景。"
  },
  {
    content: "Python中，以下关于装饰器（Decorator）的说法哪些是正确的？（多选）",
    type: "multiple",
    options: {
      A: "装饰器本质是一个返回函数的函数",
      B: "可以给一个函数添加多个装饰器",
      C: "装饰器会修改原函数的代码",
      D: "@符号是装饰器的语法糖"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: ["python"],
    explanation: "装饰器是接受函数并返回新函数的高阶函数。可以叠加多个装饰器。@decorator是语法糖，等价于 func = decorator(func)。装饰器不修改原函数代码，而是包装它。"
  },
  {
    content: "Java中，以下关于Optional类的使用哪些是最佳实践？（多选）",
    type: "multiple",
    options: {
      A: "使用Optional.of()包装可能为null的值",
      B: "使用Optional.ofNullable()包装可能为null的值",
      C: "避免在类字段中使用Optional",
      D: "使用orElse()或orElseGet()提供默认值"
    },
    correctAnswer: ["B", "C", "D"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: ["java"],
    explanation: "Optional.of()要求参数非空，ofNullable()可接受null。Optional不应用作类字段，主要用于方法返回值。orElse/orElseGet用于提供默认值，避免直接调用get()。"
  }
];
