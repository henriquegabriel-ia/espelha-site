import { Clock, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { HistoryEntry } from '@/hooks/use-history';

interface HistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatRelativeTime(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} minuto${diffMin === 1 ? '' : 's'}`;
  if (diffHours < 24) return `há ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
  if (diffHours < 48) return 'ontem';

  const d = new Date(timestamp);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function HistoryPanel({ history, onSelect, onRemove, onClear }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 text-muted-foreground/40 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Nenhum espelhamento recente</p>
      </div>
    );
  }

  function handleClear() {
    if (window.confirm('Limpar todo o histórico de espelhamentos?')) {
      onClear();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Histórico Recente</h3>
      </div>

      <div className="grid gap-2">
        {history.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry)}
            className="group relative w-full text-left rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 transition-all duration-200 hover:border-primary/30 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <p className="text-sm font-medium text-primary truncate">
                  {extractDomain(entry.url)}
                </p>
                {entry.title && (
                  <p className="text-xs text-muted-foreground truncate">
                    {entry.title}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/70">
                  {formatRelativeTime(entry.timestamp)}
                </p>
              </div>
              <span
                role="button"
                tabIndex={0}
                aria-label={`Remover ${extractDomain(entry.url)} do histórico`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(entry.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    e.preventDefault();
                    onRemove(entry.id);
                  }
                }}
                className="shrink-0 rounded p-1 text-muted-foreground/50 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            </div>
          </button>
        ))}
      </div>

      <div className="flex justify-center pt-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="mr-1.5 h-3 w-3" />
          Limpar histórico
        </Button>
      </div>
    </div>
  );
}
