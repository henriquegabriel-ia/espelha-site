"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultActionsProps {
  originalJson: Record<string, unknown> | null;
  optimizedJson?: Record<string, unknown> | null;
  filename?: string;
}

function downloadJson(data: Record<string, unknown>, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ResultActions({
  originalJson,
  optimizedJson,
  filename = "espelha-site",
}: ResultActionsProps) {
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedOptimized, setCopiedOptimized] = useState(false);

  if (!originalJson) return null;

  async function handleCopy(
    data: Record<string, unknown>,
    setter: (v: boolean) => void,
  ) {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setter(true);
      setTimeout(() => setter(false), 2000);
    } catch {
      // Fallback for browsers/contexts where clipboard API is unavailable
      try {
        const textarea = document.createElement("textarea");
        textarea.value = JSON.stringify(data, null, 2);
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setter(true);
        setTimeout(() => setter(false), 2000);
      } catch {
        // Silent fail — clipboard not available
      }
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => downloadJson(originalJson, `${filename}-original.json`)}
      >
        <Download className="mr-2 h-4 w-4" />
        Download Original
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleCopy(originalJson, setCopiedOriginal)}
      >
        {copiedOriginal ? (
          <Check className="mr-2 h-4 w-4 text-green-500" />
        ) : (
          <Copy className="mr-2 h-4 w-4" />
        )}
        Copiar Original
      </Button>

      {optimizedJson && (
        <>
          <div className="mx-1 hidden h-6 w-px bg-border sm:block" />

          <Button
            variant="default"
            size="sm"
            onClick={() =>
              downloadJson(optimizedJson, `${filename}-otimizado.json`)
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Download Otimizado
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCopy(optimizedJson, setCopiedOptimized)}
          >
            {copiedOptimized ? (
              <Check className="mr-2 h-4 w-4 text-green-500" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            Copiar Otimizado
          </Button>
        </>
      )}
    </div>
  );
}
