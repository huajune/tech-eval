import Image from "next/image";
import { cn } from "@/lib/utils";

interface DulidayLogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
};

export function DulidayLogo({
  className,
  showText = true,
  size = "md",
}: DulidayLogoProps) {
  const dimensions = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image
        src="https://www.duliday.com/assets/logo.f33f8e89.svg"
        alt="跃橙灵工智能集团 Logo"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        unoptimized
      />
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-bold text-foreground">
            跃橙集团
          </span>
          <span className="text-xs text-muted-foreground">
            技术能力评估系统
          </span>
        </div>
      )}
    </div>
  );
}
