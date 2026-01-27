import { SeedQuestion } from "./types";

export const devopsQuestions: SeedQuestion[] = [
  // 简单题（2题）
  {
    content: "在 Webpack 构建中，Loader 和 Plugin 的区别是？",
    type: "single",
    options: {
      A: "没有区别",
      B: "Loader 用于转换文件（如 less 转 css），Plugin 用于扩展构建功能（如压缩、注入环境变量）",
      C: "Loader 运行在打包后，Plugin 运行在打包前",
      D: "Plugin 只能处理 JS 文件",
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["frontend"],
    applicableLanguages: null,
    explanation: "Loader是模块转换器，用于处理不同类型的文件资源（如将SCSS转为CSS）。Plugin是功能扩展器，可以在Webpack构建流程的各个生命周期钩子中注入自定义逻辑，实现诸如打包优化、资源管理等复杂功能。",
  },
  {
    content: "线上服务 CPU 飙高，使用 top -H -p <pid> 命令的目的是？",
    type: "single",
    options: {
      A: "查看该进程打开的文件句柄",
      B: "查看该进程下的所有线程的 CPU 占用情况",
      C: "强制杀死进程",
      D: "查看网络连接数",
    },
    correctAnswer: ["B"],
    abilityDimension: "devops",
    difficulty: "easy",
    weight: 1,
    applicableRoles: ["backend"],
    applicableLanguages: null,
    explanation: "B对：top -H -p <pid>命令可以查看指定进程内各个线程的详细信息，包括CPU占用率，是定位Java程序中\"某个线程CPU占满\"问题的第一步。A错：查看文件句柄用lsof。C错：杀死进程用kill。D错：查看网络连接用netstat或ss。",
  },
];
