import { useState, useCallback, useEffect, useRef } from "react";
import { Eye, EyeOff, Trash2, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ApiKeyInputProps {
  apiKey: string;
  onSave: (key: string) => void;
  onClear: () => void;
}

export function ApiKeyInput({ apiKey, onSave, onClear }: ApiKeyInputProps) {
  const [value, setValue] = useState(apiKey);
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external changes (e.g. after clear)
  useEffect(() => {
    setValue(apiKey);
  }, [apiKey]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  const handleSave = useCallback(() => {
    if (!value.trim()) return;
    onSave(value.trim());
    setSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    savedTimerRef.current = setTimeout(() => setSaved(false), 2000);
  }, [value, onSave]);

  const handleClear = useCallback(() => {
    setValue("");
    setVisible(false);
    onClear();
  }, [onClear]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          type={visible ? "text" : "password"}
          placeholder="Cole sua API key aqui..."
          aria-label="API key do provedor de IA"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full w-10"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Esconder API key" : "Mostrar API key"}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSave}
        disabled={!value.trim()}
      >
        {saved ? <Check className="h-4 w-4 text-green-500" /> : "Salvar"}
      </Button>

      {apiKey && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleClear}
          aria-label="Limpar API key"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
    </div>
  );
}
