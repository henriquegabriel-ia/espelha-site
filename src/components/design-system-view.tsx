"use client";

import { useState, useCallback } from "react";
import { Palette, Check, Copy, Type, Ruler, Circle, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// ---------- Types ----------

interface ColorToken {
  name: string;
  hex: string;
  rgb: string;
  usage: string;
}

interface TypographyToken {
  name: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
  usage: string;
}

interface SpacingToken {
  name: string;
  value: string;
}

interface DesignSystem {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  borderRadius?: string[];
  shadows?: string[];
  cssVariables?: Record<string, string>;
}

interface DesignSystemViewProps {
  designSystem: DesignSystem | null;
  isLoading?: boolean;
}

// ---------- Helpers ----------

/** Parse a CSS value like "16px" or "2rem" into a numeric px value for bar widths */
function parseToPx(value: string): number {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  if (value.endsWith("rem")) return num * 16;
  if (value.endsWith("em")) return num * 16;
  return num; // assume px
}

/** Determine if a hex colour is "dark" so we can add a visible border */
function isDarkColor(hex: string): boolean {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.35;
}

// ---------- Sub-components ----------

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded" />
        <Skeleton className="h-7 w-48" />
      </div>

      {/* Colors skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-36" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Typography skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-28" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 p-4 rounded-lg border border-border">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </div>
      </div>

      {/* Spacing skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {children}
      </h3>
      <div className="h-px bg-border" />
    </div>
  );
}

function ColorSwatch({ color }: { color: ColorToken }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(color.hex);
    } catch {
      // fallback
      const textarea = document.createElement("textarea");
      textarea.value = color.hex;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [color.hex]);

  const dark = isDarkColor(color.hex);

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group relative rounded-lg border border-border bg-card overflow-hidden text-left transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Color preview */}
      <div
        className={`relative h-20 w-full transition-transform group-hover:scale-[1.02] ${dark ? "border-b border-border/60" : ""}`}
        style={{ backgroundColor: color.hex }}
      >
        {/* Copy overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
          {copied ? (
            <Check className="h-5 w-5 text-green-400 drop-shadow" />
          ) : (
            <Copy className="h-4 w-4 text-white drop-shadow" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-0.5">
        <p className="text-sm font-medium text-foreground truncate">{color.name}</p>
        <p className="font-mono text-xs text-foreground/80">{color.hex}</p>
        <p className="font-mono text-xs text-muted-foreground">{color.rgb}</p>
        {color.usage && (
          <p className="text-xs text-muted-foreground/70 pt-0.5 truncate">{color.usage}</p>
        )}
      </div>

      {/* Copied feedback toast */}
      {copied && (
        <span className="absolute top-2 right-2 text-xs font-medium text-green-400 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 animate-fade-in">
          Copiado
        </span>
      )}
    </button>
  );
}

function TypographyItem({ token }: { token: TypographyToken }) {
  const previewSize = Math.min(parseFloat(token.fontSize) || 16, 32);

  return (
    <div className="rounded-lg border border-border bg-card/60 p-4 space-y-2">
      <Badge variant="secondary" className="text-xs">
        {token.name}
      </Badge>

      {/* Preview text with inline styles */}
      <p
        className="text-foreground leading-snug overflow-hidden"
        style={{
          fontFamily: token.fontFamily,
          fontSize: `${previewSize}px`,
          fontWeight: token.fontWeight,
          lineHeight: token.lineHeight,
          letterSpacing: token.letterSpacing ?? undefined,
        }}
      >
        The quick brown fox jumps over the lazy dog
      </p>

      {/* Specs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-xs text-muted-foreground">
          {token.fontFamily}
        </span>
        <span className="text-muted-foreground/40">&middot;</span>
        <span className="font-mono text-xs text-muted-foreground">
          {token.fontSize}
        </span>
        <span className="text-muted-foreground/40">&middot;</span>
        <span className="font-mono text-xs text-muted-foreground">
          {token.fontWeight}
        </span>
        <span className="text-muted-foreground/40">&middot;</span>
        <span className="font-mono text-xs text-muted-foreground">
          {token.lineHeight}
        </span>
        {token.letterSpacing && (
          <>
            <span className="text-muted-foreground/40">&middot;</span>
            <span className="font-mono text-xs text-muted-foreground">
              {token.letterSpacing}
            </span>
          </>
        )}
      </div>

      {token.usage && (
        <p className="text-xs text-muted-foreground/70">{token.usage}</p>
      )}
    </div>
  );
}

function SpacingBar({ token, maxPx }: { token: SpacingToken; maxPx: number }) {
  const px = parseToPx(token.value);
  const widthPercent = maxPx > 0 ? Math.max((px / maxPx) * 100, 2) : 2;

  return (
    <div className="flex items-center gap-3">
      <span className="w-10 text-right font-mono text-xs text-muted-foreground shrink-0">
        {token.name}
      </span>
      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${widthPercent}%` }}
        />
      </div>
      <span className="w-14 font-mono text-xs text-muted-foreground shrink-0">
        {token.value}
      </span>
    </div>
  );
}

function BorderRadiusPreview({ values }: { values: string[] }) {
  return (
    <div className="flex flex-wrap gap-4">
      {values.map((radius) => (
        <div key={radius} className="flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 border-2 border-primary bg-transparent"
            style={{ borderRadius: radius }}
          />
          <span className="font-mono text-xs text-muted-foreground">{radius}</span>
        </div>
      ))}
    </div>
  );
}

function ShadowPreview({ values }: { values: string[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {values.map((shadow, index) => (
        <div key={index} className="space-y-2">
          <div
            className="h-20 rounded-lg bg-card border border-border"
            style={{ boxShadow: shadow }}
          />
          <p className="font-mono text-xs text-muted-foreground break-all line-clamp-2">
            {shadow}
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------- Main Component ----------

export function DesignSystemView({
  designSystem,
  isLoading = false,
}: DesignSystemViewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!designSystem) {
    return null;
  }

  const colors = designSystem.colors ?? [];
  const typography = designSystem.typography ?? [];
  const spacing = designSystem.spacing ?? [];
  const borderRadius = designSystem.borderRadius ?? [];
  const shadows = designSystem.shadows ?? [];

  const maxSpacingPx = spacing.reduce(
    (max, s) => Math.max(max, parseToPx(s.value)),
    0
  );

  const hasColors = colors.length > 0;
  const hasTypography = typography.length > 0;
  const hasSpacing = spacing.length > 0;
  const hasBorderRadius = borderRadius.length > 0;
  const hasShadows = shadows.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-bold font-heading">Design System</h2>
      </div>

      {/* Section 1: Colors */}
      {hasColors && (
        <section className="space-y-4">
          <SectionTitle icon={<Palette className="h-4 w-4" />}>
            Paleta de Cores
          </SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {colors.map((color) => (
              <ColorSwatch key={`${color.name}-${color.hex}`} color={color} />
            ))}
          </div>
        </section>
      )}

      {/* Section 2: Typography */}
      {hasTypography && (
        <section className="space-y-4">
          <SectionTitle icon={<Type className="h-4 w-4" />}>
            Tipografia
          </SectionTitle>
          <div className="space-y-3">
            {typography.map((token) => (
              <TypographyItem key={`${token.name}-${token.fontFamily}`} token={token} />
            ))}
          </div>
        </section>
      )}

      {/* Section 3: Spacing */}
      {hasSpacing && (
        <section className="space-y-4">
          <SectionTitle icon={<Ruler className="h-4 w-4" />}>
            Espacamentos
          </SectionTitle>
          <div className="space-y-2.5">
            {spacing.map((token) => (
              <SpacingBar key={token.name} token={token} maxPx={maxSpacingPx} />
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Border Radius */}
      {hasBorderRadius && (
        <section className="space-y-4">
          <SectionTitle icon={<Circle className="h-4 w-4" />}>
            Border Radius
          </SectionTitle>
          <BorderRadiusPreview values={borderRadius} />
        </section>
      )}

      {/* Section 5: Shadows */}
      {hasShadows && (
        <section className="space-y-4">
          <SectionTitle icon={<Layers className="h-4 w-4" />}>
            Sombras
          </SectionTitle>
          <ShadowPreview values={shadows} />
        </section>
      )}
    </div>
  );
}
