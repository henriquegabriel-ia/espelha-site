import { Key, Sparkles, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Provider, ProviderStatus } from "@/hooks/use-provider";

const PROVIDER_LABELS: Record<Provider, string> = {
  openai: "OpenAI",
  anthropic: "Anthropic",
  gemini: "Gemini",
};

interface AiProviderBannerProps {
  provider: Provider;
  providerStatus: ProviderStatus;
}

export function AiProviderBanner({
  provider,
  providerStatus,
}: AiProviderBannerProps) {
  if (providerStatus === "byo") {
    return (
      <Alert>
        <Key className="h-4 w-4" />
        <AlertDescription>
          Usando {PROVIDER_LABELS[provider]} (sua API key)
        </AlertDescription>
      </Alert>
    );
  }

  if (providerStatus === "lovable-ai") {
    return (
      <Alert>
        <Sparkles className="h-4 w-4" />
        <AlertDescription>
          Usando Lovable AI integrada. Conecte uma API key para mais controle.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        Conecte uma API key (OpenAI, Anthropic ou Gemini) para começar
      </AlertDescription>
    </Alert>
  );
}
