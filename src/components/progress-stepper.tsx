import { useState, useEffect, useRef } from "react";
import { Globe, Code, Search, Check, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StepStatus = "pending" | "active" | "complete" | "error";

interface ProgressStepperProps {
  currentStep:
    | "idle"
    | "scraping"
    | "converting"
    | "analyzing"
    | "optimizing"
    | "complete"
    | "error";
}

interface StepDef {
  label: string;
  description: string;
  icon: React.ElementType;
  estimatedSeconds: number;
}

const steps: StepDef[] = [
  {
    label: "Scraping",
    description: "Extraindo HTML, CSS e conteúdo do site via Firecrawl...",
    icon: Globe,
    estimatedSeconds: 45,
  },
  {
    label: "Convertendo",
    description: "IA convertendo para JSON, extraindo HTML, CSS e design system...",
    icon: Code,
    estimatedSeconds: 60,
  },
  {
    label: "Analisando",
    description: "IA avaliando design, SEO, conteúdo e estrutura...",
    icon: Search,
    estimatedSeconds: 45,
  },
];

function getStepStatuses(
  currentStep: ProgressStepperProps["currentStep"]
): StepStatus[] {
  switch (currentStep) {
    case "idle":
      return ["pending", "pending", "pending"];
    case "scraping":
      return ["active", "pending", "pending"];
    case "converting":
      return ["complete", "active", "pending"];
    case "analyzing":
      return ["complete", "complete", "active"];
    case "optimizing":
    case "complete":
      return ["complete", "complete", "complete"];
    case "error":
      return ["error", "pending", "pending"];
    default:
      return ["pending", "pending", "pending"];
  }
}

function getActiveStepIndex(currentStep: ProgressStepperProps["currentStep"]): number {
  switch (currentStep) {
    case "scraping": return 0;
    case "converting": return 1;
    case "analyzing": return 2;
    default: return -1;
  }
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m${s > 0 ? ` ${s}s` : ""}`;
}

function useElapsedTime(isRunning: boolean, resetKey: string) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setElapsed(0);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, resetKey]);

  return elapsed;
}

function StepIcon({ step, status }: { step: StepDef; status: StepStatus }) {
  if (status === "complete") return <Check className="h-4 w-4" />;
  if (status === "error") return <X className="h-4 w-4" />;
  if (status === "active") return <Loader2 className="h-4 w-4 animate-spin" />;
  const Icon = step.icon;
  return <Icon className="h-4 w-4" />;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const statuses = getStepStatuses(currentStep);
  const activeIndex = getActiveStepIndex(currentStep);
  const isRunning = activeIndex >= 0;
  const isOptimizing = currentStep === "optimizing";
  const isComplete = currentStep === "complete";

  const elapsed = useElapsedTime(isRunning || isOptimizing, currentStep);

  // Calculate overall progress
  const completedSteps = statuses.filter((s) => s === "complete").length;
  const totalSteps = steps.length;

  // Progress within current step (based on elapsed vs estimate)
  const currentEstimate = activeIndex >= 0 ? steps[activeIndex].estimatedSeconds : 15;
  const stepProgress = Math.min(elapsed / currentEstimate, 0.95); // cap at 95% until actually complete

  // Overall progress: completed steps + partial current step
  const overallProgress = isComplete
    ? 100
    : Math.round(((completedSteps + stepProgress) / totalSteps) * 100);

  // Estimated remaining time
  const currentRemaining = Math.max(0, currentEstimate - elapsed);
  const futureStepsTime = steps
    .slice(activeIndex + 1)
    .reduce((sum, s) => sum + s.estimatedSeconds, 0);
  const totalRemaining = currentRemaining + futureStepsTime;

  // Active step description
  const activeDescription = isOptimizing
    ? "IA aplicando sugestões de melhoria..."
    : activeIndex >= 0
      ? steps[activeIndex].description
      : isComplete
        ? "Concluído!"
        : "";

  return (
    <div className="w-full space-y-4">
      {/* Main progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">{overallProgress}%</span>
          {isRunning && (
            <span className="font-mono">
              ~{formatTime(totalRemaining)} restante
            </span>
          )}
          {isOptimizing && (
            <span className="font-mono">~{formatTime(Math.max(0, 15 - elapsed))} restante</span>
          )}
          {isComplete && (
            <span className="text-green-500 font-medium">Completo</span>
          )}
        </div>

        {/* Progress bar track */}
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              isComplete ? "bg-green-500" : "bg-primary",
              isRunning && "animate-pulse"
            )}
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Active step description + elapsed time */}
      {(isRunning || isOptimizing) && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/10 bg-primary/5 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
            <span className="text-sm text-foreground">{activeDescription}</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground shrink-0">
            {formatTime(elapsed)}
          </span>
        </div>
      )}

      {isComplete && (
        <div className="flex items-center gap-2.5 rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2.5">
          <Check className="h-4 w-4 text-green-500 shrink-0" />
          <span className="text-sm text-foreground">Análise concluída com sucesso</span>
          <span className="text-xs font-mono text-muted-foreground ml-auto">
            {formatTime(elapsed)}
          </span>
        </div>
      )}

      {currentStep === "error" && (
        <div className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/5 px-4 py-2.5">
          <X className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-sm text-foreground">Erro no processamento</span>
          <span className="text-xs font-mono text-muted-foreground ml-auto">
            {formatTime(elapsed)}
          </span>
        </div>
      )}

      {/* Step indicators */}
      <div className="flex items-center gap-1">
        {steps.map((step, i) => {
          const status = statuses[i];
          return (
            <div key={step.label} className="contents">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-300",
                  status === "pending" && "text-muted-foreground",
                  status === "active" && "bg-primary/10 text-primary",
                  status === "complete" && "bg-green-500/10 text-green-500",
                  status === "error" && "bg-red-500/10 text-red-500"
                )}
              >
                <StepIcon step={step} status={status} />
                <span className="hidden sm:inline">{step.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 transition-colors duration-300",
                    status === "complete" ? "bg-green-500/40" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type { ProgressStepperProps };
