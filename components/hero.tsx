export function Hero() {
  return (
    <div className="relative w-full flex flex-col gap-6 items-center py-12 px-4">
      {/* 渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent rounded-2xl -z-10" />
      
      <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-center text-foreground leading-tight">
        跃橙技术能力评估系统
      </h1>
      <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl text-center leading-relaxed mt-2">
        跃橙灵工智能集团技术能力评估平台，全面评估应聘者的技术能力，包括代码设计、软件架构、数据库建模和运维能力等多个维度
      </p>
      <div className="w-full max-w-2xl h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-4" />
    </div>
  );
}
