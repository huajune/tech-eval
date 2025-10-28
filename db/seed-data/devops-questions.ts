export const devopsQuestions = [
  // 简单题（12题）
  {
    content: "Linux中，以下哪个命令用于查看当前目录下的文件列表？",
    type: "single",
    options: {
      A: "cd",
      B: "ls",
      C: "pwd",
      D: "mkdir"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "ls命令用于列出目录内容。cd用于切换目录，pwd显示当前路径，mkdir创建目录。"
  },
  {
    content: "Docker中，以下哪个命令用于查看正在运行的容器？",
    type: "single",
    options: {
      A: "docker images",
      B: "docker ps",
      C: "docker run",
      D: "docker build"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "docker ps显示运行中的容器。docker images列出镜像，docker run运行容器，docker build构建镜像。"
  },
  {
    content: "Git中，以下哪个命令用于查看提交历史？",
    type: "single",
    options: {
      A: "git status",
      B: "git log",
      C: "git diff",
      D: "git branch"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "git log显示提交历史。git status显示工作区状态，git diff显示差异，git branch管理分支。"
  },
  {
    content: "在Linux中，以下哪个命令可以查看系统的CPU和内存使用情况？",
    type: "single",
    options: {
      A: "ls",
      B: "top",
      C: "cd",
      D: "cat"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "top命令实时显示系统资源使用情况，包括CPU、内存、进程等。类似的还有htop命令。"
  },
  {
    content: "以下哪个是Docker镜像的正确命名格式？",
    type: "single",
    options: {
      A: "image:tag",
      B: "repository/image:tag",
      C: "registry/repository/image:tag",
      D: "以上都可以"
    },
    correctAnswer: ["D"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "Docker镜像命名可以是image:tag（本地）、repository/image:tag（DockerHub）、registry/repository/image:tag（私有仓库）。"
  },
  {
    content: "CI/CD中的CI代表什么？",
    type: "single",
    options: {
      A: "Code Integration",
      B: "Continuous Integration",
      C: "Container Integration",
      D: "Cloud Integration"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "CI/CD代表持续集成（Continuous Integration）和持续交付/部署（Continuous Delivery/Deployment）。"
  },
  {
    content: "Linux中，以下哪个命令可以查找包含特定文本的文件？",
    type: "single",
    options: {
      A: "find",
      B: "grep",
      C: "locate",
      D: "which"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "grep用于在文件中搜索文本模式。find用于查找文件，locate用于快速定位文件，which查找命令路径。"
  },
  {
    content: "在Dockerfile中，以下哪个指令用于设置容器启动时执行的命令？",
    type: "single",
    options: {
      A: "RUN",
      B: "CMD",
      C: "COPY",
      D: "FROM"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "CMD指定容器启动时的默认命令。RUN在构建时执行命令，COPY复制文件，FROM指定基础镜像。"
  },
  {
    content: "Git中，以下哪个命令用于创建新分支并切换到该分支？",
    type: "single",
    options: {
      A: "git branch new-branch",
      B: "git checkout new-branch",
      C: "git checkout -b new-branch",
      D: "git create new-branch"
    },
    correctAnswer: ["C"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "git checkout -b new-branch 创建并切换到新分支。等价于 git branch new-branch && git checkout new-branch。"
  },
  {
    content: "Linux中，chmod 755命令的含义是什么？",
    type: "single",
    options: {
      A: "所有者可读写执行，组用户和其他用户只可读",
      B: "所有者可读写执行，组用户和其他用户可读可执行",
      C: "所有用户都可读写执行",
      D: "只有所有者可读写执行"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "755表示：所有者rwx(7=4+2+1)，组用户rx(5=4+1)，其他用户rx(5=4+1)。"
  },
  {
    content: "Nginx作为反向代理服务器的主要作用是什么？",
    type: "single",
    options: {
      A: "直接运行应用程序",
      B: "转发客户端请求到后端服务器",
      C: "存储静态文件",
      D: "编译源代码"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "Nginx作为反向代理，接收客户端请求并转发到后端服务器，可以实现负载均衡、缓存、SSL终止等功能。"
  },
  {
    content: "在Linux中，以下哪个命令可以实时查看文件的新增内容？",
    type: "single",
    options: {
      A: "cat",
      B: "tail -f",
      C: "head",
      D: "more"
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "tail -f 实时跟踪文件的新增内容，常用于查看日志文件。cat一次性显示全部，head显示前几行，more分页显示。"
  },

  // 中等题（6题）
  {
    content: "在Docker环境中，你需要让容器A访问容器B的服务，以下哪种方式最合理？",
    type: "single",
    options: {
      A: "使用容器B的IP地址直接访问（如 http://172.17.0.3:8080）",
      B: "将容器B的端口映射到宿主机，容器A通过宿主机IP访问",
      C: "将两个容器放在同一个自定义网络中，通过容器名访问",
      D: "使用 docker exec 进入容器A，手动配置hosts文件"
    },
    correctAnswer: ["C"],
    abilityDimension: "devops",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "自定义网络支持DNS解析，容器可以通过名称相互访问，更灵活可靠。容器IP会变化不可靠，端口映射增加复杂度，手动配置hosts不便维护。"
  },
  {
    content: "关于Git的分支管理，以下哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "master/main分支应该始终保持可发布状态",
      B: "feature分支应该从develop分支创建",
      C: "可以直接在master分支上开发新功能",
      D: "完成功能开发后应该删除feature分支"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "devops",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "Git Flow规范：master保持稳定，feature从develop创建，功能合并后删除feature分支保持仓库整洁。不应直接在master开发。"
  },
  {
    content: "关于Docker容器的资源限制，以下哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "可以使用--memory限制容器的内存使用",
      B: "可以使用--cpus限制容器的CPU使用",
      C: "容器默认可以使用主机的所有资源",
      D: "资源限制只能在创建容器时设置，不能修改"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "devops",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "Docker支持--memory和--cpus限制资源。容器默认可使用所有资源。可以使用docker update命令修改运行中容器的资源限制。"
  },
  {
    content: "在Linux中，以下哪些命令可以用于查看网络连接状态？（多选）",
    type: "multiple",
    options: {
      A: "netstat",
      B: "ss",
      C: "lsof",
      D: "ps"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "devops",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "netstat显示网络连接（较老），ss是现代替代（更快），lsof可以查看进程打开的网络连接。ps用于查看进程，不是网络工具。"
  },
  {
    content: "关于Kubernetes，以下哪些组件是控制平面（Control Plane）的一部分？（多选）",
    type: "multiple",
    options: {
      A: "kube-apiserver",
      B: "kube-scheduler",
      C: "kubelet",
      D: "etcd"
    },
    correctAnswer: ["A", "B", "D"],
    abilityDimension: "devops",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "控制平面包括kube-apiserver（API服务器）、kube-scheduler（调度器）、kube-controller-manager（控制器）、etcd（数据存储）。kubelet运行在工作节点上。"
  },
  {
    content: "关于CI/CD流水线，以下哪些阶段是常见的？（多选）",
    type: "multiple",
    options: {
      A: "代码检查（Lint）",
      B: "单元测试",
      C: "构建镜像",
      D: "手动部署"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "devops",
    difficulty: "medium",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "CI/CD流水线通常包括：代码检查、单元测试、构建、打包、自动部署。手动部署违背了CD的理念。"
  },

  // 困难题（2题）
  {
    content: "关于Docker的多阶段构建，以下哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "可以减小最终镜像的大小",
      B: "可以在构建过程中使用不同的基础镜像",
      C: "可以避免将构建工具打包到最终镜像",
      D: "只能在Dockerfile中使用一次FROM指令"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "devops",
    difficulty: "hard",
    weight: 1,
    applicableRoles: ["frontend", "backend", "fullstack"],
    applicableLanguages: null,
    explanation: "多阶段构建允许在Dockerfile中使用多个FROM指令，每个阶段可以使用不同的基础镜像，只将最终需要的文件复制到最终镜像，减小镜像大小。"
  },
  {
    content: "关于容器编排和服务网格，以下哪些说法是正确的？（多选）",
    type: "multiple",
    options: {
      A: "Kubernetes可以自动管理容器的生命周期",
      B: "Service Mesh可以处理服务间的通信、监控和安全",
      C: "Istio是一个流行的Service Mesh实现",
      D: "容器编排只能在云环境中使用"
    },
    correctAnswer: ["A", "B", "C"],
    abilityDimension: "devops",
    difficulty: "hard",
    weight: 1,
    applicableRoles: ["backend", "fullstack"],
    applicableLanguages: null,
    explanation: "Kubernetes提供容器编排、自动伸缩、故障恢复等功能。Service Mesh（如Istio）在应用层提供服务通信、可观测性、安全等能力。容器编排可以在本地、云端或混合环境使用。"
  }
];
