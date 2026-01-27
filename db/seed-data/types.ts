export interface SeedQuestion {
  content: string;
  type: "single" | "multiple" | "essay";
  options?: {
    [key: string]: string;
  } | null;
  correctAnswer?: string[] | null;
  abilityDimension: "code_design" | "architecture" | "database" | "devops" | "qa_testing";
  difficulty: "easy" | "medium" | "hard";
  weight: number;
  applicableRoles: ("frontend" | "backend" | "fullstack" | "tester")[];
  applicableLanguages: string[] | null;
  explanation: string;
  referenceAnswer?: string;
}
