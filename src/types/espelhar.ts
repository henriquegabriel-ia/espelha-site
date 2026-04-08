export interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  textContent: string;
  metadata: {
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonical?: string;
    lang?: string;
  };
  links: Array<{ href: string; text: string }>;
  images: Array<{ src: string; alt: string }>;
  headings: Array<{ level: number; text: string }>;
  html?: string;
}

export interface JsonRenderElement {
  type: string;
  props: Record<string, unknown>;
  children?: string[];
}

export interface JsonRenderOutput {
  root: string;
  elements: Record<string, JsonRenderElement>;
  metadata: {
    url: string;
    title: string;
    scrapedAt: string;
    provider: string;
    model: string;
  };
}

export interface AnalysisReport {
  positives: string[];
  negatives: string[];
  suggestions: Suggestion[];
}

export interface Suggestion {
  category: 'design' | 'seo' | 'content' | 'structure';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

// ---------------------------------------------------------------------------
// Design System / Design Tokens
// ---------------------------------------------------------------------------

export interface DesignToken {
  name: string;
  value: string;
  category: string;
}

export interface ColorToken {
  name: string;       // ex: "Primary", "Background", "Text", "Accent"
  hex: string;        // ex: "#1a1a2e"
  rgb: string;        // ex: "rgb(26, 26, 46)"
  usage: string;      // ex: "Cor de fundo principal"
}

export interface TypographyToken {
  name: string;       // ex: "Heading 1", "Body", "Caption"
  fontFamily: string; // ex: "Inter, sans-serif"
  fontSize: string;   // ex: "48px"
  fontWeight: string; // ex: "700"
  lineHeight: string; // ex: "1.2"
  letterSpacing?: string;
  usage: string;
}

export interface SpacingToken {
  name: string;       // ex: "xs", "sm", "md", "lg", "xl"
  value: string;      // ex: "8px"
}

export interface DesignSystem {
  colors: ColorToken[];
  typography: TypographyToken[];
  spacing: SpacingToken[];
  borderRadius?: string[];
  shadows?: string[];
  cssVariables?: Record<string, string>; // raw CSS custom properties found
}
