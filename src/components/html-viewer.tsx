"use client";

import { useState, useCallback } from "react";
import { Copy, Check, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface HtmlViewerProps {
  html: string | null;
  isLoading?: boolean;
}

export function HtmlViewer({ html, isLoading = false }: HtmlViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = html;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [html]);

  const handleDownload = useCallback(() => {
    if (!html) return;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [html]);

  if (isLoading) {
    return (
      <div className="space-y-2 p-4 rounded-md border border-border bg-card">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (!html) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <pre className="p-4 font-mono text-xs overflow-auto max-h-64">
          <code>{html}</code>
        </pre>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-400" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? "Copiado!" : "Copiar HTML"}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download HTML
        </Button>
      </div>
    </div>
  );
}
