import { useState, useCallback, useMemo } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

interface JsonViewerProps {
  data: Record<string, unknown> | null;
  isLoading?: boolean;
}

// --- Syntax Highlight (Tab JSON) ---

function highlightJson(json: string): string {
  // Escape HTML first
  const escaped = json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Tokenize and wrap in colored spans
  return escaped.replace(
    /("(?:\\.|[^"\\])*")\s*:/g, // keys
    '<span class="text-purple-400 font-bold">$1</span>:'
  ).replace(
    /:\s*("(?:\\.|[^"\\])*")/g, // string values
    ': <span class="text-green-400">$1</span>'
  ).replace(
    // standalone string values in arrays (not after colon on same match)
    /(?<=[[,]\s*)("(?:\\.|[^"\\])*")/g,
    '<span class="text-green-400">$1</span>'
  ).replace(
    /\b(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\b/g, // numbers
    '<span class="text-blue-400">$1</span>'
  ).replace(
    /\b(true|false)\b/g, // booleans
    '<span class="text-yellow-400">$1</span>'
  ).replace(
    /\bnull\b/g, // null
    '<span class="text-red-400">null</span>'
  ).replace(
    /([[\]{}])/g, // brackets/braces
    '<span class="text-muted-foreground">$1</span>'
  );
}

function JsonSyntaxView({ data }: { data: Record<string, unknown> }) {
  const raw = JSON.stringify(data, null, 2);
  const highlighted = useMemo(() => highlightJson(raw), [raw]);
  const lines = highlighted.split("\n");

  return (
    <div className="relative overflow-auto rounded-md border border-zinc-800 bg-zinc-900">
      <pre className="font-mono text-sm leading-6 p-4">
        <code>
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="inline-block w-10 shrink-0 select-none text-right pr-4 text-muted-foreground/50">
                {i + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: line }} />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

// --- Tree View (Tab Tree) ---

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function getTypeLabel(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "Array";
  if (typeof value === "object") return "Object";
  return typeof value;
}

function getItemCount(value: unknown): number {
  if (Array.isArray(value)) return value.length;
  if (value !== null && typeof value === "object") return Object.keys(value).length;
  return 0;
}

function ValueDisplay({ value }: { value: unknown }) {
  if (value === null) return <span className="text-red-400">null</span>;
  if (typeof value === "string") return <span className="text-green-400">"{value}"</span>;
  if (typeof value === "number") return <span className="text-blue-400">{String(value)}</span>;
  if (typeof value === "boolean") return <span className="text-yellow-400">{String(value)}</span>;
  return null;
}

function isPrimitive(value: unknown): boolean {
  return value === null || typeof value !== "object";
}

interface TreeNodeProps {
  label: string;
  value: unknown;
  defaultExpanded?: boolean;
  expandAll?: boolean;
}

function TreeNode({ label, value, defaultExpanded = false, expandAll }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const isOpen = expandAll !== undefined ? expandAll : expanded;

  const isExpandable = !isPrimitive(value);

  if (!isExpandable) {
    return (
      <div className="flex items-center gap-1 py-0.5 pl-5">
        <span className="font-bold text-foreground">{label}:</span>
        <ValueDisplay value={value} />
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? (value as JsonValue[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, JsonValue>);
  const typeLabel = getTypeLabel(value);
  const count = getItemCount(value);

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex items-center gap-1 py-0.5 hover:bg-zinc-800/50 rounded w-full text-left"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <span className="font-bold text-foreground">{label}</span>
        {!isOpen && (
          <span className="text-muted-foreground text-xs ml-1">
            {typeLabel}({count})
          </span>
        )}
      </button>
      {isOpen && (
        <div className="pl-4 border-l border-zinc-800 ml-2">
          {entries.map(([key, val]) => (
            <TreeNode
              key={key}
              label={key}
              value={val}
              expandAll={expandAll}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function JsonTreeView({ data }: { data: Record<string, unknown> }) {
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);

  const handleExpandAll = useCallback(() => setExpandAll(true), []);
  const handleCollapseAll = useCallback(() => setExpandAll(false), []);
  const handleReset = useCallback(() => setExpandAll(undefined), []);

  const entries = Object.entries(data);

  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900 p-4 font-mono text-sm overflow-auto">
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => { handleExpandAll(); }}
          className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-foreground transition-colors"
        >
          Expandir tudo
        </button>
        <button
          type="button"
          onClick={() => { handleCollapseAll(); }}
          className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-foreground transition-colors"
        >
          Colapsar tudo
        </button>
        {expandAll !== undefined && (
          <button
            type="button"
            onClick={() => { handleReset(); }}
            className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-muted-foreground transition-colors"
          >
            Reset
          </button>
        )}
      </div>
      <div>
        {entries.map(([key, val]) => (
          <TreeNode
            key={key}
            label={key}
            value={val}
            defaultExpanded
            expandAll={expandAll}
          />
        ))}
      </div>
    </div>
  );
}

// --- Loading State ---

function JsonViewerSkeleton() {
  return (
    <div className="space-y-2 p-4 rounded-md border border-zinc-800 bg-zinc-900">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-3/5" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  );
}

// --- Main Component ---

export function JsonViewer({ data, isLoading }: JsonViewerProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-48" />
        <JsonViewerSkeleton />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 p-12">
        <p className="text-muted-foreground">Nenhum JSON para exibir</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="json" className="w-full">
      <TabsList>
        <TabsTrigger value="json">JSON</TabsTrigger>
        <TabsTrigger value="tree">Tree</TabsTrigger>
      </TabsList>
      <TabsContent value="json">
        <JsonSyntaxView data={data} />
      </TabsContent>
      <TabsContent value="tree">
        <JsonTreeView data={data} />
      </TabsContent>
    </Tabs>
  );
}
