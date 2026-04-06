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
