export function Hero() {
  return (
    <div className="flex flex-col gap-8 items-center">
      <h1 className="text-4xl lg:text-5xl font-bold text-center">
        TechEval - 技术能力评估系统
      </h1>
      <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl text-center">
        全面评估应聘者的技术能力，包括代码设计、软件架构、数据库建模和运维能力等多个维度
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
