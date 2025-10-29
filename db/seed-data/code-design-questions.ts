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
  {
    content: "在Next.js中，以下哪种方式可以创建动态路由？",
    type: "single",
    options: {
      A: "pages/post-[id].tsx",
      B: "pages/post/[id].tsx",
      C: "pages/post/:id.tsx",
      D: "pages/post/{id}.tsx"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "Next.js使用文件系统路由，动态路由段用方括号表示，如[id].tsx。放在目录下可以访问/post/123这样的URL。"
  },
  {
    content: "TypeScript中，以下哪种方式可以定义一个可选属性？",
    type: "single",
    options: {
      A: "name: string | null",
      B: "name?: string",
      C: "name: string = ''",
      D: "name: string | undefined"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "问号(?)表示可选属性，相当于 name: string | undefined。与| null不同，可选属性可以完全不提供。"
  },
  {
    content: "React中，useState的初始值如果是一个函数调用，会发生什么？",
    type: "single",
    options: {
      A: "函数会在每次渲染时执行",
      B: "函数只会在组件挂载时执行一次",
      C: "会报错，useState不接受函数作为参数",
      D: "函数会在组件更新时执行"
    },
    correctAnswer: ["A"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "useState(expensiveFunc())会在每次渲染时调用函数。如果初始值计算昂贵，应该使用惰性初始化：useState(() => expensiveFunc())。"
  },
  {
    content: "在React中，以下关于key属性的说法，哪个是正确的？",
    type: "single",
    options: {
      A: "key只是为了方便调试，对性能没有影响",
      B: "可以使用数组索引作为key，这是最佳实践",
      C: "key帮助React识别哪些元素改变了，从而优化渲染",
      D: "key必须是数字类型"
    },
    correctAnswer: ["C"],
    abilityDimension: "code_design",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "key帮助React识别列表中元素的变化，避免不必要的重新渲染。使用索引作为key在列表项顺序改变时会导致问题，应该使用稳定的唯一标识。"
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
  },
  {
    content: "在Next.js中，你需要展示一个商品列表页面，数据每天更新一次。以下哪种数据获取方式最合适？",
    type: "single",
    options: {
      A: "getServerSideProps - 每次请求都获取最新数据",
      B: "getStaticProps with revalidate - 增量静态生成",
      C: "useEffect客户端请求 - 在浏览器中获取数据",
      D: "getStaticProps without revalidate - 构建时生成"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "数据每天更新一次，使用ISR(Incremental Static Regeneration)最合适，设置revalidate为86400秒。既保证了性能（静态页面），又能定期更新数据。SSR每次都请求浪费资源，纯静态无法更新，客户端请求SEO不友好。"
  },
  {
    content: "以下关于React性能优化的说法，哪些是正确的？（多选）",
    type: "multiple",
    options: {
      A: "useMemo用于缓存计算结果，避免重复计算",
      B: "useCallback用于缓存函数引用，避免子组件不必要的渲染",
      C: "应该给所有组件都包裹React.memo",
      D: "使用React.lazy和Suspense可以实现代码分割"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "useMemo缓存计算结果，useCallback缓存函数引用，React.lazy实现懒加载。但不应该过度优化，给所有组件包裹memo会增加额外开销，应该针对性优化重渲染昂贵的组件。"
  },
  {
    content: "TypeScript中，以下哪些工具类型的使用是正确的？（多选）",
    type: "multiple",
    options: {
      A: "Partial<User>可以将User的所有属性变为可选",
      B: "Pick<User, 'id' | 'name'>可以选择User的部分属性创建新类型",
      C: "Omit<User, 'password'>可以排除User的password属性",
      D: "Required<User>可以将User的所有可选属性变为必选"
    },
    correctAnswer: ["A", "B", "C", "D"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "所有选项都是TypeScript内置工具类型的正确用法。Partial使所有属性可选，Pick选择指定属性，Omit排除指定属性，Required使所有属性必选。"
  },
  {
    content: "在React中，你有一个深层嵌套的组件树，多个子组件需要访问用户信息。以下哪种方式最合适？",
    type: "single",
    options: {
      A: "通过props一层层传递下去",
      B: "使用Context API共享数据",
      C: "使用全局变量存储",
      D: "每个组件独立请求用户信息"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "Context API专为解决props drilling（逐层传递）问题设计，适合共享全局数据如用户信息、主题、语言等。全局变量不响应式，独立请求浪费资源，props逐层传递维护困难。"
  },
  {
    content: "以下关于TypeScript的类型推导，哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "const声明的原始类型变量会被推导为字面量类型",
      B: "let声明的变量会被推导为更宽泛的类型",
      C: "函数返回值类型通常可以自动推导",
      D: "应该给所有变量都显式声明类型"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "const x = 'hello'推导为'hello'字面量类型，let x = 'hello'推导为string。函数返回值通常能正确推导。但不需要给所有变量显式声明类型，过度标注反而降低可读性，应该利用类型推导。"
  },
  {
    content: "你在开发一个自定义Hook用于获取API数据，需要处理加载、错误、数据三种状态。以下哪种设计最合理？",
    type: "single",
    options: {
      A: "返回三个独立的state：[data, isLoading, error]",
      B: "返回一个对象：{ data, isLoading, error, refetch }",
      C: "只返回data，把loading和error存在全局state",
      D: "使用throw抛出错误，不返回error状态"
    },
    correctAnswer: ["B"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "返回对象形式最灵活，支持解构和重命名。还可以包含refetch等额外方法。数组形式对于多个同类hook使用不便，全局状态管理过度，抛出错误破坏了声明式编程。"
  },
  {
    content: "关于Next.js的Image组件，以下哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "自动优化图片大小和格式（如WebP）",
      B: "支持懒加载，提升页面性能",
      C: "必须指定width和height属性",
      D: "可以使用placeholder属性显示模糊占位图"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "code_design",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "fullstack"],
    applicableLanguages: ["typescript"],
    explanation: "Next.js Image组件自动优化图片、支持懒加载和模糊占位图。width和height不是必须的，使用fill布局时可以不指定，但指定尺寸可以避免布局偏移(CLS)。"
  }
];
