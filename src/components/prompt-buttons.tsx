import { useState, useCallback } from "react";
import { Sparkles, Copy, Check, Download, Terminal, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { generatePrompt, type PromptPlatform } from "@/lib/generate-prompt";
import type { JsonRenderOutput, DesignSystem } from "@/types/espelhar";

interface PromptButtonsProps {
  jsonRender: JsonRenderOutput;
  designSystem: DesignSystem | null;
  originalUrl: string;
  improvements?: Array<{ category: string; description: string; impact: string }>;
  html?: string;
}

const PLATFORMS: Array<{
  id: PromptPlatform;
  label: string;
  icon: React.ElementType;
  color: string;
}> = [
  { id: "lovable", label: "Lovable", icon: Sparkles, color: "bg-primary hover:bg-primary/90 text-primary-foreground" },
  { id: "replit", label: "Replit", icon: Terminal, color: "bg-orange-600 hover:bg-orange-700 text-white" },
  { id: "claude-code", label: "Claude Code", icon: Code2, color: "bg-amber-600 hover:bg-amber-700 text-white" },
];

export function PromptButtons({
  jsonRender,
  designSystem,
  originalUrl,
  improvements,
  html,
}: PromptButtonsProps) {
  const [activePlatform, setActivePlatform] = useState<PromptPlatform | null>(null);
  const [copied, setCopied] = useState(false);

  const prompt = activePlatform
    ? generatePrompt({ platform: activePlatform, jsonRender, designSystem, originalUrl, improvements, html })
    : "";

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
    a.download = `prompt-${activePlatform}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [prompt, activePlatform]);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
      {PLATFORMS.map((platform) => (
        <Sheet
          key={platform.id}
          open={activePlatform === platform.id}
          onOpenChange={(open) => {
            setActivePlatform(open ? platform.id : null);
            setCopied(false);
          }}
        >
          <SheetTrigger asChild>
            <Button
              className={`${platform.color} shadow-md px-6 py-3 text-sm font-medium w-full sm:w-auto`}
              size="lg"
            >
              <platform.icon className="mr-2 h-5 w-5" />
              Gerar prompt para {platform.label}
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-full sm:max-w-lg flex flex-col">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <platform.icon className="h-5 w-5" />
                Prompt para {platform.label}
              </SheetTitle>
              <SheetDescription>
                Cole este prompt no {platform.label} para recriar o site
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 mt-4 overflow-hidden">
              <textarea
                readOnly
                value={prompt}
                className="w-full h-full min-h-[300px] rounded-lg border border-border bg-card p-4 font-mono text-xs resize-none focus:outline-none"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCopy} className="flex-1">
                {copied ? (
                  <Check className="mr-2 h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied ? "Copiado!" : "Copiar Prompt"}
              </Button>
              <Button variant="outline" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download .txt
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      ))}
    </div>
  );
}
