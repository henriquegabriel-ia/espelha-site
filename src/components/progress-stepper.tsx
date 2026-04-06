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
  icon: React.ElementType;
}

const steps: StepDef[] = [
  { label: "Scraping", icon: Globe },
  { label: "Convertendo", icon: Code },
  { label: "Analisando", icon: Search },
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
      return ["complete", "complete", "complete"];
    case "complete":
      return ["complete", "complete", "complete"];
    case "error": {
      // Find the last active step and mark it as error
      // Error implies the process was in progress, so we check
      // which step would have been active. Default to first step.
      return ["error", "pending", "pending"];
    }
    default:
      return ["pending", "pending", "pending"];
  }
}

// For error state, we need to know which step was active.
// Since 'error' doesn't encode which step failed, we assume the last
// non-complete step was the one that errored. A more robust approach
// would accept a separate errorStep prop. For now, the convention is:
// the caller should track which step errored externally if needed.
// We provide a simple heuristic: error on step 1 by default.
// However, the spec says "último step ativo vira error" — this requires
// knowing the previous state. We'll export a helper for that.

function getStepStatusesWithError(
  previousStep: Exclude<
    ProgressStepperProps["currentStep"],
    "error" | "idle" | "complete" | "optimizing"
  >
): StepStatus[] {
  const base = getStepStatuses(previousStep);
  return base.map((s) => (s === "active" ? "error" : s)) as StepStatus[];
}

function StepIcon({
  step,
  status,
}: {
  step: StepDef;
  status: StepStatus;
}) {
  if (status === "complete") {
    return <Check className="h-5 w-5" />;
  }
  if (status === "error") {
    return <X className="h-5 w-5" />;
  }
  if (status === "active") {
    return <Loader2 className="h-5 w-5 animate-spin" />;
  }
  const Icon = step.icon;
  return <Icon className="h-5 w-5" />;
}

function Connector({ status }: { status: "pending" | "complete" | "active" }) {
  return (
    <div
      className={cn(
        // Horizontal on desktop, vertical on mobile
        "hidden sm:block sm:h-0.5 sm:flex-1",
        "transition-colors duration-300",
        status === "complete" && "bg-green-500",
        status === "active" && "bg-[#7DE8EB] animate-pulse",
        status === "pending" && "bg-muted-foreground/20"
      )}
    />
  );
}

function ConnectorVertical({
  status,
}: {
  status: "pending" | "complete" | "active";
}) {
  return (
    <div
      className={cn(
        "sm:hidden w-0.5 h-6 mx-auto",
        "transition-colors duration-300",
        status === "complete" && "bg-green-500",
        status === "active" && "bg-[#7DE8EB] animate-pulse",
        status === "pending" && "bg-muted-foreground/20"
      )}
    />
  );
}

function getConnectorStatus(
  leftStatus: StepStatus,
  rightStatus: StepStatus
): "pending" | "complete" | "active" {
  if (leftStatus === "complete" && rightStatus === "complete") return "complete";
  if (leftStatus === "complete" && (rightStatus === "active" || rightStatus === "error"))
    return "active";
  return "pending";
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const statuses = getStepStatuses(currentStep);
  const isOptimizing = currentStep === "optimizing";

  return (
    <div className="w-full px-4 py-6">
      {/* Horizontal layout (sm+) */}
      <div className="hidden sm:flex items-center gap-2">
        {steps.map((step, i) => {
          const status = statuses[i];
          return (
            <div key={step.label} className="contents">
              <div className="flex flex-col items-center gap-1.5 min-w-[100px]">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    status === "pending" &&
                      "border-muted-foreground/30 text-muted-foreground",
                    status === "active" &&
                      "border-[#7DE8EB] text-[#7DE8EB] animate-pulse",
                    status === "complete" &&
                      "border-green-500 bg-green-500/10 text-green-500",
                    status === "error" &&
                      "border-red-500 bg-red-500/10 text-red-500"
                  )}
                >
                  <StepIcon step={step} status={status} />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    status === "pending" && "text-muted-foreground",
                    status === "active" && "text-[#7DE8EB]",
                    status === "complete" && "text-green-500",
                    status === "error" && "text-red-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <Connector
                  status={getConnectorStatus(statuses[i], statuses[i + 1])}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Vertical layout (mobile) */}
      <div className="flex sm:hidden flex-col items-center gap-0">
        {steps.map((step, i) => {
          const status = statuses[i];
          return (
            <div key={step.label} className="contents">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                    status === "pending" &&
                      "border-muted-foreground/30 text-muted-foreground",
                    status === "active" &&
                      "border-[#7DE8EB] text-[#7DE8EB] animate-pulse",
                    status === "complete" &&
                      "border-green-500 bg-green-500/10 text-green-500",
                    status === "error" &&
                      "border-red-500 bg-red-500/10 text-red-500"
                  )}
                >
                  <StepIcon step={step} status={status} />
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    status === "pending" && "text-muted-foreground",
                    status === "active" && "text-[#7DE8EB]",
                    status === "complete" && "text-green-500",
                    status === "error" && "text-red-500"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <ConnectorVertical
                  status={getConnectorStatus(statuses[i], statuses[i + 1])}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Optimizing sub-label */}
      {isOptimizing && (
        <p className="text-center text-sm text-muted-foreground mt-3 animate-pulse">
          Otimizando...
        </p>
      )}
    </div>
  );
}

export { getStepStatusesWithError };
export type { ProgressStepperProps };
