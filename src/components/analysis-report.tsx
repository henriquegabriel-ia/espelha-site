"use client";

import {
  BarChart3,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisReport, Suggestion } from "@/types/espelhar";

interface AnalysisReportProps {
  report: AnalysisReport | null;
  isLoading?: boolean;
  onGenerateOptimized?: () => void;
  isOptimizing?: boolean;
}

const categoryColors: Record<Suggestion["category"], string> = {
  design: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  seo: "bg-green-500/20 text-green-400 border-green-500/30",
  content: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  structure: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const categoryLabels: Record<Suggestion["category"], string> = {
  design: "Design",
  seo: "SEO",
  content: "Content",
  structure: "Structure",
};

const impactColors: Record<Suggestion["impact"], string> = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const impactLabels: Record<Suggestion["impact"], string> = {
  high: "Alto",
  medium: "Medio",
  low: "Baixo",
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-11 w-64" />
    </div>
  );
}

export function AnalysisReportView({
  report,
  isLoading = false,
  onGenerateOptimized,
  isOptimizing = false,
}: AnalysisReportProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!report) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center gap-2">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold">Analise do Site</h2>
      </div>

      {/* Positives */}
      <div className="rounded-lg border-l-4 border-green-500 bg-green-500/10 glass p-4">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <h3 className="font-semibold text-green-500">Pontos Positivos</h3>
        </div>
        <ul className="space-y-1.5 pl-7">
          {report.positives.map((item, index) => (
            <li key={index} className="list-disc text-sm">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Negatives */}
      <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-500/10 glass p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-yellow-500">Pontos Negativos</h3>
        </div>
        <ul className="space-y-1.5 pl-7">
          {report.negatives.map((item, index) => (
            <li key={index} className="list-disc text-sm">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Suggestions */}
      <div className="rounded-lg border-l-4 border-primary bg-primary/10 glass p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-primary">
            Sugestoes de Melhoria
          </h3>
        </div>
        <div className="space-y-3">
          {report.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="rounded-md border border-border/40 bg-background/50 p-3"
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge
                  className={categoryColors[suggestion.category]}
                  variant="outline"
                >
                  {categoryLabels[suggestion.category]}
                </Badge>
                <Badge
                  className={impactColors[suggestion.impact]}
                  variant="outline"
                >
                  {impactLabels[suggestion.impact]}
                </Badge>
              </div>
              <p className="text-sm">{suggestion.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Optimized Button */}
      {onGenerateOptimized && (
        <Button
          size="lg"
          onClick={onGenerateOptimized}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <>
              <Loader2 className="animate-spin" />
              Otimizando...
            </>
          ) : (
            <>
              <Sparkles />
              Gerar JSON com Sugestoes
            </>
          )}
        </Button>
      )}
    </div>
  );
}
