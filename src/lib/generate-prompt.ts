import type { JsonRenderOutput, DesignSystem } from "@/types/espelhar";
import { generateCSS } from "./generate-css";

export type PromptPlatform = "lovable" | "replit" | "claude-code";

interface GeneratePromptOptions {
  platform: PromptPlatform;
  jsonRender: JsonRenderOutput;
  designSystem: DesignSystem | null;
  originalUrl: string;
  improvements?: Array<{ category: string; description: string; impact: string }>;
  html?: string;
}

const PLATFORM_CONFIG: Record<PromptPlatform, {
  name: string;
  stack: string;
  instructions: string[];
}> = {
  lovable: {
    name: "Lovable",
    stack: "React + Tailwind CSS + shadcn/ui",
    instructions: [
      "Use React com TypeScript",
      "Use Tailwind CSS para estilização",
      "Use shadcn/ui para componentes base (Button, Card, Badge, etc.)",
      "Mantenha o conteúdo textual exatamente como está",
      "Aplique as cores do design system usando CSS custom properties",
      "A página deve ser responsiva",
      "Mantenha a hierarquia visual do site original",
    ],
  },
  replit: {
    name: "Replit",
    stack: "React + Vite + Tailwind CSS",
    instructions: [
      "Crie um projeto React + Vite com TypeScript",
      "Use Tailwind CSS para estilização",
      "Instale shadcn/ui ou crie componentes equivalentes",
      "Mantenha o conteúdo textual exatamente como está",
      "Configure as cores do design system como CSS custom properties no :root",
      "A página deve ser responsiva (mobile-first)",
      "Mantenha a hierarquia visual e layout do site original",
      "O projeto deve rodar com `npm run dev` sem erros",
    ],
  },
  "claude-code": {
    name: "Claude Code",
    stack: "React + Vite + Tailwind CSS + shadcn/ui",
    instructions: [
      "Crie o projeto com: npm create vite@latest . -- --template react-ts",
      "Instale e configure Tailwind CSS",
      "Configure shadcn/ui com `npx shadcn@latest init`",
      "Crie todos os componentes em src/components/",
      "Use CSS custom properties (:root) para o design system",
      "Mantenha o conteúdo textual exatamente como está",
      "A página deve ser responsiva",
      "Mantenha a hierarquia visual do site original",
      "Garanta que `npm run build` compila sem erros",
    ],
  },
};

export function generatePrompt(options: GeneratePromptOptions): string {
  const { platform, jsonRender, designSystem, originalUrl, improvements, html } = options;
  const config = PLATFORM_CONFIG[platform];
  const css = designSystem ? generateCSS(designSystem) : "";
  const sections: string[] = [];

  sections.push(`Recrie este site usando ${config.stack}.\n`);

  sections.push("## Site Original");
  sections.push(`URL: ${originalUrl}\n`);

  // Component structure
  sections.push("## Estrutura de Componentes (json-render)");
  sections.push("O site tem a seguinte estrutura de componentes. Recrie cada um fielmente:\n");
  sections.push("```json");
  sections.push(JSON.stringify(jsonRender, null, 2));
  sections.push("```\n");

  // Design system
  if (designSystem) {
    sections.push("## Design System");
    sections.push("Use exatamente estas cores, fontes e espaçamentos:\n");

    if ((designSystem.colors ?? []).length > 0) {
      sections.push("### Cores");
      for (const color of designSystem.colors) {
        const usage = color.usage ? ` (${color.usage})` : "";
        sections.push(`- ${color.name}: ${color.hex}${usage}`);
      }
      sections.push("");
    }

    if ((designSystem.typography ?? []).length > 0) {
      sections.push("### Tipografia");
      for (const t of designSystem.typography) {
        const parts = [t.fontFamily, t.fontWeight, `line-height ${t.lineHeight}`];
        if (t.letterSpacing) parts.push(`tracking ${t.letterSpacing}`);
        const usage = t.usage ? ` — ${t.usage}` : "";
        sections.push(`- ${t.name}: ${parts.join(", ")}${usage}`);
      }
      sections.push("");
    }

    if ((designSystem.spacing ?? []).length > 0) {
      sections.push("### Espaçamentos");
      for (const s of designSystem.spacing) {
        sections.push(`- ${s.name}: ${s.value}`);
      }
      sections.push("");
    }

    if (designSystem.borderRadius && designSystem.borderRadius.length > 0) {
      sections.push("### Border Radius");
      for (const r of designSystem.borderRadius) {
        sections.push(`- ${r}`);
      }
      sections.push("");
    }
  }

  if (css) {
    sections.push("### CSS Custom Properties");
    sections.push("```css");
    sections.push(css);
    sections.push("```\n");
  }

  if (html) {
    sections.push("## HTML Original do Site");
    sections.push("Use este HTML como referência adicional para recriar o site fielmente:\n");
    const truncatedHtml = html.length > 15000 ? html.slice(0, 15000) + "\n... [truncado]" : html;
    sections.push("```html");
    sections.push(truncatedHtml);
    sections.push("```\n");
  }

  if (improvements && improvements.length > 0) {
    sections.push("## Melhorias a Aplicar");
    sections.push("Aplique estas melhorias ao recriar o site:\n");
    for (const imp of improvements) {
      sections.push(`- [${imp.category}] ${imp.description} (${imp.impact} impacto)`);
    }
    sections.push("");
  }

  sections.push("## Instruções");
  config.instructions.forEach((inst, i) => {
    sections.push(`${i + 1}. ${inst}`);
  });

  return sections.join("\n");
}
