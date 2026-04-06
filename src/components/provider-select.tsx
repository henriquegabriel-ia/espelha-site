import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Provider } from "@/hooks/use-provider";

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "gemini", label: "Gemini" },
];

interface ProviderSelectProps {
  provider: Provider;
  onProviderChange: (value: Provider) => void;
}

export function ProviderSelect({
  provider,
  onProviderChange,
}: ProviderSelectProps) {
  return (
    <Select value={provider} onValueChange={(v) => onProviderChange(v as Provider)}>
      <SelectTrigger className="w-[140px] shrink-0">
        <SelectValue placeholder="Provider" />
      </SelectTrigger>
      <SelectContent>
        {PROVIDERS.map((p) => (
          <SelectItem key={p.value} value={p.value}>
            {p.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
