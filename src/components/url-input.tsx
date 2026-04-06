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
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (error) setError("");
          }}
          disabled={disabled || isLoading}
          className="flex-1 h-12 text-base"
        />
        <Button
          type="submit"
          size="lg"
          disabled={disabled || isLoading}
          className="h-12 px-6"
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
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  );
}
