"use client";

import { useState, useCallback } from "react";
import { Sparkles, Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { generateCSS } from "@/lib/generate-css";
import { generateLovablePrompt } from "@/lib/generate-lovable-prompt";
import type { JsonRenderOutput, DesignSystem } from "@/types/espelhar";

interface LovablePromptButtonProps {
  jsonRender: JsonRenderOutput;
  designSystem: DesignSystem | null;
  originalUrl: string;
}

export function LovablePromptButton({
  jsonRender,
  designSystem,
  originalUrl,
}: LovablePromptButtonProps) {
  const [copied, setCopied] = useState(false);

  const css = designSystem ? generateCSS(designSystem) : "";
  const prompt = generateLovablePrompt({
    jsonRender,
    designSystem,
    css,
    originalUrl,
  });

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = prompt;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [prompt]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([prompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lovable-prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [prompt]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
          size="sm"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Gerar prompt para Lovable
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Prompt para Lovable
          </SheetTitle>
          <SheetDescription>
            Cole este prompt no Lovable para recriar o site.
          </SheetDescription>
        </SheetHeader>

        {/* Prompt content */}
        <div className="flex-1 min-h-0 mt-4">
          <textarea
            readOnly
            value={prompt}
            className="w-full h-full min-h-[300px] resize-none rounded-md border border-border bg-card p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-border">
          <Button
            variant="default"
            size="sm"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-green-400" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? "Copiado!" : "Copiar Prompt"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download .txt
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
