import { useState, type FormEvent } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function UrlInput({ onSubmit, isLoading, disabled }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const trimmed = url.trim();
    if (!trimmed) {
      setError("Digite uma URL");
      return;
    }

    if (!isValidUrl(trimmed)) {
      setError("URL inválida. Use o formato https://exemplo.com");
      return;
    }

    setError("");
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-2">
      <div className="flex gap-2">
        <Input
          type="url"
          placeholder="https://exemplo.com"
          aria-label="URL do site para espelhar"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          disabled={disabled || isLoading}
          className="flex-1 h-12 text-base glass border-[var(--glass-border)] focus-visible:ring-2 focus-visible:ring-[#7DE8EB] focus-visible:border-[#7DE8EB] focus-visible:shadow-[0_0_20px_rgba(125,232,235,0.15)]"
        />
        <Button
          type="submit"
          size="lg"
          disabled={disabled || isLoading}
          className="h-12 px-6 active:scale-95 transition-all bg-[#7DE8EB] text-[#071111] hover:bg-[#A0F0F2] hover:shadow-[0_0_30px_rgba(125,232,235,0.3)] hover:-translate-y-px"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap className="h-4 w-4" />
          )}
          {isLoading ? "Espelhando..." : "Espelhar"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
