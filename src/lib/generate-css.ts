import type { DesignSystem } from "@/types/espelhar";

/**
 * Generates a complete CSS stylesheet from a DesignSystem object.
 * Includes custom properties, utility classes, typography, spacing, and a basic reset.
 */
export function generateCSS(designSystem: DesignSystem): string {
  const lines: string[] = [];

  lines.push("/* Design System — Gerado por Espelha Site */");
  lines.push("");

  // ---- :root custom properties ----
  lines.push(":root {");

  // Colors
  if (designSystem.colors.length > 0) {
    lines.push("  /* Colors */");
    for (const color of designSystem.colors) {
      const slug = slugify(color.name);
      lines.push(`  --color-${slug}: ${color.hex};`);
    }
    lines.push("");
  }

  // Typography fonts
  if (designSystem.typography.length > 0) {
    lines.push("  /* Typography */");
    const families = new Map<string, string>();
    for (const t of designSystem.typography) {
      const key = t.name.toLowerCase().includes("heading") ? "heading" : "body";
      if (!families.has(key)) {
        families.set(key, t.fontFamily);
      }
    }
    for (const [key, value] of families) {
      lines.push(`  --font-${key}: ${value};`);
    }
    lines.push("");
  }

  // Spacing
  if (designSystem.spacing.length > 0) {
    lines.push("  /* Spacing */");
    for (const s of designSystem.spacing) {
      const slug = slugify(s.name);
      lines.push(`  --space-${slug}: ${s.value};`);
    }
    lines.push("");
  }

  // Border radius
  if (designSystem.borderRadius && designSystem.borderRadius.length > 0) {
    lines.push("  /* Border Radius */");
    const sizeLabels = ["sm", "md", "lg", "xl", "2xl", "3xl"];
    designSystem.borderRadius.forEach((r, i) => {
      const label = sizeLabels[i] ?? `${i + 1}`;
      lines.push(`  --radius-${label}: ${r};`);
    });
    lines.push("");
  }

  // Shadows
  if (designSystem.shadows && designSystem.shadows.length > 0) {
    lines.push("  /* Shadows */");
    const sizeLabels = ["sm", "md", "lg", "xl", "2xl"];
    designSystem.shadows.forEach((s, i) => {
      const label = sizeLabels[i] ?? `${i + 1}`;
      lines.push(`  --shadow-${label}: ${s};`);
    });
    lines.push("");
  }

  // Raw cssVariables passthrough
  if (designSystem.cssVariables) {
    const entries = Object.entries(designSystem.cssVariables);
    if (entries.length > 0) {
      lines.push("  /* Original CSS Variables */");
      for (const [key, value] of entries) {
        const varName = key.startsWith("--") ? key : `--${key}`;
        lines.push(`  ${varName}: ${value};`);
      }
      lines.push("");
    }
  }

  lines.push("}");
  lines.push("");

  // ---- Basic reset ----
  lines.push("/* Reset */");
  lines.push("*, *::before, *::after { box-sizing: border-box; }");
  lines.push("* { margin: 0; }");
  lines.push("body { line-height: 1.5; -webkit-font-smoothing: antialiased; }");
  lines.push("img, picture, video, canvas, svg { display: block; max-width: 100%; }");
  lines.push("input, button, textarea, select { font: inherit; }");
  lines.push("p, h1, h2, h3, h4, h5, h6 { overflow-wrap: break-word; }");
  lines.push("");

  // ---- Color utility classes ----
  if (designSystem.colors.length > 0) {
    lines.push("/* Color Utilities */");
    for (const color of designSystem.colors) {
      const slug = slugify(color.name);
      lines.push(`.text-${slug} { color: var(--color-${slug}); }`);
      lines.push(`.bg-${slug} { background-color: var(--color-${slug}); }`);
      lines.push(`.border-${slug} { border-color: var(--color-${slug}); }`);
    }
    lines.push("");
  }

  // ---- Typography classes ----
  if (designSystem.typography.length > 0) {
    lines.push("/* Typography */");
    for (const t of designSystem.typography) {
      const slug = slugify(t.name);
      const props = [
        `font-family: ${t.fontFamily}`,
        `font-size: ${t.fontSize}`,
        `font-weight: ${t.fontWeight}`,
        `line-height: ${t.lineHeight}`,
      ];
      if (t.letterSpacing) {
        props.push(`letter-spacing: ${t.letterSpacing}`);
      }
      lines.push(`.${slug} { ${props.join("; ")}; }`);
    }
    lines.push("");
  }

  // ---- Spacing classes ----
  if (designSystem.spacing.length > 0) {
    lines.push("/* Spacing */");
    for (const s of designSystem.spacing) {
      const slug = slugify(s.name);
      lines.push(`.space-${slug} { --space: var(--space-${slug}); padding: var(--space-${slug}); }`);
      lines.push(`.gap-${slug} { gap: var(--space-${slug}); }`);
      lines.push(`.mt-${slug} { margin-top: var(--space-${slug}); }`);
      lines.push(`.mb-${slug} { margin-bottom: var(--space-${slug}); }`);
    }
    lines.push("");
  }

  // ---- Border radius classes ----
  if (designSystem.borderRadius && designSystem.borderRadius.length > 0) {
    lines.push("/* Border Radius */");
    const sizeLabels = ["sm", "md", "lg", "xl", "2xl", "3xl"];
    designSystem.borderRadius.forEach((_, i) => {
      const label = sizeLabels[i] ?? `${i + 1}`;
      lines.push(`.rounded-${label} { border-radius: var(--radius-${label}); }`);
    });
    lines.push("");
  }

  // ---- Shadow classes ----
  if (designSystem.shadows && designSystem.shadows.length > 0) {
    lines.push("/* Shadows */");
    const sizeLabels = ["sm", "md", "lg", "xl", "2xl"];
    designSystem.shadows.forEach((_, i) => {
      const label = sizeLabels[i] ?? `${i + 1}`;
      lines.push(`.shadow-${label} { box-shadow: var(--shadow-${label}); }`);
    });
    lines.push("");
  }

  return lines.join("\n");
}

/** Convert a token name to a CSS-safe slug */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
