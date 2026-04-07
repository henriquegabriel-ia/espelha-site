import type { JsonRenderOutput, DesignSystem } from "@/types/espelhar";

interface GenerateLovablePromptOptions {
  jsonRender: JsonRenderOutput;
  designSystem: DesignSystem | null;
  css: string;
  originalUrl: string;
}

/**
 * Generates an optimised prompt for Lovable that recreates the analysed site
 * using React + Tailwind CSS + shadcn/ui.
 */
export function generateLovablePrompt(options: GenerateLovablePromptOptions): string {
  const { jsonRender, designSystem, css, originalUrl } = options;

  const sections: string[] = [];

  // Header
  sections.push("Recrie este site usando React + Tailwind CSS + shadcn/ui.\n");

  // Original URL
  sections.push("## Site Original");
  sections.push(`URL: ${originalUrl}\n`);

  // Component structure
  sections.push("## Estrutura de Componentes (json-render)");
  sections.push(
    "O site tem a seguinte estrutura de componentes. Recrie cada um fielmente:\n"
  );
  sections.push("```json");
  sections.push(JSON.stringify(jsonRender, null, 2));
  sections.push("```\n");

  // Design system
  if (designSystem) {
    sections.push("## Design System");
    sections.push(
      "Use exatamente estas cores, fontes e espacamentos:\n"
    );

    // Colors
    if (designSystem.colors.length > 0) {
      sections.push("### Cores");
      for (const color of designSystem.colors) {
        const usage = color.usage ? ` (${color.usage})` : "";
        sections.push(`- ${color.name}: ${color.hex}${usage}`);
      }
      sections.push("");
    }

    // Typography
    if (designSystem.typography.length > 0) {
      sections.push("### Tipografia");
      for (const t of designSystem.typography) {
        const parts = [t.fontFamily, t.fontWeight, `line-height ${t.lineHeight}`];
        if (t.letterSpacing) {
          parts.push(`tracking ${t.letterSpacing}`);
        }
        const usage = t.usage ? ` — ${t.usage}` : "";
        sections.push(`- ${t.name}: ${parts.join(", ")}${usage}`);
      }
      sections.push("");
    }

    // Spacing
    if (designSystem.spacing.length > 0) {
      sections.push("### Espacamentos");
      for (const s of designSystem.spacing) {
        sections.push(`- ${s.name}: ${s.value}`);
      }
      sections.push("");
    }

    // Border radius
    if (designSystem.borderRadius && designSystem.borderRadius.length > 0) {
      sections.push("### Border Radius");
      for (const r of designSystem.borderRadius) {
        sections.push(`- ${r}`);
      }
      sections.push("");
    }
  }

  // CSS custom properties
  if (css) {
    sections.push("### CSS Custom Properties");
    sections.push("```css");
    sections.push(css);
    sections.push("```\n");
  }

  // Instructions
  sections.push("## Instrucoes");
  sections.push("1. Use React com TypeScript");
  sections.push("2. Use Tailwind CSS para estilizacao");
  sections.push(
    "3. Use shadcn/ui para componentes base (Button, Card, Badge, etc.)"
  );
  sections.push("4. Mantenha o conteudo textual exatamente como esta");
  sections.push(
    "5. Aplique as cores do design system usando CSS custom properties"
  );
  sections.push("6. A pagina deve ser responsiva");
  sections.push("7. Mantenha a hierarquia visual do site original");

  return sections.join("\n");
}
