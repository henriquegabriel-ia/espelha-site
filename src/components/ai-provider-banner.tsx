import { Key, Sparkles, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
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
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 transition-all">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        </div>
        <div className="flex flex-1 items-center justify-between gap-2">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">API conectada</p>
            <p className="text-xs text-muted-foreground">
              Usando {PROVIDER_LABELS[provider]} com sua API key
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1">
            <Zap className="h-3 w-3 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-500">Ativa</span>
          </div>
        </div>
      </div>
    );
  }

  if (providerStatus === "lovable-ai") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 transition-all">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">Lovable AI integrada</p>
          <p className="text-xs text-muted-foreground">
            Conecte uma API key própria para mais controle e velocidade
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 transition-all">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-500/10">
        <Key className="h-4 w-4 text-yellow-500" />
      </div>
      <div className="flex flex-1 items-center justify-between gap-2">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">API não conectada</p>
          <p className="text-xs text-muted-foreground">
            Selecione o provider acima e insira sua API key para começar
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-1">
          <AlertTriangle className="h-3 w-3 text-yellow-500" />
          <span className="text-xs font-medium text-yellow-500">Pendente</span>
        </div>
      </div>
    </div>
  );
}
